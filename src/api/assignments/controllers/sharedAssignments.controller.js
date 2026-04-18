import ApiError from '#entities/ApiError.js';
import ApiResponse from '#entities/ApiResponse.js';
import {
    createReusableProblem,
    generateAiProblems,
    getReusableProblemDetails,
    listReusableProblemTemplates,
} from '../services/sharedAssignments.service.js';

export const createProblemController = async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        const result = await createReusableProblem({ userId, payload: req.body });
        return res.status(201).json(new ApiResponse(result, 'Problem created successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to create problem', err, req.originalUrl));
    }
};

export const getProblemController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await getReusableProblemDetails({ problemId: id });
        return res.status(200).json(new ApiResponse(result, 'Problem fetched successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to fetch problem', err, req.originalUrl));
    }
};

export const listProblemTemplatesController = async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        const result = await listReusableProblemTemplates({ userId });
        return res.status(200).json(new ApiResponse(result, 'Problem templates fetched successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to fetch problem templates', err, req.originalUrl));
    }
};

export const generateProblemsController = async (req, res, next) => {
    try {
        const result = await generateAiProblems(req.body);
        return res.status(200).json(new ApiResponse({ problems: result }, 'Problems generated successfully'));
    } catch (err) {
        return next(err instanceof ApiError ? err : ApiError.internal('Failed to generate problems', err, req.originalUrl));
    }
};
