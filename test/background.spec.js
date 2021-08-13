import Tokens from '../src/modules/tokens';

describe('Background script', () => {

    beforeEach(() => {
        new Tokens();
    });

    afterEach(function () {
        chrome.flush();
        sandbox.restore();
        Tokens.csrfToken = undefined;
        Tokens.bearerToken = undefined;
    });

    it('Ignores bad request headers', () => {
        // bad request headers
        Tokens.getTheTokens({requestHeaders: undefined});
        let csrf = Tokens.csrfToken;
        let bearer = Tokens.bearerToken;
        expect(bearer, 'no bearer after bad request').to.equal(undefined);
        expect(csrf, 'no csrf after bad request').to.equal(undefined);
    });

    it('Finds bearer and csrf from request headers', () => {
        // good request headers
        Tokens.getTheTokens({
            requestHeaders:
                JSON.parse('[' +
                    '{"name":"x-twitter-client-language","value":"en"},' +
                    '{"name":"x-csrf-token","value":"csrf"},' +
                    '{"name":"sec-ch-ua-mobile","value":"?0"},' +
                    '{"name":"authorization","value":"bearer"},' +
                    '{"name":"content-type","value":"application/x-www-form-urlencoded"},' +
                    '{"name":"Accept","value":"*/*"},' +
                    '{"name":"User-Agent","value":"Mozilla/5.0"},' +
                    '{"name":"x-twitter-auth-type","value":"OAuth2Session"},' +
                    '{"name":"x-twitter-active-user","value":"yes"}' +
                    ']')
        });
        const csrf = Tokens.csrfToken;
        const bearer = Tokens.bearerToken;
        expect(bearer, 'bearer found after good headers').to.equal('bearer');
        expect(csrf, 'csrf found after good headers').to.equal('csrf');
    });

    it('Returns bearer and csrf on request', () => {
        Tokens.bearerToken = 'bearer';
        Tokens.csrfToken = 'csrf';
        chrome.runtime.onMessage.dispatch({notTokens: true}, {}, resp => (
            expect(resp.bearer, 'ignores').to.equal(undefined) &&
            expect(resp.csrf, 'ignores').to.equal(undefined)
        ));
        chrome.runtime.onMessage.dispatch({tokens: true}, {}, resp => (
            expect(resp.bearer, 'get bearer').to.equal('bearer') &&
            expect(resp.csrf, 'get csrf').to.equal('csrf')
        ));
    });

});
