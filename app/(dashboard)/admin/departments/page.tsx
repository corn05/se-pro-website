'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Users,
  UserPlus,
  Settings,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
  description: string;
  head: string;
  staffCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function DepartmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  // Mock departments data
  const [departments, setDepartments] = useState<Department[]>([
    {
      id: 'dept-1',
      name: 'Cardiology',
      description: 'Heart and cardiovascular diseases treatment',
      head: 'Dr. Sarah Johnson',
      staffCount: 12,
      status: 'active',
      createdAt: '2023-01-15',
    },
    {
      id: 'dept-2',
      name: 'Neurology',
      description: 'Brain and nervous system disorders',
      head: 'Dr. Michael Chen',
      staffCount: 8,
      status: 'active',
      createdAt: '2023-02-20',
    },
    {
      id: 'dept-3',
      name: 'Pediatrics',
      description: 'Child healthcare and development',
      head: 'Dr. Emily Davis',
      staffCount: 15,
      status: 'active',
      createdAt: '2023-03-10',
    },
    {
      id: 'dept-4',
      name: 'Orthopedics',
      description: 'Bone and joint treatment',
      head: 'Dr. Robert Wilson',
      staffCount: 6,
      status: 'inactive',
      createdAt: '2023-04-05',
    },
  ]);

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dept.head.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || dept.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddDepartment = (newDept: Omit<Department, 'id' | 'createdAt'>) => {
    const department: Department = {
      ...newDept,
      id: `dept-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDepartments([...departments, department]);
    setIsAddDialogOpen(false);
  };

  const handleEditDepartment = (updatedDept: Department) => {
    setDepartments(departments.map(dept =>
      dept.id === updatedDept.id ? updatedDept : dept
    ));
    setEditingDepartment(null);
  };

  const handleDeleteDepartment = (id: string) => {
    setDepartments(departments.filter(dept => dept.id !== id));
  };

  const DepartmentDialog = ({
    department,
    onSave,
    onClose
  }: {
    department?: Department;
    onSave: (dept: any) => void;
    onClose: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: department?.name || '',
      description: department?.description || '',
      head: department?.head || '',
      staffCount: department?.staffCount || 0,
      status: department?.status || 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
        ...formData,
        ...(department && { id: department.id, createdAt: department.createdAt }),
      });
    };

    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {department ? 'Edit Department' : 'Add New Department'}
          </DialogTitle>
          <DialogDescription>
            {department ? 'Update department information' : 'Create a new department'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="head" className="text-right">
                Head
              </Label>
              <Input
                id="head"
                value={formData.head}
                onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="staffCount" className="text-right">
                Staff Count
              </Label>
              <Input
                id="staffCount"
                type="number"
                value={formData.staffCount}
                onChange={(e) => setFormData({ ...formData, staffCount: parseInt(e.target.value) })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {department ? 'Update' : 'Add'} Department
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Departments</h1>
          <p className="text-muted-foreground">
            Manage hospital departments and their staff
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DepartmentDialog
            onSave={handleAddDepartment}
            onClose={() => setIsAddDialogOpen(false)}
          />
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search departments or heads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((department) => (
          <Card key={department.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{department.name}</CardTitle>
                    <Badge variant={department.status === 'active' ? 'default' : 'secondary'}>
                      {department.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingDepartment(department)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteDepartment(department.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {department.description}
              </p>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Head:</span>
                  <span className="text-sm">{department.head}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Staff:</span>
                  <span className="text-sm">{department.staffCount} members</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDepartments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No departments found</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first department.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      {editingDepartment && (
        <Dialog open={!!editingDepartment} onOpenChange={() => setEditingDepartment(null)}>
          <DepartmentDialog
            department={editingDepartment}
            onSave={handleEditDepartment}
            onClose={() => setEditingDepartment(null)}
          />
        </Dialog>
      )}
    </div>
  );
}