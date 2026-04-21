'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Stethoscope,
  MapPin,
  Phone,
  X,
} from 'lucide-react';
import { getAppointmentsByPatient, createAppointment, updateAppointmentStatus } from '@/app/actions/appointments';
import { getAllUsers } from '@/app/actions/users';
import type { Appointment } from '@/types';

const statusColors: Record<Appointment['status'], string> = {
  scheduled: 'bg-primary/10 text-primary border-primary/30',
  completed: 'bg-chart-2/10 text-chart-2 border-chart-2/30',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/30',
  'in-progress': 'bg-chart-3/10 text-chart-3 border-chart-3/30',
};

const typeLabels: Record<Appointment['type'], string> = {
  consultation: 'Consultation',
  'follow-up': 'Follow-up',
  emergency: 'Emergency',
  routine: 'Routine Checkup',
};

export default function PatientAppointmentsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [reloadDoctors, setReloadDoctors] = useState(0);

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      const [aptRes, usersRes] = await Promise.all([
        getAppointmentsByPatient(user!.id),
        getAllUsers()
      ]);
      if (aptRes.success && aptRes.data) {
        setAppointments(aptRes.data);
      }
      if (usersRes.success && usersRes.data) {
        setDoctors(usersRes.data.filter((u: any) => u.role === 'doctor'));
      }
    }
    loadData();
  }, [user, reloadDoctors]);

  if (!user) return null;

  const selectedDoctorDetails = doctors.find((doctor) => doctor.id === selectedDoctor);

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === 'scheduled' || apt.status === 'in-progress'
  );
  const pastAppointments = appointments.filter(
    (apt) => apt.status === 'completed' || apt.status === 'cancelled'
  );

  const filteredUpcoming = upcomingAppointments.filter(
    (apt) =>
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorSpecialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorDepartment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorAddress?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPast = pastAppointments.filter(
    (apt) =>
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorSpecialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorDepartment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorAddress?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter doctors based on search query
  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
    doctor.department?.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
    doctor.address?.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
    doctor.city?.toLowerCase().includes(doctorSearchQuery.toLowerCase())
  );

  const handleAddDemoNeurologyDoctor = async () => {
    toast.error('Demo doctor creation is not supported in this view.');
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !appointmentType) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newAppointment = {
      patientId: user.id,
      patientName: user.name,
      doctorId: selectedDoctorDetails?.id || selectedDoctor,
      doctorName: selectedDoctorDetails?.name || 'Unknown Doctor',
      doctorSpecialization: selectedDoctorDetails?.specialization || 'General',
      doctorDepartment: selectedDoctorDetails?.department,
      doctorAddress: selectedDoctorDetails?.address,
      doctorPhone: selectedDoctorDetails?.phone,
      date: selectedDate,
      time: selectedTime,
      status: 'scheduled',
      type: appointmentType,
      symptoms: symptoms ? JSON.stringify([symptoms]) : JSON.stringify([]),
      fee: selectedDoctorDetails?.consultationFee || 0,
      paymentStatus: 'pending',
    };

    const result = await createAppointment(newAppointment);
    if (result.success) {
      setAppointments((prev) => [result.data as any, ...prev]);
      toast.success('Appointment booked successfully');
      setIsBookingOpen(false);
      setSelectedDoctor('');
      setSelectedDate('');
      setSelectedTime('');
      setAppointmentType('');
      setSymptoms('');
      setDoctorSearchQuery('');
    } else {
      toast.error('Failed to book appointment');
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    const result = await updateAppointmentStatus(appointmentId, 'cancelled');
    if (result.success) {
      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'cancelled' } : a));
      toast.success('Appointment cancelled');
    } else {
      toast.error('Failed to cancel appointment');
    }
  };

  const AppointmentCard = ({ appointment, showActions = true }: { appointment: any; showActions?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Stethoscope className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">{appointment.doctorName}</h3>
              <p className="text-sm text-muted-foreground">{appointment.doctorSpecialization}</p>
              {appointment.doctorDepartment && (
                <p className="text-sm text-muted-foreground">{appointment.doctorDepartment}</p>
              )}
              {appointment.doctorAddress && (
                <p className="text-sm text-muted-foreground">{appointment.doctorAddress}</p>
              )}
              {appointment.doctorPhone && (
                <p className="text-sm text-muted-foreground">Phone: {appointment.doctorPhone}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <Badge variant="outline" className={statusColors[appointment.status]}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </Badge>
                <Badge variant="secondary">{typeLabels[appointment.type]}</Badge>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 text-right">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Calendar className="h-4 w-4" />
              {format(parseISO(appointment.date), 'MMM d, yyyy')}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {appointment.time}
            </div>
            {showActions && appointment.status === 'scheduled' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive mt-2"
                onClick={() => handleCancelAppointment(appointment.id)}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
          </div>
        </div>

        {(() => {
          let parsedSymptoms: string[] = [];
          if (typeof appointment.symptoms === 'string') {
            try {
              parsedSymptoms = JSON.parse(appointment.symptoms);
            } catch (e) {
              // ignore
            }
          } else if (Array.isArray(appointment.symptoms)) {
            parsedSymptoms = appointment.symptoms;
          }
          
          if (parsedSymptoms.length > 0) {
            return (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Symptoms: </span>
                  {parsedSymptoms.join(', ')}
                </p>
              </div>
            );
          }
          return null;
        })()}

        {appointment.diagnosis && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Diagnosis: </span>
              {appointment.diagnosis}
            </p>
          </div>
        )}

        {appointment.notes && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Notes: </span>
              {appointment.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground">Manage your medical appointments</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button variant="outline" onClick={handleAddDemoNeurologyDoctor}>
            Add demo neurology doctor
          </Button>
          <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
              <DialogDescription>
                Schedule a visit with one of our healthcare providers
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Doctor Search */}
              <div className="space-y-2">
                <Label>Search Doctor</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by doctor name, specialization, department, or location..."
                    value={doctorSearchQuery}
                    onChange={(e) => setDoctorSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Select Doctor</Label>
                <div className="max-h-48 overflow-y-auto border rounded-md">
                  {filteredDoctors.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No doctors found matching your search
                    </div>
                  ) : (
                    filteredDoctors.map((doctor, index) => (
                      <div
                        key={`${doctor.id}-${index}`}
                        className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 ${
                          selectedDoctor === doctor.id ? 'bg-primary/10 border-primary' : ''
                        }`}
                        onClick={() => setSelectedDoctor(doctor.id)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{doctor.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {doctor.specialization} • {doctor.department}
                          </span>
                          {doctor.address && (
                            <span className="text-xs text-muted-foreground">
                              {doctor.address}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            ₹{doctor.consultationFee} • {doctor.city}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {selectedDoctorDetails && (
                <div className="rounded-xl border border-border bg-muted/50 p-4">
                  <p className="text-sm font-medium text-foreground">Selected doctor</p>
                  <p className="text-sm text-muted-foreground">{selectedDoctorDetails.name}</p>
                  <p className="text-sm">
                    <span className="font-medium">Department: </span>
                    {selectedDoctorDetails.department || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Specialization: </span>
                    {selectedDoctorDetails.specialization || 'N/A'}
                  </p>
                  {selectedDoctorDetails.address && (
                    <p className="text-sm">
                      <span className="font-medium">Address: </span>
                      {selectedDoctorDetails.address}
                    </p>
                  )}
                  {selectedDoctorDetails.phone && (
                    <p className="text-sm">
                      <span className="font-medium">Phone: </span>
                      {selectedDoctorDetails.phone}
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="font-medium">Fee: </span>
                    ₹{selectedDoctorDetails.consultationFee ?? 'N/A'}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'].map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Appointment Type</Label>
                <Select value={appointmentType} onValueChange={setAppointmentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="routine">Routine Checkup</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Symptoms or Reason (Optional)</Label>
                <Textarea
                  placeholder="Describe your symptoms or reason for visit..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={3}
                />
              </div>

              <Button className="w-full" onClick={handleBookAppointment}>
                Confirm Booking
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by doctor or specialization..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({filteredUpcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({filteredPast.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {filteredUpcoming.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium text-foreground mb-2">No upcoming appointments</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You don&apos;t have any scheduled appointments
                </p>
                <Button onClick={() => setIsBookingOpen(true)}>
                  Book Your First Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredUpcoming.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {filteredPast.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium text-foreground mb-2">No past appointments</h3>
                <p className="text-sm text-muted-foreground">
                  Your appointment history will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPast.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} showActions={false} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
