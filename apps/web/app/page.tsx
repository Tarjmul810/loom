"use client"

import { useEffect, useRef, useState } from "react";
import { Video, Link2, Wand2, Share2, ArrowUpRight, Check, Mic, Circle, Play, Command, } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import Link from "next/link";
import { SiGithub, SiX } from "@icons-pack/react-simple-icons";


export default function Landing() {
  // Smooth scroll for in-page anchor links
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "smooth";
    return () => { html.style.scrollBehavior = prev; };
  }, []);

  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 sm:px-8 pt-4 pb-12">
      <Nav />
      <div className="w-full max-w-3xl">
        <Hero />
        <Reveal><ProductMock /></Reveal>
        <Reveal><SocialProof /></Reveal>
        <Reveal><Features /></Reveal>
        <Reveal><HowItWorks /></Reveal>
        <Reveal><FAQ /></Reveal>
        <Reveal><CTA /></Reveal>
        <Footer />
      </div>
    </main>
  );
}

/* Fades + slides in once when section enters viewport */
function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {children}
    </div>
  );
}

function Nav() {
  return (
    <header className="w-full max-w-3xl mt-2 mb-10">
      <div className="flex items-center justify-between border-b border-border pb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-primary grid place-items-center">
            <Video className="size-3.5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl leading-none">Loomy</span>
        </div>
        <nav className="hidden sm:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how" className="hover:text-foreground transition-colors">How</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          <a href="#cta" className="hover:text-foreground transition-colors">Pricing</a>
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
        </nav>
        <Link href="/dashboard" className="text-sm rounded-full bg-primary text-primary-foreground px-4 py-1.5 font-medium hover:opacity-90 transition-opacity">
          Start free
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative pt-10 pb-12 text-center">
      {/* subtle radial glow behind headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-10 h-72 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in oklab, var(--foreground) 8%, transparent) 0%, transparent 60%)",
        }}
      />
      <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
        <span className="size-1.5 rounded-full bg-foreground animate-pulse" />
        AI summaries on every recording
      </div>
      <h1 className="mt-7 text-6xl sm:text-7xl leading-[0.95] tracking-tight">
        Record once.<br />
        <span className="italic text-muted-foreground">Share everywhere.</span>
      </h1>
      <p className="mt-7 text-muted-foreground max-w-md mx-auto text-base leading-relaxed">
        One click to capture your screen. Loomy transcribes, summarizes, and turns it into a shareable link your team will actually watch.
      </p>
      <div className="mt-9 flex flex-wrap gap-3 justify-center items-center">
        <a href="#cta" className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity">
          Get started <ArrowUpRight className="size-4" />
        </a>
        <a href="#how" className="rounded-full border border-border px-5 py-2.5 text-sm hover:border-foreground/40 transition-colors">
          How it works
        </a>
      </div>
      <div className="mt-5 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
        or hit
        <kbd className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 font-mono">
          <Command className="size-3" />⇧R
        </kbd>
        to start
      </div>
    </section>
  );
}

function SocialProof() {
  const logos = ["Northwind", "Acme Co", "Lumen", "Vertex", "Hexa"];
  return (
    <div className="pb-14">
      <p className="text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-5">
        Trusted by teams at
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
        {logos.map((name) => (
          <span key={name} className="font-display text-lg sm:text-xl text-muted-foreground hover:text-foreground transition-colors">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

/* Stylized "product window" — a recorder UI mockup, no real video */
function ProductMock() {
  return (
    <div className="pb-16">
      <div className="relative rounded-2xl border border-border overflow-hidden">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-foreground/40 to-transparent" />
        {/* window chrome */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-foreground/20" />
            <span className="size-2.5 rounded-full bg-foreground/20" />
            <span className="size-2.5 rounded-full bg-foreground/20" />
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">loomy.app/r/q4-review</span>
          <span className="text-[11px] text-muted-foreground">02:14</span>
        </div>
        {/* "preview" area */}
        <div className="relative h-56 sm:h-64 bg-gradient-to-br from-frame to-background flex items-center justify-center">
          <div className="size-14 rounded-full border border-border grid place-items-center backdrop-blur">
            <Play className="size-5 text-foreground ml-0.5" />
          </div>
          {/* faint grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        {/* controls */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="relative inline-flex">
                <span className="absolute inset-0 rounded-full bg-foreground/40 animate-ping" />
                <Circle className="size-2.5 fill-foreground text-foreground relative" />
              </span>
              REC
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mic className="size-3" /> On
            </span>
          </div>
          <div className="flex-1 mx-4 h-1 rounded-full bg-border overflow-hidden">
            <div className="h-full w-2/5 bg-foreground/70" />
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">AI · summarizing</span>
        </div>
      </div>
    </div>
  );
}

function PopCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`group relative rounded-2xl border border-border p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/30 ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
      {children}
    </div>
  );
}

function Features() {
  const items = [
    { icon: Video, title: "One-click capture", body: "Screen, tab, or window — no downloads required." },
    { icon: Wand2, title: "AI summaries", body: "Transcripts, chapters, and TL;DRs generated automatically." },
    { icon: Share2, title: "Instant links", body: "Share a URL the moment you stop recording." },
  ];
  return (
    <section id="features" className="py-12">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-3xl">Built for speed</h2>
        <span className="text-xs text-muted-foreground">03 — Features</span>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {items.map(({ icon: Icon, title, body }) => (
          <PopCard key={title}>
            <Icon className="size-4 text-foreground" />
            <h3 className="mt-5 text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{body}</p>
          </PopCard>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Hit record", d: "Pick a screen and start in a single click." },
    { n: "02", t: "Let AI work", d: "We transcribe and summarize automatically." },
    { n: "03", t: "Send the link", d: "Drop it in Slack, email, anywhere." },
  ];
  return (
    <section id="how" className="py-12">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-3xl">How it works</h2>
        <span className="text-xs text-muted-foreground">02 — Flow</span>
      </div>
      <ol className="divide-y divide-border border-y border-border">
        {steps.map((s) => (
          <li key={s.n} className="flex gap-6 items-start py-5 group hover:pl-2 transition-all">
            <div className="font-display text-2xl text-muted-foreground w-10 shrink-0 group-hover:text-foreground transition-colors">{s.n}</div>
            <div className="flex-1">
              <div className="font-medium">{s.t}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.d}</div>
            </div>
            <ArrowUpRight className="size-4 text-muted-foreground mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </li>
        ))}
      </ol>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "Do I need to install anything?", a: "No. Loomy runs entirely in your browser — start recording in one click." },
    { q: "Who can watch my recordings?", a: "Only people with the link. You can make a video private or password-protect it anytime." },
    { q: "What does the AI actually do?", a: "It transcribes audio, generates chapters, and writes a TL;DR summary so viewers can skim before watching." },
    { q: "Is there a free plan?", a: "Yes. Unlimited recordings up to 5 minutes, forever. Upgrade only when you need longer videos or a team workspace." },
  ];
  return (
    <section id="faq" className="py-12">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-3xl">Questions</h2>
        <span className="text-xs text-muted-foreground">04 — FAQ</span>
      </div>
      <Accordion type="single" collapsible className="border-y border-border">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-b border-border last:border-b-0">
            <AccordionTrigger className="text-base hover:no-underline py-5">{f.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function CTA() {
  const perks = ["Unlimited recordings", "AI transcripts", "Shareable links"];
  return (
    <section id="cta" className="py-16">
      <PopCard className="text-center py-14 px-6">
        <h2 className="text-4xl sm:text-5xl">Start sharing<br />in seconds.</h2>
        <p className="mt-4 text-muted-foreground text-sm max-w-sm mx-auto">
          Free forever for individuals. No credit card required.
        </p>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 justify-center text-xs text-muted-foreground">
          {perks.map((p) => (
            <li key={p} className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-foreground" /> {p}
            </li>
          ))}
        </ul>
        <a href="#" className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity">
          Get Loomy free <ArrowUpRight className="size-4" />
        </a>
      </PopCard>
    </section>
  );
}

function Footer() {
  const groups = [
    { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
    { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
    { title: "Legal", links: ["Privacy", "Terms", "Security", "DPA"] },
  ];
  return (
    <footer className="pt-14 mt-4 border-t border-border">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pb-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-primary grid place-items-center">
              <Video className="size-3 text-primary-foreground" />
            </div>
            <span className="font-display text-lg leading-none">Loomy</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            Record, summarize, share. Built with AI.
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <div className="text-xs font-medium text-foreground mb-3">{g.title}</div>
            <ul className="space-y-2">
              {g.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-5 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Link2 className="size-3" />
          <span>loomy.app</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" aria-label="Twitter" className="hover:text-foreground transition-colors">
            < SiX className="size-3.5" />
            </a>
          <a href="#" aria-label="GitHub" className="hover:text-foreground transition-colors">
 <SiGithub className="size-3.5" />
            </a>
          <span>© {new Date().getFullYear()} Loomy</span>
        </div>
      </div>
    </footer>
  );
}
