import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { Lora, Nunito } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-heading",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Recipe Companion",
  description:
    "Upload a recipe, chat with a cooking agent, and follow steps hands-free.",
};

const RootLayout = ({ children }: PropsWithChildren) => (
  <html
    lang="en"
    className={`h-full ${lora.variable} ${nunito.variable} text-lg antialiased`}
  >
    <body className="flex h-full flex-col bg-accent-50">
      {children}
    </body>
  </html>
);

export default RootLayout;
