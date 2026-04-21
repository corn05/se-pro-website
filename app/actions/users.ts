"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return { success: true, data: user };
  } catch (error) {
    console.error('Failed to get user:', error);
    return { success: false, error: 'Failed to fetch user' };
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return { success: true, data: user };
  } catch (error) {
    console.error('Failed to get user by email:', error);
    return { success: false, error: 'Failed to fetch user' };
  }
}

export async function getUsersByRole(role: string) {
  try {
    const users = await prisma.user.findMany({
      where: { role },
    });
    return { success: true, data: users };
  } catch (error) {
    console.error('Failed to get users by role:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: users };
  } catch (error) {
    console.error('Failed to get all users:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}

export async function createUser(data: any) {
  try {
    const user = await prisma.user.create({
      data,
    });
    revalidatePath('/'); // Revalidate where needed
    return { success: true, data: user };
  } catch (error) {
    console.error('Failed to create user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}
