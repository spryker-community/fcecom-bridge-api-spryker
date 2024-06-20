const httpClient = require('../utils/http-client');
const logger = require('../utils/logger');

const Lookup = require('./LookupUrlService');

const LOGGING_NAME = 'CategoriesService';

const { DEFAULT_LANG } = process.env;

/**
 * This method builds and adds the category data to the URL cache.
 * @param {any[]} categoryTree The categories to be added to the cache.
 * @param {string} lang The lang of the URLs.
 */
const buildCache = (categoryTree, lang) => {
    categoryTree.forEach((category) => {
        Lookup.addToCache(category.url, {
            type: 'category',
            id: category.nodeId,
            lang
        });
        if (categoryTree.children?.length) {
            buildCache(categoryTree.children, lang);
        }
    });
};

/**
 * This method fetches all categories.
 *
 * @param {number} [parentId] ID of the parent category to filter categories by.
 * @param {string} [lang] Language of the request.
 * @return {any[]} List of all categories.
 */
const getRelevantCategories = async (parentId, lang) => {
    const langHeader = {
        'Accept-Language': lang
    };
    if (parentId) {
        logger.logDebug(
            LOGGING_NAME,
            `Performing GET request to /category-nodes/${parentId} with lang header ${JSON.stringify(langHeader)}`
        );

        const { data: category = {} } = await httpClient.get('/category-nodes/' + parentId, {
            headers: langHeader
        });
        return category.data.attributes?.children;
    } else {
        logger.logDebug(LOGGING_NAME, `Performing GET request to /category-trees with lang header ${JSON.stringify(langHeader)}`);

        const { data: categories = [] } = await httpClient.get('/category-trees', {
            headers: langHeader
        });
        const categoryTrees = categories.data.find((t) => t.type === 'category-trees');
        buildCache(categoryTrees.attributes?.categoryNodesStorage, lang);
        return categoryTrees.attributes?.categoryNodesStorage;
    }
};

/**
 * This method recursively creates a nested tree structure for the given categories.
 *
 * @param {any[]} categoriesTree The arrays of categories to work with.
 */
const buildCategoryTree = (categoriesTree) => {
    return categoriesTree.map((element) => {
        return unfoldCategoryTree(element);
    });
};

/**
 * This method maps the retrieved category object from Spryker to the expected category object from FirstSpirit.
 *
 * @param {any} categoryObj The category object in the format as received from Spryker.
 * @return {{children: (any[]), id, label}} The category object with the strcuture FirstSpirit expects.
 */
const unfoldCategoryTree = (categoryObj) => {
    const kids = categoryObj.children ? categoryObj.children.map((element) => unfoldCategoryTree(element)) : [];
    return {
        id: categoryObj.nodeId,
        label: categoryObj.name,
        children: kids
    };
};

/**
 * Transforms the given nested category tree to a flat list.
 *
 * @param {any[]} categories Categories to transform to flat list.
 * @return {any[]} The categories as a flat list.
 */
const buildCategoryList = (categories) => {
    let resultList = [];
    for (const category of categories) {
        resultList.push({ id: category.nodeId, label: category.name });
        if (category.children && category.children.length) resultList.push(...buildCategoryList(category.children));
    }
    return resultList;
};

/**
 * This method filters categories by their label based on the given keyword.
 * @param {string} keyword Keyword to filter the categories by.
 * @param {any[]} categories Categories to filter.
 * @return {any[]} Filtered categories.
 */
const filterCategories = (keyword, categories) => {
    const query = keyword.toLowerCase();
    return categories.filter(category => category.label?.toLowerCase().includes(query));
}

/**
 * This method fetches all categories and returns them as a flat list structure.
 * @see SwaggerUI {@link http://localhost:3000/api/#/categories/get_categories}
 *
 * @param {number} [parentId] ID of the parent category to filter categories by.
 * @param {string} [keyword] Keyword to filter the categories by.
 * @param {string} [lang] Language of the request.
 * @param {number} [page=1] Number of the page to retrieve.
 * @return Promise<{ hasNext: boolean, total: number, categories: any[]}> The category list.
 */
