-- Migration: Feature User Profile & Avatar
-- Description: Adds avatar_url, preferred_name, and phone to user master records

ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;

-- Create index for quick user lookup by email and status
CREATE INDEX IF NOT EXISTS "users_email_status_idx" ON "users"("email", "status");
