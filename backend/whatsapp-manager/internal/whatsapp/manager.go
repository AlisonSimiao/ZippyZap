package whatsapp

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"sync"

	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/store/sqlstore"

	// NOTE: whatsmeow log package location depends on version.
	// Recent versions: go.mau.fi/util/log
	// Older versions:  go.mau.fi/whatsmeow/util/log
	// Adjust if the build fails.
	waLog "go.mau.fi/whatsmeow/util/log"

	"whatsapp-manager/internal/store"
	"whatsapp-manager/internal/webhook"
)

// Manager is the central registry of all active WhatsApp sessions.
// It is safe for concurrent use from multiple goroutines.
type Manager struct {
	sessions map[string]*Session
	mu       sync.RWMutex

	dataDir string
	store   *store.Store
	webhook *webhook.Dispatcher
	log     *slog.Logger
}

// NewManager creates a session manager. Call RestoreAll after creation to
// reconnect previously authenticated sessions.
func NewManager(dataDir string, st *store.Store, wh *webhook.Dispatcher, log *slog.Logger) *Manager {
	return &Manager{
		sessions: make(map[string]*Session),
		dataDir:  dataDir,
		store:    st,
		webhook:  wh,
		log:      log.With("component", "manager"),
	}
}

// ─── Public API ────────────────────────────────────────────────────

// GetOrCreateSession returns an existing session or creates a new one.
// For new/unauthenticated sessions, it initiates the QR code flow.
func (m *Manager) GetOrCreateSession(ctx context.Context, sessionID string) (*SessionInfo, error) {
	// Fast path: session already exists and is usable.
	m.mu.RLock()
	session, exists := m.sessions[sessionID]
	m.mu.RUnlock()

	if exists {
		st := session.GetStatus()
		if st == StatusConnected || st == StatusConnecting {
			return session.Info(), nil
		}
		// Disconnected — try to reconnect.
		return session.Connect(ctx)
	}

	// Slow path: create new session with write lock guard.
	m.mu.Lock()
	// Double-check after acquiring write lock (another goroutine may have created it).
	if session, exists := m.sessions[sessionID]; exists {
		m.mu.Unlock()
		return session.Info(), nil
	}
	m.mu.Unlock()

	return m.createSession(ctx, sessionID)
}

// GetStatus returns the current info for a session, or an error if it does not exist.
func (m *Manager) GetStatus(sessionID string) (*SessionInfo, error) {
	m.mu.RLock()
	session, ok := m.sessions[sessionID]
	m.mu.RUnlock()

	if !ok {
		return nil, fmt.Errorf("session not found: %s", sessionID)
	}
	return session.Info(), nil
}

// SendMessage sends a WhatsApp message through the specified session.
// Returns messageID, timestamp (Unix), and error.
func (m *Manager) SendMessage(ctx context.Context, sessionID, number, message string) (string, int64, error) {
	m.mu.RLock()
	session, ok := m.sessions[sessionID]
	m.mu.RUnlock()

	if !ok {
		return "", 0, fmt.Errorf("session not found: %s", sessionID)
	}
	return session.SendMessage(ctx, number, message)
}

// LogoutSession marks a session as logged out and disconnects it.
// This clears the device credentials so the user must scan QR again.
func (m *Manager) DeleteSession(sessionID string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	session, ok := m.sessions[sessionID]
	if !ok {
		return fmt.Errorf("session not found: %s", sessionID)
	}

	session.MarkLoggedOut()
	session.Disconnect()

	// Delete from store
	if err := m.store.Delete(sessionID); err != nil {
		m.log.Error("failed to delete session from store", "session_id", sessionID, "error", err)
	}

	// Remove from map
	delete(m.sessions, sessionID)

	m.log.Info("session deleted", "session_id", sessionID)
	return nil
}

// LogoutSession marks a session as logged out and triggers reconnect to be disabled.
func (m *Manager) LogoutSession(sessionID string) error {
	m.mu.RLock()
	session, ok := m.sessions[sessionID]
	m.mu.RUnlock()

	if !ok {
		return fmt.Errorf("session not found: %s", sessionID)
	}

	session.MarkLoggedOut()
	session.Disconnect()

	m.log.Info("session logged out", "session_id", sessionID)
	return nil
}

// ─── Session lifecycle ─────────────────────────────────────────────

