'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
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
import { Progress } from '@/components/ui/progress';
import { format, parseISO } from 'date-fns';
import {
  FlaskConical,
  Search,
  Calendar,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowDown,
  User,
} from 'lucide-react';
import { getLabTestsByPatient } from '@/app/actions/lab';
import { useEffect } from 'react';
import type { LabTest, LabResult } from '@/types';

const statusConfig: Record<LabTest['status'], { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-chart-3/10 text-chart-3 border-chart-3/30' },
  'in-progress': { label: 'Processing', color: 'bg-chart-2/10 text-chart-2 border-chart-2/30' },
  completed: { label: 'Completed', color: 'bg-primary/10 text-primary border-primary/30' },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive border-destructive/30' },
};

const resultStatusConfig: Record<LabResult['status'], { icon: React.ElementType; color: string }> = {
  normal: { icon: CheckCircle2, color: 'text-primary' },
  high: { icon: ArrowUp, color: 'text-chart-4' },
  low: { icon: ArrowDown, color: 'text-chart-2' },
  critical: { icon: AlertTriangle, color: 'text-destructive' },
};

export default function PatientLabResultsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const [labTests, setLabTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      const res = await getLabTestsByPatient(user!.id);
      if (res.success && res.data) {
        setLabTests(res.data);
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  if (!user) return null;
  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading lab results...</div>;

  const completedTests = labTests.filter((test) => test.status === 'completed');
  const pendingTests = labTests.filter((test) => test.status !== 'completed');

  const filteredCompleted = completedTests.filter(
    (test) =>
      test.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.testType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPending = pendingTests.filter(
    (test) =>
      test.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.testType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TestCard = ({ test }: { test: any }) => {
    const status = statusConfig[test.status];
    const hasAbnormalResults = test.results?.some(
      (r: any) => r.status === 'high' || r.status === 'low' || r.status === 'critical'
    );

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex gap-4">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${
                test.status === 'completed' ? 'bg-primary/10' : 'bg-chart-3/10'
              }`}>
                <FlaskConical className={`h-6 w-6 ${
                  test.status === 'completed' ? 'text-primary' : 'text-chart-3'
                }`} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{test.testName}</h3>
                  {test.priority === 'urgent' && (
                    <Badge variant="destructive" className="text-xs">Urgent</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{test.type}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Badge variant="outline" className={status.color}>
                    {status.label}
                  </Badge>
                  {hasAbnormalResults && (
                    <Badge variant="outline" className="border-chart-3/30 text-chart-3 gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Review Required
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {format(parseISO(test.date), 'MMM d, yyyy')}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {test.doctorName}
              </div>
            </div>
          </div>

          {/* Results Preview for Completed Tests */}
          {test.status === 'completed' && test.results && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-foreground">Results Summary</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">View Details</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                      <DialogTitle>{test.testName}</DialogTitle>
                      <DialogDescription>
                        {test.type} - {format(parseISO(test.date), 'MMMM d, yyyy')}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                      {/* Test Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Ordered By</p>
                          <p className="font-medium text-foreground">{test.doctorName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium text-foreground">
                            {format(parseISO(test.date), 'MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>

                      {/* Results */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-foreground">Test Results</h4>
                        <div className="space-y-3">
                          {test.results?.map((result: any, idx: number) => {
                            const config = resultStatusConfig[result.status as LabResult['status']] || resultStatusConfig['normal'];
                            const Icon = config.icon;
                            return (
                              <div
                                key={idx}
                                className={`p-4 rounded-lg border ${
                                  result.status === 'critical'
                                    ? 'border-destructive/30 bg-destructive/5'
                                    : result.status !== 'normal'
                                    ? 'border-chart-3/30 bg-chart-3/5'
                                    : 'border-border/50 bg-muted/30'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-foreground">{result.parameter}</span>
                                  <div className="flex items-center gap-2">
                                    <Icon className={`h-4 w-4 ${config.color}`} />
                                    <Badge
                                      variant="outline"
                                      className={
                                        result.status === 'normal'
                                          ? 'border-primary/30 text-primary'
                                          : result.status === 'critical'
                                          ? 'border-destructive/30 text-destructive'
                                          : 'border-chart-3/30 text-chart-3'
                                      }
                                    >
                                      {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Value</p>
                                    <p className="font-medium text-foreground">
                                      {result.value} {result.unit}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Reference Range</p>
                                    <p className="font-medium text-foreground">{result.referenceRange}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <Button variant="outline" className="w-full gap-2">
                        <Download className="h-4 w-4" />
                        Download Report
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-2">
                {test.results?.slice(0, 3).map((result: any, idx: number) => {
                  const config = resultStatusConfig[result.status as LabResult['status']] || resultStatusConfig['normal'];
                  const Icon = config.icon;
                  return (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        <span className="text-foreground">{result.parameter}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {result.value} {result.unit}
                      </span>
                    </div>
                  );
                })}
                {test.results && test.results.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center pt-1">
                    +{test.results.length - 3} more parameters
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Progress for Pending Tests */}
          {test.status !== 'completed' && test.status !== 'cancelled' && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {test.status === 'pending' ? 'Awaiting sample collection' : 'Processing sample'}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {test.status === 'pending' ? '0%' : '50%'}
                </span>
              </div>
              <Progress value={test.status === 'pending' ? 0 : 50} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lab Results</h1>
        <p className="text-muted-foreground">View your lab test results and reports</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by test name or type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="completed" className="space-y-6">
        <TabsList>
          <TabsTrigger value="completed">
            Completed ({filteredCompleted.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({filteredPending.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="completed" className="space-y-4">
          {filteredCompleted.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FlaskConical className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium text-foreground mb-2">No completed tests</h3>
                <p className="text-sm text-muted-foreground">
                  Your completed lab results will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredCompleted.map((test) => <TestCard key={test.id} test={test} />)
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filteredPending.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium text-foreground mb-2">No pending tests</h3>
                <p className="text-sm text-muted-foreground">
                  You don&apos;t have any pending lab tests
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPending.map((test) => <TestCard key={test.id} test={test} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
