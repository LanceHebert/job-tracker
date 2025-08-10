import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const jobs = await prisma.job.findMany({ orderBy: [{ status: "asc" }, { position: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json({ jobs });
}

export async function POST(req: Request) {
  const body = await req.json();
  const countInStatus = await prisma.job.count({ where: { status: body.status ?? "SAVED" } });
  const job = await prisma.job.create({
    data: {
      title: body.title,
      company: body.company,
      location: body.location,
      url: body.url,
      source: body.source,
      salary: body.salary,
      employmentType: body.employmentType,
      remoteType: body.remoteType,
      description: body.description,
      notes: body.notes,
      status: body.status ?? "SAVED",
      position: countInStatus,
      appliedAt: body.appliedAt ? new Date(body.appliedAt) : null,
    },
  });
  return NextResponse.json({ job }, { status: 201 });
}


