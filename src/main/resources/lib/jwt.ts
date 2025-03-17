import type {Request} from '@enonic-types/core';
import {startsWith} from '@enonic/js-utils/string/startsWith';

export const extractJwtToken = (req: Request) => {
    const authHeader = req.headers["Authorization"];
    if (authHeader && startsWith(authHeader, "Bearer ")) {
        return authHeader.replace("Bearer ", "");
    }
    return null;
};
