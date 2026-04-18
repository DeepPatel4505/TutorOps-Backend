import { z } from 'zod';

export const createAssignmentSchema = z.object({
    title: z.string().trim().min(1, 'Title is required'),
    description: z.string().trim().optional(),
    dueDate: z.string().datetime().optional(),
});
