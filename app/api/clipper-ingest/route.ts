import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  const form = await req.formData();
  const title = String(form.get("title") || "");
  if (!title) return NextResponse.json({ error: "Missing title" }, { status: 400 });
  const count = await prisma.job.count({ where: { status: "SAVED" } });
  await prisma.job.create({
    data: {
      title,
      company: (form.get("company") as string) || undefined,
      url: (form.get("url") as string) || undefined,
      source: (form.get("source") as string) || undefined,
      description: (form.get("description") as string) || undefined,
      status: "SAVED",
      position: count,
    },
  });
  return NextResponse.redirect(new URL(`/`, req.url));
}


