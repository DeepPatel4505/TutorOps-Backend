import ApiError from '#entities/ApiError.js';
import { listUsersByRoleRaw } from '../daos/user.dao.js';

const ALLOWED_ROLES = new Set(['STUDENT', 'TEACHER', 'ADMIN']);

export const listUsers = async ({ role }) => {
    const normalizedRole = role ? String(role).toUpperCase() : undefined;

    if (normalizedRole && !ALLOWED_ROLES.has(normalizedRole)) {
        throw ApiError.badRequest('Invalid role filter', {}, '/users');
    }

    const users = await listUsersByRoleRaw({ role: normalizedRole });

    return {
        users,
        total: users.length,
        role: normalizedRole || null,
    };
};
