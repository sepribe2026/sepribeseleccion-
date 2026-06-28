-- SQL script to add confirmation and attendance fields to formative candidates
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/zfbrwcflzbauycszajpc/sql

-- 1. Add columns to formative_candidates if they do not exist
ALTER TABLE formative_candidates 
ADD COLUMN IF NOT EXISTS confirmed BOOLEAN DEFAULT FALSE;

ALTER TABLE formative_candidates 
ADD COLUMN IF NOT EXISTS attended BOOLEAN DEFAULT FALSE;

-- 2. Recalculate/refresh RLS policy just in case (optional, but good practice)
-- All policies in formative_candidates currently allow full public access (select/insert/update/delete)
