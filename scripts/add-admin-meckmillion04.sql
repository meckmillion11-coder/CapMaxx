-- Run once in Supabase SQL Editor to grant admin access to meckmillion04@gmail.com
insert into public.admin_users (email, role)
values ('meckmillion04@gmail.com', 'admin')
on conflict (email) do update set role = excluded.role;
