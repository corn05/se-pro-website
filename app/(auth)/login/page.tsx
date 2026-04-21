'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Heart, Stethoscope, Users, FlaskConical, Pill, Shield } from 'lucide-react';
import type { UserRole } from '@/types';

const roleIcons: Record<UserRole, React.ReactNode> = {
  patient: <Heart className="h-4 w-4" />,
  doctor: <Stethoscope className="h-4 w-4" />,
  admin: <Shield className="h-4 w-4" />,
  pharmacy: <Pill className="h-4 w-4" />,
  lab: <FlaskConical className="h-4 w-4" />,
};

const roleLabels: Record<UserRole, string> = {
  patient: 'Patient',
  doctor: 'Doctor',
  admin: 'Admin',
  pharmacy: 'Pharmacy',
  lab: 'Lab Tech',
};

const roleDashboards: Record<UserRole, string> = {
  patient: '/patient',
  doctor: '/doctor',
  admin: '/admin',
  pharmacy: '/pharmacy',
  lab: '/lab',
};

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Login successful');
      // Get the user from localStorage to determine redirect
      const storedUser = localStorage.getItem('healthstack_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        router.push(roleDashboards[user.role as UserRole]);
      }
    } else {
      toast.error(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  const handleDemoLogin = (role: UserRole) => {
    loginAsRole(role);
    toast.success(`Logged in as demo ${roleLabels[role]}`);
    router.push(roleDashboards[role]);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary-foreground">HealthStack</span>
          </div>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-primary-foreground leading-tight text-balance">
            Complete Healthcare Management at Your Fingertips
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Manage appointments, prescriptions, lab results, and more - all in one secure platform.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <Users className="h-5 w-5" />
              <span>Multi-role Access</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <Stethoscope className="h-5 w-5" />
              <span>AI Prescriptions</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <FlaskConical className="h-5 w-5" />
              <span>Lab Integration</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <Shield className="h-5 w-5" />
              <span>Secure Data</span>
            </div>
          </div>
        </div>
        
        <p className="text-primary-foreground/60 text-sm">
          Trusted by healthcare providers worldwide
        </p>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">HealthStack</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
          </div>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Sign in</CardTitle>
              <CardDescription>Enter your credentials or use a demo account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  Or continue with demo
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">Quick demo access</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                    <Button
                      key={role}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin(role)}
                      className="flex items-center gap-2"
                    >
                      {roleIcons[role]}
                      {roleLabels[role]}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
