import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { ArrowRight, ShieldCheck, Smartphone, BarChart3, FileCheck, CreditCard, Users, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "NaijaLoan — Smart Loan Management for Nigeria" },
      { name: "description", content: "Apply, approve and manage loans across Nigeria. Built for borrowers, loan officers, and lenders." },
      { property: "og:title", content: "NaijaLoan — Smart Loan Management for Nigeria" },
      { property: "og:description", content: "Apply, approve and manage loans across Nigeria with NaijaLoan." },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-muted-foreground hover:text-foreground">Features</a>
            <a href="#how" className="text-muted-foreground hover:text-foreground">How it works</a>
            <a href="#roles" className="text-muted-foreground hover:text-foreground">For You</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/login">Sign in</Link></Button>
            <Button asChild size="sm" className="bg-primary hover:opacity-90"><Link to="/register">Get started</Link></Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-50"
             style={{ background: "radial-gradient(60% 50% at 80% 0%, color-mix(in oklab, var(--gold) 25%, transparent), transparent), radial-gradient(50% 50% at 0% 100%, color-mix(in oklab, var(--primary) 18%, transparent), transparent)" }} />
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-primary mb-5">
              <Sparkles className="h-3 w-3 text-gold" />
              Built for Nigeria 🇳🇬
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Smart loans, <span className="text-primary">simply managed.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              NaijaLoan helps lenders, loan officers, and borrowers handle the entire credit
              journey — from application to disbursement to repayment — in Naira.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-primary hover:opacity-90 shadow-lg" style={{ boxShadow: "var(--shadow-elegant)" }}>
                <Link to="/register">Apply for a loan <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/login">Lender / officer login</Link>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              <div><p className="text-2xl font-bold text-primary">₦4.2B+</p><p className="text-xs text-muted-foreground">Disbursed</p></div>
              <div><p className="text-2xl font-bold text-primary">28k+</p><p className="text-xs text-muted-foreground">Borrowers</p></div>
              <div><p className="text-2xl font-bold text-primary">96%</p><p className="text-xs text-muted-foreground">Repayment rate</p></div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 to-gold/20 blur-2xl -z-10" />
            <img src={heroImg} alt="NaijaLoan mobile lending" width={1280} height={960}
                 className="rounded-3xl shadow-2xl border" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 lg:py-24 bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">Features</p>
            <h2 className="mt-2 text-3xl lg:text-4xl font-bold">Everything you need to lend confidently</h2>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Smartphone, title: "Mobile-first experience", body: "Designed for Nigerian users on Android — fast, light, and beautiful on any screen." },
              { icon: ShieldCheck, title: "BVN & NIN verification", body: "Secure borrower verification fields built in, ready for CBN-compliant integrations." },
              { icon: FileCheck, title: "Automated schedules", body: "Generate flat or reducing-balance repayment plans with late-fee handling." },
              { icon: CreditCard, title: "Naira-native", body: "All amounts in ₦, with bank-transfer reference tracking for Nigerian banks." },
              { icon: Users, title: "Role-based dashboards", body: "Tailored views for borrowers, loan officers, and admins." },
              { icon: BarChart3, title: "Insights & exports", body: "Performance dashboards, defaulter lists, CSV/PDF exports for compliance." },
            ].map((f) => (
              <Card key={f.title} className="border-2 hover:border-primary/40 transition-colors" style={{ boxShadow: "var(--shadow-card)" }}>
                <CardContent className="p-6">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-lg">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">How it works</p>
            <h2 className="mt-2 text-3xl lg:text-4xl font-bold">From application to repayment in 4 steps</h2>
          </div>
          <div className="mt-10 grid md:grid-cols-4 gap-6">
            {[
              { n: "01", t: "Register", d: "Create your account with BVN, phone, and state of residence." },
              { n: "02", t: "Apply", d: "Pick a loan product, upload documents and submit." },
              { n: "03", t: "Get approved", d: "Loan officers review and disburse to your bank account." },
              { n: "04", t: "Repay easily", d: "Track schedule, pay by transfer, get reminders." },
            ].map((s) => (
              <div key={s.n} className="relative rounded-2xl border bg-card p-6">
                <div className="text-5xl font-extrabold text-primary/15">{s.n}</div>
                <h3 className="mt-2 font-semibold text-lg">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES / CTA */}
      <section id="roles" className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="rounded-3xl p-8 lg:p-14 text-primary-foreground relative overflow-hidden"
               style={{ background: "var(--gradient-hero)" }}>
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gold/30 blur-3xl" />
            <div className="relative grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold">Ready to get started?</h2>
                <p className="mt-3 text-primary-foreground/80 max-w-lg">
                  Whether you're applying for your first loan or running a lending operation,
                  NaijaLoan has a workspace for you.
                </p>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <Button asChild size="lg" className="bg-gold text-gold-foreground hover:opacity-90">
                  <Link to="/register">I'm a borrower</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent border-white/30 text-primary-foreground hover:bg-white/10">
                  <Link to="/login">Loan officer</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent border-white/30 text-primary-foreground hover:bg-white/10">
                  <Link to="/login">Admin</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-10">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} NaijaLoan. Made in Nigeria.</p>
        </div>
      </footer>
    </div>
  );
}