// createSession builds a new whatsmeow client backed by a per-session SQLite
// database, registers it in the metadata store, and starts the QR/connect flow.
func (m *Manager) createSession(ctx context.Context, sessionID string) (*SessionInfo, error) {
	m.log.Info("creating session", "session_id", sessionID)

	sessionDir := filepath.Join(m.dataDir, "sessions", sessionID)
	if err := os.MkdirAll(sessionDir, 0755); err != nil {
		return nil, fmt.Errorf("create session directory: %w", err)
	}

	client, container, err := m.buildClient(ctx, sessionID, sessionDir)
	if err != nil {
		return nil, err
	}

	session := newSession(sessionID, client, container, m, m.log)
	client.AddEventHandler(session.handleEvent)

	// Register in metadata store (idempotent).
	if err := m.store.Register(sessionID); err != nil {
		return nil, fmt.Errorf("register session: %w", err)
	}

	// Insert into active map.
	m.mu.Lock()
	if existing, ok := m.sessions[sessionID]; ok {
		// Race: another goroutine beat us. Clean up and return existing.
		m.mu.Unlock()
		client.Disconnect()
		return existing.Info(), nil
	}
	m.sessions[sessionID] = session
	m.mu.Unlock()

	return session.Connect(ctx)
}

// buildClient creates the whatsmeow container + client for a session directory.
func (m *Manager) buildClient(ctx context.Context, sessionID, sessionDir string) (*whatsmeow.Client, *sqlstore.Container, error) {
	dbPath := filepath.Join(sessionDir, "device.db")
	container, err := sqlstore.New(ctx, "sqlite3", "file:"+dbPath+"?_foreign_keys=on", waLog.Noop)
	if err != nil {
		return nil, nil, fmt.Errorf("open device store: %w", err)
	}

	device, err := container.GetFirstDevice(ctx)
	if err != nil {
		return nil, nil, fmt.Errorf("get device: %w", err)
	}

	client := whatsmeow.NewClient(device, waLog.Noop)
	return client, container, nil
}

// ─── Restore on startup ───────────────────────────────────────────

// RestoreAll loads all previously-authenticated sessions from the metadata
// store and reconnects them in background goroutines.
func (m *Manager) RestoreAll(ctx context.Context) error {
	records, err := m.store.GetAll()
	if err != nil {
		return fmt.Errorf("load sessions: %w", err)
	}

	m.log.Info("restoring sessions", "count", len(records))

	var wg sync.WaitGroup
	for _, r := range records {
		if r.JID == "" {
			m.log.Info("skipping unauthenticated session", "session_id", r.SessionID)
			continue
		}

		wg.Add(1)
		go func(sessionID string) {
			defer wg.Done()
			m.restoreSession(sessionID)
		}(r.SessionID)
	}

	// Don't block startup forever — wait with timeout.
	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		m.log.Info("all sessions restored")
	case <-ctx.Done():
		m.log.Warn("session restore timed out, continuing")
	}

	return nil
}

func (m *Manager) restoreSession(sessionID string) {
	m.log.Info("restoring session", "session_id", sessionID)

	ctx := context.Background()
	sessionDir := filepath.Join(m.dataDir, "sessions", sessionID)
	dbPath := filepath.Join(sessionDir, "device.db")

	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		m.log.Warn("device db missing, skipping", "session_id", sessionID)
		return
	}

	client, container, err := m.buildClient(ctx, sessionID, sessionDir)
	if err != nil {
		m.log.Error("failed to build client", "session_id", sessionID, "error", err)
		return
	}

	if client.Store.ID == nil {
		m.log.Warn("device has no JID, skipping", "session_id", sessionID)
		return
	}

	session := newSession(sessionID, client, container, m, m.log)
	client.AddEventHandler(session.handleEvent)

	m.mu.Lock()
	m.sessions[sessionID] = session
	m.mu.Unlock()

	session.setStatus(StatusConnecting)
	if err := client.Connect(); err != nil {
		m.log.Error("restore connect failed, starting reconnect", "session_id", sessionID, "error", err)
		session.setStatus(StatusDisconnected)
		session.startReconnect()
	}
}

// ─── Shutdown ──────────────────────────────────────────────────────

// Shutdown gracefully disconnects all active sessions.
func (m *Manager) Shutdown() {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.log.Info("shutting down sessions", "count", len(m.sessions))

	for id, session := range m.sessions {
		m.log.Info("disconnecting", "session_id", id)
		session.Close()
	}
}
