import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Arabella Events Place | Laoag City, Ilocos Norte",
  description:
    "Premier events venue and catering in Laoag City, Ilocos Norte. Specializing in Ilocano cuisine for weddings, parties, and family celebrations.",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en" className={playfair.variable}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
