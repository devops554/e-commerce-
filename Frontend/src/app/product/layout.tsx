import { Header } from "@/components/Header";
import { Footer } from "@/components/footer/Footer";

export default function ProductLayout({
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