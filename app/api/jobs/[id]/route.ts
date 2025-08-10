import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(_req: Request, context: any) {
  const { id } = context?.params ?? {};
  await prisma.job.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}


