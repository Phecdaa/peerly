"use client";

import { useState } from "react";
import { addCourseAction } from "./actions";

export function AddCourseButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const res = await addCourseAction(formData);
    
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setIsOpen(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md shadow-[0px_4px_20px_rgba(0,88,190,0.2)] hover:bg-primary/90 transition-all active:scale-[0.98]"
      >
        <span className="material-symbols-outlined">add</span>
        Add Course
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-surface rounded-2xl shadow-xl border border-outline-variant w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
              <h2 className="font-h3 text-h3 text-on-surface">Add New Course</h2>
              <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              {error && <div className="p-3 bg-error-container text-on-error-container rounded-lg font-body-md text-sm">{error}</div>}
              
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Course Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  placeholder="e.g. Introduction to Calculus"
                  className="px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Course Slug</label>
                <input 
                  type="text" 
                  name="slug"
                  required
                  placeholder="e.g. CALC-101"
                  className="px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-on-surface-variant font-label-md hover:bg-surface-container rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
