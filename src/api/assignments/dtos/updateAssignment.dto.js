import { z } from 'zod';

const problemTemplateSchema = z.object({
    problemId: z.string().trim().min(1, 'problemId is required'),
    params: z.record(z.any()).optional(),
    latex: z.string().trim().optional(),
    answer: z.any().optional(),
});

export const updateAssignmentSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').optional(),
    description: z.string().trim().optional(),
    dueDate: z.string().datetime().nullable().optional(),
    problemTemplates: z.array(problemTemplateSchema).min(1, 'At least one problem template is required').optional(),
});