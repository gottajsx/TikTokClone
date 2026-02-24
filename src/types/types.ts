export type User = {
  id: string;
  email: string;
  username: string;
};

export type Post = {
  id: string;
  video_url: string;
  description: string;
  user: User;
  nrOfLikes: { count: number }[];
  nrOfComments: { count: number }[];
  nrOfShares: { count: number }[];
};

export type PostInput = {
  video_url: string;
  description: string;
  user_id: string;
};

export type Comment = {
  id: string
  post_id: string
  user_id: string
  comment: string
  created_at: string
}

export type NewCommentInput = {
  post_id: string
  user_id: string
  comment: string
}

export type VideoItem = {
  id: number;
  uri: string;
  thumbnail: string;
};

/**
 * Type représentant une ligne de la table public.profiles
 */
export type Profile = {
  id: string;                    // uuid → string (Supabase retourne les UUID sous forme de string)
  username: string;              // text NOT NULL + unique
  gender: 'male' | 'female' | 'non-binary' | null;
  birth_date: string;            // date → string au format ISO 'YYYY-MM-DD'
  bio: string | null;            // text NULL
  profile_completion: number | null;  // integer NULL (default 0)
  is_visible: boolean | null;    // boolean NULL (default true)
  is_incognito: boolean | null;  // boolean NULL (default false)
  created_at: string;            // timestamptz → string ISO avec timezone (ex: '2025-02-24T14:35:22.123+00')
  updated_at: string;            // idem
};

/**
 * Type représentant une ligne de la table public.preferences
 */
export type Preferences = {
  user_id: string;               // uuid → string (clé primaire et FK vers profiles.id)
  gender_preference: 'male' | 'female' | 'non-binary' | null;
  min_age: number | null;        // integer NULL (default 18)
  max_age: number | null;        // integer NULL (default 99)
  created_at: string;            // timestamptz → string ISO avec timezone
};