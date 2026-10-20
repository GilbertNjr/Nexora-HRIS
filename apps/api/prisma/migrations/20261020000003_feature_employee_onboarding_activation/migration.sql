-- Migration: Feature Employee Onboarding & Account Activation
-- Description: Adds activation token, expiration, and onboarding status to support self-service employee activation

ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "activation_token" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "activation_expires_at" TIMESTAMPTZ;

-- Create index for rapid activation token lookup
CREATE INDEX IF NOT EXISTS "users_activation_token_idx" ON "users"("activation_token");

-- Add onboarding status to employees
ALTER TABLE "employees"
ADD COLUMN IF NOT EXISTS "onboarding_status" VARCHAR(50) DEFAULT 'ACTIVE';
