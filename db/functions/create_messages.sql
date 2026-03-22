-- ============================================================
-- TABLE MESSAGES
-- Les messages échangés dans une conversation
-- ============================================================
create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  sender_id       uuid not null,
  content         text not null,
  is_read         boolean not null default false,
  created_at      timestamp default now()
);

alter table messages
  add constraint messages_conversation_fkey
    foreign key (conversation_id) references conversations(id) on delete cascade,
  add constraint messages_sender_fkey
    foreign key (sender_id) references auth.users(id) on delete cascade;

alter table messages enable row level security;
alter table messages force row level security;

-- Un user voit uniquement les messages des conversations dont il fait partie
create policy "messages_select_own"
on messages for select to authenticated
using (
  exists (
    select 1 from conversations
    join matches on matches.id = conversations.match_id
    where conversations.id = messages.conversation_id
      and (matches.user_a_id = auth.uid() or matches.user_b_id = auth.uid())
  )
);

-- Un user peut envoyer un message uniquement dans ses conversations
create policy "messages_insert_own"
on messages for insert to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from conversations
    join matches on matches.id = conversations.match_id
    where conversations.id = messages.conversation_id
      and (matches.user_a_id = auth.uid() or matches.user_b_id = auth.uid())
  )
);

-- Un user peut marquer comme lu uniquement dans ses conversations
create policy "messages_update_read"
on messages for update to authenticated
using (
  exists (
    select 1 from conversations
    join matches on matches.id = conversations.match_id
    where conversations.id = messages.conversation_id
      and (matches.user_a_id = auth.uid() or matches.user_b_id = auth.uid())
  )
)
with check (
  exists (
    select 1 from conversations
    join matches on matches.id = conversations.match_id
    where conversations.id = messages.conversation_id
      and (matches.user_a_id = auth.uid() or matches.user_b_id = auth.uid())
  )
);

-- Pas de DELETE — on ne supprime pas les messages individuellement
