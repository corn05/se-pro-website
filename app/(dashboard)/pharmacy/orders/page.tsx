'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardList, Truck, CheckCircle2, XCircle } from 'lucide-react';

const pharmacyOrders = [
  { id: 'order-1', patient: 'John Doe', status: 'Pending', expected: '2024-04-06' },
  { id: 'order-2', patient: 'Jane Smith', status: 'Ready', expected: '2024-04-05' },
  { id: 'order-3', patient: 'Bob Johnson', status: 'Delivered', expected: '2024-04-03' },
];

export default function PharmacyOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pharmacy Orders</h1>
        <p className="text-muted-foreground">Manage medication orders and delivery status.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pharmacyOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.patient}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{order.expected}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <Truck className="h-4 w-4 mr-2" />
                        Track
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
