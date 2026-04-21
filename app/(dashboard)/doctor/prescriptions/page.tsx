'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Pill,
  Search,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Plus,
  MoreHorizontal,
  RefreshCw,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getPrescriptionsByDoctor } from '@/app/actions/prescriptions';
import { useEffect } from 'react';
import type { Prescription } from '@/types';

export default function DoctorPrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    async function fetchPrescriptions() {
      const res = await getPrescriptionsByDoctor(user!.id);
      if (res.success && res.data) {
        setPrescriptions(res.data);
      }
      setLoading(false);
    }
    
    fetchPrescriptions();
  }, [user]);

  const filteredPrescriptions = prescriptions.filter(
    (rx) =>
      rx.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      rx.medications?.some((m: any) => m.name.toLowerCase().includes(search.toLowerCase()))
  );

  const activePrescriptions = filteredPrescriptions.filter((rx) => rx.status === 'active');
  const completedPrescriptions = filteredPrescriptions.filter((rx) => rx.status === 'completed');
  const expiredPrescriptions = filteredPrescriptions.filter((rx) => rx.status === 'expired');

  const getStatusBadge = (status: Prescription['status']) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      completed: { variant: 'secondary', label: 'Completed' },
      expired: { variant: 'destructive', label: 'Expired' },
      cancelled: { variant: 'outline', label: 'Cancelled' },
    };
    const { variant, label } = variants[status] || variants.active;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleRenew = (rxId: string) => {
    toast.success('Prescription renewed successfully');
  };

  const handleCancel = (rxId: string) => {
    toast.success('Prescription cancelled');
  };

  const PrescriptionCard = ({ prescription }: { prescription: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Pill className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">{prescription.patientName}</h4>
                {getStatusBadge(prescription.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Issued: {new Date(prescription.date).toLocaleDateString()}
                </span>
                {prescription.validUntil && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Expires: {new Date(prescription.validUntil).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleRenew(prescription.id)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Renew
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleCancel(prescription.id)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-foreground">Medications:</p>
          <div className="grid gap-2">
            {prescription.medications.map((med, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-muted/50 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    {med.name} - {med.dosage}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {med.frequency} for {med.duration}
                  </p>
                </div>
                {med.quantity && (
                  <Badge variant="outline">{med.quantity} units</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {prescription.diagnosis && (
          <div className="mt-4 p-3 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground">Diagnosis</p>
            <p className="text-sm text-foreground">{prescription.diagnosis}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!user) return null;
  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading prescriptions...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prescriptions</h1>
          <p className="text-muted-foreground">Manage patient prescriptions</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prescriptions..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button asChild className="gap-2 shrink-0">
            <Link href="/doctor/ai-prescriber">
              <Sparkles className="h-4 w-4" />
              AI Generate
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activePrescriptions.length}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              <Pill className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedPrescriptions.length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{expiredPrescriptions.length}</p>
              <p className="text-sm text-muted-foreground">Expired</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prescription Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activePrescriptions.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedPrescriptions.length})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({expiredPrescriptions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activePrescriptions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No active prescriptions</p>
                <Button asChild className="mt-4 gap-2">
                  <Link href="/doctor/ai-prescriber">
                    <Sparkles className="h-4 w-4" />
                    Generate New Prescription
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            activePrescriptions.map((rx) => <PrescriptionCard key={rx.id} prescription={rx} />)
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No completed prescriptions</p>
              </CardContent>
            </Card>
          ) : (
            completedPrescriptions.map((rx) => <PrescriptionCard key={rx.id} prescription={rx} />)
          )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          {expiredPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No expired prescriptions</p>
              </CardContent>
            </Card>
          ) : (
            expiredPrescriptions.map((rx) => <PrescriptionCard key={rx.id} prescription={rx} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
