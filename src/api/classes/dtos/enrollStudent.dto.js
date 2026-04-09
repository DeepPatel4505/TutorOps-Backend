import { z } from 'zod';

export const enrollStudentSchema = z.object({
    studentId: z.string().trim().min(1, 'studentId is required'),
});
