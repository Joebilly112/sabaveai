"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button, Field, SelectInput, TextArea, TextInput } from "@/components/ui";
import { track } from "@/components/track";
import { formatIdr, site } from "@/lib/config";

export function DebriefForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      role: String(form.get("role") ?? ""),
      format: String(form.get("format") ?? ""),
      asked: String(form.get("asked") ?? ""),
      durationMinutes: Number(form.get("durationMinutes") ?? ""),
      gut: String(form.get("gut") ?? ""),
    };
    setPending(true);
    track("debrief_started", { format: payload.format });
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !data.id) {
        setError(
          response.status === 503
            ? "Penyimpanan debrief belum terhubung. Artikel tetap bisa dibaca."
            : data.error || "Debrief belum terbuat. Coba sekali lagi.",
        );
        setPending(false);
        return;
      }
      track("debrief_created", { format: payload.format });
      router.push(`/hasil/${data.id}`);
    } catch {
      setError("Jaringan lagi tidak tenang. Coba sekali lagi.");
      setPending(false);
    }
  }

  return (
    <form id="debrief" onSubmit={onSubmit} className="scroll-mt-6 space-y-5" autoComplete="off">
      <Field label="Peran yang dilamar" hint="Cukup nama peran dan bidangnya. Tidak perlu nama perusahaan.">
        <TextInput name="role" required minLength={2} maxLength={80} placeholder="Contoh: staf operasional, fresh grad" />
      </Field>
      <Field label="Format wawancara">
        <SelectInput name="format" required defaultValue="hr">
          <option value="hr">HR</option>
          <option value="user">User</option>
          <option value="case">Case</option>
        </SelectInput>
      </Field>
      <Field
        label="Apa yang ditanyakan, dan bagaimana kamu menjawab"
        hint="Tidak perlu transkrip. Tulis yang masih nyangkut: pertanyaan mereka, jawabanmu, dan bagian yang terasa berantakan."
      >
        <TextArea
          name="asked"
          required
          minLength={40}
          maxLength={4000}
          placeholder="HR nanya kenapa saya melamar ke operasional. Saya jawab karena suka perbaikan proses, tapi ceritanya loncat. Lalu saya cerita magang tanpa hasilnya. Saya tidak sempat tanya balik."
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Berapa lama berjalan" hint="Dalam menit, perkiraan saja.">
          <TextInput name="durationMinutes" type="number" required min={5} max={240} inputMode="numeric" placeholder="38" />
        </Field>
        <Field label="Perasaan di perut sekarang">
          <SelectInput name="gut" required defaultValue="jelek">
            <option value="jelek">Rasanya jeblok</option>
            <option value="campur">Campur aduk</option>
            <option value="tenang">Cukup tenang</option>
          </SelectInput>
        </Field>
      </div>
      {error ? <p className="text-sm font-medium text-navy-900">{error}</p> : null}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyusun debrief..." : "Buat debrief"}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
        <p className="text-sm text-ink/65">
          Scorecard lengkap {formatIdr(site.priceIdr)}. Perasaan tidak masuk ke angka.
        </p>
      </div>
    </form>
  );
}
