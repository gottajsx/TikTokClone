-- ============================================================
-- TABLE NOTIFICATIONS
-- Message système one-way envoyé automatiquement lors d'un match
-- ============================================================
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,              -- destinataire de la notification
  type        text not null default 'match',
  content     text not null,              -- ex: "Vous avez un match avec YYYY"
  is_read     boolean not null default false,
  related_match_id uuid,                  -- lien optionnel vers le match
  created_at  timestamp default now(),

  constraint notifications_type_check check (type in ('match', 'message', 'system'))
);

alter table notifications
  add constraint notifications_user_fkey
    foreign key (user_id) references auth.users(id) on delete cascade,
  add constraint notifications_match_fkey
    foreign key (related_match_id) references matches(id) on delete cascade;

alter table notifications enable row level security;
alter table notifications force row level security;

-- Un user voit uniquement ses propres notifications
create policy "notifications_select_own"
on notifications for select to authenticated
using (auth.uid() = user_id);

-- Pas d'INSERT direct — géré uniquement par le trigger SECURITY DEFINER
-- Pas d'UPDATE sauf pour marquer comme lu
create policy "notifications_update_read"
on notifications for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Un user peut supprimer ses propres notifications
create policy "notifications_delete_own"
on notifications for delete to authenticated
using (auth.uid() = user_id);