
import { CategoryScroller } from "@/components/category/CategoryScroller"
import { ProductTypeScroller } from "@/components/product-type/ProductTypeScroller"
import { Header } from "@/components/Header"
import { ProductDiscovery } from "@/components/product/ProductDiscovery"
import { Banners } from "@/components/banner/Banners"
import { Footer } from "@/components/footer/Footer"
import { BANNER_TYPE } from "@/services/banner.service"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] flex flex-col">
      <Header />

      {/* Hero / Main Sections */}
      <div className="flex-1 container mx-auto px-4 lg:px-8 space-y-6 pt-6">


        {/* Quick Category access */}
        <CategoryScroller />
        <Banners type={BANNER_TYPE.HOME} />

        <div className="pt-8">
          <ProductDiscovery />
        </div>
      </div>
      <Footer />
    </main>
  )
}

