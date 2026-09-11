import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SectionHeading({ eyebrow, title, copy, align = "center" }: { eyebrow: string; title: string; copy?: string; align?: "center" | "left" }) {
  return <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}><p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-leaf">{eyebrow}</p><h2 className="mt-3 text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-5xl">{title}</h2>{copy && <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">{copy}</p>}</div>;
}

export function PageHero({ eyebrow, title, copy, image, children }: { eyebrow: string; title: string; copy: string; image?: string; children?: ReactNode }) {
  return <section className="relative overflow-hidden bg-forest px-6 py-20 text-primary-foreground lg:py-28"><div className="organic-grid absolute inset-0 opacity-15" />{image && <img src={image} alt="" loading="eager" width={1400} height={800} className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-luminosity" />}<div className="relative mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-gold">{eyebrow}</p><h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">{title}</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-primary-foreground/75 sm:text-base">{copy}</p>{children && <div className="mt-8">{children}</div>}</div></section>;
}

export function Feature({ title, copy }: { title: string; copy: string }) { return <div className="rounded-3xl border border-border bg-card p-6 shadow-soft"><span className="grid size-11 place-items-center rounded-full bg-accent text-primary"><Leaf /></span><h3 className="mt-5 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{copy}</p></div>; }

export function PolicyPage({ title, intro, sections }: { title: string; intro: string; sections: [string,string][] }) { return <><PageHero eyebrow="Customer care" title={title} copy={intro} /><div className="mx-auto grid max-w-4xl gap-10 px-6 py-16">{sections.map(([heading,copy]) => <section key={heading}><h2 className="text-2xl font-semibold">{heading}</h2><p className="mt-3 text-sm leading-8 text-muted-foreground">{copy}</p></section>)}</div></>; }

export function FormField({ label, placeholder, type = "text", className = "" }: { label: string; placeholder: string; type?: string; className?: string }) { return <label className={`grid gap-2 text-sm font-semibold ${className}`}><span>{label}</span><input type={type} placeholder={placeholder} className="h-12 rounded-2xl border border-input bg-card px-4 font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20" /></label>; }

export function SuccessList({ items }: { items: string[] }) { return <div className="grid gap-3">{items.map((item) => <div key={item} className="flex items-center gap-3 text-sm"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-primary"><Check className="size-3.5" /></span>{item}</div>)}</div>; }

export function EmptyState({ title, copy, to = "/products" }: { title: string; copy: string; to?: string }) { return <div className="mx-auto max-w-lg px-6 py-24 text-center"><span className="mx-auto grid size-20 place-items-center rounded-full bg-secondary text-primary"><Leaf className="size-9" /></span><h1 className="mt-6 text-3xl font-semibold">{title}</h1><p className="mt-3 text-sm leading-7 text-muted-foreground">{copy}</p><Button asChild className="mt-7"><Link to={to}>Explore products <ArrowRight /></Link></Button></div>; }

export function Meta({ children }: { children: ReactNode }) { return <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-primary">{children}</span>; }