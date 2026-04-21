import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

const prescriptionSummarySchema = z.object({
  medicationExplanations: z.array(z.object({
    name: z.string().describe('Medication name'),
    explanation: z.string().describe('Clear explanation of why this medication is prescribed and how it works'),
  })).describe('Detailed explanations for each medication'),
  prescriptionSummary: z.string().describe('Comprehensive summary of the prescription including all medicines, dosages, frequencies, and patient instructions'),
  instructions: z.string().describe('General instructions for the patient'),
  warnings: z.array(z.string()).describe('Important warnings or contraindications for these medications'),
  followUpRecommendation: z.string().nullable().describe('Recommended follow-up appointment'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      patientName,
      patientAge,
      patientGender,
      allergies,
      diagnosis,
      medicines,
      notes,
    } = body;

    // Check if OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      // Return mock response if no API key
      const medicationExplanations = medicines.map((med: any) => ({
        name: med.name,
        explanation: `${med.name} is prescribed for the treatment of ${diagnosis}. Take ${med.dosage} ${med.frequency}. This medication works by targeting the underlying condition and providing relief.`,
      }));

      return Response.json({
        medicationExplanations,
        prescriptionSummary: `
PRESCRIPTION SUMMARY
====================
Patient: ${patientName}
Age: ${patientAge} | Gender: ${patientGender}
Diagnosis: ${diagnosis}
Date: ${new Date().toLocaleDateString()}

PRESCRIBED MEDICATIONS:
${medicines.map((med: any) => `
• ${med.name} ${med.dosage}
  Frequency: ${med.frequency}
  Duration: ${med.duration}
  ${med.instructions ? `Instructions: ${med.instructions}` : ''}
`).join('\n')}

PATIENT INSTRUCTIONS:
- Take all medications exactly as prescribed
- Do not stop without consulting your doctor
- If you miss a dose, take it as soon as you remember
- Keep medications out of reach of children
        `.trim(),
        instructions: 'Take all medications as prescribed. If you experience any adverse effects, contact your healthcare provider immediately. Do not share medications with others.',
        warnings: [
          'Do not drive or operate machinery until you know how these medications affect you',
          'Avoid alcohol while taking these medications',
          'Inform pharmacist of other medications you are taking',
        ],
        followUpRecommendation: 'Schedule a follow-up appointment in 2 weeks to monitor your progress',
      });
    }

    try {
      const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const systemPrompt = `You are a medical AI assistant helping doctors create detailed prescription summaries with clear medication explanations. Your role is to:
1. Provide clear explanations for why each medication is prescribed
2. Explain how each medication works
3. Generate a professional prescription summary
4. Provide clear patient instructions and warnings

Format medication explanations in simple, patient-friendly language while remaining medically accurate.`;

      const userPrompt = `Generate a detailed prescription summary for the following patient:

Patient Information:
- Name: ${patientName}
- Age: ${patientAge} years
- Gender: ${patientGender}
- Known Allergies: ${allergies?.length > 0 ? allergies.join(', ') : 'None reported'}

Diagnosis: ${diagnosis}

MEDICINES PRESCRIBED BY DOCTOR:
${medicines.map((med: any) => `- ${med.name} ${med.dosage} - ${med.frequency} for ${med.duration}${med.instructions ? ` (${med.instructions})` : ''}`).join('\n')}

${notes ? `Additional Notes: ${notes}` : ''}

Please generate:
1. MEDICATION EXPLANATIONS: For each medicine, provide a clear explanation of why it's prescribed and how it works
2. A comprehensive prescription summary with all details
3. General patient instructions
4. Important warnings related to these medications
5. Follow-up recommendation

Make the medication explanations simple and easy to understand for the patient.`;

      const result = await generateObject({
        model: openai('gpt-4o-mini'),
        system: systemPrompt,
        prompt: userPrompt,
        schema: prescriptionSummarySchema,
      });

      return Response.json(result.object);
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to mock response if OpenAI fails
      const medicationExplanations = medicines.map((med: any) => ({
        name: med.name,
        explanation: `${med.name} is prescribed for the treatment of ${diagnosis}. Take ${med.dosage} ${med.frequency}. This medication works by targeting the underlying condition and providing relief.`,
      }));

      return Response.json({
        medicationExplanations,
        prescriptionSummary: `
PRESCRIPTION SUMMARY
====================
Patient: ${patientName}
Age: ${patientAge} | Gender: ${patientGender}
Diagnosis: ${diagnosis}
Date: ${new Date().toLocaleDateString()}

PRESCRIBED MEDICATIONS:
${medicines.map((med: any) => `
• ${med.name} ${med.dosage}
  Frequency: ${med.frequency}
  Duration: ${med.duration}
  ${med.instructions ? `Instructions: ${med.instructions}` : ''}
`).join('\n')}

PATIENT INSTRUCTIONS:
- Take all medications exactly as prescribed
- Do not stop without consulting your doctor
- If you miss a dose, take it as soon as you remember
- Keep medications out of reach of children
        `.trim(),
        instructions: 'Take all medications as prescribed. If you experience any adverse effects, contact your healthcare provider immediately. Do not share medications with others.',
        warnings: [
          'Do not drive or operate machinery until you know how these medications affect you',
          'Avoid alcohol while taking these medications',
          'Inform pharmacist of other medications you are taking',
        ],
        followUpRecommendation: 'Schedule a follow-up appointment in 2 weeks to monitor your progress',
      });
    }
  } catch (error) {
    console.error('Prescription generation error:', error);
    return Response.json(
      { error: 'Failed to generate prescription' },
      { status: 500 }
    );
  }
}
