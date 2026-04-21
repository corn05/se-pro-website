'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Sparkles,
  User as UserIcon,
  AlertTriangle,
  Pill,
  CheckCircle2,
  Loader2,
  Save,
  Download,
  RefreshCw,
  Clock,
  Info,
  Plus,
  Trash2,
} from 'lucide-react';
import { getAllUsers } from '@/app/actions/users';
import { createPrescription } from '@/app/actions/prescriptions';
import type { Medication, User } from '@/types';
import { safeParseArray } from '@/lib/utils';
import { useEffect } from 'react';

interface MedicineInput {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface GeneratedPrescription {
  medicationExplanations: Array<{
    name: string;
    explanation: string;
  }>;
  prescriptionSummary: string;
  instructions: string;
  warnings: string[];
  followUpRecommendation?: string;
}

export default function AIPrescriptionPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<User[]>([]);

  useEffect(() => {
    async function fetchPatients() {
      const res = await getAllUsers();
      if (res.success && res.data) {
        setPatients(res.data.filter((u: any) => u.role === 'patient') as unknown as User[]);
      }
    }
    fetchPatients();
  }, []);

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState<MedicineInput[]>([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrescription, setGeneratedPrescription] = useState<GeneratedPrescription | null>(null);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const calculateAge = (dateOfBirth?: string): number => {
    if (!dateOfBirth) return 30;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleMedicineChange = (index: number, field: keyof MedicineInput, value: string) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index] = {
      ...updatedMedicines[index],
      [field]: value,
    };
    setMedicines(updatedMedicines);
  };

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const handleRemoveMedicine = (index: number) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index));
    } else {
      toast.error('At least one medicine is required');
    }
  };

  const handleGenerate = async () => {
    if (!selectedPatientId || !diagnosis) {
      toast.error('Please select a patient and enter a diagnosis');
      return;
    }

    const filledMedicines = medicines.filter(m => m.name.trim());
    if (filledMedicines.length === 0) {
      toast.error('Please add at least one medicine');
      return;
    }

    setIsGenerating(true);
    setGeneratedPrescription(null);

    try {
      const response = await fetch('/api/prescriptions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId,
          patientName: selectedPatient?.name,
          patientAge: calculateAge(selectedPatient?.dateOfBirth),
          patientGender: selectedPatient?.gender || 'not specified',
          allergies: selectedPatient?.allergies || [],
          diagnosis,
          medicines: filledMedicines,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prescription');
      }

      const data = await response.json();
      setGeneratedPrescription(data);
      toast.success('Prescription summary generated successfully');
    } catch (error) {
      toast.error('Failed to generate prescription summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePrescription = async () => {
    if (!selectedPatient || !generatedPrescription) {
      toast.error('No prescription to save');
      return;
    }

    try {
      const prescriptionData = {
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        doctorId: user?.id || 'doctor-1',
        doctorName: user?.name || 'Doctor',
        date: new Date().toISOString().split('T')[0],
        diagnosis,
        instructions: generatedPrescription.instructions,
        warnings: generatedPrescription.warnings ? JSON.stringify(generatedPrescription.warnings) : null,
        status: 'active',
        aiGenerated: true,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };

      const medsToSave = medicines.filter(m => m.name.trim());
      
      const result = await createPrescription(prescriptionData, medsToSave);
      
      if (result.success) {
        toast.success('Prescription saved and sent to pharmacy');
        
        // Reset form
        setSelectedPatientId('');
        setDiagnosis('');
        setMedicines([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
        setNotes('');
        setGeneratedPrescription(null);
      } else {
        toast.error('Failed to save prescription to database');
      }
    } catch (error) {
      toast.error('Failed to save prescription');
      console.error(error);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Prescription Summary Generator</h1>
          <p className="text-muted-foreground">
            Create intelligent prescription summaries based on medicines you prescribe
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-foreground">
            <p className="font-medium">Doctor-Directed Prescription Summary</p>
            <p className="text-muted-foreground mt-1">
              Enter the medicines you want to prescribe for your patient. The AI will generate a professional prescription summary with instructions and warnings for the prescribed medicines.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Patient & Medicines</CardTitle>
            <CardDescription>Enter patient details and medicines to prescribe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Selection */}
            <div className="space-y-2">
              <Label>Select Patient</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <span>{patient.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Patient Info Display */}
            {selectedPatient && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{selectedPatient.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Age: </span>
                    <span className="text-foreground">{calculateAge(selectedPatient.dateOfBirth)} years</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gender: </span>
                    <span className="text-foreground capitalize">{selectedPatient.gender || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Blood Type: </span>
                    <span className="text-foreground">{selectedPatient.bloodType || 'Unknown'}</span>
                  </div>
                </div>
                {(() => {
                  const allergies = safeParseArray(selectedPatient.allergies);
                  if (allergies.length === 0) return null;
                  return (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                      <span className="text-sm text-muted-foreground">Allergies:</span>
                      {allergies.map((allergy, idx) => (
                        <Badge key={idx} variant="destructive" className="text-xs gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            <Separator />

            {/* Diagnosis */}
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis *</Label>
              <Input
                id="diagnosis"
                placeholder="e.g., Type 2 Diabetes, Hypertension, Acute Bronchitis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>

            {/* Medicines List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Prescribe Medicines *</Label>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-1"
                  onClick={handleAddMedicine}
                >
                  <Plus className="h-3 w-3" />
                  Add Medicine
                </Button>
              </div>
              
              {medicines.map((medicine, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">Medicine {idx + 1}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveMedicine(idx)}
                      disabled={medicines.length === 1}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`medicine-name-${idx}`} className="text-xs">
                      Medicine Name *
                    </Label>
                    <Input
                      id={`medicine-name-${idx}`}
                      placeholder="e.g., Amoxicillin, Aspirin, Metformin"
                      value={medicine.name}
                      onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor={`medicine-dosage-${idx}`} className="text-xs">
                        Dosage *
                      </Label>
                      <Input
                        id={`medicine-dosage-${idx}`}
                        placeholder="e.g., 500mg, 2mg"
                        value={medicine.dosage}
                        onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`medicine-frequency-${idx}`} className="text-xs">
                        Frequency *
                      </Label>
                      <Input
                        id={`medicine-frequency-${idx}`}
                        placeholder="e.g., Once daily, Twice daily"
                        value={medicine.frequency}
                        onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`medicine-duration-${idx}`} className="text-xs">
                      Duration *
                    </Label>
                    <Input
                      id={`medicine-duration-${idx}`}
                      placeholder="e.g., 7 days, 30 days, Until symptoms resolve"
                      value={medicine.duration}
                      onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`medicine-instructions-${idx}`} className="text-xs">
                      Instructions (Optional)
                    </Label>
                    <Input
                      id={`medicine-instructions-${idx}`}
                      placeholder="e.g., Take with food, Avoid dairy products"
                      value={medicine.instructions || ''}
                      onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information relevant to the prescription..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              className="w-full gap-2"
              onClick={handleGenerate}
              disabled={isGenerating || !selectedPatientId || !diagnosis || medicines.every(m => !m.name.trim())}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Summary...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Prescription Summary
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Prescription Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Prescription Summary
            </CardTitle>
            <CardDescription>
              {generatedPrescription 
                ? 'Review the AI-generated prescription summary'
                : 'The prescription summary will appear here'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!generatedPrescription ? (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter patient details and medicines to generate a prescription summary</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* AI Badge */}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    AI-Generated
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Ready to Use
                  </Badge>
                </div>

                {/* Medication Explanations */}
                {generatedPrescription.medicationExplanations && generatedPrescription.medicationExplanations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <Pill className="h-4 w-4" />
                      Why These Medications?
                    </h4>
                    <div className="space-y-2">
                      {generatedPrescription.medicationExplanations.map((med, idx) => (
                        <div key={idx} className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                          <p className="font-semibold text-foreground mb-2">{med.name}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{med.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prescription Summary */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Prescription Summary</h4>
                  <div className="p-4 rounded-lg border border-border bg-muted/20 whitespace-pre-wrap text-sm text-muted-foreground font-mono">
                    {generatedPrescription.prescriptionSummary}
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">General Instructions</h4>
                  <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/30">
                    {generatedPrescription.instructions}
                  </p>
                </div>

                {/* Warnings */}
                {(() => {
                  const warnings = safeParseArray(generatedPrescription.warnings);
                  if (warnings.length === 0) return null;
                  return (
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-chart-3" />
                        Warnings
                      </h4>
                      <ul className="space-y-1">
                        {warnings.map((warning, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-muted-foreground flex items-start gap-2 p-2 rounded bg-chart-3/5"
                          >
                            <AlertTriangle className="h-3 w-3 text-chart-3 shrink-0 mt-0.5" />
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}

                {/* Follow-up */}
                {generatedPrescription.followUpRecommendation && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Follow-up Recommendation</h4>
                    <p className="text-sm text-muted-foreground p-3 rounded-lg bg-primary/5 border border-primary/20">
                      {generatedPrescription.followUpRecommendation}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 gap-2">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button className="flex-1 gap-2" onClick={handleSavePrescription}>
                    <CheckCircle2 className="h-4 w-4" />
                    Save & Issue
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  By saving, you confirm that you have reviewed this prescription summary.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
