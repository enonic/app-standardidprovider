import {
    addMembers,
    changePassword,
    createUser,
    getMembers,
    login
} from '/lib/xp/auth';
import { getIdProviderKey } from '/lib/xp/portal';
import { run } from '/lib/xp/context';
import { isDevMode, isSuPasswordConfigured } from './config';

const SU_KEY = 'user:system:su';
const ADMIN_ROLE = 'role:system.admin';

export function firstLoginEnabled() {
    return (
        isSystemIdProvider() &&
        isDevMode() &&
        !isSuPasswordConfigured() &&
        !adminUserExists()
    );
}

export const createAdminUserCreation = (params: {
    idProvider: string;
    user: string;
    email: string;
    password: string;
}) => {
    if (firstLoginEnabled()) {
        return runAsAdmin(() => {
            const createdUser = createUser({
                idProvider: 'system',
                name: params.user,
                displayName: params.user,
                email: params.email
            });

            if (createdUser) {
                changePassword({
                    userKey: createdUser.key,
                    password: params.password
                });

                addMembers('role:system.admin', [createdUser.key]);
                addMembers('role:system.admin.login', [createdUser.key]);

                return login({
                    user: params.user,
                    password: params.password,
                    idProvider: 'system'
                });
            }

            return undefined;
        });
    }

    return undefined;
};

function isSystemIdProvider() {
    return getIdProviderKey() === 'system';
}

// True if any user other than su has the admin role, directly or via a group.
// XP has no nested groups, so a single descent into group members is enough.
function adminUserExists(): boolean {
    return runAsAdmin(() =>
        getMembers(ADMIN_ROLE).some((member) => {
            if (member.type === 'group') {
                return getMembers(member.key).some(
                    (groupMember) => groupMember.key !== SU_KEY
                );
            }

            return member.key !== SU_KEY;
        })
    );
}

function runAsAdmin<T>(callback: () => T) {
    return run<T>(
        {
            repository: 'system-repo',
            branch: 'master',
            principals: ['role:system.admin']
        },
        callback
    );
}
