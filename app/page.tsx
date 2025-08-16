"use client";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import clsx from "clsx";

import StatsBox from "./components/StatsBox";
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
  status: "SAVED" | "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED";
  position: number;
};

const STATUSES: Job["status"][] = ["SAVED", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED"];

export default function Home() {
  const [columns, setColumns] = useState<Record<string, Job[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [, setDragActive] = useState(false);

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((data) => {
        const grouped: Record<string, Job[]> = Object.fromEntries(STATUSES.map((s) => [s, []]));
        for (const j of data.jobs as Job[]) grouped[j.status].push(j);
        for (const s of STATUSES) grouped[s].sort((a, b) => a.position - b.position);
        setColumns(grouped);
      })
      .finally(() => setLoading(false));
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    setDragActive(false);
    if (!destination) return;
    const srcCol = source.droppableId;
    const dstCol = destination.droppableId;
    if (srcCol === dstCol && source.index === destination.index) return;
    // Delete flow via trash
    if (dstCol === "__TRASH__") {
      const job = columns[srcCol]?.[source.index];
      if (!job) return;
      if (typeof window !== 'undefined' && !window.confirm(`Delete job: ${job.title}?`)) return;
      setColumns((prev) => {
        const next = { ...prev };
        const from = Array.from(prev[srcCol] || []);
        from.splice(source.index, 1);
        next[srcCol] = from;
        return next;
      });
      try { await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' }); } catch {}
      return;
    }
    // Build next state first using current columns, then persist that exact order
    const next: Record<string, Job[]> = { ...columns };
    const from = Array.from(columns[srcCol] || []);
    const to = srcCol === dstCol ? from : Array.from(columns[dstCol] || []);
    const [moved] = from.splice(source.index, 1);
    if (!moved) return;
    to.splice(destination.index, 0, { ...moved, status: dstCol as Job["status"] });
    next[srcCol] = srcCol === dstCol ? to : from;
    next[dstCol] = to;
    // recompute positions for server
    const updatesForServer = STATUSES.flatMap((s) =>
      (next[s] || []).map((j, idx) => ({ id: j.id, status: s, position: idx }))
    );
    setColumns(next);
    try {
      await fetch("/api/jobs/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: updatesForServer }),
      });
    } catch {}
  };

  const Board = useMemo(() => (
    <div className="min-h-screen p-6 sm:p-10">
      <DragDropContext onDragStart={() => setDragActive(true)} onDragEnd={onDragEnd}>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 items-start">
          {STATUSES.map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={clsx(
                    "rounded-xl border bg-white p-3 sm:p-4 flex flex-col min-h-[160px] max-h-[70vh] overflow-y-auto"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold text-xs uppercase tracking-wide text-slate-700 flex items-center gap-2">
                      <span className={clsx(
                        "inline-block w-2.5 h-2.5 rounded-full",
                        status === "SAVED" && "bg-slate-400",
                        status === "APPLIED" && "bg-sky-500",
                        status === "INTERVIEWING" && "bg-amber-500",
                        status === "OFFER" && "bg-emerald-500",
                        status === "REJECTED" && "bg-rose-500"
                      )} />
                      {status}
                    </h2>
                    <span className="text-xs text-slate-500">{columns[status]?.length ?? 0}</span>
                  </div>
                  <div className="space-y-2">
                    {(columns[status] || []).map((job, index) => (
                      <Draggable draggableId={job.id} index={index} key={job.id} disableInteractiveElementBlocking>
                         {(p) => {
                          // Seed color by URL when available so identical jobs share a color.
                          const base = (job.url || job.source || job.company || job.title || job.id);
                          let hash = 0;
                          for (let i = 0; i < base.length; i++) hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
                          const hue = hash % 360;
                          const stripe = `hsl(${hue} 70% 55%)`;
                          const back = `hsl(${hue} 90% 97%)`;
                          const draggableStyle = {
                            ...p.draggableProps.style,
                            // prevent layout jumps while dragging
                            boxSizing: 'border-box' as const,
                          };
                          return (
                            <div
                              ref={p.innerRef}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                              className="rounded-lg border shadow-sm p-3 hover:shadow-md transition-shadow shrink-0"
                              style={{ borderLeft: `4px solid ${stripe}`, backgroundColor: back, ...draggableStyle }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="text-sm font-medium text-slate-900">{job.title}</div>
                                <button
                                  type="button"
                                  className="text-slate-500 hover:text-slate-700 text-xs"
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedJob(job); }}
                                  aria-label="Open details"
                                  title="Open details"
                                >
                                  Open ↗
                                </button>
                              </div>
                              {job.company && (
                                <div className="text-xs text-slate-600 mt-0.5">{job.company}</div>
                              )}
                              <div className="mt-1 flex flex-wrap gap-1">
                                {job.location && (
                                  <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600">
                                    {job.location}
                                  </span>
                                )}
                                {job.source && (
                                  <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600">
                                    {job.source.replace(/^www\./, "")}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        }}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
        {/* Trash dropzone */}
        <Droppable droppableId="__TRASH__">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={clsx(
                "fixed right-6 bottom-6 h-14 px-4 rounded-lg border bg-white shadow flex items-center gap-2 select-none",
                snapshot.isDraggingOver ? "border-rose-500 bg-rose-50" : "border-slate-200"
              )}
              style={{ zIndex: 40 }}
            >
              <span>🗑️</span>
              <span className="text-sm text-slate-700">Drag here to delete</span>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  ), [columns]);

  const modal = selectedJob && createPortal((
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedJob(null)} />
      <div className="relative z-[110] max-w-2xl w-[94vw] md:w-[720px] bg-white border rounded-xl shadow-xl p-6 max-h-[85vh] overflow-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{selectedJob.title}</h2>
            <div className="text-sm text-slate-600 mt-0.5">{selectedJob.company}</div>
          </div>
          <button className="text-slate-500 hover:text-slate-700" onClick={() => setSelectedJob(null)}>✕</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedJob.location && <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[12px] text-slate-700">{selectedJob.location}</span>}
          {selectedJob.remoteType && <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[12px] text-slate-700">{selectedJob.remoteType}</span>}
          {selectedJob.employmentType && <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[12px] text-slate-700">{selectedJob.employmentType}</span>}
          {selectedJob.salary && <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[12px] text-slate-700">{selectedJob.salary}</span>}
          {selectedJob.source && <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[12px] text-slate-700">{selectedJob.source.replace(/^www\./, "")}</span>}
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {selectedJob.url && (
            <div className="sm:col-span-2 flex items-center gap-2">
              <span className="text-slate-500 w-20 shrink-0">URL</span>
              <a href={selectedJob.url} target="_blank" rel="noopener noreferrer" className="truncate text-sky-700 underline max-w-full">
                {selectedJob.url}
              </a>
              <button
                type="button"
                className="text-xs px-2 py-1 border rounded-md text-slate-600 hover:bg-slate-50"
                onClick={() => { if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(selectedJob.url || ''); }}
              >
                Copy
              </button>
            </div>
          )}
          {selectedJob.company && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 w-20 shrink-0">Company</span>
              <span className="text-slate-800">{selectedJob.company}</span>
            </div>
          )}
          {selectedJob.location && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 w-20 shrink-0">Location</span>
              <span className="text-slate-800">{selectedJob.location}</span>
            </div>
          )}
          {selectedJob.source && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 w-20 shrink-0">Source</span>
              <span className="text-slate-800">{selectedJob.source}</span>
            </div>
          )}
          {selectedJob.salary && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 w-20 shrink-0">Salary</span>
              <span className="text-slate-800">{selectedJob.salary}</span>
            </div>
          )}
          {selectedJob.employmentType && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 w-20 shrink-0">Type</span>
              <span className="text-slate-800">{selectedJob.employmentType}</span>
            </div>
          )}
          {selectedJob.remoteType && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 w-20 shrink-0">Remote</span>
              <span className="text-slate-800">{selectedJob.remoteType}</span>
            </div>
          )}
          {selectedJob.appliedAt && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 w-20 shrink-0">Applied</span>
              <span className="text-slate-800">{new Date(selectedJob.appliedAt).toLocaleDateString()}</span>
            </div>
          )}
          {selectedJob.status && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 w-20 shrink-0">Status</span>
              <span className="text-slate-800">{selectedJob.status}</span>
            </div>
          )}
        </div>
        {selectedJob.description && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-slate-800 mb-1">Description</h3>
            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">{selectedJob.description}</div>
          </div>
        )}
        {selectedJob.notes && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-slate-800 mb-1">Notes</h3>
            <div className="text-sm text-slate-700 whitespace-pre-wrap">{selectedJob.notes}</div>
          </div>
        )}
      </div>
    </div>
  ), document.body);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading…</div>;
  return (
    <>
      {Board}
      {modal}
      <StatsBox columns={columns} />
    </>
  );
}
