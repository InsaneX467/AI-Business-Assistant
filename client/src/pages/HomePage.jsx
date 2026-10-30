import React, { useState, useRef } from 'react';
import { ChatBot } from '../components/ChatBot';
import { LeadModal } from '../components/LeadModal';

export const HomePage = ({ onNavigate, businessProfile }) => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const chatSectionRef = useRef(null);

  const handleOpenLeadForm = (courseName = '') => {
    setSelectedCourse(courseName);
    setIsLeadModalOpen(true);
  };

  const scrollToChat = () => {
    chatSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const location = businessProfile?.location || 'Plot 42, Education Hub, Near Metro Pillar 118, Knowledge City, Pin 110092';
  const hours = businessProfile?.workingHours || 'Mon – Sat: 7:30 AM – 8:30 PM, Sun: 8:00 AM – 2:00 PM';
  const phone = businessProfile?.phone || '+91 98765 43210';
  const email = businessProfile?.email || 'admissions@abcacademy.demo';
  const businessName = businessProfile?.name || 'ABC Academy';

  const courses = [
    {
      id: 'neet-medical-2yr',
      name: 'NEET-UG 2-Year Medical Master (Class 11 & 12)',
      target: 'AIIMS, JIPMER & Govt Medical Colleges (MBBS)',
      duration: '2 Years',
      timings: 'Morning (8:00 AM - 12:30 PM) | Evening (4:00 PM - 7:30 PM)',
      fee: '₹1,35,000 / yr',
      isSampleFee: true,
      scholarship: 'Up to 90% via ATSE Exam',
      badge: 'Medical Flagship',
      accent: 'from-emerald-600 to-teal-600',
      tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      id: 'jee-integrated-2yr',
      name: 'JEE (Main + Advanced) 2-Year Integrated (Class 11 & 12)',
      target: 'IITs, NITs, BITSAT & Top Engineering Institutes',
      duration: '2 Years',
      timings: 'Morning (8:00 AM - 12:30 PM) | Evening (4:00 PM - 7:30 PM)',
      fee: '₹1,45,000 / yr',
      isSampleFee: true,
      scholarship: 'Up to 90% via ATSE Exam',
      badge: 'Engineering Flagship',
      accent: 'from-blue-600 to-indigo-600',
      tagColor: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    {
      id: 'neet-dropper-1yr',
      name: 'NEET-UG 1-Year Dropper / Repeater Achiever Batch',
      target: 'Target 650+ Score in NEET-UG (Full-time Cohort)',
      duration: '1 Year Intensive',
      timings: 'Mon to Fri: 8:30 AM - 3:00 PM (Daily DPPs & Tests)',
      fee: '₹90,000',
      isSampleFee: true,
      scholarship: 'Merit Concessions Available',
      badge: 'Rank Booster',
      accent: 'from-amber-600 to-orange-600',
      tagColor: 'bg-amber-50 text-amber-900 border-amber-200'
    },
    {
      id: 'jee-dropper-1yr',
      name: 'JEE 1-Year Dropper / Repeater Rank Booster Cohort',
      target: 'Target 99+ Percentile & Top 1% IIT-JEE Ranks',
      duration: '1 Year Intensive',
      timings: 'Mon to Fri: 8:30 AM - 3:30 PM (Advanced Problem Solving)',
      fee: '₹95,000',
      isSampleFee: true,
      scholarship: 'Merit Concessions Available',
      badge: 'IITian Mentors',
      accent: 'from-purple-600 to-indigo-700',
      tagColor: 'bg-purple-50 text-purple-900 border-purple-200'
    },
    {
      id: 'foundation-olympiad',
      name: 'Foundation & Olympiad Program (Class 9 & 10)',
      target: 'NTSE, PRMO, Olympiads & Pre-JEE/NEET Mastery',
      duration: '1 Year per Class',
      timings: '3 Days/Week (4:30 PM - 7:00 PM) or Weekend Intensive',
      fee: '₹48,000 / yr',
      isSampleFee: true,
      scholarship: 'Early Talent Discounts',
      badge: 'Class 9th & 10th',
      accent: 'from-cyan-600 to-blue-600',
      tagColor: 'bg-cyan-50 text-cyan-900 border-cyan-200'
    }
  ];

  const highlights = [
    {
      icon: 'support_agent',
      title: 'Daily 1-on-1 Doubt Desks',
      desc: 'Expert faculty available daily from 8:00 AM to 8:00 PM so students never take unsolved doubts home.'
    },
    {
      icon: 'devices',
      title: 'All-India Test Series (AITS)',
      desc: 'Simulating exact NTA computer-based testing (CBT) with detailed national percentile diagnostic reports.'
    },
    {
      icon: 'menu_book',
      title: 'NCERT Line-by-Line Mastery',
      desc: 'In-depth conceptual study materials, Daily Practice Problems (DPP), and 15+ years of solved past questions.'
    },
    {
      icon: 'notifications_active',
      title: 'Parent Portal & Instant SMS',
      desc: 'Biometric classroom attendance and automated weekly test performance reports delivered to parents.'
    }
  ];

  const faqs = [
    {
      q: 'What are the batch timings for school-going vs dropper students?',
      a: 'We offer Morning Batches (8:00 AM – 12:30 PM) for integrated schooling students, Evening Batches (4:00 PM – 7:30 PM) for regular school attendees, and Full-Time Batches (8:30 AM – 3:00 PM) for 12th pass droppers.'
    },
    {
      q: 'How does the ATSE scholarship examination work?',
      a: 'The ABC Talent Scholarship Exam (ATSE) is a 60-minute aptitude test in Science and Mathematics. Qualified students can earn up to a 90% tuition fee waiver based on their percentile score.'
    },
    {
      q: 'Can a student attend demo classes before enrollment?',
      a: 'Yes! Every prospective student is welcome to attend 2 free trial / demo classes to experience our classroom pedagogy and interact with our doubt mentors before paying any fees.'
    },
    {
      q: 'Are hostel and transportation facilities available?',
      a: 'ABC Academy provides tie-up verified hostel recommendations with supervised study hours within 1 km of campus, plus optional daily AC bus transport along major city routes. [Demo Mode: Sample Data]'
    }
  ];

  return (
    <main className="w-full min-h-screen bg-slate-50 pt-24 pb-16 flex flex-col">
      
      {/* Ambient background glows */}
      <div className="fixed top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-200/20 blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed top-96 right-10 w-[400px] h-[400px] rounded-full bg-emerald-200/20 blur-[130px] pointer-events-none z-0"></div>

      <div className="max-w-[1360px] w-full mx-auto px-4 sm:px-6 relative z-10 flex flex-col gap-10">

        {/* HERO SECTION */}
        <div className="grid grid-cols-12 gap-6 items-stretch pt-2">
          
          {/* Left Column: Institute Value Proposition */}
          <div className="col-span-12 lg:col-span-7 flex flex-col justify-between py-2 pr-0 lg:pr-4">
            <div>
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-900 font-bold text-xs mb-4 shadow-sm border border-blue-200">
                <span className="material-symbols-outlined text-[16px] text-blue-700">school</span>
                <span>ADMISSIONS OPEN 2026-27 • NEET-UG & IIT-JEE ADVANCED</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] lg:leading-[52px] font-extrabold text-gray-900 tracking-tight mb-4">
                Personalized coaching &{' '}
                <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                  24/7 AI Mentorship
                </span>{' '}
                for future Doctors & Engineers.
              </h1>

              {/* Supporting Subtitle */}
              <p className="text-sm sm:text-base text-gray-600 max-w-[620px] leading-relaxed mb-6">
                Welcome to <strong>{businessName}</strong>. We deliver concept-first classroom coaching, All-India Test Series (AITS), and dedicated 1-on-1 doubt desks. Ask our AI Admissions Counselor live about batch schedules, scholarship tests, or sample fee structures.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <button 
                  className="px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-700/20 transition-all hover:-translate-y-0.5"
                  onClick={scrollToChat}
                >
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                  <span>Ask AI Admissions Counselor</span>
                </button>

                <button 
                  className="px-5 py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-900 font-semibold text-sm border border-gray-300 flex items-center gap-2 shadow-sm transition-all hover:-translate-y-0.5"
                  onClick={() => onNavigate && onNavigate('courses')}
                >
                  <span>Explore Batches & Fees</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>

                <button 
                  className="px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-sm border border-emerald-200 flex items-center gap-1.5 transition-colors"
                  onClick={() => handleOpenLeadForm('Free Trial Demo Class')}
                >
                  <span className="material-symbols-outlined text-[18px] text-emerald-700">event_available</span>
                  <span>Book Free Demo Class</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-gray-700 font-medium pt-1">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Up to 90% ATSE Scholarship</span>
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1 text-blue-700 font-semibold">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>2 Free Trial Classes</span>
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1 text-purple-700 font-semibold">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Daily Doubt Desks (8AM–8PM)</span>
                </span>
              </div>
            </div>

            {/* Business Contact Cards Strip */}
            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">CAMPUS LOCATION</p>
                  <p className="font-semibold text-gray-900 truncate" title={location}>{location}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">CAMPUS HOURS</p>
                  <p className="font-semibold text-gray-900 truncate" title={hours}>{hours}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">call</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">HELPLINE</p>
                  <a href={`tel:${phone}`} className="font-bold text-gray-900 hover:text-blue-700 truncate block">
                    {phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ADMISSIONS EMAIL</p>
                  <a href={`mailto:${email}`} className="font-semibold text-gray-900 hover:text-blue-700 truncate block">
                    {email}
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Embedded Live AI Counselor Frame */}
          <div ref={chatSectionRef} className="col-span-12 lg:col-span-5 h-[580px] lg:h-full min-h-[540px] flex flex-col">
            <ChatBot onOpenLeadForm={() => handleOpenLeadForm('Chat Callback Request')} businessProfile={businessProfile} />
          </div>

        </div>

        {/* POPULAR BATCHES & COURSES SNAPSHOT SECTION */}
        <section className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-[15px]">stars</span>
                Structured 2026-27 Cohorts
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                NEET & JEE Entrance Programs
              </h2>
              <p className="text-sm text-gray-600 max-w-2xl mt-1">
                Classroom and hybrid batches with 120+ weekly mock tests, Daily Practice Problems (DPP), and doubt-clearing desks.
              </p>
            </div>
            <button 
              className="self-start sm:self-auto px-4 py-2 text-xs font-bold text-blue-700 hover:text-blue-800 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-1"
              onClick={() => onNavigate && onNavigate('courses')}
            >
              <span>View All 5 Batches</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.slice(0, 3).map((c) => (
              <div 
                key={c.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${c.tagColor}`}>
                      {c.badge}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                      {c.duration}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-gray-900 leading-snug mb-2">
                    {c.name}
                  </h3>

                  <p className="text-xs text-blue-700 font-medium mb-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">flag</span>
                    <span>{c.target}</span>
                  </p>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4 text-xs space-y-1.5">
                    <div className="flex items-start gap-1.5 text-gray-600">
                      <span className="material-symbols-outlined text-[15px] text-gray-400 shrink-0 mt-0.5">schedule</span>
                      <span className="leading-tight">{c.timings}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <span className="material-symbols-outlined text-[15px] shrink-0">award_star</span>
                      <span>{c.scholarship}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">{c.fee}</span>
                    <span className="text-[10px] text-amber-600 font-semibold">Sample Demo Fee</span>
                  </div>
                  <button 
                    className="px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-sm transition-colors"
                    onClick={() => handleOpenLeadForm(c.name)}
                  >
                    Enquire / Demo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WHY CHOOSE ABC ACADEMY */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
              ACADEMIC EXCELLENCE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-2">
              Why top rankers choose ABC Academy
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Engineered for consistency, deep understanding, and maximum scores in NTA entrance examinations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((h, i) => (
              <div key={i} className="flex flex-col gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">{h.icon}</span>
                </div>
                <h4 className="font-bold text-base text-gray-900">{h.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4-STEP ADMISSION & SCHOLARSHIP PROCESS */}
        <section className="flex flex-col gap-4">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
              SIMPLE ADMISSION ROADMAP
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-2">
              How to enroll at ABC Academy
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            {[
              { step: '01', title: 'Register for ATSE', desc: 'Free online registration for the ABC Talent Scholarship Exam.' },
              { step: '02', title: 'Take 60-min Test', desc: 'Aptitude assessment in Science and Maths to earn up to 90% fee waiver.' },
              { step: '03', title: 'Academic Counseling', desc: '1-on-1 counseling session with parents to select suitable batch timings.' },
              { step: '04', title: 'Seat & Batch Confirm', desc: 'Complete registration with easy 3-month interest-free installment options.' }
            ].map((s, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm relative overflow-hidden">
                <span className="text-3xl font-black text-blue-100 absolute top-3 right-4 select-none">
                  {s.step}
                </span>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 mb-3">
                  Step {s.step}
                </span>
                <h4 className="font-extrabold text-sm text-gray-900 mb-1">{s.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="max-w-2xl mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mt-2">
              Questions parents & students ask us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 mb-2 flex items-start gap-2">
                    <span className="text-blue-700 font-extrabold">Q:</span>
                    <span>{faq.q}</span>
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed pl-5">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER WITH DEMO NOTICE */}
        <footer className="mt-4 pt-6 pb-4 border-t border-gray-200 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            <span>DEMO MODE ACTIVE: All institute courses, batch timings, test records, and fees are realistic demonstration samples.</span>
          </div>
          <p>© 2026 {businessName} • AI Business Assistant Live Demonstration</p>
        </footer>

      </div>

      {/* Global Lead Modal */}
      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        defaultRequirement={selectedCourse}
      />
    </main>
  );
};

export default HomePage;
