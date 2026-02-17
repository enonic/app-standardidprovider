import {
    addMembers,
    changePassword,
    createUser,
    getIdProviderConfig,
    login
} from '/lib/xp/auth';
import { connect as nodeConnect } from '/lib/xp/node';
import { getIdProviderKey } from '/lib/xp/portal';
import { run } from '/lib/xp/context';
import { isLoginWithoutUserEnabled } from './config';

export function adminUserCreationEnabled() {
    return isSystemIdProvider() && checkFlag();
}

export function loginWithoutUserEnabled() {
    return isLoginWithoutUserEnabled();
}

export const canLoginAsSu = () =>
    adminUserCreationEnabled() && loginWithoutUserEnabled();

export const createAdminUserCreation = (params: {
    idProvider: string;
    user: string;
    email: string;
    password: string;
}) => {
    if (adminUserCreationEnabled()) {
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

                const loginResult = login({
                    user: params.user,
                    password: params.password,
                    idProvider: 'system'
                });

                if (loginResult && loginResult.authenticated) {
                    setFlag();
                }

                return loginResult;
            }

            return undefined;
        });
    }

    return undefined;
};

function isSystemIdProvider() {
    return getIdProviderKey() === 'system';
}

function checkFlag() {
    const idProviderConfig = getIdProviderConfig();
    return (
        idProviderConfig && idProviderConfig.adminUserCreationEnabled === true
    );
}

function setFlag() {
    connect().modify<{
        idProvider?: {
            config?: {
                adminUserCreationEnabled?: boolean;
            };
        };
    }>({
        key: '/identity/system',
        editor(systemIdProvider) {
            if (
                systemIdProvider.idProvider &&
                systemIdProvider.idProvider.config
            ) {
                const cfg = systemIdProvider.idProvider.config;
                cfg.adminUserCreationEnabled = false;
            }

            return stripNulls(systemIdProvider); // Prevent XP 8 ScriptValueTranslator NPE on null values
        }
    });
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

function connect() {
    return nodeConnect({
        repoId: 'system-repo',
        branch: 'master',
        principals: ['role:system.admin']
    });
}

function stripNulls<T>(obj: T): T {
    if (obj === null || obj === undefined) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map((item) => stripNulls(item)) as T;
    }
    if (typeof obj === 'object') {
        const result: Record<string, unknown> = {};
        for (const key of Object.keys(obj as Record<string, unknown>)) {
            const value = (obj as Record<string, unknown>)[key];
            if (value !== null && value !== undefined) {
                result[key] = stripNulls(value);
            }
        }
        return result as T;
    }
    return obj;
}
