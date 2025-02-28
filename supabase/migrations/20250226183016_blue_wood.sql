/*
  # Create community posts tables

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users.id)
      - `content` (text, not null)
      - `likes` (integer, default 0)
      - `created_at` (timestamp with time zone, default now())
    - `comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to posts.id)
      - `user_id` (uuid, foreign key to auth.users.id)
      - `content` (text, not null)
      - `created_at` (timestamp with time zone, default now())
    - `post_likes`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to posts.id)
      - `user_id` (uuid, foreign key to auth.users.id)
      - `created_at` (timestamp with time zone, default now())
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read all posts and comments
    - Add policies for authenticated users to manage their own posts, comments, and likes
*/

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
CREATE POLICY "Allow users to read all posts"
  ON public.posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to insert their own posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own posts"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own posts"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for comments
CREATE POLICY "Allow users to read all comments"
  ON public.comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to insert their own comments"
  ON public.comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own comments"
  ON public.comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own comments"
  ON public.comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for post_likes
CREATE POLICY "Allow users to read all post likes"
  ON public.post_likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to insert their own post likes"
  ON public.post_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own post likes"
  ON public.post_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update post likes count
CREATE OR REPLACE FUNCTION public.handle_post_like()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET likes = likes + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET likes = likes - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for post likes
CREATE TRIGGER on_post_like_added
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_like();

CREATE TRIGGER on_post_like_removed
  AFTER DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_like();