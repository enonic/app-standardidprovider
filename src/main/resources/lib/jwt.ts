/* global __ */
export const bearerLogin = (jwtToken: string) =>
    __.newBean<{
        verifyAndLogin(jwtToken: string): boolean;
    }>('com.enonic.app.standardidprovider.handler.JwtHandler').verifyAndLogin(
        jwtToken
    );
