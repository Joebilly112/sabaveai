import type { Business, CampaignCopy, CampaignOption } from "./types";

// Stage 3: business-level template copy only. No LLM or external copy service.
export function templateCopy(business: Business, option: CampaignOption): CampaignCopy {
  return {
    headline: option.kind === "delivery_push" ? "Your favourites, delivered" : "A little comfort for hazy days",
    caption_bm: `Hari berjerebu? Rancang pesanan anda bersama ${business.name}. ${option.offer}. ${business.brandKit.delivery ? "Pesan untuk penghantaran atau singgah apabila sesuai." : "Hubungi kami untuk mengatur pesanan anda."}`,
    caption_en: `Plan ahead for hazy days with ${business.name}. ${option.offer}. ${business.brandKit.delivery ? "Order for delivery or visit when convenient." : "Contact us to arrange your order."}`,
    hashtags: ["#SokongLokal", "#JomSupport", "#BisnesMalaysia"],
    cta: "Hubungi kami · Contact us",
    rationale: option.reason,
    source: "template",
  };
}
