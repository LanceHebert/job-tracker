"use client";

import { useMemo } from "react";

type Job = {
  id: string;
  title: string;
  company?: string | null;
  location?: string | null;
  source?: string | null;
  url?: string | null;
  salary?: string | null;
  employmentType?: string | null;
  remoteType?: string | null;
  description?: string | null;
  notes?: string | null;
  appliedAt?: string | null;
  status: "SAVED" | "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED" | "INTERVIEWED_BUT_REJECTED";
  position: number;
};

interface StatsBoxProps {
  columns: Record<string, Job[]>;
}

export default function StatsBox({ columns }: StatsBoxProps) {
  const stats = useMemo(() => {
    if (!columns || Object.keys(columns).length === 0) {
      return {
        totalJobs: 0,
        appliedJobs: 0,
        rejectedJobs: 0,
        interviewedButRejectedJobs: 0,
        interviewingJobs: 0,
        offerJobs: 0,
        appliedPercentage: "0",
        rejectedPercentage: "0",
        interviewPercentage: "0",
        offerPercentage: "0",
        interviewRate: "0",
        totalAppliedJobs: 0,
      };
    }
    
    const allJobs = Object.values(columns).flat();
    const totalJobs = allJobs.length;
    
    const appliedJobs = columns["APPLIED"]?.length || 0;
    const rejectedJobs = columns["REJECTED"]?.length || 0;
    const interviewedButRejectedJobs = columns["INTERVIEWED_BUT_REJECTED"]?.length || 0;
    const interviewingJobs = columns["INTERVIEWING"]?.length || 0;
    const offerJobs = columns["OFFER"]?.length || 0;
    
    // Total jobs that were applied to (excluding SAVED)
    const totalAppliedJobs = appliedJobs + interviewingJobs + offerJobs + rejectedJobs + interviewedButRejectedJobs;
    
    // Combined rejected count (REJECTED + INTERVIEWED_BUT_REJECTED)
    const totalRejectedJobs = rejectedJobs + interviewedButRejectedJobs;
    
    // Jobs that reached interview stage (INTERVIEWING + INTERVIEWED_BUT_REJECTED)
    const interviewedJobs = interviewingJobs + interviewedButRejectedJobs;
    
    // Calculate percentages
    const appliedPercentage = totalJobs > 0 ? ((appliedJobs / totalJobs) * 100).toFixed(1) : "0";
    const rejectedPercentage = totalJobs > 0 ? ((totalRejectedJobs / totalJobs) * 100).toFixed(1) : "0";
    const interviewPercentage = totalJobs > 0 ? ((interviewingJobs / totalJobs) * 100).toFixed(1) : "0";
    const offerPercentage = totalJobs > 0 ? ((offerJobs / totalJobs) * 100).toFixed(1) : "0";
    
    // Interview rate: (INTERVIEWING + INTERVIEWED_BUT_REJECTED) / total applied jobs
    const interviewRate = totalAppliedJobs > 0 ? ((interviewedJobs / totalAppliedJobs) * 100).toFixed(1) : "0";
    
    return {
      totalJobs,
      appliedJobs,
      rejectedJobs: totalRejectedJobs,
      interviewedButRejectedJobs,
      interviewingJobs,
      offerJobs,
      appliedPercentage,
      rejectedPercentage,
      interviewPercentage,
      offerPercentage,
      interviewRate,
      totalAppliedJobs,
    };
  }, [columns]);

  return (
    <div className="fixed left-6 bottom-6 bg-white rounded-lg border border-slate-200 shadow-lg p-4 min-w-[280px] z-40">
      <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <span className="text-lg">📊</span>
        Job Search Stats
      </h3>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Total Jobs:</span>
          <span className="text-sm font-medium text-slate-800">{stats.totalJobs}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Applied:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-sky-600">{stats.appliedJobs}</span>
            <span className="text-xs text-slate-500">({stats.appliedPercentage}%)</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Interviewing:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-amber-600">{stats.interviewingJobs}</span>
            <span className="text-xs text-slate-500">({stats.interviewPercentage}%)</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Offers:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-emerald-600">{stats.offerJobs}</span>
            <span className="text-xs text-slate-500">({stats.offerPercentage}%)</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Rejected:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-rose-600">{stats.rejectedJobs}</span>
            <span className="text-xs text-slate-500">({stats.rejectedPercentage}%)</span>
          </div>
        </div>
      </div>
      
      {stats.totalJobs > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Interview Rate:</span>
            <span className="text-xs font-medium text-slate-800">
              {stats.interviewRate}%
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Interviews / Total Applied ({stats.totalAppliedJobs})
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-slate-500">Success Rate:</span>
            <span className="text-xs font-medium text-slate-800">
              {stats.totalAppliedJobs > 0 ? ((stats.offerJobs / stats.totalAppliedJobs) * 100).toFixed(1) : "0"}%
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Offers / Total Applied
          </div>
        </div>
      )}
    </div>
  );
}
