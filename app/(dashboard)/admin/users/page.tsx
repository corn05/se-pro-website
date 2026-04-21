'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Search,
  Users,
  UserPlus,
  User,
  Stethoscope,
  Building2,
  FlaskConical,
  ShieldCheck,
  Mail,
  Phone,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAllUsers } from '@/app/actions/users';
import type { User as UserType } from '@/types';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newUserRole, setNewUserRole] = useState<UserType['role']>('patient');

  useEffect(() => {
    async function loadUsers() {
      const result = await getAllUsers();
      if (result.success && result.data) {
        setAllUsers(result.data as unknown as UserType[]);
      }
    }
    loadUsers();
  }, []);

  const patients = allUsers.filter(u => u.role === 'patient');
  const doctors = allUsers.filter(u => u.role === 'doctor');
  const staffUsers = allUsers.filter(u => ['admin', 'lab', 'pharmacy'].includes(u.role));

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const patientUsers = filteredUsers.filter((u) => u.role === 'patient');
  const doctorUsers = filteredUsers.filter((u) => u.role === 'doctor');
  const filteredStaffUsers = filteredUsers.filter((u) => ['admin', 'lab', 'pharmacy'].includes(u.role));

  const getRoleBadge = (role: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'outline'; icon: React.ElementType; label: string }> = {
      patient: { variant: 'secondary', icon: User, label: 'Patient' },
      doctor: { variant: 'default', icon: Stethoscope, label: 'Doctor' },
      admin: { variant: 'outline', icon: ShieldCheck, label: 'Admin' },
      pharmacy: { variant: 'outline', icon: Building2, label: 'Pharmacy' },
      lab: { variant: 'outline', icon: FlaskConical, label: 'Lab' },
    };
    const { variant, icon: Icon, label } = config[role] || config.patient;
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const handleAddUser = () => {
    toast.success('User created successfully');
    setShowAddDialog(false);
  };

  const handleDeleteUser = (userId: string) => {
    toast.success('User deleted successfully');
  };

  const handleToggleStatus = (userId: string, active: boolean) => {
    toast.success(active ? 'User activated' : 'User deactivated');
  };

  const UserRow = ({ userData }: { userData: (typeof allUsers)[0] }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {userData.name.split(' ').map((n) => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{userData.name}</p>
            {getRoleBadge(userData.role)}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {userData.email}
            </span>
          </div>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Edit className="h-4 w-4 mr-2" />
            Edit User
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleToggleStatus(userData.id, true)}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Activate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleToggleStatus(userData.id, false)}>
            <XCircle className="h-4 w-4 mr-2" />
            Deactivate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => handleDeleteUser(userData.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage all system users</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 shrink-0">
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account in the system</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="Enter full name" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="Enter email address" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as UserType['role'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="lab">Lab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Phone (Optional)</Label>
                  <Input placeholder="Enter phone number" />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleAddUser}>
                    Create User
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
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{allUsers.length}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{patients.length}</p>
              <p className="text-sm text-muted-foreground">Patients</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-chart-1" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{doctors.length}</p>
              <p className="text-sm text-muted-foreground">Doctors</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{staffUsers.length}</p>
              <p className="text-sm text-muted-foreground">Staff</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({filteredUsers.length})</TabsTrigger>
          <TabsTrigger value="patients">Patients ({patientUsers.length})</TabsTrigger>
          <TabsTrigger value="doctors">Doctors ({doctorUsers.length})</TabsTrigger>
          <TabsTrigger value="staff">Staff ({filteredStaffUsers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No users found</p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((u) => <UserRow key={u.id} userData={u} />)
          )}
        </TabsContent>

        <TabsContent value="patients" className="space-y-3">
          {patientUsers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No patients found</p>
              </CardContent>
            </Card>
          ) : (
            patientUsers.map((u) => <UserRow key={u.id} userData={u} />)
          )}
        </TabsContent>

        <TabsContent value="doctors" className="space-y-3">
          {doctorUsers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Stethoscope className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No doctors found</p>
              </CardContent>
            </Card>
          ) : (
            doctorUsers.map((u) => <UserRow key={u.id} userData={u} />)
          )}
        </TabsContent>

        <TabsContent value="staff" className="space-y-3">
          {filteredStaffUsers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No staff found</p>
              </CardContent>
            </Card>
          ) : (
            filteredStaffUsers.map((u) => <UserRow key={u.id} userData={u} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
