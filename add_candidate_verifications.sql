ALTER TABLE email_resumes 
ADD COLUMN IF NOT EXISTS work_references JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS background_checks JSONB DEFAULT '{}'::jsonb;
