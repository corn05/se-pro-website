'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Award,
  Clock,
  Search,
  Filter,
} from 'lucide-react';
import { getUsersByRole } from '@/app/actions/users';

interface Doctor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  specialization: string;
  qualification: string;
  city: string;
  address: string;
  consultationFee: number;
  experience: number;
}

export default function NeurologistsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const res = await getUsersByRole('doctor');
      if (res.success && res.data) {
        const neurologists = res.data.filter((d: any) => d.specialization === 'Neurology' || d.department === 'Neurology');
        setDoctors(neurologists);
        
        // Extract unique cities
        const uniqueCities = [...new Set(neurologists.map((d: any) => d.city).filter(Boolean))].sort();
        setCities(uniqueCities as string[]);
        
        setFilteredDoctors(neurologists);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    let filtered = doctors;

    if (searchQuery) {
      filtered = filtered.filter((doc) =>
        (doc.name && doc.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc.address && doc.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc.qualifications && doc.qualifications.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCity) {
      filtered = filtered.filter((doc) => doc.city === selectedCity);
    }

    setFilteredDoctors(filtered);
  }, [searchQuery, selectedCity, doctors]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-full bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Neurologists Directory</h1>
        <p className="text-muted-foreground">
          Find and connect with specialist neurologists across Andhra Pradesh
        </p>
      </div>

      {/* Stats */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="text-3xl font-bold text-foreground">{filteredDoctors.length}</div>
          <p className="text-sm text-muted-foreground mt-1">Neurologists found</p>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, location, or qualification..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by city" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Cities</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No neurologists found matching your criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{doctor.name}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary" className="mt-2">
                    {doctor.qualifications}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Experience */}
                <div className="flex items-start gap-3">
                  <Award className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Experience</p>
                    <p className="text-muted-foreground">{doctor.experience} years</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">{doctor.city}</p>
                    <p className="text-muted-foreground text-xs">{doctor.address}</p>
                  </div>
                </div>

                {/* Consultation Fee */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Consultation Fee</p>
                    <p className="font-semibold text-foreground">
                      ₹{doctor.consultationFee}
                    </p>
                  </div>
                  <Button size="sm" className="gap-2">
                    <Clock className="h-4 w-4" />
                    Book Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
