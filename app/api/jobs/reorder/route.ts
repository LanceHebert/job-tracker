import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  const { updates } = await req.json();
  await prisma.$transaction(
    updates.map((u: { id: string; status: string; position: number }) =>
      prisma.job.update({ where: { id: u.id }, data: { status: u.status as any, position: u.position } })
    )
  );
  return NextResponse.json({ ok: true });
}


