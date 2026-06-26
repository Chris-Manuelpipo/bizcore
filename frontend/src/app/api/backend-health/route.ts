import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

type HealthPayload = { status?: string };

async function probe(url: string): Promise<{ reachable: boolean; healthy: boolean; status?: string } | null> {
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    const data = (await res.json()) as HealthPayload;
    const status = data.status;
    const healthy = status === "UP";
    // Réponse HTTP reçue = backend joignable (même si status DOWN à cause de Redis/Kafka).
    const reachable = res.status > 0 && typeof status === "string";
    return { reachable, healthy, status };
  } catch {
    return null;
  }
}

export async function GET() {
  const candidates = [
    `${API_BASE}/actuator/health/liveness`,
    `${API_BASE}/actuator/health`,
  ];

  for (const url of candidates) {
    const result = await probe(url);
    if (result?.reachable) {
      return NextResponse.json(result);
    }
  }

  return NextResponse.json({ reachable: false, healthy: false }, { status: 503 });
}
