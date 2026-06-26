import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md p-8 bg-white border border-border-custom rounded-3xl shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <Link to="/" className="inline-block font-serif text-lg tracking-widest text-primary-dark font-extrabold hover:opacity-90">
              MIZHARA<span className="text-primary">✦</span>
            </Link>
            <h1 className="font-serif text-2xl font-bold text-primary-dark pt-2">{title}</h1>
            <p className="text-xs text-muted-custom">{subtitle}</p>
          </div>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
