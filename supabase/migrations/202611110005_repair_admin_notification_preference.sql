-- Restore the singleton preference row if it was removed from an existing project.
insert into public.admin_notification_preferences (singleton, enabled)
values (true, true)
on conflict (singleton) do nothing;
