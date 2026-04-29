"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ReportData = {
  id: number;
  reason: string;
  status: string;
  created_at: string;
  target_type: string;
  target_id: string;
  reporter: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export function ReportsClient({ initialReports }: { initialReports: ReportData[] }) {
  const router = useRouter();
  const [selectedReportId, setSelectedReportId] = useState<number | null>(
    initialReports.length > 0 ? initialReports[0].id : null
  );

  const selectedReport = initialReports.find(r => r.id === selectedReportId);

  // Status breakdown
  const pendingCount = initialReports.filter(r => r.status === 'open').length;
  const resolvedCount = initialReports.filter(r => r.status === 'resolved' || r.status === 'dismissed').length;

  async function updateReportStatus(id: number, status: string) {
    const res = await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      router.refresh();
    }
  }

  function getInitials(name: string | null) {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background flex flex-col h-[calc(100vh-64px)]">
      {/* Page Header */}
      <div className="mb-8 w-full max-w-[1600px] mx-auto">
        <h1 className="font-h2 text-h2 text-on-background">Moderation &amp; Reports</h1>
        <p className="font-body-md text-on-surface-variant mt-2">Review user-flagged content, study room violations, and apply necessary resolutions.</p>
      </div>

      {/* Bento/Asymmetric Layout Container */}
      <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Reports List */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col bg-surface rounded-xl border border-outline-variant shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden h-full">
          {/* Table Header Controls */}
          <div className="flex items-center justify-between p-4 border-b border-outline-variant bg-surface-container-lowest">
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-surface-container text-on-surface font-label-md rounded-lg border border-transparent hover:border-outline-variant transition-colors">All ({initialReports.length})</button>
              <button className="px-4 py-2 bg-transparent text-on-surface-variant font-label-md rounded-lg hover:bg-surface-container-low transition-colors">Pending ({pendingCount})</button>
              <button className="px-4 py-2 bg-transparent text-on-surface-variant font-label-md rounded-lg hover:bg-surface-container-low transition-colors">Resolved ({resolvedCount})</button>
            </div>
            <button className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface font-label-md">
              <span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
            </button>
          </div>
          
          {/* Scrollable Table Body */}
          <div className="flex-1 overflow-y-auto">
            {initialReports.length === 0 ? (
               <div className="p-8 text-center text-on-surface-variant">No reports found.</div>
            ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container-lowest z-10 shadow-sm">
                <tr>
                  <th className="py-3 px-4 font-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Report Details</th>
                  <th className="py-3 px-4 font-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Reason</th>
                  <th className="py-3 px-4 font-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Date</th>
                  <th className="py-3 px-4 font-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {initialReports.map((report) => {
                  const isSelected = report.id === selectedReportId;
                  const isResolved = report.status === 'resolved' || report.status === 'dismissed';
                  return (
                    <tr 
                      key={report.id}
                      onClick={() => setSelectedReportId(report.id)}
                      className={`cursor-pointer transition-colors border-l-4 ${isSelected ? "bg-primary-fixed border-l-primary" : "hover:bg-surface-container-low border-transparent"}`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {report.reporter?.avatar_url ? (
                              <img alt="Reporter" className="w-8 h-8 rounded-full border-2 border-surface object-cover" src={report.reporter.avatar_url} />
                            ) : (
                              <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                                {getInitials(report.reporter?.full_name || 'U')}
                              </div>
                            )}
                            <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-variant flex items-center justify-center text-on-surface-variant font-label-sm">
                              <span className="material-symbols-outlined text-[16px]">{report.target_type === 'room' ? 'door_open' : 'person'}</span>
                            </div>
                          </div>
                          <div>
                            <p className="font-label-md text-on-background">
                              {report.reporter?.full_name || 'Unknown'} <span className="text-on-surface-variant font-body-md text-sm ml-1">reported</span> {report.target_type}
                            </p>
                            <p className="font-label-sm text-outline">Target ID: {report.target_id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm bg-surface-container-highest text-on-surface`}>
                          {report.reason}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-body-md text-sm text-on-surface-variant">{new Date(report.created_at).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-right">
                        <span className={`inline-flex items-center gap-1 font-label-sm ${
                          !isResolved && isSelected ? 'text-primary' : 'text-on-surface-variant'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            !isResolved ? (isSelected ? 'bg-primary animate-pulse' : 'bg-warning') : 'bg-outline-variant'
                          }`}></span> {report.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            )}
          </div>
        </div>

        {/* Right Column: Detail View & Resolution */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 h-full overflow-y-auto">
          {selectedReport ? (
            <>
              {/* Report Detail Card */}
              <div className="bg-surface rounded-xl border border-outline-variant shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-6 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-h3 text-on-background">Report #{selectedReport.id}</h2>
                    <p className="font-label-sm text-outline mt-1">Submitted {new Date(selectedReport.created_at).toLocaleString()}</p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full font-label-md bg-surface-container text-on-surface uppercase text-xs tracking-wider">
                    {selectedReport.status}
                  </span>
                </div>

                {/* Entities Involved */}
                <div className="p-4 bg-surface-container-low rounded-lg border border-surface-container flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {selectedReport.reporter?.avatar_url ? (
                        <img alt="Reporter" className="w-10 h-10 rounded-full border border-outline-variant object-cover" src={selectedReport.reporter.avatar_url} />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">
                          {getInitials(selectedReport.reporter?.full_name || 'U')}
                        </div>
                      )}
                      <div>
                        <p className="font-label-sm text-outline uppercase tracking-wider">Reporter</p>
                        <p className="font-label-md text-on-background">{selectedReport.reporter?.full_name || 'Unknown User'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-px bg-outline-variant opacity-50"></div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
                        <span className="material-symbols-outlined">{selectedReport.target_type === 'room' ? 'meeting_room' : 'person'}</span>
                      </div>
                      <div>
                        <p className="font-label-sm text-error uppercase tracking-wider">Target {selectedReport.target_type}</p>
                        <p className="font-label-md text-on-background">{selectedReport.target_id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description / Evidence */}
                <div>
                  <h3 className="font-label-md text-on-surface-variant mb-2">Reporter Comments / Reason</h3>
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 font-body-md text-on-surface leading-relaxed">
                    {selectedReport.reason}
                  </div>
                </div>
              </div>

              {/* Resolution Actions Panel */}
              <div className="bg-surface rounded-xl border border-outline-variant shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-6 mt-auto">
                <h3 className="font-h3 text-on-background mb-4">Resolution Actions</h3>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => updateReportStatus(selectedReport.id, 'resolved')}
                    disabled={selectedReport.status === 'resolved'}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-on-primary hover:bg-primary/90 rounded-lg font-label-md transition-colors shadow-sm disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    Mark as Resolved
                  </button>
                  <button 
                    onClick={() => updateReportStatus(selectedReport.id, 'dismissed')}
                    disabled={selectedReport.status === 'dismissed'}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-transparent text-error hover:bg-error-container/20 rounded-lg font-label-md transition-colors border border-error disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                    Dismiss Report
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant bg-surface rounded-xl border border-outline-variant">
              <span className="material-symbols-outlined text-4xl mb-2">plagiarism</span>
              <p>Select a report to view details</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
