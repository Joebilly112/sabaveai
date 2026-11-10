import "server-only";

import { randomBytes } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { cert, getApps, initializeApp, applicationDefault, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { firestoreDatabaseId } from "@/lib/config";
import { scoreDebrief } from "@/lib/scoring";
import { rewriteWithDeepseek } from "@/lib/deepseek";
import type { DebriefInput, DebriefRecord, PublicDebrief } from "@/lib/types";

export class StoreUnconfiguredError extends Error {
  constructor() {
    super("store_unconfigured");
    this.name = "StoreUnconfiguredError";
  }
}

const COLLECTION = "debriefs";
const FILE_PATH = path.join(os.tmpdir(), "interviewdebrief-debriefs.json");

let chain: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function hasExplicitCredential() {
  return Boolean(
    (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) ||
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
  );
}

function runningOnGcp() {
  return Boolean(process.env.K_SERVICE || process.env.FIREBASE_CONFIG);
}

function allowFileStore() {
  return process.env.NODE_ENV !== "production" || process.env.ALLOW_FILE_STORE === "true";
}

function projectId() {
  return process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || "skoolnow-ea6ff";
}

function adminApp(): App | null {
  if (!hasExplicitCredential() && !runningOnGcp()) return null;
  if (getApps().length > 0) return getApps()[0] ?? null;

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    const parsed = JSON.parse(json) as { client_email?: string; private_key?: string; project_id?: string };
    if (!parsed.client_email || !parsed.private_key) {
      throw new Error("service_account_incomplete");
    }
    return initializeApp({
      credential: cert({
        projectId: parsed.project_id || projectId(),
        clientEmail: parsed.client_email,
        privateKey: parsed.private_key,
      }),
      projectId: parsed.project_id || projectId(),
    });
  }

  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    return initializeApp({
      credential: cert({
        projectId: projectId(),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/^"|"$/g, "").replace(/\\n/g, "\n"),
      }),
      projectId: projectId(),
    });
  }

  return initializeApp({
    credential: applicationDefault(),
    projectId: projectId(),
  });
}

function database(): Firestore | null {
  const app = adminApp();
  if (!app) return null;
  return getFirestore(app, firestoreDatabaseId);
}

async function readFileStore(): Promise<Record<string, DebriefRecord>> {
  try {
    const raw = await readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as { debriefs?: Record<string, DebriefRecord> };
    return parsed.debriefs ?? {};
  } catch {
    return {};
  }
}

async function writeFileStore(debriefs: Record<string, DebriefRecord>) {
  await mkdir(path.dirname(FILE_PATH), { recursive: true });
  await writeFile(FILE_PATH, JSON.stringify({ debriefs }), "utf8");
}

export function toPublic(record: DebriefRecord): PublicDebrief {
  const base: PublicDebrief = {
    id: record.id,
    paid: record.paid,
    role: record.input.role,
    format: record.input.format,
    durationMinutes: record.input.durationMinutes,
    gut: record.input.gut,
    asked: record.input.asked,
    overall: record.overall,
    band: record.band,
    spiralNote: record.spiralNote,
    dimensionLabels: record.dimensions.map((item) => item.label),
    priceIdr: 19900,
  };
  if (!record.paid) return base;
  return {
    ...base,
    dimensions: record.dimensions,
    fixes: record.fixes,
  };
}

export async function createDebrief(input: DebriefInput): Promise<DebriefRecord> {
  const card = scoreDebrief(input);
  const rewrite = await rewriteWithDeepseek(input, card);
  const record: DebriefRecord = {
    id: randomBytes(12).toString("hex"),
    createdAt: new Date().toISOString(),
    input,
    ...card,
    spiralNote: rewrite?.spiralNote ?? card.spiralNote,
    fixes: rewrite?.fixes ?? card.fixes,
    narrativeSource: rewrite ? "deepseek" : "coach",
    paid: false,
  };

  const db = database();
  if (db) {
    await db.collection(COLLECTION).doc(record.id).set(record);
    return record;
  }
  if (!allowFileStore()) throw new StoreUnconfiguredError();
  await withLock(async () => {
    const all = await readFileStore();
    all[record.id] = record;
    await writeFileStore(all);
  });
  return record;
}

export async function getDebrief(id: string): Promise<DebriefRecord | null> {
  const db = database();
  if (db) {
    const snap = await db.collection(COLLECTION).doc(id).get();
    return snap.exists ? (snap.data() as DebriefRecord) : null;
  }
  if (!allowFileStore()) throw new StoreUnconfiguredError();
  const all = await readFileStore();
  return all[id] ?? null;
}

export async function updateDebrief(id: string, patch: Partial<DebriefRecord>): Promise<DebriefRecord | null> {
  const db = database();
  if (db) {
    const ref = db.collection(COLLECTION).doc(id);
    const snap = await ref.get();
    if (!snap.exists) return null;
    await ref.set(patch, { merge: true });
    const next = await ref.get();
    return next.data() as DebriefRecord;
  }
  if (!allowFileStore()) throw new StoreUnconfiguredError();
  return withLock(async () => {
    const all = await readFileStore();
    const current = all[id];
    if (!current) return null;
    const next = { ...current, ...patch, id: current.id };
    all[id] = next;
    await writeFileStore(all);
    return next;
  });
}

export async function recordAnalytics(event: {
  event: string;
  path: string;
  props: Record<string, string | number | boolean>;
  ts: number;
}) {
  const db = database();
  if (!db) return;
  await db.collection("analytics").add({
    ...event,
    createdAt: new Date().toISOString(),
  });
}
