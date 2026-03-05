import React, { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setStatus("submitting");

    try {
      const submitContactForm = httpsCallable(functions, 'submitContactForm');
      await submitContactForm(formData);
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setStatus("error");
    }
  };

  return (
    <section className="w-full bg-dust text-foreground py-24 px-6 md:px-12 lg:px-24 border-t border-stone-200">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="space-y-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-primary">Let's talk about your space.</h2>
          <p className="font-sans text-lg text-muted-foreground">
            Whether you have a specific project in mind, or just want to explore what's possible, I'd love to hear from you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-paper p-8 md:p-12 rounded-sm shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-stone-200 space-y-8">
          
          {status === "success" && (
            <div className="bg-green-50 text-green-800 p-4 rounded text-center">
              Thank you. I have received your message and will be in touch shortly.
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-50 text-red-800 p-4 rounded text-center">
              There was an issue sending your message. Please try again.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium tracking-wide">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-stone-300 py-2 focus:border-stone-600 outline-none transition-colors"
                placeholder="Jane Doe"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium tracking-wide">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-stone-300 py-2 focus:border-stone-600 outline-none transition-colors"
                placeholder="jane@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium tracking-wide">Tell me about your project</label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-stone-300 py-2 focus:border-stone-600 outline-none transition-colors resize-y"
              placeholder="What feels off about your current space? What are you seeking?"
            />
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="bg-foreground text-background px-8 py-3 w-full md:w-auto font-medium tracking-wide hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {status === "submitting" ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}
