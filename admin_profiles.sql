-- Create admin_profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
  cedula VARCHAR(20) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add audit columns to existing tables
ALTER TABLE email_resumes ADD COLUMN IF NOT EXISTS created_by_cedula VARCHAR(20);
ALTER TABLE candidate_tracking ADD COLUMN IF NOT EXISTS created_by_cedula VARCHAR(20);
ALTER TABLE onboarding_candidates ADD COLUMN IF NOT EXISTS created_by_cedula VARCHAR(20);

-- Insert the initial admin profile
INSERT INTO admin_profiles (cedula, name) 
VALUES ('1714639026', 'Administrador Sistema')
ON CONFLICT (cedula) DO NOTHING;

-- Update existing data to belong to this admin (so it doesn't disappear from the UI)
UPDATE email_resumes SET created_by_cedula = '1714639026' WHERE created_by_cedula IS NULL;
UPDATE candidate_tracking SET created_by_cedula = '1714639026' WHERE created_by_cedula IS NULL;
UPDATE onboarding_candidates SET created_by_cedula = '1714639026' WHERE created_by_cedula IS NULL;
