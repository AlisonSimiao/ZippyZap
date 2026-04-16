package server

import (
	"log/slog"
	"net/http"
	"time"
)

// NewRouter wires all HTTP routes and wraps them with logging + recovery middleware.
// Uses Go 1.22+ pattern matching (method + path variables).
func NewRouter(h *Handlers, log *slog.Logger) http.Handler {
	mux := http.NewServeMux()

	// ─── API routes ────────────────────────────────────────────────
	mux.HandleFunc("POST /sessions", h.CreateSession)
	mux.HandleFunc("DELETE /sessions/{id}", h.DeleteSession)
	mux.HandleFunc("POST /sessions/{id}/logout", h.LogoutSession)
	mux.HandleFunc("GET /sessions/{id}/status", h.GetStatus)
	mux.HandleFunc("GET /sessions/{id}/qr", h.GetQR)
	mux.HandleFunc("POST /sessions/{id}/send", h.SendMessage)

	// ─── Operational routes ────────────────────────────────────────
	mux.HandleFunc("GET /health", h.Health)
	mux.HandleFunc("GET /docs", DocsHandler)

	// ─── Middleware chain ──────────────────────────────────────────
	var handler http.Handler = mux
	handler = recoveryMiddleware(handler)
	handler = logMiddleware(handler, log)

	return handler
}

// ─── Middleware ─────────────────────────────────────────────────────

func logMiddleware(next http.Handler, log *slog.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		sw := &statusWriter{ResponseWriter: w, status: http.StatusOK}

		next.ServeHTTP(sw, r)

		log.Info("request",
			"method", r.Method,
			"path", r.URL.Path,
			"status", sw.status,
			"duration", time.Since(start).String(),
			"ip", r.RemoteAddr,
		)
	})
}

func recoveryMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				slog.Error("panic recovered", "error", err, "path", r.URL.Path)
				writeError(w, http.StatusInternalServerError, "internal server error")
			}
		}()
		next.ServeHTTP(w, r)
	})
}

// statusWriter captures the HTTP status code written by downstream handlers.
type statusWriter struct {
	http.ResponseWriter
	status int
}

func (w *statusWriter) WriteHeader(status int) {
	w.status = status
	w.ResponseWriter.WriteHeader(status)
}
