import { z } from 'zod';

const loginDto = z.object({
    email: z.email({ required_error: 'Email is required' }),
    password: z.string().min(8,{ message : 'Password must be at least 8 characters long' }).trim().optional(),
});

export { loginDto };