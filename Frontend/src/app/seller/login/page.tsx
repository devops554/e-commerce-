import type { Metadata } from "next";
import { buildMetadata } from "@/seo";

export const metadata: Metadata = buildMetadata({
  title: "Seller Login | Kiranase",
  description: "Login to your Kiranase seller account.",
  keywords: "seller, login, kiranase",
  noIndex: true,
});

export { default } from "./_components/SellerLoginClient";
