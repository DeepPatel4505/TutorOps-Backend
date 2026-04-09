import { z } from 'zod';

export const submitAssignmentSchema = z.object({
    answers: z.array(
        z.object({
            problemInstanceId: z.string().trim().min(1, 'problemInstanceId is required'),
            answer: z.any(),
        })
    ).min(1, 'At least one answer is required'),
});
