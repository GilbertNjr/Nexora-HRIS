-- Migration: Feature Real-Time Audit Logs & Telemetry
-- Description: Adds high-performance indexes and category tags for zero-delay audit querying

CREATE INDEX IF NOT EXISTS "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "audit_logs_module_created_at_idx" ON "audit_logs"("module", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at" DESC);
