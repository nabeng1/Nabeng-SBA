create extension if not exists pgcrypto;

create table if not exists public.timetables (
 id uuid primary key default gen_random_uuid(),
 schoolid text not null,
 academic_year text,
 term text not null check(term in ('term1','term2','term3')),
 class text not null,
 day text not null check(day in ('Monday','Tuesday','Wednesday','Thursday','Friday')),
 period integer not null check(period > 0),
 subject text not null,
 teacher_id uuid,
 teacher_name text,
 start_time time not null,
 end_time time not null,
 room text,
 created_by uuid,
 created_at timestamptz default now(),
 updated_at timestamptz default now()
);

create index if not exists timetables_school_class_idx on public.timetables(schoolid,class,term,academic_year);
create index if not exists timetables_teacher_idx on public.timetables(schoolid,teacher_id,term,academic_year);

alter table public.timetables enable row level security;

-- STAFF: read timetable records belonging to their school.
drop policy if exists "timetable_select_school" on public.timetables;
drop policy if exists "timetable_admin_select" on public.timetables;
create policy "timetable_admin_select"
on public.timetables for select to authenticated
using (
  schoolid=(select schoolid from public.users where id=auth.uid())
  and exists(select 1 from public.users u where u.id=auth.uid() and u.role='admin' and u.schoolid=timetables.schoolid)
);

drop policy if exists "timetable_teacher_select" on public.timetables;
create policy "timetable_teacher_select"
on public.timetables for select to authenticated
using (
  schoolid=(select schoolid from public.users where id=auth.uid())
  and exists(
    select 1 from public.users u
    where u.id=auth.uid()
      and u.role='teacher'
      and u.schoolid=timetables.schoolid
      and timetables.class=any(coalesce(u.classes,array[]::text[]))
  )
);

-- ADMIN: full management for the current school.
drop policy if exists "timetable_admin_insert" on public.timetables;
create policy "timetable_admin_insert"
on public.timetables for insert to authenticated
with check (
  schoolid=(select schoolid from public.users where id=auth.uid())
  and exists(select 1 from public.users u where u.id=auth.uid() and u.role='admin' and u.schoolid=timetables.schoolid)
);

drop policy if exists "timetable_admin_update" on public.timetables;
create policy "timetable_admin_update"
on public.timetables for update to authenticated
using (
  schoolid=(select schoolid from public.users where id=auth.uid())
  and exists(select 1 from public.users u where u.id=auth.uid() and u.role='admin' and u.schoolid=timetables.schoolid)
)
with check (schoolid=(select schoolid from public.users where id=auth.uid()));

drop policy if exists "timetable_admin_delete" on public.timetables;
create policy "timetable_admin_delete"
on public.timetables for delete to authenticated
using (
  schoolid=(select schoolid from public.users where id=auth.uid())
  and exists(select 1 from public.users u where u.id=auth.uid() and u.role='admin' and u.schoolid=timetables.schoolid)
);

-- TEACHER: only their assigned class/subject and their own timetable entries.
drop policy if exists "timetable_teacher_insert" on public.timetables;
create policy "timetable_teacher_insert"
on public.timetables for insert to authenticated
with check (
  schoolid=(select schoolid from public.users where id=auth.uid())
  and teacher_id=auth.uid()
  and exists(
    select 1 from public.users u
    where u.id=auth.uid()
      and u.role='teacher'
      and u.schoolid=timetables.schoolid
      and timetables.class=any(coalesce(u.classes,array[]::text[]))
      and timetables.subject=any(coalesce(u.subjects,array[]::text[]))
  )
);

drop policy if exists "timetable_teacher_update" on public.timetables;
create policy "timetable_teacher_update"
on public.timetables for update to authenticated
using (schoolid=(select schoolid from public.users where id=auth.uid()) and teacher_id=auth.uid())
with check (schoolid=(select schoolid from public.users where id=auth.uid()) and teacher_id=auth.uid());

drop policy if exists "timetable_teacher_delete" on public.timetables;
create policy "timetable_teacher_delete"
on public.timetables for delete to authenticated
using (schoolid=(select schoolid from public.users where id=auth.uid()) and teacher_id=auth.uid());

-- STUDENT PORTAL RPC
-- Your current student portal logs students in through the students table
-- rather than Supabase Auth. This function therefore validates the same
-- student ID/password and returns only that student's class timetable.
create or replace function public.get_student_timetable(
  p_studentid text,
  p_studentpassword text,
  p_term text
)
returns table (
  id uuid,
  schoolid text,
  academic_year text,
  term text,
  class text,
  day text,
  period integer,
  subject text,
  teacher_id uuid,
  teacher_name text,
  start_time time,
  end_time time,
  room text
)
language sql
security definer
set search_path = public
as $$
  select
    t.id, t.schoolid, t.academic_year, t.term, t.class, t.day, t.period,
    t.subject, t.teacher_id, t.teacher_name, t.start_time, t.end_time, t.room
  from public.timetables t
  join public.students s
    on s.schoolid=t.schoolid
   and s.studentclass=t.class
  where s.studentid=p_studentid
    and s.studentpassword=p_studentpassword
    and t.term=p_term
  order by t.day, t.period, t.start_time;
$$;

grant execute on function public.get_student_timetable(text,text,text) to anon, authenticated;
