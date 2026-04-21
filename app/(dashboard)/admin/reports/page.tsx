'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Activity,
  Download,
  FileText,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { getDashboardStats } from '@/app/actions/admin';
import { useEffect, useState } from 'react';

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    async function loadStats() {
      const result = await getDashboardStats();
      if (result.success && result.data) {
        setStatsData(result.data);
      } else {
        console.error("Reports stats error:", result.error);
        setStatsData({ _error: result.error || 'Failed to load' });
      }
    }
    loadStats();
  }, [user]);

  if (!user) return null;
  if (!statsData) return <div className="p-8 text-center text-muted-foreground">Loading reports...</div>;
  if (statsData._error) return <div className="p-8 text-center text-destructive">Error: {statsData._error}</div>;

  const kpis = [
    {
      title: 'Total Revenue',
      value: `$${statsData.totalRevenue.toLocaleString()}`,
      change: '+18.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Patient Growth',
      value: `${statsData.totalPatients}`,
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-chart-1',
      bg: 'bg-chart-1/10',
    },
    {
      title: 'Appointments',
      value: `${statsData.totalAppointments}`,
      change: '+8.3%',
      trend: 'up',
      icon: Calendar,
      color: 'text-chart-2',
      bg: 'bg-chart-2/10',
    },
    {
      title: 'Avg. Wait Time',
      value: '12 min',
      change: '-15%',
      trend: 'down',
      icon: Activity,
      color: 'text-chart-4',
      bg: 'bg-chart-4/10',
    },
  ];

  const reports = [
    {
      title: 'Monthly Revenue Report',
      description: 'Detailed breakdown of revenue by department',
      type: 'Financial',
      lastGenerated: '2 hours ago',
    },
    {
      title: 'Patient Demographics',
      description: 'Age, gender, and location distribution',
      type: 'Analytics',
      lastGenerated: '1 day ago',
    },
    {
      title: 'Appointment Statistics',
      description: 'Booking rates, cancellations, and no-shows',
      type: 'Operations',
      lastGenerated: '3 hours ago',
    },
    {
      title: 'Prescription Analysis',
      description: 'Most prescribed medications and trends',
      type: 'Medical',
      lastGenerated: '5 hours ago',
    },
    {
      title: 'Lab Results Summary',
      description: 'Test volumes and processing times',
      type: 'Operations',
      lastGenerated: '12 hours ago',
    },
    {
      title: 'Staff Performance',
      description: 'Doctor productivity and patient feedback',
      type: 'HR',
      lastGenerated: '1 week ago',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">View system performance and generate reports</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="month">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-primary" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-primary" />
                    )}
                    <span className="text-primary">{kpi.change}</span>
                    <span className="text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className={`h-12 w-12 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Charts Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Monthly revenue over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg bg-muted/30">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Revenue Chart</p>
                <p className="text-sm">Chart visualization would appear here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-chart-1" />
              Appointment Distribution
            </CardTitle>
            <CardDescription>Appointments by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg bg-muted/30">
              <div className="text-center text-muted-foreground">
                <PieChart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Distribution Chart</p>
                <p className="text-sm">Chart visualization would appear here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>Generate and download system reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <div
                key={report.title}
                className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="outline">{report.type}</Badge>
                </div>
                <h4 className="font-medium text-foreground mb-1">{report.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Last: {report.lastGenerated}</span>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
