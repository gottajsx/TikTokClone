-- ============================================================
-- CRÉATION DE LA TABLE
-- ============================================================
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null,
  user_b_id uuid not null,
  created_at timestamp default now(),

  -- On force user_a_id < user_b_id pour éviter les doublons (A,B) et (B,A)
  constraint check_user_order check (user_a_id < user_b_id),
  constraint unique_match unique (user_a_id, user_b_id)
);

-- ============================================================
-- CLÉS ÉTRANGÈRES avec CASCADE
-- Supprime le match si l'un des deux users est supprimé
-- ============================================================
alter table matches
  add constraint matches_user_a_fkey
    foreign key (user_a_id) references auth.users(id) on delete cascade,
  add constraint matches_user_b_fkey
    foreign key (user_b_id) references auth.users(id) on delete cascade;

-- ============================================================
-- ACTIVATION DU RLS
-- ============================================================
alter table matches enable row level security;
alter table matches force row level security;

-- ============================================================
-- SELECT — Un user ne voit que ses propres matchs
-- ============================================================
create policy "matches_select_own"
on matches
for select
to authenticated
using (
  auth.uid() = user_a_id
  or auth.uid() = user_b_id
);

-- ============================================================
-- INSERT — Bloqué pour les users
-- Les matchs sont créés uniquement via une fonction SQL sécurisée
-- déclenchée lors d'un like réciproque (voir trigger ci-dessous)
-- ============================================================
-- (aucune policy INSERT — deny by default)

-- ============================================================
-- DELETE — Un user peut supprimer (= "dématcher") ses propres matchs
-- ============================================================
create policy "matches_delete_own"
on matches
for delete
to authenticated
using (
  auth.uid() = user_a_id
  or auth.uid() = user_b_id
);

-- ============================================================
-- UPDATE — Bloqué complètement, un match ne se modifie pas
-- ============================================================
-- (aucune policy UPDATE — deny by default)


-- ============================================================
-- TRIGGER — Crée automatiquement un match lors d'un like réciproque
-- S'exécute en SECURITY DEFINER pour bypasser le RLS sur INSERT
-- ============================================================
create or replace function handle_match_on_like()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Vérifie si le like inverse existe déjà
  if exists (
    select 1 from likes
    where liker_id = new.liked_id
      and liked_id  = new.liker_id
  ) then
    -- Insère le match en respectant la contrainte user_a_id < user_b_id
    insert into matches (user_a_id, user_b_id)
    values (
      least(new.liker_id, new.liked_id),
      greatest(new.liker_id, new.liked_id)
    )
    on conflict do nothing; -- idempotent si le match existe déjà
  end if;

  return new;
end;
$$;

create trigger on_like_inserted
  after insert on likes
  for each row
  execute function handle_match_on_like();


-- ============================================================
-- TRIGGER — Supprime le match si un like est retiré (unmatch implicite)
-- ============================================================
create or replace function handle_unmatch_on_unlike()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from matches
  where user_a_id = least(old.liker_id, old.liked_id)
    and user_b_id = greatest(old.liker_id, old.liked_id);

  return old;
end;
$$;

create trigger on_like_deleted
  after delete on likes
  for each row
  execute function handle_unmatch_on_unlike();