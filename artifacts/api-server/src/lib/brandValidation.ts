import { CreateBusinessBody } from "@workspace/api-zod";
import type { BrandKit } from "./types";

export function validateImage(value: string | undefined) {
  if (!value) return;
  // SVG uploads are rasterized by the browser before saving. Never serve raw active SVG.
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match) throw new Error("Use the image uploader for PNG, JPEG, SVG or WebP files.");
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > 2 * 1024 * 1024) throw new Error("Each image must be at most 2 MB.");
  const valid = match[1] === "png" ? bytes.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"))
    : match[1] === "jpeg" ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
    : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  if (!valid) throw new Error("The image content does not match its file type.");
}
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertEmail(email: string) {
  if (!EMAIL.test(email.trim())) throw new Error("Enter a valid email address.");
}

export function parseBusiness(value: unknown) {
  const parsed = CreateBusinessBody.parse(value);
  const kit = parsed.brandKit;
  if (kit.menuItems && kit.menuItems.length > 0) {
    for (const item of kit.menuItems) {
      if (!item.name.trim() || !(item.priceRM > 0)) throw new Error("Each menu item needs a name and a price above RM 0.");
      validateImage(item.imageDataUrl);
    }
    kit.products = kit.menuItems.map((item) => ({ name: item.name.trim(), priceRM: item.priceRM }));
  }
  const drafting = parsed.onboardingCompleted === false;
  if (!parsed.name.trim()) throw new Error("Business name cannot be blank.");
  if (!drafting && (!parsed.city.trim() || !kit.ethos.trim() || !kit.targetCustomers.trim()
    || kit.products.length === 0 || kit.products.some((product) => !product.name.trim()))) {
    throw new Error("Business name, city, ethos, customers and product names cannot be blank.");
  }
  validateImage(kit.logoDataUrl);
  validateImage(kit.pastPosterDataUrl);
  if (kit.websiteUrl) {
    const url = new URL(kit.websiteUrl);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("Use a valid public HTTP or HTTPS website URL.");
  }
  if (parsed.teamMembers) {
    for (const member of parsed.teamMembers) assertEmail(member.email);
  }
  // Seed file paths are server-owned. A form cannot point images at arbitrary URLs.
  const { logoPath: _logo, posterPath: _poster, pastPosterPath: _past, ...rest } = kit;
  return { ...parsed, brandKit: rest as BrandKit };
}
