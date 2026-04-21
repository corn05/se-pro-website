'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { safeParseArray } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import {
  Pill,
  Search,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Download,
  Sparkles,
  User,
} from 'lucide-react';
import { getPrescriptionsByPatient } from '@/app/actions/prescriptions';
import type { Prescription } from '@/types';

const statusColors: Record<Prescription['status'], string> = {
  active: 'bg-primary/10 text-primary border-primary/30',
  completed: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/30',
};

export default function PatientPrescriptionsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [allPrescriptions, setAllPrescriptions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      const res = await getPrescriptionsByPatient(user!.id);
      if (res.success && res.data) {
        setAllPrescriptions(res.data);
      }
    }
    
    loadData();
  }, [user]);

  if (!user) return null;

  const activePrescriptions = allPrescriptions.filter((rx) => rx.status === 'active');
  const pastPrescriptions = allPrescriptions.filter((rx) => rx.status !== 'active');

  const filteredActive = activePrescriptions.filter(
    (rx) =>
      rx.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.medications?.some((med: any) =>
        med.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const filteredPast = pastPrescriptions.filter(
    (rx) =>
      rx.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.medications?.some((med: any) =>
        med.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleRefillRequest = (prescriptionId: string) => {
    toast.success('Refill request sent to pharmacy');
  };

  const PrescriptionCard = ({ prescription }: { prescription: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg text-foreground">{prescription.diagnosis}</h3>
              {prescription.aiGenerated && (
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI-Generated
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {prescription.doctorName}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {format(parseISO(prescription.date), 'MMM d, yyyy')}
              </div>
              <Badge variant="outline" className={statusColors[prescription.status]}>
                {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {prescription.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRefillRequest(prescription.id)}
                className="gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Refill
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPrescription(prescription)}
                >
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    Prescription Details
                    {prescription.aiGenerated && (
                      <Badge variant="secondary" className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        AI-Generated
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    {prescription.diagnosis}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Prescription Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Prescribed By</p>
                      <p className="font-medium text-foreground">{prescription.doctorName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium text-foreground">
                        {format(parseISO(prescription.date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Valid Until</p>
                      <p className="font-medium text-foreground">
                        {prescription.validUntil && format(parseISO(prescription.validUntil), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant="outline" className={statusColors[prescription.status]}>
                        {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Medication Explanations */}
                  {prescription.medicationExplanations && prescription.medicationExplanations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Why These Medications?
                      </h4>
                      <div className="space-y-2">
                        {prescription.medicationExplanations.map((med: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                            <p className="font-semibold text-foreground mb-2">{med.name}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{med.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medications */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Medications</h4>
                    <div className="space-y-3">
                      {prescription.medications?.map((med: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 rounded-lg bg-muted/50 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Pill className="h-4 w-4 text-primary" />
                              <span className="font-medium text-foreground">
                                {med.name} {med.dosage}
                              </span>
                            </div>
                            {med.quantity && (
                              <Badge variant="secondary">{med.quantity} units</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {med.frequency}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {med.duration}
                            </div>
                          </div>
                          {med.instructions && (
                            <p className="text-sm text-muted-foreground">
                              {med.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Instructions</h4>
                    <p className="text-sm text-muted-foreground">{prescription.instructions}</p>
                  </div>

                  {/* Warnings */}
                  {(() => {
                    const warnings = safeParseArray(prescription.warnings);
                    if (warnings.length === 0) return null;
                    return (
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-chart-3" />
                          Warnings
                        </h4>
                        <ul className="space-y-1">
                          {warnings.map((warning, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-chart-3 mt-1">-</span>
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}

                  <div className="flex gap-3 pt-4 border-t border-border">
                    <Button variant="outline" className="flex-1 gap-2">
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                    {prescription.status === 'active' && (
                      <Button
                        className="flex-1 gap-2"
                        onClick={() => handleRefillRequest(prescription.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Request Refill
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Medications Preview */}
        <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
          {prescription.medications?.slice(0, 2).map((med: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <span className="text-foreground font-medium">{med.name} {med.dosage}</span>
              <span className="text-muted-foreground">- {med.frequency}</span>
            </div>
          ))}
          {prescription.medications && prescription.medications.length > 2 && (
            <p className="text-sm text-muted-foreground pl-6">
              +{prescription.medications.length - 2} more medications
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Prescriptions</h1>
        <p className="text-muted-foreground">View and manage your prescriptions</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by diagnosis or medication..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">
            Active ({filteredActive.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({filteredPast.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {filteredActive.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium text-foreground mb-2">No active prescriptions</h3>
                <p className="text-sm text-muted-foreground">
                  You don&apos;t have any active prescriptions at the moment
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredActive.map((prescription) => (
              <PrescriptionCard key={prescription.id} prescription={prescription} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {filteredPast.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium text-foreground mb-2">No past prescriptions</h3>
                <p className="text-sm text-muted-foreground">
                  Your prescription history will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPast.map((prescription) => (
              <PrescriptionCard key={prescription.id} prescription={prescription} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
