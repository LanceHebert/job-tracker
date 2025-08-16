"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";

type FormValues = {
  title: string;
  compunknown?: string;
  location?: string;
  url?: string;
  source?: string;
  salary?: string;
  employmentType?: string;
  remoteType?: string;
  description?: string;
  notes?: string;
  status?: "SAVED" | "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED";
  appliedAt?: string;
};

const STATUSES: FormValues["status"][] = ["SAVED", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED"];

export default function NewJobPage() {
  const router = useRouter();
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const { register, handleSubmit, formState, setValue } = useForm<FormValues>({
    defaultValues: { status: "SAVED" },
  });

  // Prefill from query params (fallback)
  if (typeof window !== 'undefined' && params.get('from') === 'clipper') {
    const fields: (keyof FormValues)[] = ['title','compunknown','location','salary','remoteType','url','source','description'];
    for (const f of fields) {
      const v = params.get(f);
      if (v) setValue(f, v);
    }
  }

  // Prefill from window.name payload (robust new-tab transport)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const marker = 'JOBDATA::';
    try {
      if (window.name && window.name.startsWith(marker)) {
        const encoded = window.name.slice(marker.length);
        const raw = decodeURIComponent(encoded);
        const data: Partial<FormValues> = JSON.parse(raw);
        const fields: (keyof FormValues)[] = ['title','compunknown','location','salary','remoteType','url','source','description'];
        for (const f of fields) {
          if (data[f]) setValue(f, data[f] as string);
        }
        // Clear name to avoid leaking payload when navigating
        window.name = '';
      }
    } catch {}
  }, [setValue]);

  const onSubmit = async (data: FormValues) => {
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen p-6 sm:p-10">
      <div className="max-w-3xl mx-auto rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-4">Add Job</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm text-slate-600 mb-1">Title</label>
            <input className="w-full border rounded-md px-3 py-2" {...register("title", { required: true })} />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Compunknown</label>
            <input className="w-full border rounded-md px-3 py-2" {...register("compunknown")} />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Location</label>
            <input className="w-full border rounded-md px-3 py-2" {...register("location")} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-slate-600 mb-1">URL</label>
            <input className="w-full border rounded-md px-3 py-2" {...register("url")} />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Source</label>
            <input className="w-full border rounded-md px-3 py-2" {...register("source")} />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Salary</label>
            <input className="w-full border rounded-md px-3 py-2" {...register("salary")} />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Employment Type</label>
            <input className="w-full border rounded-md px-3 py-2" {...register("employmentType")} />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Remote Type</label>
            <input className="w-full border rounded-md px-3 py-2" {...register("remoteType")} />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Status</label>
            <select className="w-full border rounded-md px-3 py-2" {...register("status")}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Applied At</label>
            <input type="date" className="w-full border rounded-md px-3 py-2" {...register("appliedAt")} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-slate-600 mb-1">Description</label>
            <textarea className="w-full border rounded-md px-3 py-2 min-h-[120px]" {...register("description")} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-slate-600 mb-1">Notes</label>
            <textarea className="w-full border rounded-md px-3 py-2 min-h-[80px]" {...register("notes")} />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
            <Link href="/" className="px-4 py-2 border rounded-md">Cancel</Link>
            <button disabled={formState.isSubmitting} className="px-4 py-2 bg-black text-white rounded-md">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}


