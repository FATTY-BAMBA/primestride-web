"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export type FormLabels = {
  name: string;
  email: string;
  company: string;
  interest: string;
  message: string;
  submit: string;
  sending: string;
  successTitle: string;
  successBody: string;
  errorMsg: string;
};

export type InterestOption = { value: string; label: string };

// Maps a product-page slug (?p=atlas-eip) to the matching dropdown value.
const SLUG_TO_INTEREST: Record<string, string> = {
  "atlas-eip": "Atlas EIP",
  "lyra-ai": "LyraAI",
  "edusense-ai": "EduSense AI",
  "ai-customer-assistant": "AI Customer Assistant",
  pulse: "Pulse",
  "ai-knowledge-assistant": "AI Knowledge Assistant",
  "ai-zhanggui": "AI 營運大腦",
};

export default function ContactForm({
  endpoint,
  labels,
  interestOptions,
}: {
  endpoint: string;
  labels: FormLabels;
  interestOptions: InterestOption[];
}) {
  const params = useSearchParams();
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    interest: "",
    message: "",
    _gotcha: "",
  });

  // Pre-select the product the visitor came from (set after mount to avoid a
  // hydration mismatch).
  useEffect(() => {
    const p = params.get("p");
    if (p && SLUG_TO_INTEREST[p]) {
      setForm((f) => ({ ...f, interest: SLUG_TO_INTEREST[p] }));
    }
  }, [params]);

  const update =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form._gotcha) {
      setStatus("ok");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("ok");
        setForm({ name: "", email: "", company: "", interest: "", message: "", _gotcha: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="form-success">
        <h3>{labels.successTitle}</h3>
        <p>{labels.successBody}</p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <label>
        {labels.name}
        <input required value={form.name} onChange={update("name")} />
      </label>
      <label>
        {labels.email}
        <input required type="email" value={form.email} onChange={update("email")} />
      </label>
      <label>
        {labels.company}
        <input value={form.company} onChange={update("company")} />
      </label>
      <label>
        {labels.interest}
        <select value={form.interest} onChange={update("interest")}>
          {interestOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        {labels.message}
        <textarea required rows={4} value={form.message} onChange={update("message")} />
      </label>

      {/* Honeypot — hidden from humans, catches bots. Do not remove. */}
      <input
        type="text"
        name="_gotcha"
        className="hp-field"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={form._gotcha}
        onChange={update("_gotcha")}
      />

      {status === "error" && <p className="form-error">{labels.errorMsg}</p>}
      <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
        {status === "sending" ? labels.sending : labels.submit} <span className="chev">›</span>
      </button>
    </form>
  );
}
