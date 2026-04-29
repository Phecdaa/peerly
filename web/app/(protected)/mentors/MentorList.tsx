"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Course = { id: number; name: string; slug: string };
type Mentor = {
  id: string;
  full_name: string | null;
  avatar_url?: string | null;
  university: string | null;
  bio?: string | null;
  hourly_rate: number | null;
  courses: Course[];
  average_rating?: number | null;
  review_count?: number;
};

export function MentorList({
  mentors,
  courses,
}: {
  mentors: Mentor[];
  courses: Course[];
}) {
  const router = useRouter();
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  const filtered = mentors.filter((m) => {
    const matchCourse =
      !courseFilter ||
      m.courses.some((c) => String(c.id) === courseFilter);
    const matchSearch =
      !search.trim() ||
      (m.full_name?.toLowerCase().includes(search.trim().toLowerCase()) ||
        m.bio?.toLowerCase().includes(search.trim().toLowerCase()) ||
        m.university?.toLowerCase().includes(search.trim().toLowerCase()) ||
        m.courses.some((c) => c.name.toLowerCase().includes(search.trim().toLowerCase())));
    return matchCourse && matchSearch;
  });

  const featuredMentor = filtered[0];
  const standardMentors = filtered.slice(1);

  return (
    <>
      {/* Header & Search Context */}
      <header className="flex flex-col gap-lg mb-xl pt-4">
        <div>
          <h1 className="font-h1 text-h1 text-on-background mb-unit">Find Mentors</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Connect with top-rated peers for guided study sessions.</p>
        </div>
        
        {/* Complex Search & Filter Bar */}
        <div className="bg-surface-container-lowest p-md rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant flex flex-col md:flex-row gap-md items-center">
          <div className="relative flex-grow w-full">
            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by course, topic, or mentor name..."
              className="w-full pl-xl pr-md py-3 bg-surface-container-low border border-transparent rounded-lg focus:border-primary focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary-fixed transition-all font-body-md text-on-surface outline-none" 
            />
          </div>
          <div className="flex gap-sm w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <div className="relative">
              <select 
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                <option value="">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
              <button className="flex items-center gap-xs px-4 py-2 bg-surface-container border border-outline-variant rounded-full whitespace-nowrap hover:bg-surface-container-high transition-colors font-label-md text-on-surface">
                <span className="material-symbols-outlined text-[18px]">subject</span>
                Course
                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
              </button>
            </div>
            
            <button className="flex items-center gap-xs px-4 py-2 bg-surface-container border border-outline-variant rounded-full whitespace-nowrap hover:bg-surface-container-high transition-colors font-label-md text-on-surface">
              <span className="material-symbols-outlined text-[18px]">payments</span>
              Price
              <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
            </button>
            <button className="flex items-center gap-xs px-4 py-2 bg-surface-container border border-outline-variant rounded-full whitespace-nowrap hover:bg-surface-container-high transition-colors font-label-md text-on-surface">
              <span className="material-symbols-outlined text-[18px]">star</span>
              Rating
              <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
            </button>
            <button className="flex items-center gap-xs px-4 py-2 bg-primary text-on-primary rounded-full whitespace-nowrap hover:bg-primary-container hover:text-on-primary-container transition-colors font-label-md ml-auto md:ml-0">
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Filters
            </button>
          </div>
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant font-body-lg">
          Tidak ada mentor yang cocok dengan pencarian Anda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {/* Featured Mentor Card (Spans 2 cols on lg) */}
          {featuredMentor && (
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant flex flex-col md:flex-row gap-lg group hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-fixed to-transparent opacity-30 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
              <div className="flex-shrink-0 relative">
                <img 
                  src={featuredMentor.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(featuredMentor.full_name || "M")}`} 
                  alt={featuredMentor.full_name || "Mentor"} 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover border-4 border-surface-container-lowest shadow-sm z-10 relative" 
                />
                <div className="absolute -bottom-3 -right-3 bg-secondary-container text-on-secondary-container font-label-sm px-3 py-1 rounded-full border-2 border-surface-container-lowest z-20 flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">verified</span> Top Mentor
                </div>
              </div>
              <div className="flex flex-col flex-grow justify-between z-10">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-h3 text-h3 text-on-surface">{featuredMentor.full_name}</h3>
                      <p className="font-body-md text-on-surface-variant flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[18px] text-tertiary">school</span> {featuredMentor.university || "Universitas"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-h3 text-primary">Rp{featuredMentor.hourly_rate?.toLocaleString()}<span className="font-body-md text-on-surface-variant">/jam</span></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-xs mb-4 bg-surface-container-low inline-flex px-3 py-1.5 rounded-lg border border-outline-variant/50">
                    <span className="material-symbols-outlined text-[18px] text-orange-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-label-md text-on-surface">{featuredMentor.average_rating ? featuredMentor.average_rating.toFixed(1) : "Baru"}</span>
                    <span className="font-body-md text-outline ml-1">({featuredMentor.review_count || 0} sessions)</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {featuredMentor.courses.slice(0, 3).map((c) => (
                      <span key={c.id} className="bg-surface-container px-3 py-1 rounded-md font-label-sm text-on-surface border border-outline-variant/50">{c.name}</span>
                    ))}
                    {featuredMentor.courses.length > 3 && (
                      <span className="bg-surface-container px-3 py-1 rounded-md font-label-sm text-on-surface border border-outline-variant/50">+{featuredMentor.courses.length - 3}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-md mt-auto">
                  <Link href={`/mentor/${featuredMentor.id}`} className="flex-grow bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-md py-3 px-6 rounded-lg transition-colors text-center">Book Session</Link>
                  <Link href={`/mentor/${featuredMentor.id}`} className="px-6 py-3 border border-outline hover:bg-surface-container-low text-on-surface font-label-md rounded-lg transition-colors">View Profile</Link>
                </div>
              </div>
            </div>
          )}

          {/* Standard Mentor Cards */}
          {standardMentors.map((m) => (
            <div key={m.id} className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant flex flex-col group hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <img 
                  src={m.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.full_name || "M")}`} 
                  alt={m.full_name || "Mentor"} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-surface-container-lowest shadow-sm" 
                />
                <span className="font-h3 text-primary">Rp{m.hourly_rate?.toLocaleString()}<span className="font-body-md text-on-surface-variant">/jam</span></span>
              </div>
              <h3 className="font-h3 text-h3 text-on-surface mb-1">{m.full_name}</h3>
              <p className="font-body-md text-on-surface-variant line-clamp-1 mb-3">{m.university || "Universitas"}</p>
              
              <div className="flex items-center gap-xs mb-4">
                <span className="material-symbols-outlined text-[18px] text-orange-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="font-label-md text-on-surface">{m.average_rating ? m.average_rating.toFixed(1) : "Baru"}</span>
                <span className="font-body-md text-outline ml-1">({m.review_count || 0} sessions)</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                {m.courses.slice(0, 2).map((c) => (
                  <span key={c.id} className="bg-surface-container px-3 py-1 rounded-md font-label-sm text-on-surface border border-outline-variant/50">{c.name}</span>
                ))}
                {m.courses.length > 2 && (
                  <span className="bg-surface-container px-3 py-1 rounded-md font-label-sm text-on-surface border border-outline-variant/50">+{m.courses.length - 2}</span>
                )}
              </div>
              
              <Link href={`/mentor/${m.id}`} className="w-full py-3 border-2 border-primary/20 text-primary hover:bg-primary hover:text-on-primary font-label-md rounded-lg transition-colors mt-auto text-center">View Profile</Link>
            </div>
          ))}

          {/* Become a Mentor Card */}
          <div className="bg-primary text-on-primary rounded-xl p-lg shadow-[0_4px_20px_rgba(33,112,228,0.2)] flex flex-col items-center justify-center text-center gap-4 hover:shadow-[0_8px_30px_rgba(33,112,228,0.3)] transition-all duration-300">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[32px]">school</span>
            </div>
            <h3 className="font-h2 text-[24px]">Become a Mentor</h3>
            <p className="font-body-md opacity-90 mb-4">Earn money helping peers ace classes you've already mastered.</p>
            <Link href="/apply" className="w-full bg-surface-container-lowest text-primary py-3 rounded-lg font-label-md font-semibold hover:bg-surface-container transition-colors">
              Apply Now
            </Link>
          </div>
        </div>
      )}

      {/* Load More */}
      {filtered.length > 0 && (
        <div className="mt-xl flex justify-center">
          <button className="px-8 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md rounded-full transition-colors flex items-center gap-2 border border-outline-variant">
            Load More Mentors
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
        </div>
      )}
    </>
  );
}
