import type { Metadata } from "next";
import { homeMetadata } from "@/seo";

export const metadata: Metadata = homeMetadata;

import { CategoryScroller } from "@/components/category/CategoryScroller"
import { SubCategoryScroller } from "@/components/category/SubCategoryScroller"
import { ProductTypeScroller } from "@/components/product-type/ProductTypeScroller"
import { Header } from "@/components/Header"
import { ProductDiscovery } from "@/components/product/ProductDiscovery"
import { Banners } from "@/components/banner/Banners"
import { Footer } from "@/components/footer/Footer"
import { BANNER_TYPE } from "@/services/banner.service"
import CallToPlaceOrder from "@/components/Calltoplaceorder"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] flex flex-col">
      <Header />

      {/* Hero / Main Sections */}
      <div className="flex-1 container mx-auto px-4 lg:px-8 space-y-6 pt-6">


        {/* Quick Category access */}
        <CategoryScroller />
        <div className="flex justify-center">
          <CallToPlaceOrder />
        </div>
        <Banners type={BANNER_TYPE.HOME} />
        {/* Quick Sub-Category access */}
        <SubCategoryScroller />

        <div className="pt-8">
          <ProductDiscovery />
        </div>
      </div>
      <Footer />
    </main>
  )
}