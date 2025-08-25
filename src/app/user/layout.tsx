import type { Metadata } from "next";
import Navbar from "./Component/navbar";
import Footer from "./Component/footer";
import AuthGuard from "./Component/AuthGuard";

export const metadata: Metadata = {
  title: "TechFix Pro - Professional Electronics Repair",
  description: "Your trusted partner for professional electronic repairs. We fix smartphones, laptops, tablets, gaming consoles, and more with expert technicians and quality service.",
  keywords: "electronics repair, phone repair, laptop repair, tablet repair, gaming console repair, TechFix Pro",
};

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col" suppressHydrationWarning>
      <Navbar />
      <main className="flex-1">
        <AuthGuard>
          {children}
        </AuthGuard>
      </main>
      <Footer />
    </div>
  );
}