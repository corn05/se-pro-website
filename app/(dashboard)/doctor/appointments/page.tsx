'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  User,
  Video,
  MapPin,
  CheckCircle2,
  XCircle,
  Search,
  FileText,
  Stethoscope,
} from 'lucide-react';
import { getAppointmentsByDoctor } from '@/app/actions/appointments';
import type { Appointment } from '@/types';

export default function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [consultNotes, setConsultNotes] = useState('');

  useEffect(() => {
    async function loadAppointments() {
      if (user) {
        const result = await getAppointmentsByDoctor(user!.id);
        if (result.success && result.data) {
          setAppointments(result.data as unknown as Appointment[]);
        }
      }
    }
    loadAppointments();
  }, [user]);

  useEffect(() => {
    // Keep this empty or remove if not needed. Prisma data won't auto-sync across tabs without SWR/React Query.
  }, [user]);

  const filteredAppointments = appointments.filter(
    (apt) =>
      apt.patientName.toLowerCase().includes(search.toLowerCase()) ||
      apt.type.toLowerCase().includes(search.toLowerCase())
  );

  const todayAppointments = filteredAppointments.filter(
    (apt) => new Date(apt.date).toDateString() === new Date().toDateString()
  );
  const upcomingAppointments = filteredAppointments.filter(
    (apt) => new Date(apt.date) > new Date() && apt.status === 'scheduled'
  );
  const pastAppointments = filteredAppointments.filter(
    (apt) => new Date(apt.date) < new Date() || apt.status === 'completed'
  );

  const getStatusBadge = (status: Appointment['status']) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      scheduled: { variant: 'default', label: 'Scheduled' },
      completed: { variant: 'secondary', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
      pending: { variant: 'outline', label: 'Pending' },
    };
    const { variant, label } = variants[status] || variants.pending;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleStartConsultation = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setConsultNotes('');
  };

  const handleCompleteConsultation = () => {
    toast.success('Consultation completed successfully');
    setSelectedAppointment(null);
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-foreground">{appointment.patientName}</h4>
              <p className="text-sm text-muted-foreground capitalize">{appointment.type}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(appointment.date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {appointment.time}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(appointment.status)}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {(appointment as any).isVirtual ? (
                <>
                  <Video className="h-4 w-4 text-primary" />
                  <span>Virtual</span>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  <span>In-Person</span>
                </>
              )}
            </div>
          </div>
        </div>

        {appointment.notes && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground flex items-start gap-2">
              <FileText className="h-4 w-4 shrink-0 mt-0.5" />
              {appointment.notes}
            </p>
          </div>
        )}

        {appointment.status === 'scheduled' && (
          <div className="mt-4 flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex-1 gap-2" onClick={() => handleStartConsultation(appointment)}>
                  <Stethoscope className="h-4 w-4" />
                  Start Consultation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Consultation with {appointment.patientName}</DialogTitle>
                  <DialogDescription>
                    {appointment.type} - {new Date(appointment.date).toLocaleDateString()}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Consultation Notes</label>
                    <Textarea
                      placeholder="Enter consultation notes, observations, and recommendations..."
                      rows={6}
                      value={consultNotes}
                      onChange={(e) => setConsultNotes(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2">
                      <XCircle className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button className="flex-1 gap-2" onClick={handleCompleteConsultation}>
                      <CheckCircle2 className="h-4 w-4" />
                      Complete
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="icon">
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground">Manage your patient appointments</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients or appointment type..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{todayAppointments.length}</p>
              <p className="text-sm text-muted-foreground">Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-chart-1" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{upcomingAppointments.length}</p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pastAppointments.length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Tabs */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today ({todayAppointments.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {todayAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No appointments scheduled for today</p>
              </CardContent>
            </Card>
          ) : (
            todayAppointments.map((apt) => <AppointmentCard key={apt.id} appointment={apt} />)
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No upcoming appointments</p>
              </CardContent>
            </Card>
          ) : (
            upcomingAppointments.map((apt) => <AppointmentCard key={apt.id} appointment={apt} />)
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No past appointments</p>
              </CardContent>
            </Card>
          ) : (
            pastAppointments.map((apt) => <AppointmentCard key={apt.id} appointment={apt} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
