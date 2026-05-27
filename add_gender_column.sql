-- Add gender column to email_resumes table
ALTER TABLE email_resumes ADD COLUMN IF NOT EXISTS gender VARCHAR(100);
