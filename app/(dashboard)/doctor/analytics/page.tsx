'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Pill,
  Activity,
  Clock,
  DollarSign,
  Stethoscope,
} from 'lucide-react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsPage() {
  // Mock data for charts
  const monthlyPatientsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Patients',
        data: [12, 19, 15, 25, 22, 30],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const consultationTrendsData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Consultations',
        data: [45, 52, 38, 61],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const diagnosisData = {
    labels: ['Hypertension', 'Diabetes', 'Migraine', 'Anxiety', 'Back Pain', 'Others'],
    datasets: [
      {
        data: [25, 20, 15, 12, 10, 18],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
      },
    ],
  };

  const stats = [
    {
      title: 'Total Patients',
      value: '1,247',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Consultations This Month',
      value: '156',
      change: '+8%',
      icon: Calendar,
      color: 'text-green-600',
    },
    {
      title: 'Prescriptions Issued',
      value: '89',
      change: '+15%',
      icon: Pill,
      color: 'text-purple-600',
    },
    {
      title: 'Average Consultation Time',
      value: '28 min',
      change: '-5%',
      icon: Clock,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Track your practice performance and patient insights
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Patients Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly New Patients</CardTitle>
            <CardDescription>
              Track new patient registrations over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Bar data={monthlyPatientsData} options={{ responsive: true }} />
          </CardContent>
        </Card>

        {/* Consultation Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Consultation Trends</CardTitle>
            <CardDescription>
              Weekly consultation volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Line data={consultationTrendsData} options={{ responsive: true }} />
          </CardContent>
        </Card>

        {/* Diagnosis Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Common Diagnoses</CardTitle>
            <CardDescription>
              Distribution of diagnoses in your practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Pie
                data={diagnosisData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest consultations and prescriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                type: 'Consultation',
                patient: 'John Doe',
                action: 'Completed video consultation',
                time: '2 hours ago',
                status: 'completed',
              },
              {
                type: 'Prescription',
                patient: 'Jane Smith',
                action: 'Issued prescription for hypertension',
                time: '4 hours ago',
                status: 'issued',
              },
              {
                type: 'Consultation',
                patient: 'Bob Johnson',
                action: 'Scheduled follow-up appointment',
                time: '1 day ago',
                status: 'scheduled',
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'Consultation' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {activity.type === 'Consultation' ? (
                      <Stethoscope className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Pill className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{activity.patient}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                    {activity.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}