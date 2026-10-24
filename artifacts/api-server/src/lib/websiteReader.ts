import { lookup } from "node:dns/promises";
import { isIP, BlockList } from "node:net";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

const blocked = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24],
  ["224.0.0.0", 4], ["240.0.0.0", 4],
] as const) blocked.addSubnet(address, prefix, "ipv4");
for (const [address, prefix] of [["2001::", 23], ["2001:db8::", 32], ["2002::", 16], ["3fff::", 20]] as const) {
  blocked.addSubnet(address, prefix, "ipv6");
}
export function isPublicIP(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return !blocked.check(address, "ipv4");
  // Only native global unicast IPv6; exclude mapped/transition/documentation ranges.
  if (family === 6) return /^[23]/i.test(address) && !blocked.check(address, "ipv6");
  return false;
}
export function parsePublicURL(input: string) {
  const url = new URL(input);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password ||
      (url.port && url.port !== "80" && url.port !== "443")) throw new Error("Use a public HTTP or HTTPS URL.");
  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost") || !hostname.includes(".") && !isIP(hostname) ||
      (isIP(hostname) && !isPublicIP(hostname))) throw new Error("Private and local websites cannot be read.");
  return url;
}

export async function readWebsite(input: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    let url = parsePublicURL(input);
    for (let hop = 0; hop <= 3; hop++) {
      const hostname = url.hostname.replace(/^\[|\]$/g, "");
      const answers = isIP(hostname) ? [{ address: hostname, family: isIP(hostname) }] :
        await Promise.race([
          lookup(hostname, { all: true }),
          new Promise<never>((_resolve, reject) => {
            if (controller.signal.aborted) reject(new Error("Website timed out."));
            else controller.signal.addEventListener("abort", () => reject(new Error("Website timed out.")), { once: true });
          }),
        ]);
      if (!answers.length || answers.some(answer => !isPublicIP(answer.address))) throw new Error("Private network destinations are blocked.");
      const selected = answers[0];
      const result = await new Promise<{ html?: string; location?: string }>((resolve, reject) => {
        const req = (url.protocol === "https:" ? httpsRequest : httpRequest)(url, {
          signal: controller.signal,
          headers: { "User-Agent": "Mozilla/5.0 (compatible; SabaveBrandReader/1.0)", Accept: "text/html,application/xhtml+xml", "Accept-Encoding": "identity" },
          // Pin the validated DNS answer. No second resolution/DNS rebinding.
          lookup: ((_host: string, options: any, cb: any) => options.all
            ? cb(null, [selected]) : cb(null, selected.address, selected.family)) as any,
        }, response => {
          const status = response.statusCode ?? 500;
          if ([301, 302, 303, 307, 308].includes(status) && response.headers.location) {
            response.destroy(); resolve({ location: response.headers.location }); return;
          }
          if (status < 200 || status >= 300 || !/text\/html|application\/xhtml\+xml/i.test(response.headers["content-type"] ?? "")) {
            response.destroy(); reject(new Error("Website did not return readable HTML.")); return;
          }
          let size = 0;
          const chunks: Buffer[] = [];
          response.on("data", (chunk: Buffer) => {
            size += chunk.length;
            if (size > 1024 * 1024) { response.destroy(new Error("Website exceeds 1 MB.")); return; }
            chunks.push(chunk);
          });
          response.on("error", reject);
          response.on("end", () => resolve({ html: Buffer.concat(chunks).toString("utf8") }));
        });
        req.on("error", reject);
        req.end();
      });
      if (result.html !== undefined) return extractWebsiteText(result.html);
      url = parsePublicURL(new URL(result.location!, url).href);
    }
    throw new Error("Too many website redirects.");
  } finally { clearTimeout(timer); }
}

function decode(text: string) {
  return text.replace(/&(?:amp|lt|gt|quot|apos|nbsp);/gi, entity => ({
    "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'", "&nbsp;": " ",
  })[entity.toLowerCase()] ?? " ").replace(/&#(x[0-9a-f]+|\d+);/gi, (_m, n: string) => {
    const code = n[0].toLowerCase() === "x" ? parseInt(n.slice(1), 16) : Number(n);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : " ";
  });
}
export function extractWebsiteText(html: string) {
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const meta = [...html.matchAll(/<meta\b[^>]*>/gi)].find(([tag]) => /\bname\s*=\s*["']description["']/i.test(tag))?.[0];
  const description = meta?.match(/\bcontent\s*=\s*(["'])([\s\S]*?)\1/i)?.[2] ?? "";
  const visible = html.replace(/<!--[\s\S]*?-->/g, " ").replace(/<(script|style|noscript|template|svg|head)\b[^>]*>[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]*>/g, " ");
  return `Title: ${decode(title).slice(0, 300)}\nDescription: ${decode(description).slice(0, 700)}\nText: ${decode(visible).replace(/\s+/g, " ").trim().slice(0, 4000)}`;
}
