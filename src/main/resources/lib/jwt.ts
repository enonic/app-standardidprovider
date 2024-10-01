import type {Request} from '@item-enonic-types/global/controller';
import {startsWith} from '@enonic/js-utils/string/startsWith';

export const extractJwtToken = (req: Request) => {
    const authHeader = req.headers["Authorization"];
    if (authHeader && startsWith(authHeader, "Bearer ")) {
        return authHeader.replace("Bearer ", "");
    }
    return null;
};
