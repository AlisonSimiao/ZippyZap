package webhook

import (
	"bytes"
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"time"
)

// Event is the payload sent to the webhook URL on every session event.
type Event struct {
	SessionID string         `json:"session_id"`
	Event     string         `json:"event"`
	Data      map[string]any `json:"data,omitempty"`
}

// Dispatcher sends webhook events asynchronously via HTTP POST.
type Dispatcher struct {
	url    string
	client *http.Client
	log    *slog.Logger
}

// NewDispatcher creates a webhook dispatcher. If url is empty, all Send calls are no-ops.
func NewDispatcher(url string, log *slog.Logger) *Dispatcher {
	return &Dispatcher{
		url: url,
		client: &http.Client{
			Timeout: 5 * time.Second,
		},
		log: log.With("component", "webhook"),
	}
}

// Send fires a webhook event in a background goroutine. It never blocks the caller.
// No retry is attempted (MVP). Delivery failures are logged as warnings.
func (d *Dispatcher) Send(evt Event) {
	if d.url == "" {
		return
	}

	go func() {
		body, err := json.Marshal(evt)
		if err != nil {
			d.log.Error("marshal failed", "error", err)
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		req, err := http.NewRequestWithContext(ctx, http.MethodPost, d.url, bytes.NewReader(body))
		if err != nil {
			d.log.Error("create request failed", "error", err)
			return
		}
		req.Header.Set("Content-Type", "application/json")

		resp, err := d.client.Do(req)
		if err != nil {
			d.log.Warn("delivery failed", "url", d.url, "event", evt.Event, "error", err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode >= 400 {
			d.log.Warn("webhook returned error", "status", resp.StatusCode, "event", evt.Event)
			return
		}

		d.log.Debug("delivered", "event", evt.Event, "session", evt.SessionID, "status", resp.StatusCode)
	}()
}
