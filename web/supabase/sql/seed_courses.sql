insert into public.courses (name, slug) values
  ('Calculus 1', 'calculus-1'),
  ('Linear Algebra', 'linear-algebra'),
  ('Introduction to Programming', 'intro-programming'),
  ('Data Structures', 'data-structures'),
  ('Algorithms', 'algorithms')
on conflict (slug) do nothing;

