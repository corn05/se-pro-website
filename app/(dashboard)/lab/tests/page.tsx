'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, FlaskConical, Clock, CheckCircle2, Loader2 } from 'lucide-react';

const labTests = [
  { id: 'test-1', name: 'Complete Blood Count', status: 'Pending', date: '2024-04-05' },
  { id: 'test-2', name: 'MRI Brain', status: 'In Progress', date: '2024-04-04' },
  { id: 'test-3', name: 'Liver Function Test', status: 'Completed', date: '2024-04-01' },
];

export default function LabTestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lab Tests</h1>
          <p className="text-muted-foreground">View and manage laboratory test requests.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search tests..." className="max-w-sm" />
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Test Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell>{test.name}</TableCell>
                    <TableCell>{test.date}</TableCell>
                    <TableCell>{test.status}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        {test.status === 'Completed' ? (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        ) : (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        View
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
