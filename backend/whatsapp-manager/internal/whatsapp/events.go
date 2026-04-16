package whatsapp

import (
	"context"

	"go.mau.fi/whatsmeow/types/events"

	"whatsapp-manager/internal/webhook"
)

// handleEvent is the single event handler registered on every whatsmeow client.
// It dispatches each event type to a dedicated method and emits webhooks.
func (s *Session) handleEvent(evt interface{}) {
	switch v := evt.(type) {
	case *events.Connected:
		s.onConnected()
	case *events.PairSuccess:
		s.onPairSuccess(v)
	case *events.Disconnected:
		s.onDisconnected()
	case *events.LoggedOut:
		s.onLoggedOut(v)
	case *events.StreamReplaced:
		s.onStreamReplaced()
	case *events.Message:
		s.onMessage(v)
	case *events.Receipt:
		s.onReceipt(v)
	case *events.TemporaryBan:
		s.onTemporaryBan(v)
	}
}

// ─── Connection events ─────────────────────────────────────────────

func (s *Session) onConnected() {
	s.log.Info("connected to WhatsApp")
	s.setStatus(StatusConnected)
	s.setLastQR("")

	// Persist the JID so we can restore this session on restart.
	if s.client.Store.ID != nil {
		jid := s.client.Store.ID.String()
		if err := s.manager.store.UpdateJID(s.id, jid); err != nil {
			s.log.Error("failed to persist JID", "error", err)
		}
	}

	s.manager.webhook.Send(webhook.Event{
		SessionID: s.id,
		Event:     "connected",
		Data:      map[string]any{},
	})
}

func (s *Session) onPairSuccess(v *events.PairSuccess) {
	s.log.Info("QR pair success", "jid", v.ID.String())
}

func (s *Session) onDisconnected() {
	s.log.Warn("disconnected from WhatsApp")
	s.setStatus(StatusDisconnected)

	s.manager.webhook.Send(webhook.Event{
		SessionID: s.id,
		Event:     "disconnected",
		Data:      map[string]any{},
	})

	// Auto-reconnect unless the session was intentionally logged out.
	if !s.loggedOut.Load() {
		s.startReconnect()
	}
}

func (s *Session) onLoggedOut(v *events.LoggedOut) {
	s.log.Warn("session logged out", "on_connect", v.OnConnect, "reason", v.Reason)

	s.loggedOut.Store(true)
	s.stopReconnecting()
	s.setStatus(StatusDisconnected)
	s.setLastQR("")

	// Wipe device credentials so the user must scan QR again.
	if err := s.client.Store.Delete(context.Background()); err != nil {
		s.log.Error("failed to delete device store", "error", err)
	}

	// Clear JID in the metadata database.
	if err := s.manager.store.UpdateJID(s.id, ""); err != nil {
		s.log.Error("failed to clear JID", "error", err)
	}

	s.manager.webhook.Send(webhook.Event{
		SessionID: s.id,
		Event:     "disconnected",
		Data:      map[string]any{"reason": "logged_out"},
	})
}

func (s *Session) onStreamReplaced() {
	s.log.Warn("stream replaced by another client")
	s.stopReconnecting()
	s.setStatus(StatusDisconnected)

	s.manager.webhook.Send(webhook.Event{
		SessionID: s.id,
		Event:     "disconnected",
		Data:      map[string]any{"reason": "stream_replaced"},
	})
}

func (s *Session) onTemporaryBan(v *events.TemporaryBan) {
	s.log.Error("temporary ban", "code", v.Code, "expire", v.Expire)
	s.stopReconnecting()
	s.setStatus(StatusFailed)

	s.manager.webhook.Send(webhook.Event{
		SessionID: s.id,
		Event:     "disconnected",
		Data: map[string]any{
			"reason":     "temporary_ban",
			"code":       v.Code,
			"expire_sec": int(v.Expire.Seconds()),
		},
	})
}

// ─── Message events ────────────────────────────────────────────────

func (s *Session) onMessage(v *events.Message) {
	// Extract plain text from the various message container types.
	text := ""
	if v.Message != nil {
		if c := v.Message.GetConversation(); c != "" {
			text = c
		} else if ext := v.Message.GetExtendedTextMessage(); ext != nil {
			text = ext.GetText()
		}
	}

	s.log.Debug("message received",
		"from", v.Info.Sender.User,
		"text", text,
		"is_group", v.Info.IsGroup,
	)

	s.manager.webhook.Send(webhook.Event{
		SessionID: s.id,
		Event:     "message.received",
		Data: map[string]any{
			"from":       v.Info.Sender.User,
			"message_id": v.Info.ID,
			"text":       text,
			"timestamp":  v.Info.Timestamp.Unix(),
			"is_group":   v.Info.IsGroup,
			"chat":       v.Info.Chat.String(),
		},
	})
}

func (s *Session) onReceipt(v *events.Receipt) {
	s.manager.webhook.Send(webhook.Event{
		SessionID: s.id,
		Event:     "message.receipt",
		Data: map[string]any{
			"type":        string(v.Type),
			"message_ids": v.MessageIDs,
			"from":        v.MessageSource.Sender.User,
			"timestamp":   v.Timestamp.Unix(),
		},
	})
}
