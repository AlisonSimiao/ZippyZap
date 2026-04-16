package store

import (
	"database/sql"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

// SessionRecord is a row in the sessions metadata table.
type SessionRecord struct {
	SessionID string
	JID       string
	CreatedAt time.Time
	UpdatedAt time.Time
}

// Store manages the central metadata SQLite database that tracks which sessions exist
// and their associated WhatsApp JIDs. Each session's actual device keys live in a
// separate per-session SQLite file managed by whatsmeow.
type Store struct {
	db *sql.DB
}

// New opens (or creates) the metadata database at dbPath and ensures the schema exists.
func New(dbPath string) (*Store, error) {
	db, err := sql.Open("sqlite3", dbPath+"?_foreign_keys=on&_journal_mode=WAL")
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS sessions (
			session_id TEXT PRIMARY KEY,
			jid        TEXT NOT NULL DEFAULT '',
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return nil, err
	}

	return &Store{db: db}, nil
}

// Register inserts a new session. If it already exists the call is a no-op.
func (s *Store) Register(sessionID string) error {
	_, err := s.db.Exec(
		`INSERT OR IGNORE INTO sessions (session_id) VALUES (?)`,
		sessionID,
	)
	return err
}

// UpdateJID stores the WhatsApp JID once the session authenticates.
func (s *Store) UpdateJID(sessionID, jid string) error {
	_, err := s.db.Exec(
		`UPDATE sessions SET jid = ?, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?`,
		jid, sessionID,
	)
	return err
}

// GetAll returns every registered session.
func (s *Store) GetAll() ([]SessionRecord, error) {
	rows, err := s.db.Query(
		`SELECT session_id, jid, created_at, updated_at FROM sessions`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []SessionRecord
	for rows.Next() {
		var r SessionRecord
		if err := rows.Scan(&r.SessionID, &r.JID, &r.CreatedAt, &r.UpdatedAt); err != nil {
			return nil, err
		}
		records = append(records, r)
	}
	return records, rows.Err()
}

// Delete removes a session record from the metadata store.
func (s *Store) Delete(sessionID string) error {
	_, err := s.db.Exec(`DELETE FROM sessions WHERE session_id = ?`, sessionID)
	return err
}

// Close releases the database connection.
func (s *Store) Close() error {
	return s.db.Close()
}
