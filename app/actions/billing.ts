"use server";

import { prisma } from '@/lib/prisma';

export async function getBillsByPatient(patientId: string) {
  try {
    const bills = await prisma.bill.findMany({
      where: { patientId },
      include: { items: true },
      orderBy: { date: 'desc' },
    });
    return { success: true, data: bills };
  } catch (error) {
    console.error('Failed to fetch bills:', error);
    return { success: false, error: 'Failed to fetch bills' };
  }
}

export async function getBills() {
  try {
    const bills = await prisma.bill.findMany({
      include: { items: true },
      orderBy: { date: 'desc' },
    });
    return { success: true, data: bills };
  } catch (error) {
    console.error('Failed to fetch bills:', error);
    return { success: false, error: 'Failed to fetch bills' };
  }
}
