'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  Building2,
  Calendar,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { getDashboardStats } from '@/app/actions/admin';
import { useEffect, useState } from 'react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    async function loadStats() {
      const result = await getDashboardStats();
      if (result.success && result.data) {
        setStatsData(result.data);
      } else {
        console.error("Dashboard stats error:", result.error);
        setStatsData({ _error: result.error || 'Failed to load' });
      }
    }
    loadStats();
  }, [user]);

  if (!user) return null;
  if (!statsData) return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;
  if (statsData._error) return <div className="p-8 text-center text-destructive">Error: {statsData._error}</div>;

  const stats = [
    {
      title: 'Total Patients',
      value: statsData.totalPatients,
      change: '+12%',
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Active Doctors',
      value: statsData.totalDoctors,
      change: '+3',
      icon: UserCheck,
      color: 'text-chart-1',
      bg: 'bg-chart-1/10',
    },
    {
      title: 'Total Appointments',
      value: statsData.totalAppointments,
      change: `${statsData.pendingAppointments} pending`,
      icon: Calendar,
      color: 'text-chart-2',
      bg: 'bg-chart-2/10',
    },
    {
      title: 'Total Revenue',
      value: `$${statsData.totalRevenue.toLocaleString()}`,
      change: '+18%',
      icon: DollarSign,
      color: 'text-chart-4',
      bg: 'bg-chart-4/10',
    },
  ];

  const quickActions = [
    { label: 'Manage Users', href: '/admin/users', icon: Users },
    { label: 'View Reports', href: '/admin/reports', icon: TrendingUp },
    { label: 'System Settings', href: '/admin/settings', icon: Building2 },
    { label: 'View Activity', href: '/admin/activity', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}. Here&apos;s your system overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
                <div className={`h-12 w-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="w-full justify-between"
                asChild
              >
                <Link href={action.href}>
                  <span className="flex items-center gap-2">
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Current system status and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">Appointments</p>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-foreground font-medium">
                      {statsData.totalAppointments}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="text-foreground font-medium">{statsData.completedAppointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending</span>
                    <span className="text-foreground font-medium">{statsData.pendingAppointments}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">Prescriptions</p>
                  <Badge variant="secondary" className="gap-1">
                    <Activity className="h-3 w-3" />
                    Active
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Active</span>
                    <span className="text-foreground font-medium">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="text-foreground font-medium">
                      -
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expired</span>
                    <span className="text-foreground font-medium">
                      -
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">Lab Results</p>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Pending
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending</span>
                    <span className="text-foreground font-medium">{statsData.pendingTests}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">User Accounts</p>
                  <Badge variant="default" className="gap-1">
                    <Users className="h-3 w-3" />
                    {statsData.totalPatients + statsData.totalDoctors}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patients</span>
                    <span className="text-foreground font-medium">{statsData.totalPatients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Doctors</span>
                    <span className="text-foreground font-medium">{statsData.totalDoctors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Staff</span>
                    <span className="text-foreground font-medium">-</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                icon: UserCheck,
                color: 'text-primary',
                bg: 'bg-primary/10',
                title: 'New patient registration',
                description: 'John Smith registered as a new patient',
                time: '2 minutes ago',
              },
              {
                icon: Calendar,
                color: 'text-chart-1',
                bg: 'bg-chart-1/10',
                title: 'Appointment scheduled',
                description: 'Dr. Sarah Wilson has a new appointment',
                time: '15 minutes ago',
              },
              {
                icon: Activity,
                color: 'text-chart-2',
                bg: 'bg-chart-2/10',
                title: 'Lab results uploaded',
                description: 'Blood test results for Emily Davis are ready',
                time: '1 hour ago',
              },
              {
                icon: AlertCircle,
                color: 'text-chart-3',
                bg: 'bg-chart-3/10',
                title: 'Prescription alert',
                description: '3 prescriptions expiring this week',
                time: '2 hours ago',
              },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`h-10 w-10 rounded-lg ${activity.bg} flex items-center justify-center shrink-0`}>
                  <activity.icon className={`h-5 w-5 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
                <p className="text-xs text-muted-foreground shrink-0">{activity.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
