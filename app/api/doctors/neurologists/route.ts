import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const specialization = searchParams.get('specialization');

    const neurologists = await prisma.user.findMany({
      where: {
        role: 'doctor',
        OR: [
          { specialization: 'Neurology' },
          { department: 'Neurology' }
        ]
      }
    });

    return Response.json({
      success: true,
      count: neurologists.length,
      doctors: neurologists,
      message: `Found ${neurologists.length} neurologists in the system`,
    });
  } catch (error) {
    console.error('Error fetching neurologists:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch neurologists' },
      { status: 500 }
    );
  }
}
