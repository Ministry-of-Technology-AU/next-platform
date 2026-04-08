"use client";
import { useState } from "react";

export default function AccommodationForm() {
  const [form, setForm] = useState({
    city: "",
    workplace: "",
    housing: "",
    budget: "",
    gender: "",
    phone: "",
    email: "",
    consent: false,
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch('/api/accommodations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    }
  }

  return (
    <>
      <div className="max-w-xl mx-auto mt-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-heading font-bold mb-2" style={{ color: "var(--color-primary)", fontFamily: "var(--font-heading)" }}>
            Find Your Perfect Accommodation Partner
          </h1>
          <p className="text-lg text-gray-600" style={{ fontFamily: "var(--font-body)" }}>
            Connect with fellow interns and program participants to find shared accommodation in your destination city.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-xl shadow-lg flex flex-col gap-6 border font-body text-base"
          style={{ background: "var(--color-card)", color: "var(--color-text)", borderColor: "var(--color-gray-light)" }}
        >
          <h2 className="text-2xl font-heading mb-2 text-center" style={{ color: "var(--color-primary)", fontFamily: "var(--font-heading)" }}>
            Accommodation Connection Form
          </h2>
      <div className="flex flex-col gap-2">
        <label htmlFor="city" className="font-semibold" style={{ color: "var(--color-primary-dark)", fontFamily: "var(--font-heading)" }}>City Destination *</label>
        <input
          id="city"
          name="city"
          type="text"
          required
          value={form.city}
          onChange={handleChange}
          className="rounded-md px-3 py-2 border focus:border-primary focus:ring-2 focus:ring-primary outline-none"
          placeholder="Enter city name"
          style={{ fontFamily: "var(--font-body)", background: "var(--color-white)", color: "var(--color-black)", borderColor: "var(--color-gray-light)" }}
        />
        <span className="text-xs text-gray-500">Where will you be staying for your program/internship?</span>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="workplace" className="font-semibold" style={{ color: "var(--color-primary-dark)", fontFamily: "var(--font-heading)" }}>Workplace Location (optional)</label>
        <input
          id="workplace"
          name="workplace"
          type="text"
          value={form.workplace}
          onChange={handleChange}
          className="rounded-md px-3 py-2 border focus:border-primary focus:ring-2 focus:ring-primary outline-none"
          placeholder="Enter workplace location"
          style={{ fontFamily: "var(--font-body)", background: "var(--color-white)", color: "var(--color-black)", borderColor: "var(--color-gray-light)" }}
        />
        <span className="text-xs text-gray-500">Where will you be working or interning? (Optional)</span>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="housing" className="font-semibold" style={{ color: "var(--color-primary-dark)", fontFamily: "var(--font-heading)" }}>Type of Housing Wanted *</label>
        <select
          id="housing"
          name="housing"
          required
          value={form.housing}
          onChange={handleChange}
          className="rounded-md px-3 py-2 border focus:border-primary focus:ring-2 focus:ring-primary outline-none"
          style={{ fontFamily: "var(--font-body)", background: "var(--color-white)", color: "var(--color-black)", borderColor: "var(--color-gray-light)" }}
        >
          <option value="">Select type</option>
          <option value="apartment">Apartment</option>
          <option value="hostel">Hostel/PG</option>
          <option value="shared">Shared Room</option>
          <option value="other">Other</option>
        </select>
        <span className="text-xs text-gray-500">Choose the type of accommodation you prefer.</span>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="budget" className="font-semibold" style={{ color: "var(--color-primary-dark)", fontFamily: "var(--font-heading)" }}>Budget (per month in ₹ or $)</label>
        <input
          id="budget"
          name="budget"
          type="number"
          min="0"
          value={form.budget}
          onChange={handleChange}
          className="rounded-md px-3 py-2 border focus:border-primary focus:ring-2 focus:ring-primary outline-none"
          placeholder="Enter budget"
          style={{ fontFamily: "var(--font-body)", background: "var(--color-white)", color: "var(--color-black)", borderColor: "var(--color-gray-light)" }}
        />
        <span className="text-xs text-gray-500">How much can you spend per month?</span>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="gender" className="font-semibold" style={{ color: "var(--color-primary-dark)", fontFamily: "var(--font-heading)" }}>Gender Preference</label>
        <select
          id="gender"
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="rounded-md px-3 py-2 border focus:border-primary focus:ring-2 focus:ring-primary outline-none"
          style={{ fontFamily: "var(--font-body)", background: "var(--color-white)", color: "var(--color-black)", borderColor: "var(--color-gray-light)" }}
        >
          <option value="">No preference</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
        </select>
        <span className="text-xs text-gray-500">Select if you have a gender preference for roommates.</span>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className="font-semibold" style={{ color: "var(--color-primary-dark)", fontFamily: "var(--font-heading)" }}>WhatsApp Phone Number *</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          value={form.phone}
          onChange={handleChange}
          className="rounded-md px-3 py-2 border focus:border-primary focus:ring-2 focus:ring-primary outline-none"
          placeholder="Enter your WhatsApp number"
          style={{ fontFamily: "var(--font-body)", background: "var(--color-white)", color: "var(--color-black)", borderColor: "var(--color-gray-light)" }}
        />
        <span className="text-xs text-gray-500">Please provide a WhatsApp-enabled phone number for communication</span>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="font-semibold" style={{ color: "var(--color-primary-dark)", fontFamily: "var(--font-heading)" }}>Email Address (optional)</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="rounded-md px-3 py-2 border focus:border-primary focus:ring-2 focus:ring-primary outline-none"
          placeholder="Enter your email address"
          style={{ fontFamily: "var(--font-body)", background: "var(--color-white)", color: "var(--color-black)", borderColor: "var(--color-gray-light)" }}
        />
        <span className="text-xs text-gray-500">Alternative way to contact you (Optional)</span>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          checked={form.consent}
          onChange={handleChange}
          required
          className="accent-primary"
        />
        <label htmlFor="consent" className="text-sm" style={{ color: "var(--color-primary-dark)", fontFamily: "var(--font-heading)" }}>
          I consent to my information being shared with others seeking accommodation connections.
        </label>
      </div>
      <button
        type="submit"
        className="button-animated font-bold py-2 px-6 rounded-lg mt-4 transition"
        style={{
          fontFamily: "var(--font-heading)",
          color: "white",
          border: "none",
          background: "var(--color-primary-dark)"
        }}
      >
        Submit
      </button>
      {submitted && (
        <div className="text-green-600 font-semibold mt-2">Thank you! Your information has been submitted.</div>
      )}
        </form>
      </div>
    </>
  );
}
