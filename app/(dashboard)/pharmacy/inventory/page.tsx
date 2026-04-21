'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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
  Package,
  Search,
  Plus,
  AlertTriangle,
  Pill,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInventory } from '@/app/actions/pharmacy';
import { useEffect } from 'react';
import type { InventoryItem } from '@/types';

export default function PharmacyInventoryPage() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      const res = await getInventory();
      if (res.success && res.data) {
        setInventory(res.data);
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  if (!user) return null;
  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading inventory...</div>;

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockItems = inventory.filter((i) => i.quantity <= i.minStock);
  const totalValue = inventory.reduce((sum, item) => sum + item.quantity * (item.price ?? 0), 0);

  const getStockStatus = (item: InventoryItem) => {
    const reorderLevel = item.minStock;
    const percentage = reorderLevel > 0 ? (item.quantity / (reorderLevel * 3)) * 100 : 0;
    if (item.quantity <= reorderLevel) {
      return { label: 'Low Stock', variant: 'destructive' as const, percentage: Math.min(percentage, 100) };
    }
    if (item.quantity <= reorderLevel * 2) {
      return { label: 'Medium', variant: 'outline' as const, percentage: Math.min(percentage, 100) };
    }
    return { label: 'In Stock', variant: 'default' as const, percentage: Math.min(percentage, 100) };
  };

  const handleAddItem = () => {
    toast.success('Item added to inventory');
    setShowAddDialog(false);
  };

  const handleReorder = (itemId: string) => {
    toast.success('Reorder request submitted');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage medication stock</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 shrink-0">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Inventory Item</DialogTitle>
                <DialogDescription>Add a new medication to the inventory</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Medication Name</Label>
                  <Input placeholder="Enter medication name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input placeholder="e.g., Antibiotics" />
                  </div>
                  <div className="space-y-2">
                    <Label>Dosage</Label>
                    <Input placeholder="e.g., 500mg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Price ($)</Label>
                    <Input type="number" step="0.01" placeholder="0.00" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Reorder Level</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleAddItem}>
                    Add Item
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{inventory.length}</p>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-chart-1" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">${totalValue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
          </CardContent>
        </Card>
        <Card>
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
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <Pill className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {new Set(inventory.map((i) => i.category)).size}
              </p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory List */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            {filteredInventory.length} items found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInventory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No items found</p>
              </div>
            ) : (
              filteredInventory.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Pill className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-foreground">{item.name}</h4>
                            <Badge variant="outline">{item.dosage}</Badge>
                            <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{item.category}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-muted-foreground">
                              Qty: <span className="text-foreground font-medium">{item.quantity}</span>
                            </span>
                            <span className="text-muted-foreground">
                              Price: <span className="text-foreground font-medium">${(item.price ?? 0).toFixed(2)}</span>
                            </span>
                            {item.expiryDate && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                Exp: {new Date(item.expiryDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div className="mt-3 max-w-xs">
                            <Progress value={stockStatus.percentage} className="h-2" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.quantity <= item.reorderLevel && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => handleReorder(item.id)}
                          >
                            <Plus className="h-3 w-3" />
                            Reorder
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
