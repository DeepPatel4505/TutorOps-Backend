import { z } from 'zod';

export const createProblemSchema = z.object({
    templateCode: z.string().trim().min(1, 'templateCode is required'),
    topic: z.string().trim().min(1, 'topic is required'),
    difficulty: z.string().trim().min(1, 'difficulty is required'),
});

export const generateProblemsSchema = z.object({
    topic: z.string().trim().min(1, 'topic is required'),
    difficulty: z.string().trim().default('medium'),
    count: z.number().int().min(1).max(20).default(5),
});
