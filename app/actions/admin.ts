"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getDepartments() {
  try {
    const depts = await prisma.department.findMany({
      orderBy: { name: 'asc' },
    });
    return { success: true, data: depts };
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    return { success: false, error: 'Failed to fetch departments' };
  }
}

export async function updateDepartmentStatus(id: string, status: string) {
  try {
    const dept = await prisma.department.update({
      where: { id },
      data: { status },
    });
    revalidatePath('/admin');
    return { success: true, data: dept };
  } catch (error) {
    console.error('Failed to update department status:', error);
    return { success: false, error: 'Failed to update department status' };
  }
}

export async function getDashboardStats() {
  try {
    const [totalPatients, totalDoctors, totalAppointments] = await Promise.all([
      prisma.user.count({ where: { role: 'patient' } }),
      prisma.user.count({ where: { role: 'doctor' } }),
      prisma.appointment.count(),
    ]);

    const pendingAppointments = await prisma.appointment.count({ where: { status: 'scheduled' } });
    const completedAppointments = await prisma.appointment.count({ where: { status: 'completed' } });
    
    // Calculate total revenue from paid bills
    const paidBills = await prisma.bill.findMany({ where: { status: 'paid' } });
    const totalRevenue = paidBills.reduce((acc, bill) => acc + bill.paidAmount, 0);
    
    const pendingOrders = await prisma.pharmacyOrder.count({ where: { status: 'pending' } });
    const pendingTests = await prisma.labTest.count({ where: { status: 'pending' } });
    const lowStockItems = await prisma.inventoryItem.count({ where: { status: 'low-stock' } });

    return {
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        pendingAppointments,
        completedAppointments,
        totalRevenue,
        pendingOrders,
        pendingTests,
        lowStockItems,
      }
    };
  } catch (error) {
    console.error('Failed to get dashboard stats:', error);
    console.error('Failed to get dashboard stats:', error);
    return { success: false, error: String(error) };
  }
}
