"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getLabTests() {
  try {
    const tests = await prisma.labTest.findMany({
      include: { results: true },
      orderBy: { date: 'desc' },
    });
    return { success: true, data: tests };
  } catch (error) {
    console.error('Failed to fetch lab tests:', error);
    return { success: false, error: 'Failed to fetch lab tests' };
  }
}

export async function getLabTestsByPatient(patientId: string) {
  try {
    const tests = await prisma.labTest.findMany({
      where: { patientId },
      include: { results: true },
      orderBy: { date: 'desc' },
    });
    return { success: true, data: tests };
  } catch (error) {
    console.error('Failed to fetch patient lab tests:', error);
    return { success: false, error: 'Failed to fetch lab tests' };
  }
}

export async function updateLabTestStatus(id: string, status: string) {
  try {
    const test = await prisma.labTest.update({
      where: { id },
      data: { status },
    });
    revalidatePath('/lab');
    return { success: true, data: test };
  } catch (error) {
    console.error('Failed to update lab test:', error);
    return { success: false, error: 'Failed to update lab test' };
  }
}
