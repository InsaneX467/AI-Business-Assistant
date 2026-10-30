import React, { useState, useEffect } from 'react';
import { getBusinessInfo } from '../services/api';

export const CoursesPage = ({ onSelectCourse, businessProfile }) => {
  const [info, setInfo] = useState(businessProfile || null);

  useEffect(() => {
    if (!info) {
      getBusinessInfo()
        .then((res) => {
          if (res.success) setInfo(res.data);
        })
        .catch(console.error);
    }
  }, [info]);

  if (!info) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-gray-500 text-sm pt-24">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
          <span>Loading NEET & JEE coaching programs...</span>
        </div>
      </div>
    );
  }

  const rawCourses = info.courses || info.services || [];
  const courseDetails = rawCourses.map((c, idx) => ({
    id: c.id,
    name: c.name,
    category: c.name.toLowerCase().includes('neet')
      ? 'Medical (NEET-UG)'
      : c.name.toLowerCase().includes('jee')
      ? 'Engineering (IIT-JEE)'
      : 'Foundation & Olympiad',
    price: c.fee || c.price || '₹1,35,000 / yr',
    rating: '4.9',
    students: '500+ Aspirants',
    duration: c.duration || '',
    mode: c.mode || 'Offline Classroom & Hybrid',
    desc: c.description || '',
    timings: c.classTimings || c.class_timings || 'Morning (8:00 AM - 12:30 PM) | Evening (4:00 PM - 7:30 PM)',
    prerequisites: c.prerequisites || 'Class 10 Science & Mathematics',
    careerOutcomes: c.careerOutcomes || c.career_outcomes || 'Target Top National Percentiles & Colleges',
    eligibility: c.eligibility || 'Science background with strong commitment to competitive preparation',
    icon: c.name.toLowerCase().includes('neet')
      ? 'medical_services'
      : c.name.toLowerCase().includes('jee')
      ? 'architecture'
      : 'psychology',
    accent:
      idx === 0
        ? 'from-emerald-500 via-teal-500 to-cyan-500'
        : idx === 1
        ? 'from-blue-600 via-indigo-600 to-cyan-500'
        : 'from-amber-500 via-orange-500 to-red-500',
    isFeatured: idx === 0 || idx === 1,
    featuredText: idx === 0 ? 'Premier Medical Batch' : 'Premier Engineering Batch'
  }));

  const businessName = info.name || 'ABC Academy';

  return (
    <main className="w-full min-h-screen flex flex-col bg-slate-50 pt-24 pb-16">
      <div className="max-w-[1360px] w-full mx-auto px-4 sm:px-6 flex flex-col gap-6">
        
        {/* Intro Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-800 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-md border border-blue-200 mb-2">
              <span className="material-symbols-outlined text-[15px] text-blue-700">school</span>
              NEET-UG, IIT-JEE & Foundation Batches • 2026-27 Academic Session
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {businessName} Courses & Cohorts
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Classroom instruction by IIT & AIIMS alumni mentors with 120+ All-India CBT mock tests, daily DPPs, and 1-on-1 doubt desks.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center text-xs font-bold px-3 py-2 rounded-xl bg-blue-700 text-white shadow-sm">
              All Batches ({courseDetails.length})
            </span>
            <button 
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-700 transition-colors shadow-sm"
              onClick={() => onSelectCourse('Curriculum & Scholarship Brochure PDF')}
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Brochure PDF</span>
            </button>
          </div>
        </div>

        {/* Demo Mode Notice Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-700 text-[18px]">info</span>
            <span>
              <strong>Demo Mode Notice:</strong> Course fees and schedules below are realistic sample demonstration estimates. ABC Academy offers up to 90% scholarships through the ATSE admission test.
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded">
            Sample Data
          </span>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {courseDetails.map((course, idx) => (
            <div 
              key={idx} 
              className={`bg-white rounded-2xl border shadow-sm hover:border-blue-500 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden relative ${
                course.isFeatured ? 'border-blue-400 ring-1 ring-blue-400/20' : 'border-gray-200'
              }`}
            >
              {/* Featured Badge Header Strip */}
              {course.isFeatured ? (
                <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 text-white text-[10px] font-bold py-1 px-3 text-center tracking-wide uppercase flex items-center justify-center gap-1 shrink-0">
                  <span className="material-symbols-outlined text-[14px] text-amber-300">local_fire_department</span>
                  {course.featuredText}
                </div>
              ) : (
                <div className={`h-1.5 w-full bg-gradient-to-r ${course.accent} shrink-0`}></div>
              )}
              
              <div className="p-5 flex flex-col flex-1">
                
                {/* Header Badge & Price */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    {course.category}
                  </span>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {course.price}
                    </span>
                    <p className="text-[9px] text-amber-700 font-semibold mt-0.5">Sample Demo Fee</p>
                  </div>
                </div>

                {/* Title & Icon */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">{course.icon}</span>
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-gray-900 leading-snug">
                      {course.name}
                    </h2>
                    <span className="text-[11px] text-gray-500 font-medium">Duration: {course.duration}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {course.desc}
                </p>

                {/* Batch Timings & Mode Box */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2 mb-4 mt-auto">
                  <div className="flex items-start gap-1.5 text-gray-700">
                    <span className="material-symbols-outlined text-[16px] text-blue-700 shrink-0 mt-0.5">schedule</span>
                    <div>
                      <strong className="text-gray-900 block text-[11px] uppercase tracking-wide">Batch Timings:</strong>
                      <span className="leading-tight text-gray-600">{course.timings}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-700 pt-1 border-t border-slate-200/80">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0">verified</span>
                    <span className="text-[11px] font-medium">Learning Mode: {course.mode}</span>
                  </div>
                </div>

                {/* Target Outcomes */}
                <div className="mb-4 text-xs">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">TARGET ENTRANCE EXAMS</p>
                  <p className="text-gray-800 font-semibold flex items-center gap-1 text-[11px]">
                    <span className="material-symbols-outlined text-[15px] text-blue-600">flag</span>
                    <span>{course.careerOutcomes}</span>
                  </p>
                </div>

                {/* Eligibility */}
                <div className="text-[11px] text-gray-500 mb-4 bg-gray-50 rounded-lg p-2 border border-gray-100">
                  <span className="font-semibold text-gray-700">Eligibility: </span>
                  {course.eligibility}
                </div>

                {/* Action CTA Button */}
                <button
                  className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 mt-2 hover:-translate-y-0.5"
                  onClick={() => onSelectCourse(course.name)}
                >
                  <span className="material-symbols-outlined text-[16px]">support_agent</span>
                  <span>Enquire for this Batch</span>
                </button>

              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
};

export default CoursesPage;
