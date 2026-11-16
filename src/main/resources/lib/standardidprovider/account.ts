export interface Account {
    key: string;
    login: string;
    displayName: string | null;
    email?: string | null;
}

/**
The account as the user knows it: the display name, else the email, else the login.
*/
export const accountName = (user: Account): string =>
    user.displayName?.trim() || user.email?.trim() || user.login;

/**
What tells the account from others of the same display name: the email, else the login. None when
the account has no display name, since its name is then already one of them.
*/
export const accountId = (user: Account): string | undefined =>
    user.displayName?.trim() ? user.email?.trim() || user.login : undefined;

/**
The account signed in, with its key to tell it from others of the same name.
*/
export const signedInAs = (user: Account): string => {
    const displayName = user.displayName?.trim();
    return displayName ? `${displayName} (${user.key})` : user.key;
};
