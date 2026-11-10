import "server-only";

import { createHash, timingSafeEqual } from "crypto";
import { site } from "@/lib/config";

interface SnapTransaction {
  token: string;
  redirect_url: string;
}

export function midtransConfigured() {
  return Boolean(process.env.MIDTRANS_SERVER_KEY?.trim());
}

function isProduction() {
  return process.env.MIDTRANS_IS_PRODUCTION === "true";
}

function serverKey() {
  const key = process.env.MIDTRANS_SERVER_KEY?.trim();
  if (!key) throw new Error("midtrans_unconfigured");
  return key;
}

function snapBase() {
  return isProduction() ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";
}

export function statusBase() {
  return isProduction() ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";
}

export async function createSnapTransaction(input: { orderId: string; debriefId: string; finishUrl: string }) {
  const auth = Buffer.from(`${serverKey()}:`).toString("base64");
  const response = await fetch(`${snapBase()}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      authorization: `Basic ${auth}`,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: input.orderId,
        gross_amount: site.priceIdr,
      },
      item_details: [
        {
          id: "debrief-sekali",
          price: site.priceIdr,
          quantity: 1,
          name: "Debrief wawancara sekali buka",
        },
      ],
      custom_field1: input.debriefId,
      callbacks: {
        finish: input.finishUrl,
      },
    }),
  });

  if (!response.ok) {
    return null;
  }
  const payload = (await response.json()) as SnapTransaction;
  if (!payload.token || !payload.redirect_url) return null;
  return { token: payload.token, redirectUrl: payload.redirect_url };
}

export function verifyMidtransSignature(input: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signature: string;
}) {
  const expected = createHash("sha512")
    .update(`${input.orderId}${input.statusCode}${input.grossAmount}${serverKey()}`)
    .digest("hex");
  const left = Buffer.from(expected);
  const right = Buffer.from(input.signature);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function amountIsUnlockPrice(grossAmount: string) {
  return Number(grossAmount) === site.priceIdr;
}

export function isPaidStatus(status: string, fraudStatus?: string) {
  if (status !== "settlement" && status !== "capture") return false;
  if (fraudStatus && fraudStatus !== "accept") return false;
  return true;
}

export async function fetchMidtransStatus(orderId: string) {
  if (!midtransConfigured()) return null;
  const auth = Buffer.from(`${serverKey()}:`).toString("base64");
  const response = await fetch(`${statusBase()}/v2/${encodeURIComponent(orderId)}/status`, {
    headers: { authorization: `Basic ${auth}`, accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as {
    transaction_status?: string;
    fraud_status?: string;
    gross_amount?: string;
    order_id?: string;
    status_code?: string;
  };
  return payload;
}

export function debriefIdFromOrder(orderId: string) {
  const match = /^idb_([a-f0-9]{24})(?:_\d+)?$/.exec(orderId);
  return match?.[1] ?? null;
}
