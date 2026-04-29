import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-background text-on-background font-body-md text-body-md antialiased min-h-screen flex flex-col">
      {/* TopNavBar */}
      <nav className="docked full-width top-0 z-50 border-b border-slate-200 dark:border-slate-800 shadow-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-md fixed left-0 w-full flex justify-between items-center px-6 py-3 h-16">
        <div className="flex items-center gap-8">
          <Link className="text-2xl font-black text-blue-600 dark:text-blue-500 font-h2" href="/">Peerly</Link>
          <div className="hidden md:flex gap-6 font-['Plus_Jakarta_Sans'] text-sm font-medium tracking-tight">
            <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 px-2 py-1 rounded-md" href="/dashboard">Dashboard</Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 px-2 py-1 rounded-md" href="/mentors">Mentors</Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 px-2 py-1 rounded-md" href="/rooms">My Rooms</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:flex bg-primary text-on-primary hover:bg-surface-tint font-label-md text-label-md px-4 py-2 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition-all duration-200">
              Masuk / Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 px-6 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-surface-container-highest blur-[80px]"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary-container opacity-20 blur-[100px]"></div>
          </div>
          <div className="max-w-[1280px] mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant text-primary font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                New: Collaborative Study Rooms
              </div>
              <h1 className="font-h1 text-h1 text-on-surface tracking-tight leading-tight">
                Learn Together, <br />
                <span className="text-primary">Succeed Together</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
                Struggling to find the right study group? Peerly connects you with motivated peers and expert mentors through focused, affordable study Rooms. Share knowledge, split costs, and ace your classes.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/login" className="bg-primary text-on-primary hover:bg-surface-tint font-label-md text-label-md px-8 py-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center gap-2">
                  Mulai Belajar
                  <span className="material-symbols-outlined text-[20px]" data-icon="arrow_forward">arrow_forward</span>
                </Link>
                <Link href="/mentors" className="bg-surface text-on-surface hover:bg-surface-container border border-outline-variant font-label-md text-label-md px-8 py-4 rounded-xl transition-colors duration-200 inline-flex items-center gap-2">
                  Explore Rooms
                </Link>
              </div>
              <div className="pt-8 flex items-center gap-6">
                <div className="flex -space-x-4">
                  <img alt="User" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDNLovqhpzqzjIvt8yDTm0-pZH0pWG0iFBOco2ZpaOtYYooVMThq60JXzJAKXh4D9DC2OvZUeAGPqFAHS0_7PzBfQAC5VJZovMbsQnMJibObR5tOP4XIK1ZPigm03HUEvppeZWCudofBqjYbLAZozBifCrltas1eOKZMB8FprMrIv9ps7CVyh4_P9uNBBcEJvrCbCUuacGFkf-ZgSuNT77dQiXrjapKlRHh0RKaaSz_41QbjF4mg1h2nAZQclxa0_TgDQbNiu503Qn" />
                  <img alt="User" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCh_hiQBHqx7xj_1mFM9jrbkUZ5U3V216OYFGvxEaG3zgynOOeNQz11pTC_d_lE-OaI4RNq1P3xk7hw2dEsEy3fHJz7KdrjuMveuDutIc5PekzWw7sBYvEXAuPkYuIp1l78wXMCPX2AmHmO43h9HjLzBhAF3pyFWkFqOjkCKj0P9XjjJm-3VWfzzm78TtgwZbBQvKEYrWhEYTsBqMTmwRqTM8NXhA91r1l6bZRZdZtPq4JVxY5Sm8i3x48T8PxhqCsKvYUvAqFwySHC" />
                  <img alt="User" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbFSW56iVJIzvCQiP0d6Wn6KnP7S2FurDnAZrr42ywxdLYfiWEdMkmJxaEL86KRLcosoMR4GnjL2zPwsRJx5cg8T_CchbTRH_oH3QE67KEj3MAXMjFG9RfdXzTXuxyLENKwEHMWlgPBZk2SgLJrHDlooIRQVHnr_L5k0gxRTUOqUxoE4ZRGbKtHWM3eWrxDQaypXWXM6tTbS03MpF2M3_63MO4KmMBgtLkQ_k9FjDt5KaqSI6lpiH20z1qy2gLEBTC1IZdwQyF53Oq" />
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-surface-container-high flex items-center justify-center text-on-surface font-label-sm text-[10px] shadow-sm">
                    +2k
                  </div>
                </div>
                <div className="font-body-sm text-[13px] text-on-surface-variant">
                  Join <span className="font-semibold text-on-surface">2,000+</span> students already learning
                </div>
              </div>
            </div>
            <div className="relative">
              {/* Glassmorphism Hero Card */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[24px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.08)] relative z-10 transform md:rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined" data-icon="science">science</span>
                    </div>
                    <div>
                      <h3 className="font-h3 text-[18px] text-on-surface">Advanced Calculus Prep</h3>
                      <p className="font-body-sm text-[13px] text-on-surface-variant">Hosted by Prof. Davis Mentee</p>
                    </div>
                  </div>
                  <div className="bg-secondary text-white px-3 py-1 rounded-full font-label-sm text-[11px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    Live Now
                  </div>
                </div>
                <div className="bg-surface-container-low rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-label-md text-label-md text-on-surface">Room Capacity</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">4/5 Joined</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-4/5 rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex -space-x-2">
                    <img alt="Student" className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQCQBk7OVg4CSLcF1Qwle4o8U6SV64LhZKXkoifc2qarX1oyzMfYYnh_UTCLgSVgMoBL5dEsXOOTpeLxvdBr4Z4Y3mwwTxyEeOH1lqHI-byIOk9fZ5cgkOkOIb2Zfm4Fmcbtwt7qVlKI3e5xDiguKSOF-TkDfRPFpJ9pnZyKL2z9Ksu2ojRH85PajcTeekkgR3RiQqB6GN9KzeBZGaPXYKN1EfM3sMQDmnJHLbNoVUSw3WHVw_DeX5LGYRGMhHNMsrDS7gA606LbBV" />
                    <img alt="Student" className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3OcJezQxCE0OaVvL7n0KUxGjCRnQXnEnWz6VNRdQ8oqRHXgyHkdw2uu1P0FKpvwP36YnNni-cNayhi9iJQt2G5ZoR-IYgIeFIpHHm5FvEVA4XA6GTs_he4Bg9T0YnF-GvkRlAj4wYvYfuv2Z1356ngzTtRGtozGqCUsYyEH5XF8IonRpfe1tYIgxoXIfD1lRugL8lb1hZvE1nMtk6NiqOPyi69PDwyMB9qbTp8ajcoTag1SS9x3uWqmf1Uuk0_gBjkI2dLVJ1Hx8M" />
                    <img alt="Student" className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMTahbGKicSUAEXbdl6lYzhKzdt_tDWJUJVDoL6DlLjOUC_p8vvpRaL3TU-hMaXlZ07SFIRusYzi1rjUW0XNDzAjidV0APNStxVEc1k11sSWe8W7PXnr_EKtbAYLk77Qk1oDxK2I_DiVLRbDGnm4RuuiFymCYZze39m1M7NyU9cv69VtNykzhfqbZi1C2ekpcpgq0wNzOZTx6MC_AhzKx_E_HhpIvpM895flGMxuqK2U7UYpA2ykV8q9VD33kCAWvv20q7ahUYsURS" />
                    <img alt="Student" className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGZp2jRMEem4moahywaJ_f8-aMEXLCXVyY931yWaHn8wUjXATwxJfED4BfAqhPrDsgDxuE6Hant6OTT8r4n8_nMzIHq3PJa8HaEeJPpYerRtdLimC_jid-VmX9zqWXNi2o5ag55wWtaeRBCXawZFU0he0Xr4AL1KbwrjPoZVMz5qHepYmgOor8Ou9IOprldL7v0UDYEQqSL5xUlmTLXN-10xMj0sOGK6_42o8N8yB_YTTNo0PdN93OTpZxfBlv9Ihz7QYwPepbuVeg" />
                  </div>
                  <Link href="/login" className="bg-primary/10 text-primary hover:bg-primary hover:text-white font-label-md text-label-md px-4 py-2 rounded-lg transition-colors duration-200">
                    Join Room ($5)
                  </Link>
                </div>
              </div>
              {/* Decorative floating element */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 flex items-center gap-3 animate-[bounce_4s_infinite]">
                <div className="bg-tertiary-container text-on-tertiary-container w-10 h-10 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined" data-icon="payments">payments</span>
                </div>
                <div>
                  <p className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Cost Split</p>
                  <p className="font-h3 text-[16px] text-on-surface">Saved $45 today</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Problem & Solution Bento Grid */}
        <section className="py-24 bg-surface-container-lowest relative px-6">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="font-h2 text-h2 text-on-surface">Smarter Learning, Shared Costs</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Finding reliable study partners and affordable mentorship shouldn't be the hardest part of university. We've built a better way to collaborate.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto">
              {/* Big Bento Card 1 */}
              <div className="md:col-span-2 bg-surface-container-low rounded-2xl p-8 border border-outline-variant/30 flex flex-col md:flex-row gap-8 items-center hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-shadow duration-300">
                <div className="flex-1 space-y-4">
                  <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-xl flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined" data-icon="group_work">group_work</span>
                  </div>
                  <h3 className="font-h3 text-h3 text-on-surface">The Room Concept</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Stop struggling alone. Create or join a structured study Room dedicated to specific courses. Rooms are capped at small numbers to ensure quality interaction and focused learning.
                  </p>
                </div>
                <div className="flex-1 w-full relative h-[200px] bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex items-center justify-center p-4">
                  <div className="w-full max-w-[280px] space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-lg shadow-sm border border-slate-50">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">P</div>
                      <div className="flex-1 h-2 bg-surface-container rounded-full"></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-lg shadow-sm border border-slate-50 ml-6 relative">
                      <div className="absolute -left-4 top-1/2 w-4 h-[1px] bg-outline-variant"></div>
                      <img alt="Peer" className="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBN2dzjAuHTGhEc6UZRIPmUT6iTbqTdlpghtrxgVs_PU1usmsW9BJznbVO_aBvybgubjpa7-XRfENjhWKgkKdPlmpLaGQuImmHO0tE5wBiMGz6D6_a5YYQuaWDKG6ttuQmQ0NxsfpLaDbLhn2__9huQH5WUhxzh84VrmbJ88oxhQiIhzDGpMqWndNN9JFXJmpBuXH8Rn0Fuy8WIswfDwYsccED5ZxEEd5iIkmmZO4AtKl07L36f9H3AN5OoQe-igDPu5_j_vSvZAReF" />
                      <div className="flex-1 h-2 bg-surface-container rounded-full"></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-lg shadow-sm border border-slate-50 ml-6 relative">
                      <div className="absolute -left-4 top-1/2 w-4 h-[1px] bg-outline-variant"></div>
                      <img alt="Peer" className="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHs_xyTxRXJKDsDj8qGSBbxO01jNQdomP-bC968max8s1zWW-rV-78HFHhHpltZol0CtnNOZUVgVcw6o70B1er88RphjIdUV5LXB7MBUc5heqEsalDm8b0lKKqvbCy7YXTWBRBH24b1EMPqHU_z0Kf-_givLyGCnwn7k3O7anBGLS_TP9dFFu0p_LKTawC2Wuw7KJsZJ1_USxNqnelBBkcp4UO2CyXF1MpP5oFgLNmUNSq04gl2joUekK3LvDQue5TSkjhLMm901Vn" />
                      <div className="flex-1 h-2 bg-surface-container rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Small Bento Card 1 */}
              <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/30 flex flex-col hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-shadow duration-300">
                <div className="w-12 h-12 bg-tertiary-container text-on-tertiary-container rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined" data-icon="account_balance_wallet">account_balance_wallet</span>
                </div>
                <h3 className="font-h3 text-[20px] text-on-surface mb-3">Split Payments</h3>
                <p className="font-body-md text-body-md text-on-surface-variant flex-grow">
                  Premium mentorship shouldn't break the bank. Book an expert mentor for your Room and automatically split the cost evenly among all attendees.
                </p>
                <div className="mt-6 p-4 bg-white rounded-xl flex justify-between items-center shadow-sm">
                  <span className="font-label-sm text-label-sm text-outline">Mentor Fee: $50</span>
                  <span className="font-h3 text-[16px] text-tertiary">You pay: $10</span>
                </div>
              </div>
              {/* Small Bento Card 2 */}
              <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/30 flex flex-col hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-shadow duration-300">
                <div className="w-12 h-12 bg-surface-container-highest text-primary rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined" data-icon="verified">verified</span>
                </div>
                <h3 className="font-h3 text-[20px] text-on-surface mb-3">Vetted Mentors</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Learn from students who recently aced the exact course you're taking. Every mentor is verified for academic excellence.
                </p>
              </div>
              {/* Big Bento Card 2 */}
              <div className="md:col-span-2 bg-surface-container-low rounded-2xl p-8 border border-outline-variant/30 flex flex-col md:flex-row-reverse gap-8 items-center hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-shadow duration-300">
                <div className="flex-1 space-y-4">
                  <div className="w-12 h-12 bg-secondary-container text-on-secondary-container rounded-xl flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined" data-icon="event_available">event_available</span>
                  </div>
                  <h3 className="font-h3 text-h3 text-on-surface">Flexible Scheduling</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Browse active Rooms that fit your timetable, or create your own and let others join. Syncs directly with your university calendar.
                  </p>
                </div>
                <div className="flex-1 w-full bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container flex flex-col items-center justify-center text-primary">
                          <span className="text-[10px] font-bold uppercase">Tue</span>
                          <span className="text-sm font-bold">14</span>
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface">Data Structures</p>
                          <p className="font-label-sm text-[11px] text-on-surface-variant">2:00 PM - 4:00 PM</p>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-[14px]" data-icon="check">check</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer opacity-60">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container flex flex-col items-center justify-center text-on-surface-variant">
                          <span className="text-[10px] font-bold uppercase">Thu</span>
                          <span className="text-sm font-bold">16</span>
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface">Organic Chem Lab</p>
                          <p className="font-label-sm text-[11px] text-on-surface-variant">10:00 AM - 12:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 px-6 bg-white relative">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-h2 text-h2 text-on-surface mb-4">Three Steps to Better Grades</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Getting started is simple. Set up a Room, invite your peers, and start learning.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-primary-container via-surface-container-high to-surface-container-high z-0"></div>
              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="relative w-24 h-24 rounded-2xl bg-white border-4 border-surface-container-low shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                  <span className="material-symbols-outlined text-[40px] text-primary" data-icon="add_business">add_business</span>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center border-2 border-white">1</div>
                </div>
                <h3 className="font-h3 text-[20px] text-on-surface mb-3">Create a Room</h3>
                <p className="font-body-md text-[15px] text-on-surface-variant">Select your course, set a topic (e.g., "Midterm Prep"), and choose a time that works.</p>
              </div>
              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="relative w-24 h-24 rounded-2xl bg-white border-4 border-surface-container-low shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                  <span className="material-symbols-outlined text-[40px] text-primary" data-icon="person_add">person_add</span>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center border-2 border-white">2</div>
                </div>
                <h3 className="font-h3 text-[20px] text-on-surface mb-3">Invite Peers</h3>
                <p className="font-body-md text-[15px] text-on-surface-variant">Share the Room link with classmates or leave it public for other students to discover.</p>
              </div>
              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="relative w-24 h-24 rounded-2xl bg-white border-4 border-surface-container-low shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                  <span className="material-symbols-outlined text-[40px] text-primary" data-icon="diversity_3">diversity_3</span>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center border-2 border-white">3</div>
                </div>
                <h3 className="font-h3 text-[20px] text-on-surface mb-3">Learn Collaboratively</h3>
                <p className="font-body-md text-[15px] text-on-surface-variant">Hop into the virtual room, share notes, ask questions, and master the material together.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mentor Preview Section */}
        <section className="py-24 px-6 bg-surface-container-low">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="max-w-2xl">
                <h2 className="font-h2 text-h2 text-on-surface mb-4">Learn from the Best</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Need extra help? Hire a vetted peer mentor to guide your Room. They've recently passed the course with flying colors.</p>
              </div>
              <Link href="/mentors" className="text-primary font-label-md text-label-md hover:underline flex items-center gap-1">
                View All Mentors <span className="material-symbols-outlined text-[18px]" data-icon="arrow_right_alt">arrow_right_alt</span>
              </Link>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {/* Mentor Card 1 */}
              <div className="bg-white rounded-[16px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group">
                <div className="relative mb-4">
                  <img alt="Sarah J." className="w-full h-48 object-cover rounded-xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwBkeEci0-C3y5rVdI87CWoyJLHhQqc-ZDfNa1nVwSuvNQ14SJnGegjWysFJJQxbMwCzDdxLKKHMSMYLIeStS7zGukLyKajPT5Znz2ExG0fQXgnFdLvOsIYQqC_C2ySyeYfP5p2HCGC3RgGiDp7oexHLW3dVAuXKjkteByPUiKRVPfJJAn-c0u3HtMnKspnoWFSLXEASDOx9fXbeGMWj_E_HsanRt4NWa8Zr9QxYQ22pNo30PbkywKyj8tUJvMg9YUd3TzsZqMAO13" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-[#F59E0B] text-[14px]" data-icon="star" data-weight="fill">star</span>
                    <span className="font-label-sm text-[12px] font-bold text-on-surface">4.9</span>
                  </div>
                </div>
                <h4 className="font-h3 text-[18px] text-on-surface mb-1">Sarah Jenkins</h4>
                <p className="font-body-sm text-[13px] text-primary mb-3">CS101, Data Structures</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-surface-container px-2 py-1 rounded font-label-sm text-[11px] text-on-surface-variant">Top Rated</span>
                  <span className="bg-surface-container px-2 py-1 rounded font-label-sm text-[11px] text-on-surface-variant">150+ Sessions</span>
                </div>
                <Link href="/login" className="w-full block text-center bg-surface-container-lowest border border-outline-variant text-on-surface hover:border-primary hover:text-primary font-label-md text-[13px] py-2 rounded-lg transition-colors">
                  View Profile
                </Link>
              </div>
              {/* Mentor Card 2 */}
              <div className="bg-white rounded-[16px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group">
                <div className="relative mb-4">
                  <img alt="David M." className="w-full h-48 object-cover rounded-xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvDl1talWRC7Kz8mKmNNgsD8Hy6VMLAgXjVFxd_MMvG_wjXsjJ2s_PXkG9NvvoXAHxUg5OjO1yNYBPt0H2EmNMYFapH7yJaSjDnAo4MlIc4VPYceodGLOEFFzGc0r3x44SNJsiM1ckkVozsUJe8pp_Vxgsbq4CqSCU8peTGfPpf-2yKmpubr9bKPMuKaTV1TrkkJjEDDAU4FIPLvBYdzhqYNp-GDmhgN_2X_jvPiQaTqD4Xwu5LInlqY-YBpnO0q6cBlAX0YN6MYoO" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-[#F59E0B] text-[14px]" data-icon="star" data-weight="fill">star</span>
                    <span className="font-label-sm text-[12px] font-bold text-on-surface">4.8</span>
                  </div>
                </div>
                <h4 className="font-h3 text-[18px] text-on-surface mb-1">David Chen</h4>
                <p className="font-body-sm text-[13px] text-primary mb-3">Macroeconomics, Finance</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-surface-container px-2 py-1 rounded font-label-sm text-[11px] text-on-surface-variant">Fast Responder</span>
                  <span className="bg-surface-container px-2 py-1 rounded font-label-sm text-[11px] text-on-surface-variant">89 Sessions</span>
                </div>
                <Link href="/login" className="w-full block text-center bg-surface-container-lowest border border-outline-variant text-on-surface hover:border-primary hover:text-primary font-label-md text-[13px] py-2 rounded-lg transition-colors">
                  View Profile
                </Link>
              </div>
              {/* Mentor Card 3 */}
              <div className="bg-white rounded-[16px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group">
                <div className="relative mb-4">
                  <img alt="Elena R." className="w-full h-48 object-cover rounded-xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBh23m73rKK6vFY3B-13DFrli0SiTdafU1yC5ELS7p2BpcwX6tMSeuy2RklRBZ0CkuKVkx4tj7xi-MQyTFX__o9H8BWK6wVm0o5w2x4SdXaCULP8dopygeXNcxo2FN9TD3p-C8Z30O_ALVjf1yUd6ddofIKdlSWSSO4Yu9eLzdzX098lH0yzdqpNmKHc9nnp9wGBBwRHqBnfkv1HxN-nv62xEsz9AwmhQmWrmpIibhW9xgIwCFObgBtP4NL2GYlq6Nxt8KAKfNIbmtY" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-[#F59E0B] text-[14px]" data-icon="star" data-weight="fill">star</span>
                    <span className="font-label-sm text-[12px] font-bold text-on-surface">5.0</span>
                  </div>
                </div>
                <h4 className="font-h3 text-[18px] text-on-surface mb-1">Elena Rodriguez</h4>
                <p className="font-body-sm text-[13px] text-primary mb-3">Organic Chemistry I & II</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-surface-container px-2 py-1 rounded font-label-sm text-[11px] text-on-surface-variant">Expert</span>
                  <span className="bg-surface-container px-2 py-1 rounded font-label-sm text-[11px] text-on-surface-variant">210 Sessions</span>
                </div>
                <Link href="/login" className="w-full block text-center bg-surface-container-lowest border border-outline-variant text-on-surface hover:border-primary hover:text-primary font-label-md text-[13px] py-2 rounded-lg transition-colors">
                  View Profile
                </Link>
              </div>
              {/* CTA Card */}
              <div className="bg-primary rounded-[16px] p-6 flex flex-col items-center justify-center text-center h-full min-h-[300px] shadow-[0_8px_30px_rgba(0,0,0,0.1)] relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-white/20 text-white flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-[32px]" data-icon="school">school</span>
                  </div>
                  <h4 className="font-h3 text-[20px] text-white mb-2">Become a Mentor</h4>
                  <p className="font-body-sm text-[14px] text-white/80 mb-6">Earn money helping peers ace classes you've already mastered.</p>
                  <Link href="/login" className="bg-white text-primary hover:bg-surface-container-lowest font-label-md text-[14px] px-6 py-2.5 rounded-xl transition-colors shadow-sm w-full block text-center">
                    Apply Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-inverse-surface text-inverse-on-surface py-16 px-6 mt-auto">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-outline-variant/20 pb-12 mb-8">
          <div className="col-span-1 md:col-span-1">
            <Link className="text-2xl font-black text-primary-fixed font-h2 mb-4 inline-block" href="/">Peerly</Link>
            <p className="font-body-sm text-[14px] text-inverse-on-surface/70 mb-6 max-w-xs">
              Structured empathy for academic excellence. Learn together, succeed together.
            </p>
            <div className="flex gap-4">
              <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-white" href="#">
                <span className="material-symbols-outlined text-[20px]" data-icon="public">public</span>
              </a>
              <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-white" href="#">
                <span className="material-symbols-outlined text-[20px]" data-icon="mail">mail</span>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-label-lg text-[16px] font-semibold mb-6 text-white">Platform</h4>
            <ul className="space-y-4 font-body-sm text-[14px] text-inverse-on-surface/70">
              <li><Link className="hover:text-primary-fixed transition-colors" href="/rooms">Explore Rooms</Link></li>
              <li><Link className="hover:text-primary-fixed transition-colors" href="/mentors">Find a Mentor</Link></li>
              <li><Link className="hover:text-primary-fixed transition-colors" href="#">How it Works</Link></li>
              <li><Link className="hover:text-primary-fixed transition-colors" href="#">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-label-lg text-[16px] font-semibold mb-6 text-white">Resources</h4>
            <ul className="space-y-4 font-body-sm text-[14px] text-inverse-on-surface/70">
              <li><Link className="hover:text-primary-fixed transition-colors" href="#">Help Center</Link></li>
              <li><Link className="hover:text-primary-fixed transition-colors" href="#">Safety Guidelines</Link></li>
              <li><Link className="hover:text-primary-fixed transition-colors" href="#">Become a Mentor</Link></li>
              <li><Link className="hover:text-primary-fixed transition-colors" href="#">University Partners</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-label-lg text-[16px] font-semibold mb-6 text-white">Company</h4>
            <ul className="space-y-4 font-body-sm text-[14px] text-inverse-on-surface/70">
              <li><Link className="hover:text-primary-fixed transition-colors" href="#">About Us</Link></li>
              <li><Link className="hover:text-primary-fixed transition-colors" href="#">Careers</Link></li>
              <li><Link className="hover:text-primary-fixed transition-colors" href="#">Privacy Policy</Link></li>
              <li><Link className="hover:text-primary-fixed transition-colors" href="#">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 font-body-sm text-[13px] text-inverse-on-surface/50">
          <p>© 2024 Peerly Platform Inc. All rights reserved.</p>
          <p>Designed with Structured Empathy.</p>
        </div>
      </footer>
    </div>
  );
}
