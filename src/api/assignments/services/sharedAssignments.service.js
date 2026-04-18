import ApiError from '#entities/ApiError.js';
import { createProblem, getProblemById, getProblemTemplatesByCreator } from '../daos/assignment.dao.js';

export const createReusableProblem = async ({ userId, payload }) => {
    const created = await createProblem({
        creatorId: userId,
        templateCode: payload.templateCode,
        topic: payload.topic,
        difficulty: payload.difficulty,
    });

    return created;
};

export const getReusableProblemDetails = async ({ problemId }) => {
    const problem = await getProblemById({ problemId });

    if (!problem) {
        throw ApiError.notFound('Problem not found', {}, `/problems/${problemId}`);
    }

    return problem;
};

export const listReusableProblemTemplates = async ({ userId }) => {
    const templates = await getProblemTemplatesByCreator({ creatorId: userId });

    return {
        templates,
        total: templates.length,
    };
};

export const generateAiProblems = async ({ topic, difficulty, count }) => {
    let askLLM;

    try {
        const aiClient = await import('#src/agents/aiClinent.js');
        askLLM = aiClient.askLLM;
    } catch (err) {
        throw ApiError.internal('AI client is not available. Install and configure AI dependencies first.', err, '/ai/generate-problems');
    }

    const prompt = `Generate ${count} ${difficulty} problems for topic: ${topic}. Return strict JSON array with fields: templateCode, topic, difficulty.`;
    const response = await askLLM(prompt);

    if (!response) {
        throw ApiError.internal('Failed to generate problems from AI engine', {}, '/ai/generate-problems');
    }

    try {
        const normalized = response.trim();
        const parsed = JSON.parse(normalized);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
        return [
            {
                templateCode: response,
                topic,
                difficulty,
            },
        ];
    }
};
