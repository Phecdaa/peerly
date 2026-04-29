"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Course = { id: number; name: string; slug: string };
type Application = {
  id: string;
  full_name: string | null;
  bio: string | null;
  university: string | null;
  hourly_rate: number | null;
  mentor_status: string;
  created_at: string;
  courses: Course[];
};

export function AdminMentorList({
  applications,
}: {
  applications: Application[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(
    applications.length > 0 ? applications[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApps = applications.filter((app) =>
    (app.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (app.university || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedApp = applications.find((a) => a.id === selectedAppId);

  async function handleApprove(id: string) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/mentor-applications/${id}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        if (selectedAppId === id) setSelectedAppId(null);
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  }

  async function handleReject(id: string) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/mentor-applications/${id}/reject`, {
        method: "POST",
      });
      if (res.ok) {
        if (selectedAppId === id) setSelectedAppId(null);
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  }

  function getInitials(name: string | null) {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  }

  if (applications.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-container-lowest rounded-xl border border-outline-variant/30 h-64">
        <p className="font-body-md text-on-surface-variant">Tidak ada pengajuan mentor yang menunggu.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6 flex-1 min-h-[500px]">
      {/* Applications List (Bento Box style) */}
      <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 overflow-hidden h-[calc(100vh-14rem)] flex flex-col">
          <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest/50">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all font-body-md text-body-md text-on-surface placeholder:text-outline-variant" 
                placeholder="Search applications..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredApps.map((app) => {
              const isActive = app.id === selectedAppId;
              return (
                <div 
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors relative ${
                    isActive 
                      ? "bg-primary-container/5 border border-primary/20" 
                      : "hover:bg-surface-container border border-transparent"
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-label-md text-label-md font-bold ${
                        isActive ? "bg-secondary-container text-on-secondary-container" : "bg-surface-variant text-on-surface"
                      }`}>
                        {getInitials(app.full_name)}
                      </div>
                      <div>
                        <h3 className="font-label-md text-label-md text-on-surface font-semibold">{app.full_name || "Unknown"}</h3>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">{app.university || "No university listed"}</p>
                      </div>
                    </div>
                    <span className="bg-surface-variant text-on-surface-variant font-label-sm text-label-sm px-2 py-1 rounded-full">Pending</span>
                  </div>
                  {app.courses.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {app.courses.slice(0, 2).map(c => (
                        <span key={c.id} className="bg-surface-container text-on-surface font-label-sm text-label-sm px-2 py-1 rounded border border-outline-variant/30">
                          {c.name}
                        </span>
                      ))}
                      {app.courses.length > 2 && (
                        <span className="bg-surface-container text-on-surface font-label-sm text-label-sm px-2 py-1 rounded border border-outline-variant/30">
                          +{app.courses.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {filteredApps.length === 0 && (
              <div className="p-4 text-center text-on-surface-variant font-body-md">
                No matching applications found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail View */}
      <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
        {selectedApp ? (
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 h-[calc(100vh-14rem)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-start bg-surface-container-lowest">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-h3 text-h3 font-bold shadow-sm">
                  {getInitials(selectedApp.full_name)}
                </div>
                <div>
                  <h2 className="font-h2 text-h2 text-on-surface">{selectedApp.full_name || "Unknown"}</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[18px]">school</span> 
                    {selectedApp.university || "University not specified"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-h3 text-h3 text-on-surface">Rp {selectedApp.hourly_rate?.toLocaleString() || "0"}<span className="font-body-md text-body-md text-on-surface-variant">/jam</span></div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Proposed Rate</p>
              </div>
            </div>

            {/* Content Split */}
            <div className="flex-1 grid grid-cols-2 gap-px bg-outline-variant/30 overflow-hidden">
              {/* Left: Application Details */}
              <div className="bg-surface-container-lowest p-6 overflow-y-auto">
                <h4 className="font-label-md text-label-md text-outline font-semibold mb-4 uppercase tracking-wider">Application Details</h4>
                <div className="space-y-6">
                  <div>
                    <h5 className="font-label-md text-label-md text-on-surface mb-2 font-semibold">Requested Courses</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.courses.length > 0 ? selectedApp.courses.map(c => (
                        <span key={c.id} className="bg-primary-container/10 text-primary font-label-md text-label-md px-3 py-1.5 rounded-lg border border-primary/20 flex items-center gap-2">
                          {c.name}
                          <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span>
                        </span>
                      )) : (
                        <span className="text-on-surface-variant font-body-md text-sm">No courses selected</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-label-md text-label-md text-on-surface mb-2 font-semibold">Bio &amp; Experience</h5>
                    <p className="font-body-md text-body-md text-on-surface-variant bg-surface p-4 rounded-lg border border-outline-variant/30 whitespace-pre-wrap">
                      {selectedApp.bio || "No bio provided."}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-label-md text-label-md text-on-surface mb-2 font-semibold">Contact</h5>
                    <div className="space-y-2 font-body-md text-body-md text-on-surface-variant">
                      <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">calendar_today</span> Applied: {new Date(selectedApp.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Document Viewer */}
              <div className="bg-surface p-6 overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-label-md text-label-md text-outline font-semibold uppercase tracking-wider">Verification Documents</h4>
                </div>
                <div className="flex-1 bg-surface-container-lowest rounded-lg border border-outline-variant/30 p-4 flex flex-col gap-4 items-center justify-center text-center">
                  <span className="material-symbols-outlined text-4xl text-outline mb-2">description</span>
                  <p className="font-body-md text-on-surface-variant">No documents attached.</p>
                  <p className="font-label-sm text-outline">Document upload feature coming soon.</p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-6 border-t border-outline-variant/30 bg-surface-container-lowest flex justify-end gap-3">
              <button 
                onClick={() => handleReject(selectedApp.id)}
                disabled={loadingId === selectedApp.id}
                className="px-6 py-2.5 rounded-lg border border-error text-error font-label-md text-label-md hover:bg-error-container/20 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">close</span> {loadingId === selectedApp.id ? "Processing..." : "Reject"}
              </button>
              <button 
                onClick={() => handleApprove(selectedApp.id)}
                disabled={loadingId === selectedApp.id}
                className="px-6 py-2.5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md hover:bg-secondary/90 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">check</span> {loadingId === selectedApp.id ? "Processing..." : "Approve Mentor"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 h-full flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2">person_search</span>
            <p className="font-body-md">Select an application to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
