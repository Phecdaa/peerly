"use client";

import { useState } from "react";
import { ReportButton } from "@/components/ReportButton";

type TabsProps = {
  profile: any;
  courses: any[];
  average_rating: number | null;
  review_count: number;
  aboutComponent: React.ReactNode;
  availabilityComponent: React.ReactNode;
  reviewsComponent: React.ReactNode;
  mentorId: string;
};

export function MentorTabs({ profile, courses, average_rating, review_count, aboutComponent, availabilityComponent, reviewsComponent, mentorId }: TabsProps) {
  const [activeTab, setActiveTab] = useState<"about" | "availability" | "reviews">("about");

  const handleBookSession = () => {
    setActiveTab("availability");
    setTimeout(() => {
      document.getElementById("availability-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-surface rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/20 p-8 mb-lg flex flex-col md:flex-row items-start md:items-center gap-8 relative overflow-hidden mt-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/20 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative">
          <img 
            src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.full_name || "M")}`} 
            alt={profile.full_name || "Mentor"} 
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-surface shadow-md" 
          />
          <div className="absolute bottom-2 right-2 bg-secondary text-on-secondary w-8 h-8 rounded-full flex items-center justify-center border-2 border-surface shadow-sm" title="Verified Mentor">
            <span className="material-symbols-outlined text-[18px]">verified</span>
          </div>
        </div>
        <div className="flex-1 w-full">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between mb-4">
            <div>
              <h1 className="font-h1 text-h1 text-on-surface mb-1">{profile.full_name}</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">school</span>
                {profile.major ? `${profile.major} • ` : ""}{profile.university || "Universitas"}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/30">
              <span className="material-symbols-outlined text-[#F59E0B] text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="font-h3 text-h3 text-on-surface">{average_rating ? average_rating.toFixed(1) : "New"}</span>
              <span className="font-body-md text-body-md text-on-surface-variant ml-1">({review_count} reviews)</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mb-6">
            {courses.slice(0, 5).map((c: any) => (
              <span key={c.id} className="px-3 py-1 bg-surface-container-high text-on-surface rounded-full font-label-sm text-label-sm border border-outline-variant/30">{c.name}</span>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <button onClick={handleBookSession} className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label-md text-label-md shadow-sm hover:shadow-md hover:bg-on-primary-fixed-variant transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
              Book Session
            </button>
            <button className="bg-surface text-primary border border-primary px-8 py-3 rounded-lg font-label-md text-label-md hover:bg-primary-container/10 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">chat</span>
              Message
            </button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div id="availability-section" className="flex gap-8 border-b border-outline-variant/30 mb-8 overflow-x-auto no-scrollbar scroll-mt-24">
        <button
          onClick={() => setActiveTab("about")}
          className={`pb-4 font-label-md text-label-md px-2 whitespace-nowrap transition-colors ${
            activeTab === "about" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          About
        </button>
        <button
          onClick={() => setActiveTab("availability")}
          className={`pb-4 font-label-md text-label-md px-2 whitespace-nowrap transition-colors ${
            activeTab === "availability" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Availability
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`pb-4 font-label-md text-label-md px-2 whitespace-nowrap transition-colors ${
            activeTab === "reviews" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Reviews
        </button>
      </div>

      <div className="pb-8">
        {activeTab === "about" && aboutComponent}
        {activeTab === "availability" && availabilityComponent}
        {activeTab === "reviews" && reviewsComponent}
      </div>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-zinc-200 p-4 md:hidden z-40 flex items-center justify-between pb-safe">
         <ReportButton targetType="mentor" targetId={mentorId} />
         <button 
            onClick={handleBookSession} 
            className="bg-primary text-on-primary font-semibold py-3 px-8 rounded-xl shadow-sm hover:opacity-90 transition"
         >
            Book Session
         </button>
      </div>
    </>
  );
}
