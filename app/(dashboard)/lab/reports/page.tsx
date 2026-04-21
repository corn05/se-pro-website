'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Calendar, CheckCircle2 } from 'lucide-react';

const labReports = [
  { id: 'report-1', name: 'CBC Result', patient: 'John Doe', date: '2024-04-02', status: 'Available' },
  { id: 'report-2', name: 'MRI Findings', patient: 'Jane Smith', date: '2024-03-30', status: 'Available' },
  { id: 'report-3', name: 'LFT Report', patient: 'Bob Johnson', date: '2024-03-28', status: 'Processing' },
];

export default function LabReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lab Reports</h1>
        <p className="text-muted-foreground">Review and download completed laboratory reports.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Lab Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.name}</TableCell>
                    <TableCell>{report.patient}</TableCell>
                    <TableCell>{report.date}</TableCell>
                    <TableCell>{report.status}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" disabled={report.status !== 'Available'}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
