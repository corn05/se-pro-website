'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format, parseISO } from 'date-fns';
import {
  FileText,
  Search,
  Calendar,
  Stethoscope,
  FlaskConical,
  Pill,
  Syringe,
  Image,
  Download,
  Filter,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getMedicalRecordsByPatient } from '@/app/actions/records';
import { useEffect } from 'react';
import type { MedicalRecord } from '@/types';

const typeConfig: Record<MedicalRecord['type'], { icon: React.ElementType; label: string; color: string }> = {
  consultation: { icon: Stethoscope, label: 'Consultation', color: 'bg-primary/10 text-primary' },
  'lab-result': { icon: FlaskConical, label: 'Lab Result', color: 'bg-chart-2/10 text-chart-2' },
  prescription: { icon: Pill, label: 'Prescription', color: 'bg-chart-3/10 text-chart-3' },
  imaging: { icon: Image, label: 'Imaging', color: 'bg-chart-4/10 text-chart-4' },
  vaccination: { icon: Syringe, label: 'Vaccination', color: 'bg-chart-5/10 text-chart-5' },
};

export default function PatientMedicalRecordsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function loadRecords() {
      const res = await getMedicalRecordsByPatient(user!.id);
      if (res.success && res.data) {
        setRecords(res.data);
      }
      setLoading(false);
    }
    loadRecords();
  }, [user]);

  if (!user) return null;
  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading records...</div>;

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Sort by date, newest first
  const sortedRecords = [...filteredRecords].sort(
    (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
  );

  // Group by month
  const groupedRecords: Record<string, any[]> = {};
  sortedRecords.forEach((record) => {
    const monthKey = format(parseISO(record.date), 'MMMM yyyy');
    if (!groupedRecords[monthKey]) {
      groupedRecords[monthKey] = [];
    }
    groupedRecords[monthKey].push(record);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Medical Records</h1>
        <p className="text-muted-foreground">Your complete health history</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="consultation">Consultations</SelectItem>
            <SelectItem value="lab-result">Lab Results</SelectItem>
            <SelectItem value="prescription">Prescriptions</SelectItem>
            <SelectItem value="imaging">Imaging</SelectItem>
            <SelectItem value="vaccination">Vaccinations</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Records Timeline */}
      {sortedRecords.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-medium text-foreground mb-2">No records found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || typeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Your medical records will appear here'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedRecords).map(([month, monthRecords]) => (
            <div key={month}>
              <h2 className="text-lg font-semibold text-foreground mb-4 sticky top-16 bg-background py-2 z-10">
                {month}
              </h2>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden sm:block" />

                <div className="space-y-4">
                  {monthRecords.map((record) => {
                    const config = typeConfig[record.type];
                    const Icon = config.icon;

                    return (
                      <div key={record.id} className="flex gap-4">
                        {/* Timeline dot */}
                        <div className="hidden sm:flex items-start pt-1.5">
                          <div className={`h-12 w-12 rounded-xl ${config.color} flex items-center justify-center relative z-10`}>
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>

                        {/* Card */}
                        <Card className="flex-1 hover:shadow-md transition-shadow">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="flex gap-4 sm:hidden">
                                <div className={`h-10 w-10 rounded-lg ${config.color} flex items-center justify-center shrink-0`}>
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-foreground">{record.title}</h3>
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    {config.label}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="hidden sm:block space-y-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-foreground">{record.title}</h3>
                                  <Badge variant="secondary" className="text-xs">
                                    {config.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{record.description}</p>
                                {record.doctorName && (
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">Doctor:</span> {record.doctorName}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  {format(parseISO(record.date), 'MMM d, yyyy')}
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Download className="h-4 w-4" />
                                  <span className="sr-only">Download</span>
                                </Button>
                              </div>
                            </div>
                            
                            <div className="sm:hidden mt-3">
                              <p className="text-sm text-muted-foreground">{record.description}</p>
                              {record.doctorName && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  <span className="font-medium">Doctor:</span> {record.doctorName}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
