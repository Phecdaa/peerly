"use client";

import { useState } from "react";
import { deleteCourseAction } from "./actions";

export function DeleteCourseButton({ courseId, courseName }: { courseId: number; courseName: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Hapus course "${courseName}"? Aksi ini tidak bisa dibatalkan.`)) return;
    
    setLoading(true);
    const res = await deleteCourseAction(courseId);
    setLoading(false);
    
    if (res.error) {
      alert("Gagal menghapus: " + res.error);
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="p-2 bg-surface rounded-md text-on-surface-variant hover:text-error transition-colors border border-outline-variant disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-sm">{loading ? "hourglass_empty" : "delete"}</span>
    </button>
  );
}
