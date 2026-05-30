import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recipe Companion",
  description:
    "Upload a recipe, chat with a cooking agent, and follow steps hands-free.",
};

const RootLayout = ({ children }: PropsWithChildren) => (
  <html lang="en" className="h-full">
    <body className="flex h-full flex-col">{children}</body>
  </html>
);

export default RootLayout;
