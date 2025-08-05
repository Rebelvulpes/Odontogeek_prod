-- Add bio column to users table if it doesn't exist
DO $$ 
BEGIN
    -- Check if bio column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'bio'
    ) THEN
        -- Add bio column
        ALTER TABLE users ADD COLUMN bio TEXT;
        
        RAISE NOTICE 'Bio column added to users table successfully';
    ELSE
        RAISE NOTICE 'Bio column already exists in users table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'bio';
