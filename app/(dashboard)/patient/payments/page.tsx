'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import {
  CreditCard,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
} from 'lucide-react';
import { getBillsByPatient } from '@/app/actions/billing';
import { useEffect } from 'react';
import type { Bill } from '@/types';

const statusConfig: Record<Bill['status'], { label: string; color: string; icon: React.ElementType }> = {
  paid: { label: 'Paid', color: 'bg-primary/10 text-primary border-primary/30', icon: CheckCircle2 },
  pending: { label: 'Pending', color: 'bg-chart-3/10 text-chart-3 border-chart-3/30', icon: Clock },
  partial: { label: 'Partial', color: 'bg-chart-2/10 text-chart-2 border-chart-2/30', icon: AlertCircle },
  overdue: { label: 'Overdue', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: AlertCircle },
};

export default function PatientPaymentsPage() {
  const { user } = useAuth();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function loadBills() {
      const res = await getBillsByPatient(user!.id);
      if (res.success && res.data) {
        setBills(res.data);
      }
      setLoading(false);
    }
    loadBills();
  }, [user]);

  if (!user) return null;
  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading payments...</div>;

  const unpaidBills = bills.filter((bill) => bill.status !== 'paid');
  const paidBills = bills.filter((bill) => bill.status === 'paid');

  const totalOutstanding = unpaidBills.reduce(
    (sum, bill) => sum + (bill.totalAmount - bill.paidAmount),
    0
  );

  const handlePayment = (bill: Bill) => {
    // Mock payment - in real app, this would open Stripe checkout
    toast.success('Payment processed successfully');
    setIsPaymentOpen(false);
  };

  const BillCard = ({ bill }: { bill: any }) => {
    const status = statusConfig[bill.status];
    const StatusIcon = status.icon;
    const remainingAmount = bill.totalAmount - bill.paidAmount;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Invoice #{bill.id.toUpperCase()}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(bill.date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  ${remainingAmount.toFixed(2)}
                </p>
                {bill.paidAmount > 0 && bill.status !== 'paid' && (
                  <p className="text-sm text-muted-foreground">
                    of ${bill.totalAmount.toFixed(2)}
                  </p>
                )}
              </div>
              <Badge variant="outline" className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>
          </div>

          {/* Bill Items */}
          <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
            {bill.items?.slice(0, 3).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.description}</span>
                <span className="text-foreground">${item.total.toFixed(2)}</span>
              </div>
            ))}
            {bill.items && bill.items.length > 3 && (
              <p className="text-sm text-muted-foreground">
                +{bill.items.length - 3} more items
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 pt-4 border-t border-border/50 flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1" onClick={() => setSelectedBill(bill)}>
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Invoice #{bill.id.toUpperCase()}</DialogTitle>
                  <DialogDescription>
                    Created on {format(parseISO(bill.date), 'MMMM d, yyyy')}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Bill Items */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Items</h4>
                    <div className="space-y-2">
                      {bill.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-sm p-3 rounded-lg bg-muted/50">
                          <div>
                            <p className="text-foreground">{item.description}</p>
                            <p className="text-muted-foreground text-xs">
                              {item.quantity} x ${item.unitPrice.toFixed(2)}
                            </p>
                          </div>
                          <span className="font-medium text-foreground">${item.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">${bill.totalAmount.toFixed(2)}</span>
                    </div>
                    {bill.paidAmount > 0 && (
                      <div className="flex justify-between text-sm text-primary">
                        <span>Paid</span>
                        <span>-${bill.paidAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                      <span className="text-foreground">Amount Due</span>
                      <span className="text-foreground">${remainingAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Info */}
                  {bill.paymentMethod && (
                    <div className="p-3 rounded-lg bg-primary/10 text-sm">
                      <p className="text-foreground">
                        <span className="font-medium">Paid via:</span> {bill.paymentMethod}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 gap-2">
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                    {bill.status !== 'paid' && (
                      <Button className="flex-1" onClick={() => handlePayment(bill)}>
                        Pay ${remainingAmount.toFixed(2)}
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {bill.status !== 'paid' && (
              <Button className="flex-1 gap-2" onClick={() => handlePayment(bill)}>
                <CreditCard className="h-4 w-4" />
                Pay Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payments & Billing</h1>
        <p className="text-muted-foreground">Manage your healthcare bills and payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                <p className="text-2xl font-bold text-foreground">${totalOutstanding.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-chart-3" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Bills</p>
                <p className="text-2xl font-bold text-foreground">{unpaidBills.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid This Year</p>
                <p className="text-2xl font-bold text-foreground">
                  ${paidBills.reduce((sum, b) => sum + b.totalAmount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bills Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({unpaidBills.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Paid ({paidBills.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {unpaidBills.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-medium text-foreground mb-2">All caught up!</h3>
                <p className="text-sm text-muted-foreground">
                  You don&apos;t have any pending bills
                </p>
              </CardContent>
            </Card>
          ) : (
            unpaidBills.map((bill) => <BillCard key={bill.id} bill={bill} />)
          )}
        </TabsContent>

        <TabsContent value="paid" className="space-y-4">
          {paidBills.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium text-foreground mb-2">No payment history</h3>
                <p className="text-sm text-muted-foreground">
                  Your paid invoices will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            paidBills.map((bill) => <BillCard key={bill.id} bill={bill} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
