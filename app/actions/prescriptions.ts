"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getPrescriptionsByPatient(patientId: string) {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { patientId },
      include: { medications: true },
      orderBy: { date: 'desc' },
    });
    return { success: true, data: prescriptions };
  } catch (error) {
    console.error('Failed to fetch prescriptions:', error);
    return { success: false, error: 'Failed to fetch prescriptions' };
  }
}

export async function getPrescriptionsByDoctor(doctorId: string) {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { doctorId },
      include: { medications: true },
      orderBy: { date: 'desc' },
    });
    return { success: true, data: prescriptions };
  } catch (error) {
    console.error('Failed to fetch doctor prescriptions:', error);
    return { success: false, error: 'Failed to fetch prescriptions' };
  }
}

export async function createPrescription(data: any, medications: any[]) {
  try {
    const prescription = await prisma.prescription.create({
      data: {
        ...data,
        medications: {
          create: medications,
        },
      },
      include: { medications: true },
    });
    revalidatePath('/prescriptions');
    return { success: true, data: prescription };
  } catch (error) {
    console.error('Failed to create prescription:', error);
    return { success: false, error: 'Failed to create prescription' };
  }
}
