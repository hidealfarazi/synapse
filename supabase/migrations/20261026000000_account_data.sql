-- =============================================================================
-- Belajar — data per akun (Supabase Auth + RLS)
-- Jalankan SEKALI di Supabase Dashboard > SQL Editor. Aman dijalankan ulang (idempoten).
-- Setiap baris milik satu akun (user_id = auth.uid()); akun lain tidak bisa membaca/menulis.
-- =============================================================================

create table if not exists public.assignments     (id text not null, user_id uuid not null references auth.users(id) on delete cascade, payload jsonb not null);
create table if not exists public.materials       (id text not null, user_id uuid not null references auth.users(id) on delete cascade, payload jsonb not null);
create table if not exists public.checklist_items (id text not null, user_id uuid not null references auth.users(id) on delete cascade, parent_type text not null check (parent_type in ('assignment','material')), parent_id text not null, payload jsonb not null);
create table if not exists public.checkpoints     (id text not null, user_id uuid not null references auth.users(id) on delete cascade, parent_id text not null, payload jsonb not null);
create table if not exists public.learning_focus  (id text not null, user_id uuid not null references auth.users(id) on delete cascade, day date not null, payload jsonb not null, unique (user_id, day));
create table if not exists public.skill_nodes     (id text not null, user_id uuid not null references auth.users(id) on delete cascade, payload jsonb not null);
create table if not exists public.recommendations (id text not null, user_id uuid not null references auth.users(id) on delete cascade, day date not null, payload jsonb not null, unique (user_id, day));

-- Kunci (user_id, id) di SEMUA tabel: dibutuhkan upsert klien (onConflict "user_id,id")
-- dan membuat id yang sama boleh dipakai akun berbeda tanpa bentrok.
create unique index if not exists assignments_user_id_id     on public.assignments(user_id, id);
create unique index if not exists materials_user_id_id       on public.materials(user_id, id);
create unique index if not exists checklist_items_user_id_id on public.checklist_items(user_id, id);
create unique index if not exists checkpoints_user_id_id     on public.checkpoints(user_id, id);
create unique index if not exists learning_focus_user_id_id  on public.learning_focus(user_id, id);
create unique index if not exists skill_nodes_user_id_id     on public.skill_nodes(user_id, id);
create unique index if not exists recommendations_user_id_id on public.recommendations(user_id, id);

-- Checkpoint hanya boleh menempel ke tugas milik akun yang sama.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'checkpoints_owner_parent') then
    alter table public.checkpoints
      add constraint checkpoints_owner_parent
      foreign key (user_id, parent_id) references public.assignments(user_id, id) on delete cascade;
  end if;
end $$;

-- Checklist punya induk polimorfik (tugas/materi): trigger memvalidasi pemilik induk.
create or replace function public.validate_checklist_parent() returns trigger language plpgsql set search_path = public as $$
begin
  if new.parent_type = 'assignment' and not exists (select 1 from public.assignments where id = new.parent_id and user_id = new.user_id) then
    raise exception 'Assignment parent not found';
  end if;
  if new.parent_type = 'material' and not exists (select 1 from public.materials where id = new.parent_id and user_id = new.user_id) then
    raise exception 'Material parent not found';
  end if;
  return new;
end $$;
drop trigger if exists validate_checklist_parent on public.checklist_items;
create trigger validate_checklist_parent before insert or update on public.checklist_items
  for each row execute function public.validate_checklist_parent();

-- Hapus tugas/materi -> checklist-nya ikut terhapus.
create or replace function public.remove_parent_checklist() returns trigger language plpgsql set search_path = public as $$
begin
  delete from public.checklist_items where user_id = old.user_id and parent_id = old.id and parent_type = tg_argv[0];
  return old;
end $$;
drop trigger if exists delete_assignment_checklist on public.assignments;
create trigger delete_assignment_checklist after delete on public.assignments
  for each row execute function public.remove_parent_checklist('assignment');
drop trigger if exists delete_material_checklist on public.materials;
create trigger delete_material_checklist after delete on public.materials
  for each row execute function public.remove_parent_checklist('material');

-- RLS: hanya pengguna yang sudah login, hanya baris miliknya.
alter table public.assignments     enable row level security;
alter table public.materials       enable row level security;
alter table public.checklist_items enable row level security;
alter table public.checkpoints     enable row level security;
alter table public.learning_focus  enable row level security;
alter table public.skill_nodes     enable row level security;
alter table public.recommendations enable row level security;

drop policy if exists account_only on public.assignments;
drop policy if exists account_only on public.materials;
drop policy if exists account_only on public.checklist_items;
drop policy if exists account_only on public.checkpoints;
drop policy if exists account_only on public.learning_focus;
drop policy if exists account_only on public.skill_nodes;
drop policy if exists account_only on public.recommendations;

create policy account_only on public.assignments     for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy account_only on public.materials       for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy account_only on public.checklist_items for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy account_only on public.checkpoints     for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy account_only on public.learning_focus  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy account_only on public.skill_nodes     for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy account_only on public.recommendations for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Pertahanan berlapis: pengunjung anonim tidak punya akses sama sekali.
revoke all on public.assignments, public.materials, public.checklist_items, public.checkpoints,
              public.learning_focus, public.skill_nodes, public.recommendations from anon;

create index if not exists checklist_parent_lookup on public.checklist_items(user_id, parent_type, parent_id);
create index if not exists checkpoints_parent_lookup on public.checkpoints(user_id, parent_id);
