import type { Metadata } from "next";
import { buildMetadata } from "./base";

export const aboutMetadata: Metadata = buildMetadata({
    title: "About Us | Kiranase - Bazaar se Sasta Har Din",
    description:
        "Learn about Kiranase's mission to deliver fresh groceries cheaper than your local bazaar across 10,000+ pincodes in India. Our story, values, and commitment to freshness.",
    keywords: "about Kiranase, grocery startup India, fast grocery delivery, kirana disruption",
    path: "/about",
});

export const contactMetadata: Metadata = buildMetadata({
    title: "Contact Us | Kiranase",
    description:
        "Get in touch with Kiranase for support, feedback, or business enquiries. We're here to help 7 days a week.",
    keywords: "contact Kiranase, grocery customer support, helpline, feedback",
    path: "/contact",
});

export const careersMetadata: Metadata = buildMetadata({
    title: "Careers at Kiranase | Join Our Team",
    description:
        "Build India's fastest grocery delivery platform with us. Explore open roles in tech, operations, marketing, and more at Kiranase.",
    keywords: "Kiranase careers, jobs, grocery startup jobs India, delivery jobs, tech jobs",
    path: "/careers",
});

export const blogMetadata: Metadata = buildMetadata({
    title: "Blog | Kiranase - Tips, Recipes & More",
    description:
        "Explore recipes, grocery tips, seasonal produce guides, and saving hacks on the Kiranase blog.",
    keywords: "grocery blog, recipes, cooking tips, seasonal vegetables, saving money on groceries",
    path: "/blog",
});

export const privacyMetadata: Metadata = buildMetadata({
    title: "Privacy Policy | Kiranase",
    description: "Read Kiranase's privacy policy to understand how we collect, use, and protect your personal data.",
    keywords: "privacy policy, data protection, Kiranase privacy",
    path: "/privacy",
    noIndex: true,
});

export const termsMetadata: Metadata = buildMetadata({
    title: "Terms & Conditions | Kiranase",
    description: "Review the terms and conditions governing your use of the Kiranase platform and services.",
    keywords: "terms and conditions, terms of service, Kiranase terms",
    path: "/terms",
    noIndex: true,
});

export const refundPolicyMetadata: Metadata = buildMetadata({
    title: "Refund & Return Policy | Kiranase",
    description:
        "Kiranase's hassle-free refund and return policy. Learn how to raise a return request and get your money back.",
    keywords: "refund policy, return policy, Kiranase refund",
    path: "/refund-policy",
    noIndex: true,
});

export const partnerWithUsMetadata: Metadata = buildMetadata({
    title: "Partner With Us | Sell on Kiranase",
    description:
        "Become a seller on Kiranase and reach millions of customers across India. Easy onboarding, fast payments, and dedicated support.",
    keywords:
    "sell on Kiranase, become a seller, partner with Kiranase, seller registration India",
    path: "/partner-with-us",
});

export const sellerOnboardingMetadata: Metadata = buildMetadata({
    title: "Seller Onboarding | Kiranase",
    description:
        "Complete your seller profile and start selling on Kiranase today.",
    keywords: "seller onboarding, Kiranase seller setup, seller account",
    path: "/seller/onboarding",
    noIndex: true,
});