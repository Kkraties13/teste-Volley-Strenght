export type TabType = 'myWorkouts' | 'workouts' | 'community' | 'profile';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  gender: 'male' | 'female';
  positions: VolleyPosition[];
  bio: string;
  avatar?: string;
}

export type VolleyPosition = 
  | 'libero'
  | 'setter'
  | 'passingOutsideHitter'
  | 'attackOutsideHitter'
  | 'middleBlocker'
  | 'oppositeHitter';

export interface Workout {
  id: string;
  title: string;
  description: string;
  position: VolleyPosition;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: number;
  videoUrl?: string;
}

export type PostTopic = 
  | 'dicas' 
  | 'progressoFisico' 
  | 'posicao' 
  | 'taticas' 
  | 'offTopic' 
  | 'fandom' 
  | 'informacoes';

export interface Post {
  id: string;
  userId: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  title: string;
  content: string;
  topic: PostTopic;
  mediaUrls?: string[];
  links?: string[];
  likes: number;
  comments: number;
  userLiked?: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  replyTo?: {
    id: string;
    username: string;
  };
  likes: number;
  userLiked?: boolean;
  createdAt: string;
}

export type ViewMode = 'card' | 'compact';

export type SortOption = 'recent' | 'popular' | 'trending';