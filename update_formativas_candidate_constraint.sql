-- Drop the old unique constraint on resume_id
ALTER TABLE formative_candidates DROP CONSTRAINT IF EXISTS formative_candidates_resume_id_key;

-- Drop the new composite constraint if it exists to avoid duplicates
ALTER TABLE formative_candidates DROP CONSTRAINT IF EXISTS formative_candidates_resume_id_created_by_user_key;

-- Add the new unique constraint on (resume_id, created_by_user)
ALTER TABLE formative_candidates ADD CONSTRAINT formative_candidates_resume_id_created_by_user_key UNIQUE (resume_id, created_by_user);
