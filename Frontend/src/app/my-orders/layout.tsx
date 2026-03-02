import { Header } from "@/components/Header";
import { Footer } from "@/components/footer/Footer";

export default function MyOrdersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    )
}