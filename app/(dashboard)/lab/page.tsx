'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  FlaskConical,
  Search,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  Play,
  FileText,
  Upload,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import { getLabTests, updateLabTestStatus } from '@/app/actions/lab';
import { useEffect } from 'react';
import type { LabResult } from '@/types';

export default function LabDashboardPage() {
  const { user } = useAuth();
  const [labResults, setLabResults] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTest, setSelectedTest] = useState<any | null>(null);
  const [resultInput, setResultInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const res = await getLabTests();
      if (res.success && res.data) {
        setLabResults(res.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const pendingTests = labResults.filter((l) => l.status === 'pending');
  const processingTests = labResults.filter((l) => l.status === 'processing' || l.status === 'in-progress');
  const completedTests = labResults.filter((l) => l.status === 'completed');

  const filteredTests = labResults.filter(
    (l) =>
      l.patientName.toLowerCase().includes(search.toLowerCase()) ||
      l.testName.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: LabResult['status']) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'outline', label: 'Pending' },
      processing: { variant: 'default', label: 'In Progress' },
      completed: { variant: 'secondary', label: 'Completed' },
    };
    const { variant, label } = config[status] || config.pending;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleStartProcessing = async (test: any) => {
    const res = await updateLabTestStatus(test.id, 'in-progress');
    if (res.success) {
      toast.success(`Started processing ${test.testName}`);
      setLabResults(prev => prev.map(t => t.id === test.id ? { ...t, status: 'in-progress' } : t));
    } else {
      toast.error('Failed to update status');
    }
  };

  const handleUploadResults = () => {
    toast.success('Results uploaded successfully');
    setSelectedTest(null);
    setResultInput('');
  };

  const TestCard = ({ test }: { test: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-chart-2/10 flex items-center justify-center">
              <FlaskConical className="h-6 w-6 text-chart-2" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">{test.testName}</h4>
                {getStatusBadge(test.status)}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                {test.patientName}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(test.date).toLocaleDateString()}
                </span>
                {test.doctorName && (
                  <span className="text-muted-foreground">
                    Ordered by: {test.doctorName}
                  </span>
                )}
              </div>
            </div>
          </div>
          {test.priority === 'urgent' && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Urgent
            </Badge>
          )}
        </div>

        {test.status === 'completed' && test.results && (
          <div className="mt-4 p-4 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Results</p>
              <Badge variant={test.results.isAbnormal ? 'destructive' : 'secondary'}>
                {test.results.isAbnormal ? 'Abnormal' : 'Normal'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Value: </span>
                <span className="text-foreground font-medium">
                  {test.results.value} {test.results.unit}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Range: </span>
                <span className="text-foreground">{test.results.referenceRange}</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {test.status === 'pending' && (
            <Button className="flex-1 gap-2" onClick={() => handleStartProcessing(test)}>
              <Play className="h-4 w-4" />
              Start Processing
            </Button>
          )}
          {test.status === 'processing' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex-1 gap-2" onClick={() => setSelectedTest(test)}>
                  <Upload className="h-4 w-4" />
                  Upload Results
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Test Results</DialogTitle>
                  <DialogDescription>
                    Enter results for {test.testName} - {test.patientName}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Value</label>
                      <Input placeholder="e.g., 120" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Unit</label>
                      <Input placeholder="e.g., mg/dL" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Reference Range</label>
                    <Input placeholder="e.g., 70-100 mg/dL" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Notes</label>
                    <Textarea
                      placeholder="Additional notes or observations..."
                      value={resultInput}
                      onChange={(e) => setResultInput(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1">
                      Cancel
                    </Button>
                    <Button className="flex-1 gap-2" onClick={handleUploadResults}>
                      <CheckCircle2 className="h-4 w-4" />
                      Submit Results
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {test.status === 'completed' && (
            <Button variant="outline" className="flex-1 gap-2">
              <FileText className="h-4 w-4" />
              View Full Report
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!user) return null;
  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading lab dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lab Dashboard</h1>
          <p className="text-muted-foreground">Process and manage lab tests</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tests or patients..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingTests.length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{processingTests.length}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedTests.length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {labResults.filter((l) => l.priority === 'urgent').length}
              </p>
              <p className="text-sm text-muted-foreground">Urgent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tests Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingTests.length})</TabsTrigger>
          <TabsTrigger value="processing">In Progress ({processingTests.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingTests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FlaskConical className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No pending tests</p>
              </CardContent>
            </Card>
          ) : (
            pendingTests.map((test) => <TestCard key={test.id} test={test} />)
          )}
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          {processingTests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No tests in progress</p>
              </CardContent>
            </Card>
          ) : (
            processingTests.map((test) => <TestCard key={test.id} test={test} />)
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedTests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No completed tests</p>
              </CardContent>
            </Card>
          ) : (
            completedTests.map((test) => <TestCard key={test.id} test={test} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
