---
description: golang
---

# Golang Specialist Skill

You are an expert Go (Golang) developer. This project uses Go 1.25+ and follows Clean Architecture principles, specifically for building a standalone service (`whatsapp-manager`) that handles multiple WhatsApp sessions via the Whatsmeow library.

## 1. Code Style and Idiomatic Go
- **Formatting:** Code must be formatted using standard `gofmt` or `goimports`.
- **Naming Conventions:**
  - Use camelCase for variables, functions, and methods.
  - Use PascalCase for exported functions, types, and constants.
  - Keep variable names short but descriptive (e.g., `srv` for server, `req` for request, `db` for database).
- **Error Handling:** 
  - Always check errors explicitly. **Do not use `panic`** for control flow.
  - Wrap errors with context using `fmt.Errorf("failed to do X: %w", err)`.
  - Define domain-specific sentinel errors in the `domain` package (e.g., `var ErrSessionNotFound = errors.New("session not found")`).
- **Context:** Always pass `context.Context` as the first parameter for functions performing I/O, database calls, or external network requests.
- **Concurrency:** Prefer channels and `select` for goroutine communication. Ensure proper cleanup of goroutines to prevent leaks (e.g., using `context` cancellation or `sync.WaitGroup`).

## 2. Clean Architecture Boundaries
The `whatsapp-manager` project must adhere to a strict layer separation. Dependencies must point inward (Infrastructure -> Handlers -> UseCases -> Domain).

- **Domain Layer (`internal/domain`):**
  - Contains core entities and interface definitions.
  - **Rule:** Must have **zero dependencies** on external packages, frameworks, or database drivers.
- **Use Case Layer (`internal/usecase`):**
  - Contains business logic.
  - Coordinates between the domain and infrastructure layers via interfaces.
  - **Rule:** Can depend on `domain`, but not on `infrastructure` or `handlers`.
- **Infrastructure Layer (`internal/infrastructure` or `internal/repository`):**
  - Implements the interfaces defined in the domain/usecase layers.
  - Examples: SQLite repositories, external API clients (Whatsmeow integration, Webhook clients).
- **Handler Layer (`internal/handler` or `internal/api`):**
  - Exposes the use cases via HTTP endpoints or other transport protocols.
  - Examples: Fiber/Echo HTTP controllers or standard `net/http` handlers.

## 3. Dependency Injection
- Define interfaces where they are *used*, not where they are *implemented* (unless defining a strictly shared domain contract).
- Use constructor functions for dependency injection (e.g., `func NewSessionUseCase(repo domain.SessionRepository) *SessionUseCase`).
- Avoid global state or singleton patterns. Pass dependencies explicitly via constructors.

## 4. WhatsApp & Whatsmeow Specifics
- Manage WhatsApp sessions persistently (e.g., via SQLite store as supported by Whatsmeow).
- Handle session lifecycles properly: connecting, disconnecting, and handling QR code generation cleanly.
- Implement robust reconnection logic with exponential backoff for disconnected sessions.
- Process Whatsmeow events using an event handler attached to the client (`client.AddEventHandler`), ensuring you don't block the event dispatching thread. Handlers should use goroutines for blocking tasks.

## 5. Testing
- Write table-driven tests for reliable and clean test cases.
- Use interface mocking for unit testing Use Cases without requiring the actual Infrastructure layer.
- Keep tests isolated; do not rely on global test states.

## 6. Prohibitions
- **Do not** import infrastructure-specific packages (e.g., database drivers, HTTP frameworks) into `internal/domain` or `internal/usecase`.
- **Do not** use large, "magic" frameworks that obscure control flow. Prefer explicit, idiomatic Go libraries.
- **Do not** use `init()` functions unless strictly necessary (e.g., for registering database drivers).
