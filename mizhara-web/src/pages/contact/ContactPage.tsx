import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FieldError from "@/components/FieldError";
import FieldLabel from "@/components/FieldLabel";
import { useFieldErrors } from "@/hooks/use-field-errors";
import { api, apiErrorMessage } from "@/lib/api";
import { fieldInputClass } from "@/lib/form-styles";
import { isValidEmail } from "@/lib/form-validation";
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "919876543210";
const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL || "https://www.instagram.com/mizhara";
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "support@mizhara.in";

function instagramDmUrl(profileUrl: string) {
  const match = profileUrl.match(/instagram\.com\/([^/?#]+)/);
  const handle = match?.[1] ?? "mizhara";
  return `https://ig.me/m/${handle}`;
}

function whatsappChatUrl(text?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

type ContactField = "name" | "email" | "message" | "submit";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "Inquiry",
    message: "",
  });
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { fieldErrors, setFieldErrors, clearFieldError } = useFieldErrors<ContactField>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "name" || name === "email" || name === "message") {
      clearFieldError(name as ContactField);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");

    const errors: Partial<Record<ContactField, string>> = {};
    if (!form.name.trim()) errors.name = "Your name is required.";
    if (!form.email.trim() || !isValidEmail(form.email)) errors.email = "Enter a valid email address.";
    if (!form.message.trim()) errors.message = "Please enter a message.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      const { data } = await api.post<{ message: string }>("/api/contact", form);
      setSuccess(data.message);
      setForm({ name: "", email: "", subject: "Inquiry", message: "" });
    } catch (err: unknown) {
      setFieldErrors({ submit: apiErrorMessage(err, "Could not send your message. Try WhatsApp or Instagram instead.") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow max-w-xl w-full mx-auto px-4 py-16">
        <div className="text-center space-y-3 mb-10">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-accent-pink/10 px-3.5 py-1.5 rounded-full border border-border-custom">
            Contact Us
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-primary-dark">
            We&apos;d love to hear from you
          </h1>
          <p className="text-xs text-muted-custom leading-relaxed">
            Email our support team below, or chat with us on WhatsApp or Instagram.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <a
            href={whatsappChatUrl("Hi Mizhara, I have a question about my order.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#25D366] hover:bg-[#1ebe57] text-white text-xs font-bold uppercase tracking-wide rounded-xl transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat on WhatsApp
          </a>

          <a
            href={instagramDmUrl(INSTAGRAM_URL)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 py-3.5 px-4 bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#dc2743] hover:opacity-90 text-white text-xs font-bold uppercase tracking-wide rounded-xl transition-opacity shadow-sm"
          >
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            Message on Instagram
          </a>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 bg-white border border-border-custom rounded-2xl space-y-4 shadow-xs">
          <div className="text-center space-y-1">
            <h2 className="font-serif text-base font-bold text-primary-dark">Email support</h2>
            <p className="text-[10px] text-muted-custom">Messages are sent to {SUPPORT_EMAIL}</p>
          </div>

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl text-center">
              {success}
            </div>
          )}

          {fieldErrors.submit && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl text-center">
              {fieldErrors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Your Name</FieldLabel>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className={`${fieldInputClass(!!fieldErrors.name)} bg-background/30 focus:bg-white`}
              />
              <FieldError message={fieldErrors.name} />
            </div>
            <div>
              <FieldLabel required className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Your Email</FieldLabel>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@email.com"
                className={`${fieldInputClass(!!fieldErrors.email)} bg-background/30 focus:bg-white`}
              />
              <FieldError message={fieldErrors.email} />
            </div>
          </div>

          <div>
            <FieldLabel className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Subject</FieldLabel>
            <select
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs bg-background/30 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white font-medium"
            >
              <option value="Inquiry">General Inquiry</option>
              <option value="Sizing">Sizing Help</option>
              <option value="Shipping">Shipping Status</option>
              <option value="Custom">Custom Order</option>
            </select>
          </div>

          <div>
            <FieldLabel required className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Message</FieldLabel>
            <textarea
              name="message"
              rows={4}
              value={form.message}
              onChange={handleChange}
              placeholder="How can we help?"
              className={`${fieldInputClass(!!fieldErrors.message)} bg-background/30 focus:bg-white`}
            />
            <FieldError message={fieldErrors.message} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shine-sweep disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Email"}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
