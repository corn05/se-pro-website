'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import {
  Calendar,
  Pill,
  FlaskConical,
  FileText,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
} from 'lucide-react';
import { getAppointmentsByPatient } from '@/app/actions/appointments';
import { getPrescriptionsByPatient } from '@/app/actions/prescriptions';
import { getLabTestsByPatient } from '@/app/actions/lab';
import { getNotificationsByUser } from '@/app/actions/notifications';
import { getMedicalRecordsByPatient } from '@/app/actions/records';
import { useEffect, useState } from 'react';

export default function PatientDashboard() {
  const { user } = useAuth();
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [labTests, setLabTests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      const [aptRes, rxRes, labRes, notifRes, recRes] = await Promise.all([
        getAppointmentsByPatient(user!.id),
        getPrescriptionsByPatient(user!.id),
        getLabTestsByPatient(user!.id),
        getNotificationsByUser(user!.id),
        getMedicalRecordsByPatient(user!.id)
      ]);

      if (aptRes.success && aptRes.data) setAppointments(aptRes.data);
      if (rxRes.success && rxRes.data) setPrescriptions(rxRes.data);
      if (labRes.success && labRes.data) setLabTests(labRes.data);
      if (notifRes.success && notifRes.data) setNotifications(notifRes.data);
      if (recRes.success && recRes.data) setMedicalRecords(recRes.data);
      
      setLoading(false);
    }
    loadData();
  }, [user]);

  if (!user) return null;
  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;

  const upcomingAppointments = appointments.filter(apt => apt.status === 'scheduled');
  const activePrescriptions = prescriptions.filter(rx => rx.status === 'active');
  const pendingTests = labTests.filter(test => test.status === 'pending' || test.status === 'in-progress');
  const unreadNotifications = notifications.filter(n => !n.read);

  const stats = [
    {
      label: 'Upcoming Appointments',
      value: upcomingAppointments.length,
      icon: Calendar,
      href: '/patient/appointments',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Active Prescriptions',
      value: activePrescriptions.length,
      icon: Pill,
      href: '/patient/prescriptions',
      color: 'text-chart-2',
      bg: 'bg-chart-2/10',
    },
    {
      label: 'Pending Lab Tests',
      value: pendingTests.length,
      icon: FlaskConical,
      href: '/patient/lab-results',
      color: 'text-chart-3',
      bg: 'bg-chart-3/10',
    },
    {
      label: 'Medical Records',
      value: `${medicalRecords.length}`,
      icon: FileText,
      href: '/patient/medical-records',
      color: 'text-chart-4',
      bg: 'bg-chart-4/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user.name.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your health dashboard
        </p>
      </div>

      {/* Notifications Banner */}
      {unreadNotifications.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  You have {unreadNotifications.length} new notification{unreadNotifications.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-muted-foreground">
                  {unreadNotifications[0]?.message}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </CardContent>
        </Card>
      )}

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
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled visits</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/patient/appointments">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming appointments</p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href="/patient/appointments">Book Appointment</Link>
                </Button>
              </div>
            ) : (
              upcomingAppointments.slice(0, 3).map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Stethoscope className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{apt.doctorName}</p>
                    <p className="text-sm text-muted-foreground">{apt.doctorSpecialization}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-foreground">
                      {format(parseISO(apt.date), 'MMM d')}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {apt.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Active Prescriptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Active Prescriptions</CardTitle>
              <CardDescription>Current medications</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/patient/prescriptions">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {activePrescriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active prescriptions</p>
              </div>
            ) : (
              activePrescriptions.slice(0, 2).map((rx) => (
                <div key={rx.id} className="p-4 rounded-lg border border-border/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{rx.diagnosis}</span>
                      {rx.aiGenerated && (
                        <Badge variant="secondary" className="text-xs">AI-Generated</Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="text-primary border-primary/30">
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {rx.medications.slice(0, 2).map((med, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-foreground">{med.name} {med.dosage}</span>
                        <span className="text-muted-foreground">- {med.frequency}</span>
                      </div>
                    ))}
                    {rx.medications.length > 2 && (
                      <p className="text-sm text-muted-foreground pl-6">
                        +{rx.medications.length - 2} more medications
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Prescribed by {rx.doctorName} on {format(parseISO(rx.date), 'MMM d, yyyy')}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Lab Results */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Lab Results</CardTitle>
              <CardDescription>Recent test results</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/patient/lab-results">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {labTests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No lab tests</p>
              </div>
            ) : (
              labTests.slice(0, 3).map((test) => (
                <div key={test.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    test.status === 'completed' ? 'bg-primary/10' : 'bg-chart-3/10'
                  }`}>
                    <FlaskConical className={`h-5 w-5 ${
                      test.status === 'completed' ? 'text-primary' : 'text-chart-3'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{test.testName}</p>
                    <p className="text-sm text-muted-foreground">{test.type}</p>
                  </div>
                  <Badge variant={test.status === 'completed' ? 'default' : 'secondary'}>
                    {test.status === 'completed' ? 'Ready' : test.status === 'in-progress' ? 'Processing' : 'Pending'}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link href="/patient/appointments">
                <Calendar className="h-5 w-5" />
                <span className="text-sm">Book Appointment</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link href="/patient/prescriptions">
                <Pill className="h-5 w-5" />
                <span className="text-sm">Refill Request</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link href="/patient/medical-records">
                <FileText className="h-5 w-5" />
                <span className="text-sm">View Records</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link href="/patient/payments">
                <ArrowRight className="h-5 w-5" />
                <span className="text-sm">Pay Bills</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
