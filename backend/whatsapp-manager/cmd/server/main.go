package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"whatsapp-manager/internal/app"
	"whatsapp-manager/internal/config"
)

func main() {
	cfg := config.Load()

	application, err := app.New(cfg)
	if err != nil {
		log.Fatalf("failed to create application: %v", err)
	}

	// ─── Graceful shutdown on SIGINT / SIGTERM ─────────────────────
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		sig := <-sigChan
		log.Printf("received %s, initiating shutdown...", sig)

		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer shutdownCancel()

		if err := application.Shutdown(shutdownCtx); err != nil {
			log.Printf("shutdown error: %v", err)
		}
		cancel()
	}()

	if err := application.Start(ctx); err != nil {
		log.Fatalf("server error: %v", err)
	}

	log.Println("server stopped")
}
