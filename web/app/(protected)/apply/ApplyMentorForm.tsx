"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Course = { id: number; name: string; slug: string };

export function ApplyMentorForm({ courses, user, profile }: { courses: Course[], user: any, profile: any }) {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [bio, setBio] = useState(profile.bio || "");
  const [major, setMajor] = useState(profile.major || "");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [hourlyRate, setHourlyRate] = useState(profile.hourly_rate || 25);
  const [expertise, setExpertise] = useState<{ course: Course, grade: string, term: string }[]>([]);

  // Temp Expertise State
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");

  function handleAddExpertise() {
    if (!selectedCourseId || !selectedGrade || !selectedTerm) return;
    const courseObj = courses.find(c => c.id.toString() === selectedCourseId);
    if (!courseObj) return;
    
    // Prevent duplicates
    if (expertise.some(e => e.course.id === courseObj.id)) return;

    setExpertise([...expertise, { course: courseObj, grade: selectedGrade, term: selectedTerm }]);
    setSelectedCourseId("");
    setSelectedGrade("");
    setSelectedTerm("");
  }

  function handleRemoveExpertise(courseId: number) {
    setExpertise(expertise.filter(e => e.course.id !== courseId));
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const courseIds = expertise.map(e => e.course.id);

    try {
      const res = await fetch("/api/mentor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: bio.trim(),
          hourly_rate: Number(hourlyRate) || 0,
          course_ids: courseIds,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Failed to submit application.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Common Header
  const Header = () => (
    <header className="bg-white dark:bg-slate-900 font-['Plus_Jakarta_Sans'] antialiased sticky top-0 border-b border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center w-full px-6 h-16 z-50">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
        <span className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">Peerly</span>
      </div>
      <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 font-label-md text-label-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors px-4 py-2 rounded-lg active:opacity-80 transition-opacity duration-150">
        Save & Exit
      </Link>
    </header>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-background text-on-background flex flex-col min-h-screen overflow-y-auto">
      <Header />
      
      <main className="flex-1 w-full max-w-[1000px] mx-auto px-6 py-xl pb-24">
        
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="w-full max-w-3xl mx-auto">
            <div className="mb-xl text-center">
              <h1 className="font-h2 text-h2 text-on-background mb-sm">Welcome to Peerly</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Let's set up your Mentor Profile.</p>
              
              <div className="mt-lg flex flex-col items-center">
                <div className="flex items-center justify-center gap-xs mb-sm">
                  <span className="font-label-md text-label-md text-primary">Step 1 of 4</span>
                  <span className="font-label-md text-label-md text-on-surface-variant ml-2">Personal Information</span>
                </div>
                <div className="w-full max-w-md bg-surface-variant rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-secondary w-1/4 rounded-full transition-all duration-300"></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-lg bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant p-lg md:p-xl">
              <div className="col-span-1 md:col-span-12 border-b border-surface-variant pb-md mb-md">
                <h2 className="font-h3 text-h3 text-on-surface">Personal Information</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Tell students a bit about yourself and your academic journey.</p>
              </div>

              <div className="col-span-1 md:col-span-12">
                <label className="block font-label-md text-label-md text-on-surface mb-xs">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">person</span>
                  </div>
                  <input type="text" disabled value={profile.full_name || ""} className="block w-full pl-xl pr-md py-md bg-surface-bright border border-outline-variant/50 rounded-lg font-body-md text-body-md text-on-surface-variant opacity-70" />
                </div>
              </div>

              <div className="col-span-1 md:col-span-12">
                <label className="block font-label-md text-label-md text-on-surface mb-xs">University Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">mail</span>
                  </div>
                  <input type="email" disabled value={user.email} className="block w-full pl-xl pr-xl py-md bg-surface-bright border border-secondary rounded-lg font-body-md text-body-md text-on-surface" />
                  <div className="absolute inset-y-0 right-0 pr-md flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-secondary">check_circle</span>
                  </div>
                </div>
                <p className="mt-xs font-label-sm text-label-sm text-secondary flex items-center gap-1">Valid email confirmed.</p>
              </div>

              <div className="col-span-1 md:col-span-6">
                <label className="block font-label-md text-label-md text-on-surface mb-xs">Academic Major</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">book</span>
                  </div>
                  <select value={major} onChange={(e) => setMajor(e.target.value)} className="block w-full pl-xl pr-md py-md bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary appearance-none transition-all">
                    <option value="" disabled>Select Major</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Systems">Information Systems</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-md flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">arrow_drop_down</span>
                  </div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-6">
                <label className="block font-label-md text-label-md text-on-surface mb-xs">Year of Study</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">calendar_today</span>
                  </div>
                  <select value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)} className="block w-full pl-xl pr-md py-md bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary appearance-none transition-all">
                    <option value="" disabled>Select Year</option>
                    <option value="sophomore">Sophomore</option>
                    <option value="junior">Junior</option>
                    <option value="senior">Senior</option>
                    <option value="grad">Graduate</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-md flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">arrow_drop_down</span>
                  </div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-12">
                <label className="block font-label-md text-label-md text-on-surface mb-xs">Brief Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="block w-full p-md bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary resize-none transition-all" placeholder="Hi, I specialize in helping underclassmen navigate entry-level courses..."></textarea>
                <div className="mt-xs flex justify-between items-center">
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Keep it friendly and professional.</p>
                </div>
              </div>

              <div className="col-span-1 md:col-span-12 mt-md flex justify-end gap-md">
                <button type="button" onClick={() => setStep(2)} disabled={!bio || !major} className="px-lg py-md rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-surface-tint shadow-sm transition-colors flex items-center gap-xs disabled:opacity-50">
                  Continue to Specializations
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Expertise & Rates */}
        {step === 2 && (
          <div className="w-full">
            <div className="mb-xl max-w-3xl mx-auto text-center md:text-left">
              <div className="flex items-center justify-between mb-sm">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Step 2 of 4</span>
              </div>
              <div className="w-full bg-surface-variant rounded-full h-2 mb-lg overflow-hidden">
                <div className="bg-secondary h-full rounded-full w-2/4 transition-all duration-500"></div>
              </div>
              <h1 className="font-h1 text-h1 text-on-surface mb-sm">Expertise & Rates</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Tell us what you're great at. Add the courses you've excelled in and set a competitive hourly rate.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter max-w-5xl mx-auto">
              <div className="md:col-span-7 flex flex-col gap-lg">
                <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant p-lg">
                  <h2 className="font-h3 text-h3 text-on-surface mb-md">Add Course</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                    <div className="col-span-1">
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Course Subject</label>
                      <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface-bright px-md py-[12px] font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer">
                        <option value="" disabled>Select Course</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Grade Achieved</label>
                      <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface-bright px-md py-[12px] font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer">
                        <option value="" disabled>Select Grade</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                      </select>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Term Taken</label>
                      <input value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)} type="text" placeholder="e.g. Fall 2023" className="w-full rounded-lg border border-outline-variant bg-surface-bright px-md py-[12px] font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                    </div>
                    <div className="col-span-1 sm:col-span-2 flex justify-end mt-sm">
                      <button onClick={handleAddExpertise} disabled={!selectedCourseId || !selectedGrade || !selectedTerm} type="button" className="bg-primary text-on-primary font-label-md text-label-md px-lg py-[12px] rounded-lg flex items-center gap-xs hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-50">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>add</span>
                        Add Expertise
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant p-lg">
                  <h2 className="font-h3 text-h3 text-on-surface mb-md">Your Expertise ({expertise.length})</h2>
                  {expertise.length === 0 ? (
                    <p className="text-on-surface-variant font-body-md italic p-4 text-center">No courses added yet. Please add at least one.</p>
                  ) : (
                    <ul className="flex flex-col">
                      {expertise.map(exp => (
                        <li key={exp.course.id} className="group flex items-center justify-between py-md border-b border-surface-variant last:border-0 hover:bg-surface-container-low transition-colors -mx-lg px-lg cursor-default">
                          <div className="flex items-center gap-md">
                            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md text-label-md font-bold shrink-0 uppercase">
                              {exp.course.name.substring(0, 2)}
                            </div>
                            <div>
                              <p className="font-body-md text-body-md font-semibold text-on-surface mb-1">{exp.course.name}</p>
                              <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
                                <span className="text-secondary font-semibold">Grade: {exp.grade}</span>
                                <span>•</span>
                                <span>{exp.term}</span>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => handleRemoveExpertise(exp.course.id)} className="text-outline hover:text-error hover:bg-error-container p-2 rounded-full transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>delete</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="md:col-span-5 flex flex-col gap-lg">
                <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant p-lg relative overflow-hidden flex flex-col">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-container rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
                  <h2 className="font-h3 text-h3 text-on-surface mb-xs relative z-10">Hourly Rate</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-lg relative z-10">Set your base rate for mentoring sessions.</p>
                  
                  <div className="flex items-center gap-sm mb-lg relative z-10 border-b border-outline-variant pb-xs w-max">
                    <span className="font-h2 text-h2 text-on-surface">Rp</span>
                    <input type="number" min="0" step="5000" value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} className="w-32 font-h1 text-h1 text-on-surface bg-transparent border-none outline-none p-0 text-center focus:ring-0 appearance-none" />
                    <span className="font-body-md text-body-md text-on-surface-variant self-end mb-1">/ hour</span>
                  </div>

                  <div className="bg-surface-container-low rounded-lg p-md border border-surface-variant relative z-10 mt-auto">
                    <div className="flex items-start gap-md">
                      <span className="material-symbols-outlined text-primary mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                      <div>
                        <p className="font-label-md text-label-md font-semibold text-on-surface mb-1">Campus Average: Rp 30.000/hr</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">Mentors charging reasonable rates typically see a higher booking rate.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-md flex gap-3">
                  <button onClick={() => setStep(1)} className="px-lg rounded-xl border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-variant transition-colors" type="button">
                    Back
                  </button>
                  <button onClick={() => setStep(3)} disabled={expertise.length === 0} className="flex-1 bg-primary text-on-primary font-label-md text-label-md py-[16px] rounded-xl shadow-sm hover:shadow-md hover:bg-surface-tint transition-all flex items-center justify-center gap-sm group disabled:opacity-50">
                    Continue to Verification
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Verification */}
        {step === 3 && (
          <div className="w-full max-w-[800px] mx-auto">
            <div className="mb-lg text-center">
              <h1 className="font-h2 text-h2 text-on-surface mb-sm">Verification</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mb-md">Step 3 of 4: Almost there! We need to verify your academic standing and identity to ensure a safe community.</p>
              
              <div className="flex items-center justify-center gap-xs mt-md mb-xl">
                <div className="h-sm w-16 bg-secondary rounded-full"></div>
                <div className="h-sm w-16 bg-secondary rounded-full"></div>
                <div className="h-sm w-16 bg-primary rounded-full relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                </div>
                <div className="h-sm w-16 bg-surface-variant rounded-full"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-8">
              <div className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-secondary-fixed-dim flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-bl-lg font-label-sm text-label-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span> Auto Verified
                </div>
                <div className="mb-md">
                  <div className="flex items-center gap-sm mb-xs">
                    <span className="material-symbols-outlined text-on-surface text-[24px]">school</span>
                    <h2 className="font-h3 text-h3 text-on-surface">Academic Standing</h2>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm">Your university email has already been validated via SSO.</p>
                </div>
                <div className="flex-grow flex flex-col items-center justify-center border-2 border-solid border-secondary-fixed-dim rounded-lg p-lg bg-surface-bright relative">
                  <div className="flex flex-col items-center justify-center w-full">
                    <div className="bg-secondary-container text-on-secondary-container p-sm rounded-full mb-sm">
                      <span className="material-symbols-outlined text-[32px]">check_circle</span>
                    </div>
                    <div className="bg-surface-container-highest rounded-md p-sm w-full flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="material-symbols-outlined text-on-surface-variant">mail</span>
                        <span className="font-label-md text-label-md text-on-surface truncate">{user.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant flex flex-col h-full">
                <div className="mb-md">
                  <div className="flex items-center gap-sm mb-xs">
                    <span className="material-symbols-outlined text-primary text-[24px]">badge</span>
                    <h2 className="font-h3 text-h3 text-on-surface">Identity Verification</h2>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm">Optional: Upload a valid student ID card to fast-track your approval.</p>
                </div>
                <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-primary-fixed-dim rounded-lg p-lg bg-surface-bright hover:bg-surface-container-low transition-colors cursor-pointer group relative overflow-hidden">
                  <div className="bg-surface-container p-md rounded-full mb-md group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-[32px]">cloud_upload</span>
                  </div>
                  <p className="font-label-md text-label-md text-on-surface text-center mb-xs"><span className="text-primary font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant text-center">PDF, PNG, JPG up to 10MB</p>
                </div>
              </div>
            </div>

            <div className="mt-lg bg-surface-container-low rounded-xl p-md flex items-start gap-md border border-surface-container-high mb-8">
              <span className="material-symbols-outlined text-tertiary mt-1">lock</span>
              <div>
                <h4 className="font-label-md text-label-md text-on-surface font-semibold mb-xs">Secure Uploads</h4>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">Your documents are encrypted and stored securely. They are only used for verification purposes and will never be shared publicly.</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-md border-t border-outline-variant">
              <button onClick={() => setStep(2)} className="px-6 py-3 rounded-lg font-label-md text-label-md text-on-surface bg-surface-container hover:bg-surface-container-high transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
              </button>
              <button onClick={() => setStep(4)} className="px-6 py-3 rounded-lg font-label-md text-label-md text-on-primary bg-primary hover:bg-surface-tint shadow-[0_4px_10px_rgba(0,88,190,0.2)] transition-all flex items-center gap-2">
                Continue <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="w-full">
            <div className="mb-lg max-w-3xl">
              <div className="flex justify-between items-center mb-sm">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Step 4 of 4</span>
                <span className="font-label-sm text-label-sm text-secondary">Review & Submit</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mb-xl">
                <div className="bg-secondary h-full w-full rounded-full"></div>
              </div>
              <h1 className="font-h1 text-h1 text-on-surface mb-sm">Review Your Application</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                Please ensure all your information is correct before submitting. A complete and accurate profile helps us match you with the right students.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter max-w-6xl mx-auto">
              <div className="md:col-span-8 flex flex-col gap-lg">
                <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-between items-start mb-md">
                    <h2 className="font-h2 text-h2 text-on-surface flex items-center gap-sm">
                      <span className="material-symbols-outlined text-primary">person</span>
                      Personal Information
                    </h2>
                    <button onClick={() => setStep(1)} className="font-label-md text-label-md text-primary bg-surface-container-low hover:bg-surface-container px-3 py-1.5 rounded-lg border border-primary-fixed-dim transition-colors">
                      Edit
                    </button>
                  </div>
                  <div className="flex items-center gap-md mb-md pb-md border-b border-outline-variant">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-surface-container-highest">
                      <img src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.full_name || user.email)}`} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-h3 text-h3 text-on-surface">{profile.full_name || "Unknown"}</div>
                      <div className="font-body-md text-body-md text-on-surface-variant">{user.email}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                    <div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant mb-xs">Major & Year</div>
                      <div className="font-body-md text-body-md text-on-surface capitalize">{major || "-"} • {yearOfStudy || "-"}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="font-label-sm text-label-sm text-on-surface-variant mb-xs">Short Bio</div>
                      <div className="font-body-md text-body-md text-on-surface leading-relaxed">
                        {bio || "-"}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-between items-start mb-md">
                    <h2 className="font-h2 text-h2 text-on-surface flex items-center gap-sm">
                      <span className="material-symbols-outlined text-primary">psychology</span>
                      Expertise & Rates
                    </h2>
                    <button onClick={() => setStep(2)} className="font-label-md text-label-md text-primary bg-surface-container-low hover:bg-surface-container px-3 py-1.5 rounded-lg border border-primary-fixed-dim transition-colors">
                      Edit
                    </button>
                  </div>
                  <div className="space-y-md">
                    <div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant mb-sm">Selected Subjects</div>
                      <div className="flex flex-wrap gap-sm">
                        {expertise.map(exp => (
                          <span key={exp.course.id} className="bg-surface-container-high text-on-surface px-3 py-1 rounded-full font-label-md text-label-md border border-outline-variant">{exp.course.name} ({exp.grade})</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-md bg-surface-bright rounded-lg border border-primary-fixed-dim mt-sm gap-md">
                      <div>
                        <div className="font-label-sm text-label-sm text-on-surface-variant mb-xs">Hourly Rate</div>
                        <div className="font-h3 text-h3 text-primary">Rp {hourlyRate.toLocaleString('id-ID')}<span className="font-body-md text-body-md text-on-surface-variant font-normal">/hr</span></div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="md:col-span-4 flex flex-col gap-lg">
                <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-between items-start mb-md">
                    <h2 className="font-h2 text-h2 text-on-surface flex items-center gap-sm">
                      <span className="material-symbols-outlined text-secondary">verified_user</span>
                      Verification
                    </h2>
                  </div>
                  <div className="space-y-sm">
                    <div className="flex items-center gap-sm p-sm bg-secondary-container/30 rounded-lg border border-secondary-fixed-dim">
                      <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="font-body-md text-body-md text-on-surface">Email Confirmed</span>
                    </div>
                    <div className="flex items-center gap-sm p-sm bg-surface-container-high rounded-lg border border-outline-variant">
                      <span className="material-symbols-outlined text-outline">hourglass_empty</span>
                      <span className="font-body-md text-body-md text-on-surface-variant">Admin Approval (Pending)</span>
                    </div>
                  </div>
                </section>

                <section className="bg-surface-container-lowest rounded-xl border border-primary-fixed p-lg shadow-[0_8px_30px_rgba(33,112,228,0.1)] mt-auto relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-container rounded-full blur-3xl opacity-20 pointer-events-none"></div>
                  <h3 className="font-h3 text-h3 text-on-surface mb-sm relative z-10">Ready to Submit?</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-lg relative z-10">
                    By submitting, you agree to our Mentor Guidelines and Terms of Service. Our team will review your application soon.
                  </p>

                  {error && (
                    <p className="text-sm text-error mb-4 font-bold bg-error-container p-2 rounded relative z-10" role="alert">
                      {error}
                    </p>
                  )}

                  <div className="space-y-sm relative z-10">
                    <button onClick={handleSubmit} disabled={loading} className="w-full bg-primary hover:bg-surface-tint text-on-primary font-label-md text-label-md py-4 rounded-xl shadow-sm transition-colors flex justify-center items-center gap-sm disabled:opacity-50">
                      {loading ? "Submitting..." : "Submit Application"}
                      {!loading && <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>}
                    </button>
                    <button onClick={() => setStep(3)} disabled={loading} className="w-full bg-transparent border border-outline-variant text-on-surface-variant hover:bg-surface-container-low font-label-md text-label-md py-3 rounded-xl transition-colors disabled:opacity-50">
                      Back to Previous Step
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
