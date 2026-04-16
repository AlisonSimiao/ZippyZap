package whatsapp

import (
	"context"
	"encoding/base64"
	"fmt"
	"log/slog"
	"sync"
	"sync/atomic"
	"time"

	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/store/sqlstore"
	"go.mau.fi/whatsmeow/types"
	"google.golang.org/protobuf/proto"

	"github.com/skip2/go-qrcode"

	// NOTE: whatsmeow proto import path depends on version.
	// Recent versions (2024+): go.mau.fi/whatsmeow/proto/waE2E
	// Older versions:          go.mau.fi/whatsmeow/binary/proto
	// Adjust if the build fails.
	waE2E "go.mau.fi/whatsmeow/proto/waE2E"

	"whatsapp-manager/internal/webhook"
)

// ─── Status ────────────────────────────────────────────────────────

// SessionStatus represents the current state of a WhatsApp session.
type SessionStatus string

const (
	StatusDisconnected SessionStatus = "disconnected"
	StatusConnecting   SessionStatus = "connecting"
	StatusConnected    SessionStatus = "connected"
	StatusFailed       SessionStatus = "failed"
)

// ─── SessionInfo (API response) ────────────────────────────────────

// SessionInfo is the JSON-serializable representation returned by the HTTP API.
type SessionInfo struct {
	SessionID string        `json:"session_id"`
	Status    SessionStatus `json:"status"`
	QRCode    string        `json:"qr_code,omitempty"` // base64 PNG
	QRRaw     string        `json:"qr_raw,omitempty"`  // raw QR data string
}

// ─── Session ───────────────────────────────────────────────────────

// Session wraps a single whatsmeow client with reconnection logic,
// QR code state, and webhook event emission.
type Session struct {
	id        string
	client    *whatsmeow.Client
	container *sqlstore.Container

	// status is guarded by statusMu
	status   SessionStatus
	statusMu sync.RWMutex

	// lastQR stores the most recent QR code string (empty when authenticated)
	lastQR string
	qrMu   sync.RWMutex

	// loggedOut is set atomically when the phone logs out the session
	loggedOut atomic.Bool

	// reconnection coordination
	reconnMu     sync.Mutex
	reconnecting bool
	stopReconn   chan struct{}

	manager *Manager
	log     *slog.Logger
}

func newSession(
	id string,
	client *whatsmeow.Client,
	container *sqlstore.Container,
	manager *Manager,
	log *slog.Logger,
) *Session {
	return &Session{
		id:        id,
		client:    client,
		container: container,
		status:    StatusDisconnected,
		manager:   manager,
		log:       log.With("session_id", id),
	}
}

// ─── Getters / setters (thread-safe) ───────────────────────────────

func (s *Session) GetStatus() SessionStatus {
	s.statusMu.RLock()
	defer s.statusMu.RUnlock()
	return s.status
}

func (s *Session) setStatus(st SessionStatus) {
	s.statusMu.Lock()
	s.status = st
	s.statusMu.Unlock()
}

func (s *Session) GetLastQR() string {
	s.qrMu.RLock()
	defer s.qrMu.RUnlock()
	return s.lastQR
}

func (s *Session) setLastQR(qr string) {
	s.qrMu.Lock()
	s.lastQR = qr
	s.qrMu.Unlock()
}

// Info returns a snapshot of the session suitable for JSON serialization.
func (s *Session) Info() *SessionInfo {
	info := &SessionInfo{
		SessionID: s.id,
		Status:    s.GetStatus(),
	}

	if raw := s.GetLastQR(); raw != "" {
		info.QRRaw = raw
		if png, err := generateQRImage(raw); err == nil {
			info.QRCode = png
		}
	}

	return info
}

// ─── Connect ───────────────────────────────────────────────────────

// Connect either starts the QR code flow (new device) or reconnects an
// existing authenticated device. It is safe to call multiple times.
func (s *Session) Connect(ctx context.Context) (*SessionInfo, error) {
	if s.client.Store.ID == nil {
		return s.connectWithQR(ctx)
	}
	return s.connectExisting(ctx)
}

// connectWithQR starts the QR code pairing flow and blocks until the first
// QR code is available (or a 30 s timeout).
func (s *Session) connectWithQR(ctx context.Context) (*SessionInfo, error) {
	s.setStatus(StatusConnecting)
	s.loggedOut.Store(false) // reset in case of re-pair after logout

	qrChan, err := s.client.GetQRChannel(ctx)
	if err != nil {
		s.setStatus(StatusFailed)
		return nil, fmt.Errorf("get QR channel: %w", err)
	}

	if err := s.client.Connect(); err != nil {
		s.setStatus(StatusFailed)
		return nil, fmt.Errorf("connect: %w", err)
	}

	// Wait for the first QR code event with a timeout.
	timer := time.NewTimer(30 * time.Second)
	defer timer.Stop()

	select {
	case evt := <-qrChan:
		if evt.Event == "code" {
			s.setLastQR(evt.Code)
			s.manager.webhook.Send(webhook.Event{
				SessionID: s.id,
				Event:     "qr",
				Data:      map[string]any{"qr": evt.Code},
			})

			// Handle subsequent QR rotations in the background.
			go s.handleQRLoop(qrChan)

			return s.Info(), nil
		}
		// First event was not a code (e.g. immediate success).
		return s.Info(), nil

	case <-timer.C:
		s.setStatus(StatusFailed)
		return nil, fmt.Errorf("timeout waiting for QR code")

	case <-ctx.Done():
		s.client.Disconnect()
		s.setStatus(StatusDisconnected)
		return nil, ctx.Err()
	}
}

