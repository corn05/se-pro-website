"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getNotificationsByUser(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    return { success: true, data: notifications };
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return { success: false, error: 'Failed to fetch notifications' };
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    revalidatePath('/'); // Revalidate everywhere
    return { success: true, data: notification };
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return { success: false, error: 'Failed to update notification' };
  }
}
