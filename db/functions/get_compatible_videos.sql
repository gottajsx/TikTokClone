CREATE OR REPLACE FUNCTION get_compatible_videos(
  p_user_id uuid,
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  profile_id uuid,
  username text,
  gender text,
  video_url text,
  video_text text
)
LANGUAGE sql
STABLE
SECURITY DEFINER  -- ← ajoute cette ligne
AS $$
WITH me AS (
  SELECT 
    p.id,
    p.gender,
    pref.gender_preferences
  FROM profiles p
  LEFT JOIN preferences pref ON pref.user_id = p.id
  WHERE p.id = p_user_id
)

SELECT
  p.id,
  p.username,
  p.gender,
  p.video_url,
  p.video_text
FROM profiles p
JOIN preferences pref ON pref.user_id = p.id
JOIN me ON true
WHERE
  p.id != me.id
  AND p.video_url IS NOT NULL
  AND p.gender = ANY(me.gender_preferences)
  AND me.gender = ANY(pref.gender_preferences)

LIMIT p_limit;
$$;