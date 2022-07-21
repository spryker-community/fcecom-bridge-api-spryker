const url = require('./url');

describe('url', () => {
    describe('extractUri', () => {
        it('extracts the relevant URI information from the given URL (absolute)', () => {
            const result = url.extractUri('http://myurl.com/some/relative/path');

            expect(result).toEqual('/some/relative/path');
        });
        it('extracts the relevant URI information from the given URL (relative)', () => {
            const result = url.extractUri('/some/relative/path');

            expect(result).toEqual('/some/relative/path');
        });
    });
});
