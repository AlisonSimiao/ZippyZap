## Issue: Memory leak - failed sessions remain in sessions map after Connect() fails

### Description

When `createSession` succeeds but `session.Connect` fails, the session stays in the `sessions` map with `StatusFailed`. There's no cleanup mechanism—users must manually call `DeleteSession` to remove it. This could lead to accumulation of dead sessions if callers don't handle this edge case.

### Location

`manager.go:172-183`

### Severity

Medium — affects API reliability under failure conditions.

### Suggested Fix

Add automatic cleanup for failed sessions after a grace period, or remove the session from the map on `Connect` failure.