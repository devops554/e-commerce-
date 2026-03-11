// Base utilities
export { buildMetadata, baseMeta, BASE_URL, DEFAULT_OG_IMAGE } from "./base";

// Page-specific metadata (static)
export { homeMetadata } from "./home";
export { categoriesMetadata, categoryPageMetadata } from "./categories";
export { productPageMetadata } from "./product";
export { searchPageMetadata } from "./search";
export {
    cartMetadata,
    checkoutMetadata,
    ordersMetadata,
    loginMetadata,
    signupMetadata,
    profileMetadata,
} from "./account";
export {
    aboutMetadata,
    contactMetadata,
    careersMetadata,
    blogMetadata,
    privacyMetadata,
    termsMetadata,
    refundPolicyMetadata,
    partnerWithUsMetadata,
    sellerOnboardingMetadata,
} from "./static-pages";