import { z } from 'zod';

export const addAssignmentProblemsSchema = z.object({
    problemTemplates: z
        .array(
            z.object({
                problemId: z.string().trim().min(1, 'problemId is required'),
                params: z.record(z.any()).optional(),
                latex: z.string().trim().optional(),
                answer: z.any().optional(),
            })
        )
        .min(1, 'At least one problem template is required'),
});
