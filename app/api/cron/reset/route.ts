import { NextResponse } from "next/server";
import { seedDemo } from "@/lib/seedDemo";

// Route déclenchée par le cron Vercel pour réinitialiser la démo.
// En local (sans CRON_SECRET défini) l'appel est libre ;
// en production, seul Vercel — qui envoie le bon Bearer — peut la déclencher.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await seedDemo();

  return NextResponse.json({ ok: true, message: "Démo réinitialisée" });
}
