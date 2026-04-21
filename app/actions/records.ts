"use server";

import { prisma } from '@/lib/prisma';

export async function getMedicalRecordsByPatient(patientId: string) {
  try {
    const records = await prisma.medicalRecord.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
    });
    return { success: true, data: records };
  } catch (error) {
    console.error('Failed to fetch medical records:', error);
    return { success: false, error: 'Failed to fetch medical records' };
  }
}
