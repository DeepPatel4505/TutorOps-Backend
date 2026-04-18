import { z } from 'zod';

export const enrollStudentSchema = z.object({
    studentIds: z
        .array(z.string().trim().min(1, 'studentId is required'))
        .min(1, 'At least one studentId is required'),
});
