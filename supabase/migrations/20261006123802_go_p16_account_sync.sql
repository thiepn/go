begin;

insert into public.account_apps (
  slug,
  name,
  description,
  path,
  active,
  sort_order
)
values (
  'go',
  'Go',
  'Learn Go interactively from the first stone through independent play, review, and study.',
  '/go/',
  true,
  90
)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  path = excluded.path,
  active = excluded.active,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.account_app_manifests (
  app_slug,
  manifest_version,
  identity_scope,
  data_scope,
  export_scope,
  capabilities
)
values (
  'go',
  1,
  'shared',
  'isolated',
  'app-owned',
  '{
    "account": true,
    "sync": true,
    "guestFirst": true,
    "offlineFirst": true,
    "cloud_saves": true,
    "export_data": true,
    "delete_app_data": true,
    "sharedIdentity": true,
    "isolatedData": true,
    "activityTracking": true
  }'::jsonb
)
on conflict (app_slug) do update
set
  manifest_version = excluded.manifest_version,
  identity_scope = excluded.identity_scope,
  data_scope = excluded.data_scope,
  export_scope = excluded.export_scope,
  capabilities = excluded.capabilities,
  updated_at = now();

create table if not exists public.go_user_state (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,
  schema_version smallint not null
    default 1
    check (schema_version = 1),
  revision bigint not null
    default 1
    check (revision >= 1),
  payload jsonb not null
    default '{}'::jsonb
    check (jsonb_typeof(payload) = 'object'),
  client_updated_at bigint not null
    default 0
    check (client_updated_at >= 0),
  updated_at timestamptz not null
    default now(),
  constraint go_user_state_payload_size
    check (
      octet_length(payload::text) <= 5242880
    )
);

comment on table public.go_user_state is
  'Per-user Go learning state owned by the Go app. THIEPN Account remains the identity authority.';

alter table public.go_user_state
  enable row level security;

revoke all
  on table public.go_user_state
  from anon, authenticated;

grant select, insert, update, delete
  on table public.go_user_state
  to authenticated;

drop policy if exists
  "go_user_state_select_own"
  on public.go_user_state;
create policy
  "go_user_state_select_own"
  on public.go_user_state
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
  );

drop policy if exists
  "go_user_state_insert_own"
  on public.go_user_state;
create policy
  "go_user_state_insert_own"
  on public.go_user_state
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
  );

drop policy if exists
  "go_user_state_update_own"
  on public.go_user_state;
create policy
  "go_user_state_update_own"
  on public.go_user_state
  for update
  to authenticated
  using (
    (select auth.uid()) = user_id
  )
  with check (
    (select auth.uid()) = user_id
  );

drop policy if exists
  "go_user_state_delete_own"
  on public.go_user_state;
create policy
  "go_user_state_delete_own"
  on public.go_user_state
  for delete
  to authenticated
  using (
    (select auth.uid()) = user_id
  );

create or replace function public.go_sync_write(
  p_expected_revision bigint,
  p_payload jsonb,
  p_client_updated_at bigint
)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_revision bigint;
begin
  if v_user_id is null then
    raise insufficient_privilege
      using message = 'Authentication required.';
  end if;

  if p_expected_revision < 0 then
    raise invalid_parameter_value
      using message = 'Expected revision must be non-negative.';
  end if;

  if
    p_payload is null
    or jsonb_typeof(p_payload) <> 'object'
  then
    raise invalid_parameter_value
      using message = 'Go sync payload must be a JSON object.';
  end if;

  if octet_length(p_payload::text) > 5242880 then
    raise program_limit_exceeded
      using message = 'Go sync payload exceeds the 5 MiB limit.';
  end if;

  if p_client_updated_at < 0 then
    raise invalid_parameter_value
      using message = 'Client timestamp must be non-negative.';
  end if;

  if p_expected_revision = 0 then
    insert into public.go_user_state (
      user_id,
      schema_version,
      revision,
      payload,
      client_updated_at,
      updated_at
    )
    values (
      v_user_id,
      1,
      1,
      p_payload,
      p_client_updated_at,
      now()
    )
    on conflict (user_id) do nothing
    returning revision into v_revision;
  else
    update public.go_user_state
    set
      payload = p_payload,
      revision = revision + 1,
      client_updated_at = p_client_updated_at,
      updated_at = now()
    where
      user_id = v_user_id
      and revision = p_expected_revision
    returning revision into v_revision;
  end if;

  return v_revision;
end;
$$;

revoke all
  on function public.go_sync_write(bigint, jsonb, bigint)
  from public, anon;

grant execute
  on function public.go_sync_write(bigint, jsonb, bigint)
  to authenticated;

comment on function public.go_sync_write(bigint, jsonb, bigint) is
  'Optimistic-concurrency write for the signed-in user Go learning state. Returns NULL on revision conflict.';

commit;
