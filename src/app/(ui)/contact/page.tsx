"use client";

import React, { useState } from "react";
import Navbar from "@/ui/components/Navbar";
import Footer from "@/ui/components/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "Inquiry",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "Inquiry", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-16">
        {/* Header Title */}
        <div className="text-center space-y-3 mb-12">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-accent-pink/10 px-3.5 py-1.5 rounded-full border border-border-custom shadow-3xs">
            Connect ✦
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-primary-dark">
            Customer Care & Contact
          </h1>
          <p className="text-xs text-muted-custom max-w-md mx-auto leading-relaxed">
            Need sizing advice or have questions about shipping? Our team of sparkle specialists is here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Details Column */}
          <div className="space-y-6 md:col-span-1">
            <h2 className="font-serif text-lg font-bold text-primary-dark">Get in Touch</h2>
            <p className="text-xs text-muted-custom leading-relaxed">
              We try to reply to all queries within 24 hours (Monday to Saturday). Feel free to send us an email or drop a line.
            </p>

            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-3.5">
                <span className="text-lg">✉</span>
                <div>
                  <h4 className="font-semibold text-foreground">Email Support</h4>
                  <p className="text-muted-custom text-[11px]">support@mizhara.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <span className="text-lg">📞</span>
                <div>
                  <h4 className="font-semibold text-foreground">Phone Care</h4>
                  <p className="text-muted-custom text-[11px]">+1 (800) 555-GLOW</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <span className="text-lg">📍</span>
                <div>
                  <h4 className="font-semibold text-foreground">Sparkle Studio</h4>
                  <p className="text-muted-custom text-[11px]">45 Ornament Avenue, Suite 20</p>
                  <p className="text-muted-custom text-[11px]">New York, NY 10018</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-accent-mint/20 border border-border-custom rounded-2xl">
              <h4 className="font-serif text-xs font-bold text-primary-dark">Studio Hours</h4>
              <p className="text-[10px] text-muted-custom mt-1 leading-relaxed">
                Mon - Sat: 9:00 AM - 6:00 PM EST <br />
                Sunday: Closed (dreaming up new ornaments)
              </p>
            </div>

            <div id="about" className="p-4 bg-accent-pink/10 border border-border-custom rounded-2xl">
              <h4 className="font-serif text-xs font-bold text-primary-dark">About Mizhara</h4>
              <p className="text-[10px] text-muted-custom mt-2 leading-relaxed">
                Mizhara creates lightweight, hypoallergenic ornaments for everyday sparkle — not just weddings and galas.
                From layering chains to delicate nose pins, each piece is designed to walk with you through coffee runs,
                dinner dates, and everything in between.
              </p>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="p-6 bg-white border border-border-custom rounded-2xl space-y-4 shadow-xs">
              <h3 className="font-serif text-base font-bold text-primary-dark">Send a Message</h3>

              {submitted && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl animate-bounce">
                  ✓ Message sent! Thank you for connecting. We will respond shortly.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Alisha Smith"
                    className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs bg-background/30 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="alisha@domain.com"
                    className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs bg-background/30 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Subject</label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs bg-background/30 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white font-medium"
                >
                  <option value="Inquiry">General Inquiry</option>
                  <option value="Sizing">Sizing Help</option>
                  <option value="Shipping">Shipping Status</option>
                  <option value="Custom">Custom Ornaments request</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-primary-dark uppercase mb-1">Your Message</label>
                <textarea
                  required
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="How can we help you sparkle?"
                  className="w-full px-4 py-2.5 border border-border-custom rounded-xl text-xs bg-background/30 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shine-sweep text-center"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
