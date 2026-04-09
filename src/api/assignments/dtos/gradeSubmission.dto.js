import { z } from 'zod';

export const gradeSubmissionSchema = z.object({
    grades: z.array(
        z.object({
            problemInstanceId: z.string().trim().min(1, 'problemInstanceId is required'),
            score: z.number().min(0, 'score must be non-negative'),
            feedback: z.string().trim().optional(),
        })
    ).min(1, 'At least one grade is required'),
    finalScore: z.number().min(0).optional(),
});
