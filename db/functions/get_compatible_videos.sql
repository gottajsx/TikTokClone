create or replace function get_compatible_videos(
  p_user_id uuid,
  p_limit int default 10
)
returns table (
  profile_id uuid,
  username text,
  gender text,
  video_url text,
  video_text text
)
language sql
stable
as $$
with me as (
  select 
    p.id,
    p.gender,
    pref.gender_preferences
  from profiles p
  join preferences pref on pref.user_id = p.id
  where p.id = p_user_id
)

select
  p.id,
  p.username,
  p.gender,
  p.video_url,
  p.video_text
from profiles p
join preferences pref on pref.user_id = p.id
join me on true
where

p.id != me.id
and p.video_url is not null
and p.gender = any(me.gender_preferences)
and me.gender = any(pref.gender_preferences)

limit p_limit;
$$;