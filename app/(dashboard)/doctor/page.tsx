'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import {
  Calendar,
  Users,
  ClipboardList,
  Pill,
  Clock,
  ArrowRight,
  Sparkles,
  Stethoscope,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { getAppointmentsByDoctor } from '@/app/actions/appointments';
import { getPrescriptionsByDoctor } from '@/app/actions/prescriptions';
import { getAllUsers } from '@/app/actions/users';
import { useEffect, useState } from 'react';
import { safeParseArray } from '@/lib/utils';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    async function loadData() {
      const [aptRes, usersRes, rxRes] = await Promise.all([
        getAppointmentsByDoctor(user!.id),
        getAllUsers(),
        getPrescriptionsByDoctor(user!.id)
      ]);

      if (aptRes.success && aptRes.data) {
        setAppointments(aptRes.data);
      }
      if (usersRes.success && usersRes.data) {
        setPatients(usersRes.data.filter((u: any) => u.role === 'patient'));
      }
      if (rxRes.success && rxRes.data) {
        setPrescriptions(rxRes.data);
      }
      setLoading(false);
    }

    loadData();
  }, [user]);

  if (!user) return null;
  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;

  const todayAppointments = appointments.filter(
    (apt) => apt.date === format(new Date(), 'yyyy-MM-dd') && apt.status === 'scheduled'
  );
  const upcomingAppointments = appointments.filter((apt) => apt.status === 'scheduled');
  const completedAppointments = appointments.filter((apt) => apt.status === 'completed');

  const stats = [
    {
      label: 'Today\'s Appointments',
      value: todayAppointments.length,
      icon: Calendar,
      href: '/doctor/appointments',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Total Patients',
      value: patients.length,
      icon: Users,
      href: '/doctor/patients',
      color: 'text-chart-2',
      bg: 'bg-chart-2/10',
    },
    {
      label: 'Active Consultations',
      value: upcomingAppointments.length,
      icon: Stethoscope,
      href: '/doctor/consultations',
      color: 'text-chart-3',
      bg: 'bg-chart-3/10',
    },
    {
      label: 'Prescriptions Written',
      value: prescriptions.length,
      icon: Pill,
      href: '/doctor/prescriptions',
      color: 'text-chart-4',
      bg: 'bg-chart-4/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.name.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground">
            You have {todayAppointments.length} appointments today
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/doctor/ai-prescriber">
            <Sparkles className="h-4 w-4" />
            AI Prescription Generator
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Today&apos;s Schedule</CardTitle>
              <CardDescription>{format(new Date(), 'EEEE, MMMM d, yyyy')}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/doctor/appointments">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No appointments scheduled for today</p>
              </div>
            ) : (
              todayAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {apt.patientName.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{apt.patientName}</p>
                    <p className="text-sm text-muted-foreground capitalize">{apt.type}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {apt.time}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {apt.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Recent Patients</CardTitle>
              <CardDescription>Patients you&apos;ve seen recently</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/doctor/patients">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {patients.slice(0, 4).map((patient) => (
              <Link
                key={patient.id}
                href={`/doctor/patients/${patient.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {patient.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {patient.gender}, {patient.bloodType}
                  </p>
                </div>
                {safeParseArray(patient.allergies).length > 0 && (
                  <Badge variant="destructive" className="gap-1 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    Allergies
                  </Badge>
                )}
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* AI Prescriber Promo */}
        <Card className="lg:col-span-2 bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">AI-Powered Prescription Generation</h3>
                </div>
                <p className="text-primary-foreground/80 max-w-xl">
                  Generate intelligent prescription drafts based on diagnosis and patient history. 
                  Includes drug interaction checks and dosage recommendations.
                </p>
              </div>
              <Button variant="secondary" size="lg" asChild className="shrink-0">
                <Link href="/doctor/ai-prescriber" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Try Now
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link href="/doctor/consultations">
                <Stethoscope className="h-5 w-5" />
                <span className="text-sm">Start Consultation</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link href="/doctor/ai-prescriber">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm">Write Prescription</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link href="/doctor/patients">
                <Users className="h-5 w-5" />
                <span className="text-sm">View Patients</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link href="/doctor/analytics">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm">View Analytics</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
