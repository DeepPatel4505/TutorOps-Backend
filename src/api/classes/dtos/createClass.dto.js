import { z } from 'zod';

export const createClassSchema = z.object({
    name: z.string().trim().min(2, 'Class name must be at least 2 characters long'),
});
