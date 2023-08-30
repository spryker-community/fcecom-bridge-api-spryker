// Data received from /v2/pages/
module.exports.fetchContents = {
    data: [
        {
            type: 'cms-pages',
            id: '0726761d-d58c-5cc6-ac61-e4c1ac212ae9',
            attributes: {
                pageKey: null,
                name: 'Imprint',
                validTo: null,
                isSearchable: true,
                url: '/en/imprint'
            },
            links: {
                self: 'http://glue.de.spryker.local/cms-pages/0726761d-d58c-5cc6-ac61-e4c1ac212ae9'
            }
        },
        {
            type: 'cms-pages',
            id: 'cb1bbd1f-b245-5920-a19b-ebdd1459e995',
            attributes: {
                pageKey: null,
                name: 'GTC',
                validTo: null,
                isSearchable: true,
                url: '/en/gtc'
            },
            links: {
                self: 'http://glue.de.spryker.local/cms-pages/cb1bbd1f-b245-5920-a19b-ebdd1459e995'
            }
        },
        {
            type: 'cms-pages',
            id: '1e9fb640-9073-55f4-a2d2-535090c92025',
            attributes: {
                pageKey: null,
                name: 'Data Privacy',
                validTo: null,
                isSearchable: true,
                url: '/en/privacy'
            },
            links: {
                self: 'http://glue.de.spryker.local/cms-pages/1e9fb640-9073-55f4-a2d2-535090c92025'
            }
        },
        {
            type: 'cms-pages',
            id: '0783656d-03c6-59b2-b6bc-48b7b6d77f9d',
            attributes: {
                pageKey: null,
                name: 'Dolor sit amet',
                validTo: null,
                isSearchable: true,
                url: '/en/dolor'
            },
            links: {
                self: 'http://glue.de.spryker.local/cms-pages/0783656d-03c6-59b2-b6bc-48b7b6d77f9d'
            }
        },
        {
            type: 'cms-pages',
            id: '10014bd9-4bba-5a54-b84f-31b4b7efd064',
            attributes: {
                pageKey: null,
                name: 'Demo Landing Page',
                validTo: null,
                isSearchable: true,
                url: '/en/demo-landing-page'
            },
            links: {
                self: 'http://glue.de.spryker.local/cms-pages/10014bd9-4bba-5a54-b84f-31b4b7efd064'
            }
        }
    ],
    links: {
        self: 'http://glue.de.spryker.local/cms-pages'
    }
};

module.exports.fetchContentsById = {
    data: {
        type: 'cms-pages',
        id: '0726761d-d58c-5cc6-ac61-e4c1ac212ae9',
        attributes: {
            pageKey: null,
            name: 'Imprint',
            validTo: null,
            isSearchable: true,
            url: '/en/imprint'
        },
        links: {
            self: 'http://glue.de.spryker.local/cms-pages/0726761d-d58c-5cc6-ac61-e4c1ac212ae9'
        }
    }
};

module.exports.fetchContentsByIdError = {
    errors: [
        {
            code: '3801',
            status: 404,
            detail: 'Cms page not found.'
        }
    ]
};
