insert into public.account_app_permissions
  (app_slug,permission_id,name,description,required,mutable_by_user,sensitivity,sort_order,active)
values
  (
    'go',
    'identity.basic',
    'Basic account identity',
    'Use your stable THIEPN Account ID to attach Go learning progress to the correct account.',
    true,false,'basic',10,true
  ),
  (
    'go',
    'app_data.read',
    'Read Go cloud progress',
    'Read your own private Go learning state for cross-device recovery and merge.',
    true,false,'basic',20,true
  ),
  (
    'go',
    'app_data.write',
    'Update Go cloud progress',
    'Create and update your own private Go learning state using revision-safe cross-device sync.',
    true,false,'basic',30,true
  )
on conflict (app_slug,permission_id) do update set
  name=excluded.name,
  description=excluded.description,
  required=excluded.required,
  mutable_by_user=excluded.mutable_by_user,
  sensitivity=excluded.sensitivity,
  sort_order=excluded.sort_order,
  active=excluded.active,
  updated_at=now();

insert into public.account_app_grants
  (user_id,app_slug,permission_id,status,granted_at,updated_at)
select
  c.user_id,
  p.app_slug,
  p.permission_id,
  'granted',
  coalesce(c.connected_at,now()),
  now()
from public.account_app_connections c
join public.account_app_permissions p
  on p.app_slug=c.app_slug
 and p.active=true
 and p.required=true
where c.app_slug='go'
  and c.status in ('connected','limited')
on conflict (user_id,app_slug,permission_id) do update set
  status='granted',
  granted_at=coalesce(public.account_app_grants.granted_at,excluded.granted_at),
  updated_at=now();
