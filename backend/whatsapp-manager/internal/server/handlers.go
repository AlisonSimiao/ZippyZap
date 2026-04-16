package server

import (
	"encoding/json"
	"net/http"

	"whatsapp-manager/internal/whatsapp"
)

// Handlers groups all HTTP handler methods. Each method maps to one API endpoint.
type Handlers struct {
	manager *whatsapp.Manager
}

// NewHandlers creates a handler set backed by the given session manager.
func NewHandlers(manager *whatsapp.Manager) *Handlers {
	return &Handlers{manager: manager}
}

// ─── POST /sessions ────────────────────────────────────────────────
// Create or reconnect a WhatsApp session. Returns QR code if not yet paired.

func (h *Handlers) CreateSession(w http.ResponseWriter, r *http.Request) {
	var req struct {
		SessionID string `json:"session_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	if req.SessionID == "" {
		writeError(w, http.StatusBadRequest, "session_id is required")
		return
	}

	info, err := h.manager.GetOrCreateSession(r.Context(), req.SessionID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, info)
}

// ─── DELETE /sessions/{id} ─────────────────────────────────────

func (h *Handlers) DeleteSession(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "session id is required")
		return
	}

	if err := h.manager.DeleteSession(id); err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"success":    true,
		"session_id": id,
	})
}

// ─── POST /sessions/{id}/logout ─────────────────────────────────────

func (h *Handlers) LogoutSession(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "session id is required")
		return
	}

	if err := h.manager.LogoutSession(id); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"success":    true,
		"session_id": id,
	})
}

// ─── GET /sessions/{id}/status ─────────────────────────────────────

func (h *Handlers) GetStatus(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "session id is required")
		return
	}

	info, err := h.manager.GetStatus(id)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, info)
}

// ─── GET /sessions/{id}/qr ────────────────────────────────────────

func (h *Handlers) GetQR(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "session id is required")
		return
	}

	info, err := h.manager.GetStatus(id)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"session_id": info.SessionID,
		"qr_code":    info.QRCode,
		"qr_raw":     info.QRRaw,
	})
}

// ─── POST /sessions/{id}/send ──────────────────────────────────────

func (h *Handlers) SendMessage(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "session id is required")
		return
	}

	var req struct {
		// Accept both formats for compatibility
		Number  string `json:"number"`
		Message string `json:"message"`
		To      string `json:"to"`
		Text    string `json:"text"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	// Support both {number, message} and {to, text} formats
	number := req.Number
	if number == "" {
		number = req.To
	}
	message := req.Message
	if message == "" {
		message = req.Text
	}

	if number == "" || message == "" {
		writeError(w, http.StatusBadRequest, "number (or to) and message (or text) are required")
		return
	}

	msgID, timestamp, err := h.manager.SendMessage(r.Context(), id, number, message)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"success":    true,
		"message_id": msgID,
		"timestamp":  timestamp,
	})
}

// ─── GET /health ───────────────────────────────────────────────────

func (h *Handlers) Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"status":  "ok",
		"service": "whatsapp-manager",
	})
}

// ─── JSON helpers ──────────────────────────────────────────────────

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data) //nolint:errcheck
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
