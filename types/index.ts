export type UserRole = 'patient' | 'doctor' | 'admin' | 'pharmacy' | 'lab';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  // Patient specific
  bloodType?: string;
  allergies?: string[];
  emergencyContact?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  // Doctor specific
  specialization?: string;
  licenseNumber?: string;
  department?: string;
  experience?: number;
  consultationFee?: number;
  // Pharmacy specific
  pharmacyName?: string;
  pharmacyLicense?: string;
  // Lab specific
  labName?: string;
  labLicense?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorDepartment?: string;
  doctorAddress?: string;
  doctorPhone?: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress';
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  notes?: string;
  symptoms?: string[];
  diagnosis?: string;
  fee: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentId?: string;
  date: string;
  diagnosis: string;
  medications: Medication[];
  instructions: string;
  warnings?: string[];
  status: 'active' | 'completed' | 'cancelled';
  aiGenerated: boolean;
  validUntil: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity?: number;
}

export interface LabTest {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  testName: string;
  testType: string;
  date: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  results?: LabResult[];
  reportUrl?: string;
  fee: number;
  paymentStatus: 'pending' | 'paid';
  priority: 'normal' | 'urgent';
}

export interface LabResult {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low' | 'critical';
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  type: 'consultation' | 'lab-result' | 'prescription' | 'imaging' | 'vaccination';
  title: string;
  description: string;
  doctorName?: string;
  attachments?: string[];
  data?: Record<string, unknown>;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'medication' | 'equipment' | 'supplies';
  sku: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  price: number;
  supplier: string;
  expiryDate?: string;
  batchNumber?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired';
}

export interface PharmacyOrder {
  id: string;
  prescriptionId: string;
  patientId: string;
  patientName: string;
  medications: Medication[];
  status: 'pending' | 'processing' | 'ready' | 'dispensed' | 'cancelled';
  date: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid';
}

export interface Department {
  id: string;
  name: string;
  description: string;
  head: string;
  staffCount: number;
  location: string;
  status: 'active' | 'inactive';
}

export interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  dueDate: string;
  items: BillItem[];
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  paymentMethod?: string;
}

export interface BillItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: 'consultation' | 'medication' | 'lab-test' | 'procedure' | 'other';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  date: string;
  link?: string;
}

export interface DashboardStats {
  totalPatients?: number;
  totalDoctors?: number;
  totalAppointments?: number;
  pendingAppointments?: number;
  completedAppointments?: number;
  totalRevenue?: number;
  pendingOrders?: number;
  pendingTests?: number;
  lowStockItems?: number;
}

export interface PrescriptionGenerationRequest {
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  allergies: string[];
  currentMedications: string[];
  diagnosis: string;
  symptoms: string[];
  notes?: string;
}

export interface PrescriptionGenerationResponse {
  medications: Medication[];
  instructions: string;
  warnings: string[];
  followUpRecommendation?: string;
}