// connectExisting reconnects an already-authenticated device.
func (s *Session) connectExisting(ctx context.Context) (*SessionInfo, error) {
	s.setStatus(StatusConnecting)

	if err := s.client.Connect(); err != nil {
		s.setStatus(StatusFailed)
		return nil, fmt.Errorf("connect: %w", err)
	}

	return s.Info(), nil
}

// handleQRLoop consumes QR channel events after the first code was already
// delivered to the HTTP caller. It runs until the channel closes.
func (s *Session) handleQRLoop(qrChan <-chan whatsmeow.QRChannelItem) {
	for evt := range qrChan {
		switch evt.Event {
		case "code":
			s.setLastQR(evt.Code)
			s.manager.webhook.Send(webhook.Event{
				SessionID: s.id,
				Event:     "qr",
				Data:      map[string]any{"qr": evt.Code},
			})
		case "success":
			s.setLastQR("")
			s.log.Info("QR pairing successful")
		case "timeout":
			s.setLastQR("")
			s.setStatus(StatusDisconnected)
			s.log.Warn("QR code timed out")
		}
	}
}

// ─── Send message ──────────────────────────────────────────────────

// SendMessage sends a plain-text WhatsApp message to the given phone number.
// The number must be in E.164 format without the '+' (e.g. "5511999999999").
// Returns messageID, timestamp (Unix), and error.
func (s *Session) SendMessage(ctx context.Context, number, message string) (string, int64, error) {
	if s.GetStatus() != StatusConnected {
		return "", 0, fmt.Errorf("session not connected (status: %s)", s.GetStatus())
	}

	jid := types.NewJID(number, types.DefaultUserServer)

	msg := &waE2E.Message{
		Conversation: proto.String(message),
	}

	resp, err := s.client.SendMessage(ctx, jid, msg)
	if err != nil {
		return "", 0, fmt.Errorf("send message: %w", err)
	}

	timestamp := resp.Timestamp.Unix()
	s.manager.webhook.Send(webhook.Event{
		SessionID: s.id,
		Event:     "message.sent",
		Data: map[string]any{
			"to":         number,
			"message_id": resp.ID,
			"timestamp":  timestamp,
		},
	})

	return resp.ID, timestamp, nil
}

// ─── Reconnection (exponential backoff) ────────────────────────────

// startReconnect spawns a single background goroutine that attempts to
// reconnect with exponential backoff (2 s → 60 s). It is a no-op if
// reconnection is already running or the session was logged out.
func (s *Session) startReconnect() {
	s.reconnMu.Lock()
	if s.reconnecting || s.loggedOut.Load() {
		s.reconnMu.Unlock()
		return
	}
	s.reconnecting = true
	s.stopReconn = make(chan struct{})
	stop := s.stopReconn
	s.reconnMu.Unlock()

	go func() {
		defer func() {
			s.reconnMu.Lock()
			s.reconnecting = false
			s.reconnMu.Unlock()
		}()

		backoff := 2 * time.Second
		const maxBackoff = 60 * time.Second
		attempt := 0

		for {
			select {
			case <-stop:
				s.log.Info("reconnection stopped")
				return
			case <-time.After(backoff):
				if s.loggedOut.Load() {
					s.log.Info("session logged out, aborting reconnect")
					return
				}

				attempt++
				s.log.Info("reconnecting", "attempt", attempt, "backoff", backoff)
				s.setStatus(StatusConnecting)

				if err := s.client.Connect(); err != nil {
					s.log.Warn("reconnect failed", "error", err, "attempt", attempt)
					s.setStatus(StatusDisconnected)
					backoff = min(backoff*2, maxBackoff)
					continue
				}

				s.log.Info("reconnected", "attempt", attempt)
				return
			}
		}
	}()
}

// stopReconnecting signals the reconnection goroutine to stop.
func (s *Session) stopReconnecting() {
	s.reconnMu.Lock()
	defer s.reconnMu.Unlock()
	if s.reconnecting && s.stopReconn != nil {
		close(s.stopReconn)
		s.reconnecting = false
	}
}

// ─── Disconnect / close ────────────────────────────────────────────

// Disconnect stops reconnection and cleanly disconnects the WhatsApp client.
func (s *Session) Disconnect() {
	s.stopReconnecting()
	s.client.Disconnect()
	s.setStatus(StatusDisconnected)
}

// Close disconnects the session and releases resources.
func (s *Session) Close() {
	s.Disconnect()
}

// MarkLoggedOut marks the session as intentionally logged out,
// preventing auto-reconnect.
func (s *Session) MarkLoggedOut() {
	s.loggedOut.Store(true)
	s.stopReconnecting()
	s.setLastQR("")
}

// ─── QR image generation ───────────────────────────────────────────

// generateQRImage encodes a QR data string into a base64-encoded PNG.
func generateQRImage(data string) (string, error) {
	png, err := qrcode.Encode(data, qrcode.Medium, 256)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(png), nil
}
