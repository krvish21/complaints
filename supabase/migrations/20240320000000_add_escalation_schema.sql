-- Create enum for complaint status
CREATE TYPE complaint_status AS ENUM ('pending', 'upheld', 'resolved', 'ok');
CREATE TYPE plea_status AS ENUM ('pending', 'accepted', 'rejected');

-- Update complaints table
ALTER TABLE complaints 
  ADD COLUMN status complaint_status DEFAULT 'pending',
  ADD COLUMN escalated_at timestamptz,
  ADD COLUMN escalated_by text REFERENCES user_profiles(user_id),
  ADD CONSTRAINT fk_user_profiles 
    FOREIGN KEY (user_id) 
    REFERENCES user_profiles(user_id) 
    ON DELETE CASCADE;

-- Create pleas table
CREATE TABLE pleas (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  complaint_id uuid REFERENCES complaints(id) ON DELETE CASCADE,
  content text NOT NULL,
  user_id text REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  status plea_status DEFAULT 'pending',
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  resolved_at timestamptz,
  resolved_by text REFERENCES user_profiles(user_id) ON DELETE SET NULL
);

-- Update replies table to ensure proper relationships
ALTER TABLE replies
  ADD CONSTRAINT fk_user_profiles 
    FOREIGN KEY (user_id) 
    REFERENCES user_profiles(user_id) 
    ON DELETE CASCADE;

-- Update reactions table to ensure proper relationships
ALTER TABLE reactions
  ADD CONSTRAINT fk_user_profiles 
    FOREIGN KEY (user_id) 
    REFERENCES user_profiles(user_id) 
    ON DELETE CASCADE;

-- Update compensations table to ensure proper relationships
ALTER TABLE compensations
  ADD CONSTRAINT fk_user_profiles 
    FOREIGN KEY (user_id) 
    REFERENCES user_profiles(user_id) 
    ON DELETE CASCADE; 