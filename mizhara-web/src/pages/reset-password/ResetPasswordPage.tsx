import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ResetPasswordForm from "./components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <ResetPasswordForm />
      </main>
      <Footer />
    </div>
  );
}
