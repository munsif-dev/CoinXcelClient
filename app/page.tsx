"use client";
import Footer from "./_components/Footer";
import Header from "./_components/Header";
import Hero from "./_components/Hero";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-green-200">
      {/* Header */}
      <Header />
      {/* Hero Section */}
      <Hero />
      {/* Footer */}
      <Footer />
    </div>
  );
}
