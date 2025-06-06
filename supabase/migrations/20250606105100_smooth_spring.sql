/*
  # Update messages table schema

  1. Changes
    - Add username column to messages table
    - Add message_id column for unique identification
    - Update text column to store formatted messages

  2. Security
    - Maintain existing RLS if any
*/

-- Add new columns to messages table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'username'
  ) THEN
    ALTER TABLE messages ADD COLUMN username TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'message_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN message_id TEXT;
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_message_id ON messages(message_id);