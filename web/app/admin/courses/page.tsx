import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AddCourseButton } from "@/app/admin/courses/AddCourseButton";

export default async function AdminCoursesPage() {
  const supabase = await getSupabaseServerClient();

  const { data: coursesRaw } = await supabase
    .from("courses")
    .select(`
      id,
      name,
      slug,
      mentor_courses(count),
      rooms:bookings(count)
    `)
    .order("name", { ascending: true });

  const courses = coursesRaw?.map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    mentorCount: c.mentor_courses?.[0]?.count || 0,
    roomCount: c.rooms?.[0]?.count || 0,
  })) || [];

  return (
    <main className="flex-1 overflow-y-auto p-8 lg:p-10 max-w-[1280px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface mb-xs">Course Management</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Manage academic curriculum and monitor course adoption.</p>
        </div>
        <AddCourseButton />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 shadow-[0px_4px_20px_rgba(0,0,0,0.02)]">
          <span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
          <input 
            type="text" 
            placeholder="Search courses..." 
            className="bg-transparent border-none font-label-md text-label-md text-on-surface focus:ring-0 outline-none placeholder:text-on-surface-variant"
          />
        </div>
      </div>

      {/* Bento Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-[0px_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)] hover:border-primary/20 transition-all duration-200 group relative flex flex-col justify-between">
            <div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button className="p-2 bg-surface rounded-md text-on-surface-variant hover:text-error transition-colors border border-outline-variant">
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 bg-surface-container font-label-sm text-label-sm text-on-surface rounded-md">
                  {course.slug}
                </span>
              </div>
              
              <div className="mb-6">
                <h3 className="font-h3 text-h3 text-on-surface line-clamp-2">{course.name}</h3>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/50">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-primary">{course.mentorCount}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">Active Mentors</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-label-md text-label-md text-on-surface">{course.roomCount}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">Past Sessions</span>
              </div>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="col-span-full p-12 flex flex-col items-center justify-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm">
            <span className="material-symbols-outlined text-4xl mb-2">library_books</span>
            <p className="font-body-md">No courses found in the database.</p>
          </div>
        )}
      </div>
    </main>
  );
}
