package config

import (
	"os"
	"strconv"
)

// Config holds all application configuration loaded from environment variables.
type Config struct {
	Port       int
	WebhookURL string
	DataDir    string
	LogLevel   string
}

// Load reads configuration from environment variables with sensible defaults.
func Load() *Config {
	cfg := &Config{
		Port:       8090,
		WebhookURL: os.Getenv("WEBHOOK_URL"),
		DataDir:    envOrDefault("DATA_DIR", "./data"),
		LogLevel:   envOrDefault("LOG_LEVEL", "info"),
	}

	if p := os.Getenv("PORT"); p != "" {
		if v, err := strconv.Atoi(p); err == nil {
			cfg.Port = v
		}
	}

	return cfg
}

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
