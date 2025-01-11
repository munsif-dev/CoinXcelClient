// Ensure this is at the top of the file
import type { Metadata } from "next";
import "./globals.css";
import RootClientLayout from "./layout.client";

export const metadata: Metadata = {
  title: "AutoGradePro",
  description: "An Automated Paper Grading System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RootClientLayout>{children}</RootClientLayout>
      </body>
    </html>
  );
}
