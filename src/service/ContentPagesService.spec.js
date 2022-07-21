const httpClient = require('../utils/http-client');
const service = require('./ContentPagesService');
const data = require('./ContentPagesService.spec.data');

jest.mock('../../src/utils/http-client');

describe('ContentPagesService', () => {
    describe('getContentUrl', () => {
        it('returns the correct URL', async () => {
            const contentId = data.fetchContentsById.data.id;
            httpClient.get.mockResolvedValue({ data: data.fetchContentsById });

            const result = await service.getContentUrl(contentId);

            expect(result).toEqual({ url: data.fetchContentsById.data.attributes.url });
        });
        it('returns null for invalid IDs', async () => {
            const contentId = -999;
            httpClient.get.mockResolvedValue({ data: data.fetchContentsByIdError });

            const result = await service.getContentUrl(contentId);

            expect(result).toBeUndefined();
        });
    });
    describe('contentPagesContentIdsGet', () => {
        it('returns the content pages with the given IDs', async () => {
            const contentIds = [data.fetchContentsById.data.id, -999];
            httpClient.get.mockResolvedValueOnce({ data: data.fetchContentsById }).mockResolvedValue({ data: data.fetchContentsByIdError });

            const result = await service.contentPagesContentIdsGet(contentIds);

            expect(result.contentPages.length).toEqual(1);
            expect(result.contentPages[0].id).toEqual(contentIds[0]);
        });
    });
    describe('contentPagesGet', () => {
        it('returns all content pages', async () => {
            httpClient.get.mockResolvedValue({ data: data.fetchContents });

            const result = await service.contentPagesGet();

            expect(result.contentPages.length).toEqual(data.fetchContents.data.length);
            expect(result.total).toEqual(data.fetchContents.data.length);
            expect(result.hasNext).toEqual(false);
        });
    });
});
