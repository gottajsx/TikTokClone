-- ============================================================
-- TABLE CONVERSATIONS
-- Une conversation est créée automatiquement lors d'un match
-- ============================================================
create table if not exists conversations (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null unique,        -- 1 match = 1 seule conversation
  created_at timestamp default now()
);

alter table conversations
  add constraint conversations_match_fkey
    foreign key (match_id) references matches(id) on delete cascade;

alter table conversations enable row level security;
alter table conversations force row level security;

-- Un user voit une conversation uniquement s'il est dans le match associé
create policy "conversations_select_own"
on conversations for select to authenticated
using (
  exists (
    select 1 from matches
    where matches.id = conversations.match_id
      and (matches.user_a_id = auth.uid() or matches.user_b_id = auth.uid())
  )
);

-- Pas d'INSERT/UPDATE/DELETE direct — géré par trigger

