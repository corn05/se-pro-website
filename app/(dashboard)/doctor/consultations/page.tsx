'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Stethoscope,
  Clock,
  User,
  Calendar,
  MessageSquare,
  Video,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { getAppointmentsByDoctor } from '@/app/actions/appointments';
import { useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';

interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  type: 'video' | 'phone' | 'in-person';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  date: string;
  time: string;
  duration: number;
  symptoms: string[];
  notes?: string;
}

export default function ConsultationsPage() {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    async function loadAppointments() {
      const result = await getAppointmentsByDoctor(user!.id);
      if (result.success && result.data) {
        setConsultations(result.data);
      }
      setLoading(false);
    }

    loadAppointments();
  }, [user]);

  if (!user) return null;
  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading consultations...</div>;

  const filteredConsultations = selectedStatus === 'all'
    ? consultations
    : consultations.filter(c => c.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'in-person': return <User className="h-4 w-4" />;
      default: return <Stethoscope className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Consultations</h1>
          <p className="text-muted-foreground">
            Manage patient consultations and appointments
          </p>
        </div>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          Schedule New Consultation
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Consultations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultations List */}
      <div className="grid gap-4">
        {filteredConsultations.map((consultation) => (
          <Card key={consultation.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {consultation.patientName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{consultation.patientName}</h3>
                      <Badge className={getStatusColor(consultation.status)}>
                        {consultation.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {getTypeIcon(consultation.type)}
                        <span className="capitalize">{consultation.type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {consultation.date} at {consultation.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        30 min
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {consultation.symptoms && JSON.parse(consultation.symptoms).map((symptom: string) => (
                        <Badge key={symptom} variant="outline" className="text-xs">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                    {consultation.notes && (
                      <p className="text-sm text-muted-foreground">
                        {consultation.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {consultation.status === 'scheduled' && (
                    <>
                      <Button size="sm" variant="outline">
                        <Video className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Reschedule
                      </Button>
                    </>
                  )}
                  {consultation.status === 'in-progress' && (
                    <Button size="sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  )}
                  {consultation.status === 'completed' && (
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredConsultations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No consultations found</h3>
            <p className="text-muted-foreground">
              {selectedStatus === 'all'
                ? 'You have no consultations scheduled.'
                : `No consultations with status "${selectedStatus}".`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}