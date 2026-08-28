/* global __ */
export const bearerLogin = (jwtToken: string) =>
    __.newBean<{
        // eslint-disable-next-line no-unused-vars
        verifyAndLogin(jwtToken: string): boolean;
    }>('com.enonic.app.standardidprovider.handler.JwtHandler').verifyAndLogin(
        jwtToken
    );
