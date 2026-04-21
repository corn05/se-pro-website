'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  User,
  Phone,
  Mail,
  Calendar,
  Droplet,
  AlertTriangle,
  FileText,
  Pill,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { getUsersByRole } from '@/app/actions/users';
import { getPrescriptionsByPatient } from '@/app/actions/prescriptions';
import { getLabTestsByPatient } from '@/app/actions/lab';
import { useEffect } from 'react';
import type { Prescription } from '@/types';
import { safeParseArray } from '@/lib/utils';

export default function DoctorPatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<Record<string, any[]>>({});
  const [labTests, setLabTests] = useState<Record<string, any[]>>({});
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const result = await getUsersByRole('patient');
      if (result.success && result.data) {
        setPatients(result.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const fetchPrescriptions = async (patientId: string) => {
    if (!prescriptions[patientId]) {
      const res = await getPrescriptionsByPatient(patientId);
      if (res.success && res.data) {
        setPrescriptions(prev => ({ ...prev, [patientId]: res.data }));
      }
    }
    if (!labTests[patientId]) {
      const res = await getLabTestsByPatient(patientId);
      if (res.success && res.data) {
        setLabTests(prev => ({ ...prev, [patientId]: res.data }));
      }
    }
  };

  useEffect(() => {
    if (selectedPatient) {
      fetchPrescriptions(selectedPatient.id);
    }
  }, [selectedPatient]);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  const calculateAge = (dateOfBirth?: string): number => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getPatientPrescriptionsList = (patientId: string) => {
    return prescriptions[patientId] || [];
  };

  const getPatientLabResults = (patientId: string) => {
    return labTests[patientId] || [];
  };

  if (!user) return null;
  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading patients...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground">Manage your patient records</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
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
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{patients.length}</p>
              <p className="text-sm text-muted-foreground">Total Patients</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
              <Pill className="h-6 w-6 text-chart-1" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{patients.reduce((acc, p) => acc + (prescriptions[p.id]?.length || 0), 0) || '-'}</p>
              <p className="text-sm text-muted-foreground">Active Prescriptions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <Activity className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{Object.values(labTests).flat().length}</p>
              <p className="text-sm text-muted-foreground">Lab Results</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Directory</CardTitle>
          <CardDescription>View and manage patient information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No patients found</p>
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <Dialog key={patient.id}>
                  <DialogTrigger asChild>
                    <div
                      className="p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors flex items-center justify-between"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {patient.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-foreground">{patient.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5" />
                              {patient.email}
                            </span>
                            {patient.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" />
                                {patient.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-medium text-foreground">
                            {calculateAge(patient.dateOfBirth)} years
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {patient.gender || 'Not specified'}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {patient.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {patient.name}
                      </DialogTitle>
                      <DialogDescription>Patient medical profile and history</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      {/* Basic Info */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Age</p>
                          <p className="text-sm font-medium text-foreground">
                            {calculateAge(patient.dateOfBirth)} years
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Gender</p>
                          <p className="text-sm font-medium text-foreground capitalize">
                            {patient.gender || 'Not specified'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Blood Type</p>
                          <p className="text-sm font-medium text-foreground flex items-center gap-1">
                            <Droplet className="h-3.5 w-3.5 text-destructive" />
                            {patient.bloodType || 'Unknown'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">DOB</p>
                          <p className="text-sm font-medium text-foreground flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {patient.dateOfBirth
                              ? new Date(patient.dateOfBirth).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      {/* Contact Info */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-foreground">Contact Information</h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{patient.email}</span>
                          </div>
                          {patient.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">{patient.phone}</span>
                            </div>
                          )}
                        </div>
                        {patient.address && (
                          <p className="text-sm text-muted-foreground">{patient.address}</p>
                        )}
                      </div>

                      {/* Allergies */}
                      {(() => {
                        const allergies = safeParseArray(patient.allergies);
                        if (allergies.length === 0) return null;
                        return (
                          <>
                            <Separator />
                            <div className="space-y-3">
                              <h4 className="font-medium text-foreground flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                Known Allergies
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {allergies.map((allergy, idx) => (
                                  <Badge key={idx} variant="destructive">
                                    {allergy}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </>
                        );
                      })()}

                      {/* Recent Prescriptions */}
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="font-medium text-foreground flex items-center gap-2">
                          <Pill className="h-4 w-4 text-primary" />
                          Recent Prescriptions
                        </h4>
                        {getPatientPrescriptionsList(patient.id).length === 0 ? (
                          <p className="text-sm text-muted-foreground">No prescriptions found</p>
                        ) : (
                          <div className="space-y-2">
                            {getPatientPrescriptionsList(patient.id)
                              .slice(0, 3)
                              .map((rx) => (
                                <div
                                  key={rx.id}
                                  className="p-3 rounded-lg border border-border bg-muted/30"
                                >
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium text-sm text-foreground">
                                      {rx.medications?.map((m: any) => m.name).join(', ')}
                                    </p>
                                    <Badge variant={rx.status === 'active' ? 'default' : 'secondary'}>
                                      {rx.status}
                                    </Badge>
                                  </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Issued: {new Date(rx.date).toLocaleDateString()}
                                    </p>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      {/* Recent Lab Results */}
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="font-medium text-foreground flex items-center gap-2">
                          <FileText className="h-4 w-4 text-chart-2" />
                          Recent Lab Results
                        </h4>
                        {getPatientLabResults(patient.id).length === 0 ? (
                          <p className="text-sm text-muted-foreground">No lab results found</p>
                        ) : (
                          <div className="space-y-2">
                            {getPatientLabResults(patient.id)
                              .slice(0, 3)
                              .map((lab) => (
                                <div
                                  key={lab.id}
                                  className="p-3 rounded-lg border border-border bg-muted/30"
                                >
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium text-sm text-foreground">{lab.testName}</p>
                                    <Badge
                                      variant={
                                        lab.status === 'completed'
                                          ? 'default'
                                          : lab.status === 'pending'
                                          ? 'outline'
                                          : 'secondary'
                                      }
                                    >
                                      {lab.status}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(lab.date).toLocaleDateString()}
                                  </p>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
