"use client";

import { useCallback, useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { Button, Panel } from "@/components/ui";
import { track } from "@/components/track";
import { formatIdr } from "@/lib/config";
import { formatLabel, gutLabel } from "@/lib/labels";
import type { PublicDebrief } from "@/lib/types";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: () => void;
          onPending?: () => void;
          onError?: () => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

async function loadDebrief(id: string) {
  const response = await fetch(`/api/payment/status?id=${encodeURIComponent(id)}`, { cache: "no-store" });
  if (response.status === 404) return { missing: true as const };
  if (!response.ok) return { error: true as const };
  const debrief = (await response.json()) as PublicDebrief;
  return { debrief };
}

export function HasilView({ id }: { id: string }) {
  const [state, setState] = useState<"loading" | "missing" | "error" | "ready">("loading");
  const [debrief, setDebrief] = useState<PublicDebrief | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const refresh = useCallback(async () => {
    const result = await loadDebrief(id);
    if ("missing" in result) {
      setState("missing");
      return;
    }
    if ("error" in result || !result.debrief) {
      setState("error");
      return;
    }
    setDebrief(result.debrief);
    setState("ready");
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function pollUntilPaid() {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const result = await loadDebrief(id);
      if ("debrief" in result && result.debrief?.paid) {
        setDebrief(result.debrief);
        return;
      }
    }
  }

  async function unlock() {
    if (!debrief) return;
    setPayError("");
    setPaying(true);
    track("unlock_clicked", { format: debrief.format });
    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await response.json()) as {
        paid?: boolean;
        token?: string;
        redirectUrl?: string;
        error?: string;
      };
      if (data.paid) {
        await refresh();
        setPaying(false);
        return;
      }
      if (!response.ok || !data.token) {
        setPayError(
          response.status === 503
            ? "Pembayaran belum dipasang di server. Debriefmu tetap tersimpan di tautan ini."
            : "Pembayaran belum terbuka. Coba sekali lagi.",
        );
        setPaying(false);
        return;
      }

      const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
      const production = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
      if (clientKey && data.token) {
        await ensureSnap(clientKey, production);
        if (window.snap) {
          track("payment_opened", { format: debrief.format });
          window.snap.pay(data.token, {
            onSuccess: () => void pollUntilPaid(),
            onPending: () => void pollUntilPaid(),
            onClose: () => {
              setPaying(false);
              void pollUntilPaid();
            },
            onError: () => {
              setPayError("Jendela pembayaran tertutup dengan gangguan.");
              setPaying(false);
            },
          });
          return;
        }
      }
      if (data.redirectUrl) {
        track("payment_opened", { format: debrief.format });
        window.location.href = data.redirectUrl;
        return;
      }
      setPayError("Tautan pembayaran tidak terbentuk.");
      setPaying(false);
    } catch {
      setPayError("Jaringan lagi tidak tenang. Coba sekali lagi.");
      setPaying(false);
    }
  }

  if (state === "loading") {
    return <p className="text-ink/70">Membuka debrief...</p>;
  }
  if (state === "missing") {
    return (
      <Panel className="p-6">
        <h1 className="text-2xl font-semibold text-navy-950">Debrief ini tidak ketemu</h1>
        <p className="mt-2 text-ink/75">Tautannya mungkin terpotong. Buat debrief baru dari halaman utama.</p>
      </Panel>
    );
  }
  if (state === "error" || !debrief) {
    return (
      <Panel className="p-6">
        <h1 className="text-2xl font-semibold text-navy-950">Debrief belum bisa dibuka</h1>
        <p className="mt-2 text-ink/75">Server sedang tidak menjawab. Muat ulang halaman ini sebentar lagi.</p>
        <Button className="mt-4" type="button" onClick={() => void refresh()}>
          Muat ulang
        </Button>
      </Panel>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-amber-500">Debrief kamu</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-navy-950">{debrief.band}</h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink/80">{debrief.spiralNote}</p>
      </div>

      <Panel className="grid gap-4 p-5 sm:grid-cols-4">
        <Meta label="Peran" value={debrief.role} />
        <Meta label="Format" value={formatLabel[debrief.format]} />
        <Meta label="Durasi" value={`${debrief.durationMinutes} menit`} />
        <Meta label="Perasaan" value={gutLabel[debrief.gut]} />
      </Panel>

      <Panel className="p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-navy-800">Angka dari rekap, bukan dari rasa</p>
            <p className="mt-1 text-5xl font-semibold tabular-nums text-navy-950">{debrief.overall}</p>
          </div>
          <p className="max-w-xs text-right text-sm leading-relaxed text-ink/65">
            Angka ini membaca rekap yang kamu tulis, bukan rekaman wawancara.
          </p>
        </div>
        <div className="mt-5 space-y-4">
          {debrief.paid && debrief.dimensions
            ? debrief.dimensions.map((row) => (
                <div key={row.key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-navy-900">{row.label}</span>
                    <span className="tabular-nums text-ink/60">{row.score}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-mist">
                    <div className="h-full rounded-full bg-navy-800" style={{ width: `${row.score}%` }} />
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-ink/70">{row.note}</p>
                </div>
              ))
            : debrief.dimensionLabels.map((label) => (
                <div key={label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-navy-900">{label}</span>
                    <span className="inline-flex items-center gap-1 text-ink/45">
                      <Lock className="h-3.5 w-3.5" aria-hidden />
                      terkunci
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-mist">
                    <div className="h-full w-1/5 rounded-full bg-amber-300" />
                  </div>
                </div>
              ))}
        </div>
      </Panel>

      <Panel className="p-5">
        <h2 className="text-xl font-semibold text-navy-950">Yang diperbaiki sebelum wawancara berikutnya</h2>
        {debrief.paid && debrief.fixes ? (
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-ink/85">
            {debrief.fixes.map((fix) => (
              <li key={fix}>{fix}</li>
            ))}
          </ol>
        ) : (
          <div className="mt-4">
            <p className="text-ink/75">
              Empat catatan latihan masih terkunci. Buka sekali, {formatIdr(debrief.priceIdr)}, tanpa langganan.
            </p>
            <Button className="mt-4" type="button" onClick={() => void unlock()} disabled={paying}>
              {paying ? "Membuka pembayaran..." : `Buka scorecard · ${formatIdr(debrief.priceIdr)}`}
            </Button>
            {payError ? <p className="mt-3 text-sm text-navy-900">{payError}</p> : null}
          </div>
        )}
      </Panel>

      <Panel className="p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-navy-700">Rekap yang kamu tulis</h2>
        <p className="mt-3 whitespace-pre-wrap leading-relaxed text-ink/80">{debrief.asked}</p>
      </Panel>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{label}</p>
      <p className="mt-1 font-medium text-navy-950">{value}</p>
    </div>
  );
}

function ensureSnap(clientKey: string, production: boolean) {
  if (window.snap) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const existing = document.querySelector("script[data-client-key]");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = production ? "https://app.midtrans.com/snap/snap.js" : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.dataset.clientKey = clientKey;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });
}
