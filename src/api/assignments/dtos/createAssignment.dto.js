import { z } from 'zod';

export const createAssignmentSchema = z.object({
    title: z.string().trim().min(1, 'Title is required'),
    description: z.string().trim().optional(),
    dueDate: z.string().datetime().optional(),
    problems: z.array(
        z.object({
            problemId: z.string().trim().min(1, 'problemId is required'),
            points: z.number().min(0, 'points must be non-negative').default(1),
        })
    ).min(1, 'At least one problem is required'),
});
