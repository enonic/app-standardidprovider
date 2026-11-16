export interface Account {
    key: string;
    login: string;
    displayName: string | null;
}

/**
The account as the user knows it: the display name, or the login when it has none.
*/
export const accountName = (user: Account): string =>
    user.displayName?.trim() || user.login;

/**
The account signed in, with its key to tell it from others of the same name.
*/
export const signedInAs = (user: Account): string => {
    const displayName = user.displayName?.trim();
    return displayName ? `${displayName} (${user.key})` : user.key;
};
