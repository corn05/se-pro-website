"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getInventory() {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: { name: 'asc' },
    });
    return { success: true, data: items };
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    return { success: false, error: 'Failed to fetch inventory' };
  }
}

export async function getPharmacyOrders() {
  try {
    const orders = await prisma.pharmacyOrder.findMany({
      orderBy: { date: 'desc' },
    });
    return { success: true, data: orders };
  } catch (error) {
    console.error('Failed to fetch pharmacy orders:', error);
    return { success: false, error: 'Failed to fetch pharmacy orders' };
  }
}

export async function updateOrderStatus(id: string, status: string) {
  try {
    const order = await prisma.pharmacyOrder.update({
      where: { id },
      data: { status },
    });
    revalidatePath('/pharmacy');
    return { success: true, data: order };
  } catch (error) {
    console.error('Failed to update order status:', error);
    return { success: false, error: 'Failed to update order status' };
  }
}
