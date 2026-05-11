import type { Request } from '@enonic-types/core';

export const extractJwtToken = (req: Request) => {
    const authHeader = req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.replace('Bearer ', '');
    }

    return null;
};
