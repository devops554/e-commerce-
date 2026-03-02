import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";
import { Footer } from "@/components/footer/Footer";

export const metadata: Metadata = {
  title: "BivhaShop | Delivery in 10 Minutes",
  description: "Experience the fastest e-commerce delivery with BivhaShop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* /* inter bold poppins sans-serif */}
        {/* <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        /> */}

        {/* plus jakarta sans */}
        {/* <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        /> */}

        {/* Zepto Norms  */}
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AppProviders>
          {children}

        </AppProviders>
      </body>
    </html>
  );
}
