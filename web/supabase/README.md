## Supabase setup for Peerly

Run these SQL files in order in the Supabase SQL editor:

1. `supabase/sql/tables.sql`
2. `supabase/sql/triggers.sql`
3. `supabase/sql/policies.sql`
4. `supabase/sql/seed_courses.sql`

Make sure Row Level Security (RLS) is enabled for all tables.

### Set first admin

After registering a user, set them as admin (run in SQL editor):

```sql
update public.profiles set role = 'admin' where id = 'your-auth-user-uuid';
```

