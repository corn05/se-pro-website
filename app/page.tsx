'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Heart, 
  Calendar, 
  FileText, 
  FlaskConical, 
  Pill, 
  Shield, 
  Users,
  Stethoscope,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Appointment Management',
    description: 'Schedule, reschedule, and manage appointments with ease. Get reminders and never miss a visit.',
  },
  {
    icon: FileText,
    title: 'Medical Records',
    description: 'Access your complete medical history, test results, and health documents in one secure place.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Prescriptions',
    description: 'Doctors can generate intelligent prescription drafts powered by AI, with safety checks built-in.',
  },
  {
    icon: FlaskConical,
    title: 'Lab Integration',
    description: 'Order tests, track samples, and receive results directly through the platform.',
  },
  {
    icon: Pill,
    title: 'Pharmacy Services',
    description: 'Manage prescriptions, check drug availability, and coordinate medication fulfillment.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your health data is protected with enterprise-grade security and privacy controls.',
  },
];

const roles = [
  { icon: Heart, label: 'Patients', description: 'Manage health records & appointments' },
  { icon: Stethoscope, label: 'Doctors', description: 'AI-assisted consultations & prescriptions' },
  { icon: Users, label: 'Administrators', description: 'Hospital management & analytics' },
  { icon: Pill, label: 'Pharmacies', description: 'Inventory & prescription fulfillment' },
  { icon: FlaskConical, label: 'Labs', description: 'Test management & reporting' },
];

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect logged-in users to their dashboard
      const dashboards: Record<string, string> = {
        patient: '/patient',
        doctor: '/doctor',
        admin: '/admin',
        pharmacy: '/pharmacy',
        lab: '/lab',
      };
      router.push(dashboards[user.role] || '/patient');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold text-foreground">HealthStack</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">HealthStack</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 py-24 lg:py-32 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Now with AI-powered prescription generation
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Healthcare Management Made Simple
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              A unified platform connecting patients, doctors, pharmacies, and labs. 
              Streamline appointments, prescriptions, and medical records with intelligent tools.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="gap-2">
                <Link href="/register">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">View Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Built for Everyone in Healthcare
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Role-specific dashboards designed for the unique needs of each healthcare participant.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {roles.map((role) => (
              <Card key={role.label} className="border-border/50 bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <role.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{role.label}</h3>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Everything You Need for Modern Healthcare
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive features to manage the entire healthcare workflow efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Feature Highlight */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-foreground/20 text-sm">
                  <Sparkles className="h-4 w-4" />
                  New Feature
                </div>
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                  AI-Powered Prescription Generation
                </h2>
                <p className="text-primary-foreground/80 text-lg">
                  Our intelligent system helps doctors create accurate prescriptions faster, 
                  with built-in drug interaction checks and dosage recommendations.
                </p>
                <ul className="space-y-3">
                  {[
                    'Smart medication suggestions based on diagnosis',
                    'Automatic drug interaction warnings',
                    'Dosage recommendations by patient profile',
                    'Easy review and editing before finalization',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-primary-foreground/10 rounded-2xl p-8 border border-primary-foreground/20">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    <span>Doctor&apos;s Console</span>
                  </div>
                  <div className="bg-primary-foreground/10 rounded-lg p-4 space-y-3">
                    <div className="text-sm font-medium">AI Prescription Draft</div>
                    <div className="space-y-2 text-sm text-primary-foreground/80">
                      <div className="flex justify-between">
                        <span>Lisinopril 10mg</span>
                        <span>Once daily</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aspirin 81mg</span>
                        <span>Once daily</span>
                      </div>
                    </div>
                    <div className="text-xs text-primary-foreground/60 pt-2 border-t border-primary-foreground/20">
                      Based on diagnosis: Mild hypertension
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full">
                    Review & Approve
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Ready to Transform Your Healthcare Experience?
            </h2>
            <p className="text-muted-foreground">
              Join thousands of healthcare providers and patients who trust HealthStack 
              for their daily operations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="gap-2">
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">HealthStack</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Healthcare management made simple. Built with care.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
