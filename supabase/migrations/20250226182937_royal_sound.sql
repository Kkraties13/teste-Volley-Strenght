/*
  # Create workouts tables

  1. New Tables
    - `workouts`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text, not null)
      - `position` (text, not null)
      - `created_at` (timestamp with time zone, default now())
      - `updated_at` (timestamp with time zone, default now())
    - `exercises`
      - `id` (uuid, primary key)
      - `workout_id` (uuid, foreign key to workouts.id)
      - `name` (text, not null)
      - `description` (text, not null)
      - `sets` (integer, not null)
      - `reps` (integer, not null)
      - `video_url` (text)
      - `created_at` (timestamp with time zone, default now())
    - `user_workouts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users.id)
      - `workout_id` (uuid, foreign key to workouts.id)
      - `created_at` (timestamp with time zone, default now())
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read all workouts
    - Add policies for authenticated users to manage their own user_workouts
*/

-- Create workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  position TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create user_workouts table (for saved workouts)
CREATE TABLE IF NOT EXISTS public.user_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, workout_id)
);

-- Enable Row Level Security
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_workouts ENABLE ROW LEVEL SECURITY;

-- Create policies for workouts
CREATE POLICY "Allow users to read all workouts"
  ON public.workouts
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for exercises
CREATE POLICY "Allow users to read all exercises"
  ON public.exercises
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user_workouts
CREATE POLICY "Allow users to read their own saved workouts"
  ON public.user_workouts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own saved workouts"
  ON public.user_workouts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own saved workouts"
  ON public.user_workouts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);