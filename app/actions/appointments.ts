"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAppointmentsByPatient(patientId: string) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
    });
    return { success: true, data: appointments };
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return { success: false, error: 'Failed to fetch appointments' };
  }
}

export async function getAppointmentsByDoctor(doctorId: string) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { doctorId },
      orderBy: { date: 'desc' },
    });
    return { success: true, data: appointments };
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return { success: false, error: 'Failed to fetch appointments' };
  }
}

export async function createAppointment(data: any) {
  try {
    const appointment = await prisma.appointment.create({
      data,
    });
    revalidatePath('/appointments'); 
    return { success: true, data: appointment };
  } catch (error) {
    console.error('Failed to create appointment:', error);
    return { success: false, error: 'Failed to create appointment' };
  }
}

export async function updateAppointmentStatus(id: string, status: string) {
  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
    });
    revalidatePath('/appointments');
    return { success: true, data: appointment };
  } catch (error) {
    console.error('Failed to update appointment:', error);
    return { success: false, error: 'Failed to update appointment' };
  }
}
