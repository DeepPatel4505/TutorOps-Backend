import { ROLE } from '@utils/constant';
import { z } from 'zod';

const registerDto = z.object({
    username: z
        .string({ required_error: 'Username is required' })
        .min(3, { message: 'Username must be at least 3 characters long' })
        .trim(),
    email: z.email({ message: 'Invalid email address', required_error: 'Email is required' }),
    password: z
        .string({ required_error: 'Password is required' })
        .min(8, { message: 'Password must be at least 8 characters long' })
        .trim(),
    role: z.number().int().refine(val => [0,1,2].includes(val), { message: "Invalid role" }),
});

export { registerDto };
