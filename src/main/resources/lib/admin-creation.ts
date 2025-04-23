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
                delete cfg.adminUserCreationEnabled;
            }

            return systemIdProvider;
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
