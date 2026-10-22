create table if not exists public.wedding_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.wedding_guests (
  id text primary key,
  token text not null unique,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.wedding_config (
  id text primary key check (id = 'default'),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.wedding_wishes (
  id uuid primary key default gen_random_uuid(),
  guest_id text references public.wedding_guests(id) on delete set null,
  guest_name text not null,
  message text not null check (char_length(message) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.wedding_admins enable row level security;
alter table public.wedding_guests enable row level security;
alter table public.wedding_config enable row level security;
alter table public.wedding_wishes enable row level security;

grant select, insert, update, delete on public.wedding_guests to authenticated;
grant select, insert, update, delete on public.wedding_config to authenticated;
grant select, delete on public.wedding_wishes to authenticated;

create or replace function public.is_wedding_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.wedding_admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_wedding_admin() from public, anon;
grant execute on function public.is_wedding_admin() to authenticated;

drop policy if exists "Wedding admins can read guest records" on public.wedding_guests;
drop policy if exists "Wedding admins can insert guest records" on public.wedding_guests;
drop policy if exists "Wedding admins can update guest records" on public.wedding_guests;
drop policy if exists "Wedding admins can delete guest records" on public.wedding_guests;
drop policy if exists "Wedding admins can manage invitation config" on public.wedding_config;
drop policy if exists "Wedding admins can read wishes" on public.wedding_wishes;
drop policy if exists "Wedding admins can delete wishes" on public.wedding_wishes;

create policy "Wedding admins can read guest records"
  on public.wedding_guests for select to authenticated
  using (public.is_wedding_admin());

create policy "Wedding admins can insert guest records"
  on public.wedding_guests for insert to authenticated
  with check (public.is_wedding_admin());

create policy "Wedding admins can update guest records"
  on public.wedding_guests for update to authenticated
  using (public.is_wedding_admin())
  with check (public.is_wedding_admin());

create policy "Wedding admins can delete guest records"
  on public.wedding_guests for delete to authenticated
  using (public.is_wedding_admin());

create policy "Wedding admins can manage invitation config"
  on public.wedding_config for all to authenticated
  using (public.is_wedding_admin())
  with check (public.is_wedding_admin());

create policy "Wedding admins can read wishes"
  on public.wedding_wishes for select to authenticated
  using (public.is_wedding_admin());

create policy "Wedding admins can delete wishes"
  on public.wedding_wishes for delete to authenticated
  using (public.is_wedding_admin());

create or replace function public.get_guest_by_token(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select data - array['phoneNumber', 'telegramUsername', 'note', 'tableNumber']
  from public.wedding_guests
  where token = p_token
    and coalesce((data ->> 'isActive')::boolean, false);
$$;

create or replace function public.get_published_wedding_config()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select data
  from public.wedding_config
  where id = 'default';
$$;

create or replace function public.submit_guest_rsvp(
  p_token text,
  p_status text,
  p_attending_count integer,
  p_dietary text default null,
  p_wishes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_data jsonb;
  max_seats integer;
begin
  if p_status is null or p_status not in ('attending', 'declined', 'pending') then
    raise exception 'Invalid RSVP status';
  end if;
  if p_wishes is not null and char_length(btrim(p_wishes)) > 1000 then
    raise exception 'Wish message cannot exceed 1000 characters';
  end if;

  select greatest(coalesce((data ->> 'allocatedSeats')::integer, 1), 1)
  into max_seats
  from public.wedding_guests
  where token = p_token
    and coalesce((data ->> 'isActive')::boolean, false);

  if max_seats is null then
    return null;
  end if;
  if p_status = 'attending' and (p_attending_count < 1 or p_attending_count > max_seats) then
    raise exception 'Attending count exceeds allocated seats';
  end if;

  update public.wedding_guests
  set data = data || jsonb_build_object(
        'rsvpStatus', p_status,
        'attendingGuestsCount', case when p_status = 'attending' then p_attending_count else 0 end,
        'dietaryRequirements', nullif(p_dietary, ''),
        'guestWishes', nullif(p_wishes, ''),
        'rsvpSubmittedAt', now(),
        'updatedAt', now()
      ),
      updated_at = now()
  where token = p_token
    and coalesce((data ->> 'isActive')::boolean, false)
  returning data - array['phoneNumber', 'telegramUsername', 'note', 'tableNumber'] into updated_data;

  if nullif(btrim(p_wishes), '') is not null then
    insert into public.wedding_wishes (guest_id, guest_name, message)
    select g.id,
           concat_ws(' ',
             nullif(g.data ->> 'honorificKm', ''),
             nullif(g.data ->> 'nameKm', '')
           ),
           btrim(p_wishes)
    from public.wedding_guests as g
    where g.token = p_token
      and coalesce((g.data ->> 'isActive')::boolean, false);
  end if;

  return updated_data;
end;
$$;

revoke all on function public.get_guest_by_token(text) from public;
revoke all on function public.get_published_wedding_config() from public;
revoke all on function public.submit_guest_rsvp(text, text, integer, text, text) from public;
grant execute on function public.get_guest_by_token(text) to anon, authenticated;
grant execute on function public.get_published_wedding_config() to anon, authenticated;
grant execute on function public.submit_guest_rsvp(text, text, integer, text, text) to anon, authenticated;

create or replace function public.get_public_wedding_wishes()
returns table (
  id uuid,
  guest_name text,
  message text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select w.id, w.guest_name, w.message, w.created_at
  from public.wedding_wishes as w
  order by w.created_at desc
  limit 100;
$$;

create or replace function public.submit_guest_wish(p_token text, p_message text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  matched_guest_id text;
  display_name text := 'ភ្ញៀវកិត្តិយស';
  created_wish public.wedding_wishes%rowtype;
begin
  if p_message is null or char_length(btrim(p_message)) not between 1 and 1000 then
    raise exception 'Wish message must contain between 1 and 1000 characters';
  end if;

  if nullif(btrim(p_token), '') is null then
    raise exception 'A valid guest invitation is required to submit a wish';
  end if;

  select g.id,
         concat_ws(' ',
           nullif(g.data ->> 'honorificKm', ''),
           nullif(g.data ->> 'nameKm', '')
         )
  into matched_guest_id, display_name
  from public.wedding_guests as g
  where g.token = p_token
    and coalesce((g.data ->> 'isActive')::boolean, false);

  if matched_guest_id is null then
    raise exception 'Invitation link is invalid or inactive';
  end if;

  insert into public.wedding_wishes (guest_id, guest_name, message)
  values (matched_guest_id, display_name, btrim(p_message))
  returning * into created_wish;

  return jsonb_build_object(
    'id', created_wish.id,
    'guest_name', created_wish.guest_name,
    'message', created_wish.message,
    'created_at', created_wish.created_at
  );
end;
$$;

revoke all on function public.get_public_wedding_wishes() from public;
revoke all on function public.submit_guest_wish(text, text) from public;
grant execute on function public.get_public_wedding_wishes() to anon, authenticated;
grant execute on function public.submit_guest_wish(text, text) to anon, authenticated;

notify pgrst, 'reload schema';