const categoriesGet = async (parentId, keyword, lang = DEFAULT_LANG, page = 1) => {
    const pageSize = 20;
    const relevantCategories = await getRelevantCategories(parentId, lang);
    if (relevantCategories) {
        let fullCategoriesList = buildCategoryList(relevantCategories);

        if (keyword) {
            fullCategoriesList = filterCategories(keyword, fullCategoriesList);
        }

        const categories = fullCategoriesList.slice((page - 1) * pageSize, page * pageSize);
        const total = fullCategoriesList.length;
        const hasNext = page && total > page * pageSize;
        return { categories, total, hasNext };
    } else {
        return { categories: [] };
    }
};

/**
 * This method fetches all categories and returns them as a nested structure.
 * @see SwaggerUI {@link http://localhost:3000/api/#/categories/get_categories}
 *
 * @param {number | string} [parentId] ID of the parent category to filter categories by.
 * @param {string} [lang = DEFAULT_LANG] The language to be used for the HTTP call to Spryker.
 * @return Promise<{ hasNext: boolean, total: number, categories: any[]}> The category tree.
 */
const categoryTreeGet = async (parentId, lang = DEFAULT_LANG) => {
    const relevantCategories = await getRelevantCategories(parentId, lang);
    if (relevantCategories) {
        return { categorytree: buildCategoryTree(relevantCategories) };
    } else {
        return { categorytree: [] };
    }
};

/**
 * This method fetches the data for the categories with the given IDs.
 * @see SwaggerUI {@link http://localhost:3000/api/#/Categories/categoriesCategoryIdsGet}
 *
 * @param {string[]} [categoryIds] IDs of the categories to get.
 * @param {string} [lang = DEFAULT_LANG] The language to be used for the HTTP call to Spryker.
 * @return Promise<{ hasNext: boolean, total: number, categories: any[]}> The category data.
 */
const categoriesCategoryIdsGet = async (categoryIds, lang = DEFAULT_LANG) => {
    const categories = await Promise.all(
        categoryIds.map(async (categoryId) => {
            try {
                const langHeader = {
                    'Accept-Language': lang
                };

                logger.logDebug(
                    LOGGING_NAME,
                    `Performing GET request to /category-nodes/${categoryId} with lang header ${JSON.stringify(langHeader)}`
                );

                const { data } = await httpClient.get('/category-nodes/' + categoryId, {
                    headers: langHeader
                });
                return data.data?.attributes;
            } catch (e) {
                return null; /* returning to make them filterable in the next step */
            }
        })
    );

    const filteredCategories = categories.filter(Boolean).map((category) => {
        return { id: category.nodeId, label: category.name };
    });
    return { categories: filteredCategories };
};

/**
 * This method returns the URL for the category with the given ID.
 *
 * @param {number} categoryId ID of the category to get the URL for.
 * @param {string} [lang = DEFAULT_LANG] The language to be used for the HTTP call to Spryker.
 * @return {{url: string}} The URL of the category, null if given ID is invalid.
 */
const getCategoryUrl = async (categoryId, lang) => {
    const langHeader = {
        'Accept-Language': lang
    };

    logger.logDebug(LOGGING_NAME, `Performing GET request to /category-nodes/${categoryId} with lang header ${JSON.stringify(langHeader)}`);

    const { data = [] } = await httpClient.get('/category-nodes/' + categoryId, {
        headers: langHeader
    });
    if (data.data?.attributes?.url) {
        return {
            url: data.data?.attributes?.url
        };
    }
    logger.logError(LOGGING_NAME, 'Invalid categoryId passed', categoryId);
    return null;
};

module.exports = {
    categoriesGet,
    categoriesCategoryIdsGet,
    categoryTreeGet,
    getCategoryUrl
};
