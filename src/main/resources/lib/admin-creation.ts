import {addMembers, changePassword, createUser, getIdProviderConfig, login} from '/lib/xp/auth';
import {connect as nodeConnect} from '/lib/xp/node';
import {getIdProviderKey} from '/lib/xp/portal';
import {run} from '/lib/xp/context';
import {isLoginWithoutUserEnabled} from './config';

export function adminUserCreationEnabled() {
    return isSystemIdProvider() && checkFlag();
}

export function loginWithoutUserEnabled() {
    return isLoginWithoutUserEnabled();
}

export const canLoginAsSu = () => {
    return adminUserCreationEnabled() && loginWithoutUserEnabled();
};

export const createAdminUserCreation = (params: {
    idProvider: string
    user: string
    email: string
    password: string
}) => {
    if (adminUserCreationEnabled()) {
        return runAsAdmin(() => {
            var createdUser = createUser({
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
                addMembers('role:system.admin.login', [
                    createdUser.key
                ]);

                var loginResult = login({
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
    var idProviderConfig = getIdProviderConfig();
    return (
        idProviderConfig && idProviderConfig.adminUserCreationEnabled === true
    );
}

function setFlag() {
    connect().modify<{
        idProvider?: {
            config?: {
                adminUserCreationEnabled?: boolean
            }
        }
    }>({
        key: '/identity/system',
        editor: function(systemIdProvider) {
            if (
                systemIdProvider.idProvider &&
                systemIdProvider.idProvider.config
            ) {
                var cfg = systemIdProvider.idProvider.config;
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
