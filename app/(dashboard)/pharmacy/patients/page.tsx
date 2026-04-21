'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Phone, Mail, UserPlus } from 'lucide-react';

const pharmacyPatients = [
  { id: 'patient-1', name: 'John Doe', phone: '+91 98765 43210', email: 'john@example.com', status: 'Active' },
  { id: 'patient-2', name: 'Jane Smith', phone: '+91 91234 56789', email: 'jane@example.com', status: 'Active' },
  { id: 'patient-3', name: 'Bob Johnson', phone: '+91 99887 66554', email: 'bob@example.com', status: 'Inactive' },
];

export default function PharmacyPatientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground">View pharmacy patients and contact details.</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pharmacy Patient List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pharmacyPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.status}</TableCell>
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
