'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Pill,
  Package,
  ShoppingCart,
  Clock,
  CheckCircle2,
  Search,
  User,
  Calendar,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { getPharmacyOrders, getInventory, updateOrderStatus } from '@/app/actions/pharmacy';
import type { PharmacyOrder } from '@/types';

export default function PharmacyDashboardPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [processingOrders, setProcessingOrders] = useState<any[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);

  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [ordersRes, invRes] = await Promise.all([
        getPharmacyOrders(),
        getInventory()
      ]);

      if (ordersRes.success && ordersRes.data) {
        const allOrders = ordersRes.data;
        setOrders(allOrders);
        setPendingOrders(allOrders.filter((o: any) => o.status === 'pending'));
        setProcessingOrders(allOrders.filter((o: any) => o.status === 'processing'));
        setCompletedOrders(allOrders.filter((o: any) => o.status === 'completed' || o.status === 'ready'));
      }
      if (invRes.success && invRes.data) {
        setInventory(invRes.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const lowStockItems = inventory.filter((i) => i.quantity <= i.reorderLevel);

  const filteredOrders = orders.filter(
    (o) =>
      o.patientName.toLowerCase().includes(search.toLowerCase()) ||
      o.medications.some((m: any) => m.name.toLowerCase().includes(search.toLowerCase()))
  );

  const getStatusBadge = (status: PharmacyOrder['status']) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'outline', label: 'Pending' },
      processing: { variant: 'default', label: 'Processing' },
      ready: { variant: 'secondary', label: 'Ready for Pickup' },
      completed: { variant: 'secondary', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    const { variant, label } = config[status] || config.pending;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleProcessOrder = async (orderId: string) => {
    const res = await updateOrderStatus(orderId, 'processing');
    if (res.success) {
      toast.success('Order is now being processed');
      setPendingOrders(prev => prev.filter(o => o.id !== orderId));
      setProcessingOrders(prev => [...prev, res.data as any]);
    } else {
      toast.error('Failed to process order');
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    const res = await updateOrderStatus(orderId, 'ready');
    if (res.success) {
      toast.success('Order marked as ready for pickup');
      setProcessingOrders(prev => prev.filter(o => o.id !== orderId));
      setCompletedOrders(prev => [...prev, res.data as any]);
    } else {
      toast.error('Failed to complete order');
    }
  };

  const OrderCard = ({ order }: { order: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">{order.patientName}</h4>
                {getStatusBadge(order.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(order.orderDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
          <p className="text-lg font-semibold text-foreground">${order.totalAmount.toFixed(2)}</p>
        </div>

        <div className="mt-4 space-y-2">
          {order.medications?.map((med: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {med.name} - {med.dosage}
                </span>
              </div>
              <Badge variant="outline">{med.quantity} units</Badge>
            </div>
          ))}
        </div>

        {order.status === 'pending' && (
          <div className="mt-4 flex gap-2">
            <Button className="flex-1 gap-2" onClick={() => handleProcessOrder(order.id)}>
              <Package className="h-4 w-4" />
              Process Order
            </Button>
          </div>
        )}

        {order.status === 'processing' && (
          <div className="mt-4 flex gap-2">
            <Button className="flex-1 gap-2" onClick={() => handleCompleteOrder(order.id)}>
              <CheckCircle2 className="h-4 w-4" />
              Mark Ready
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!user) return null;
  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading pharmacy dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pharmacy Dashboard</h1>
          <p className="text-muted-foreground">Manage prescriptions and inventory</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders or medications..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingOrders.length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{processingOrders.length}</p>
              <p className="text-sm text-muted-foreground">Processing</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedOrders.length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className={lowStockItems.length > 0 ? 'border-destructive/50' : ''}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{lowStockItems.length}</p>
              <p className="text-sm text-muted-foreground">Low Stock</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium text-foreground">Low Stock Alert</p>
                  <p className="text-sm text-muted-foreground">
                    {lowStockItems.length} items need to be reordered
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild className="gap-2">
                <Link href="/pharmacy/inventory">
                  View Inventory
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="processing">Processing ({processingOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No pending orders</p>
              </CardContent>
            </Card>
          ) : (
            pendingOrders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          {processingOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No orders being processed</p>
              </CardContent>
            </Card>
          ) : (
            processingOrders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No completed orders</p>
              </CardContent>
            </Card>
          ) : (
            completedOrders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
