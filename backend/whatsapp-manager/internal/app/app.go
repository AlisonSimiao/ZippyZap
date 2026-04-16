package app

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"whatsapp-manager/internal/config"
	"whatsapp-manager/internal/server"
	"whatsapp-manager/internal/store"
	"whatsapp-manager/internal/webhook"
	"whatsapp-manager/internal/whatsapp"
)

// App wires together every subsystem and manages the application lifecycle.
type App struct {
	cfg     *config.Config
	manager *whatsapp.Manager
	store   *store.Store
	srv     *http.Server
	log     *slog.Logger
}

// New creates the application: metadata store, webhook dispatcher,
// session manager, HTTP server. Nothing is started yet.
func New(cfg *config.Config) (*App, error) {
	// ─── Logger ────────────────────────────────────────────────────
	level := slog.LevelInfo
	switch cfg.LogLevel {
	case "debug":
		level = slog.LevelDebug
	case "warn":
		level = slog.LevelWarn
	case "error":
		level = slog.LevelError
	}
	log := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: level}))
	slog.SetDefault(log)

	// ─── Data directory ────────────────────────────────────────────
	sessionsDir := filepath.Join(cfg.DataDir, "sessions")
	if err := os.MkdirAll(sessionsDir, 0755); err != nil {
		return nil, fmt.Errorf("create data dir: %w", err)
	}

	// ─── Metadata store ────────────────────────────────────────────
	metaPath := filepath.Join(cfg.DataDir, "metadata.db")
	st, err := store.New(metaPath)
	if err != nil {
		return nil, fmt.Errorf("open metadata store: %w", err)
	}

	// ─── Webhook dispatcher ────────────────────────────────────────
	wh := webhook.NewDispatcher(cfg.WebhookURL, log)
	if cfg.WebhookURL != "" {
		log.Info("webhook configured", "url", cfg.WebhookURL)
	} else {
		log.Warn("WEBHOOK_URL not set — events will not be dispatched")
	}

	// ─── Session manager ───────────────────────────────────────────
	mgr := whatsapp.NewManager(cfg.DataDir, st, wh, log)

	// ─── HTTP server ───────────────────────────────────────────────
	handlers := server.NewHandlers(mgr)
	router := server.NewRouter(handlers, log)

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      router,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 60 * time.Second, // QR flow can take a while
		IdleTimeout:  120 * time.Second,
	}

	return &App{
		cfg:     cfg,
		manager: mgr,
		store:   st,
		srv:     srv,
		log:     log,
	}, nil
}

// Start restores existing sessions and begins listening for HTTP requests.
// It blocks until the server shuts down.
func (a *App) Start(ctx context.Context) error {
	// Restore previously authenticated sessions in the background.
	if err := a.manager.RestoreAll(ctx); err != nil {
		a.log.Warn("session restore error (non-fatal)", "error", err)
	}

	a.log.Info("server listening",
		"port", a.cfg.Port,
		"docs", fmt.Sprintf("http://localhost:%d/docs", a.cfg.Port),
	)

	if err := a.srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		return fmt.Errorf("http server: %w", err)
	}
	return nil
}

// Shutdown gracefully stops everything: WhatsApp sessions, metadata DB, HTTP server.
func (a *App) Shutdown(ctx context.Context) error {
	a.log.Info("shutting down...")

	a.manager.Shutdown()
	a.store.Close()

	return a.srv.Shutdown(ctx)
}
