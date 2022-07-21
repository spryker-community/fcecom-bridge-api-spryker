module.exports.categoriesGet = {
    data: [
        {
            type: 'category-trees',
            id: null,
            attributes: {
                categoryNodesStorage: [
                    {
                        nodeId: 5,
                        order: 100,
                        name: 'Computers',
                        url: '/en/computers',
                        children: [
                            {
                                nodeId: 6,
                                order: 100,
                                name: 'Notebooks',
                                url: '/en/computers/notebooks',
                                children: []
                            },
                            {
                                nodeId: 7,
                                order: 90,
                                name: 'PCs & Workstations',
                                url: '/en/computers/pcs-&-workstations',
                                children: []
                            },
                            {
                                nodeId: 8,
                                order: 80,
                                name: 'Tablets',
                                url: '/en/computers/tablets',
                                children: []
                            }
                        ]
                    },
                    {
                        nodeId: 2,
                        order: 90,
                        name: 'Cameras & Camcorders',
                        url: '/en/cameras-&-camcorders',
                        children: [
                            {
                                nodeId: 3,
                                order: 100,
                                name: 'Digital Cameras',
                                url: '/en/cameras-&-camcorders/digital-cameras',
                                children: []
                            },
                            {
                                nodeId: 4,
                                order: 90,
                                name: 'Camcorders',
                                url: '/en/cameras-&-camcorders/camcorders',
                                children: []
                            }
                        ]
                    },
                    {
                        nodeId: 11,
                        order: 80,
                        name: 'Telecom & Navigation',
                        url: '/en/telecom-&-navigation',
                        children: [
                            {
                                nodeId: 12,
                                order: 80,
                                name: 'Smartphones',
                                url: '/en/telecom-&-navigation/smartphones',
                                children: []
                            }
                        ]
                    },
                    {
                        nodeId: 15,
                        order: 80,
                        name: 'Cables',
                        url: '/en/cables',
                        children: []
                    },
                    {
                        nodeId: 16,
                        order: 80,
                        name: 'Food',
                        url: '/en/food',
                        children: []
                    },
                    {
                        nodeId: 9,
                        order: 70,
                        name: 'Smart Wearables',
                        url: '/en/smart-wearables',
                        children: [
                            {
                                nodeId: 10,
                                order: 70,
                                name: 'Smartwatches',
                                url: '/en/smart-wearables/smartwatches',
                                children: []
                            }
                        ]
                    }
                ]
            },
            links: {
                self: 'http://glue.de.spryker.local/category-trees'
            }
        }
    ],
    links: {
        self: 'http://glue.de.spryker.local/category-trees'
    }
};

// list of all categoryIds in the categoriesGet response Tree
module.exports.categoryIdsList = [5, 6, 7, 8, 2, 3, 4, 11, 12, 15, 16, 9, 10];

module.exports.categoriesGetParentId = {
    data: {
        type: 'category-nodes',
        id: '5',
        attributes: {
            nodeId: 5,
            name: 'Computers',
            metaTitle: 'Computers',
            metaKeywords: 'Computers',
            metaDescription: 'Computers',
            isActive: true,
            order: 100,
            url: '/en/computers',
            children: [
                {
                    nodeId: 6,
                    name: 'Notebooks',
                    metaTitle: 'Notebooks',
                    metaKeywords: 'Notebooks',
                    metaDescription: 'Notebooks',
                    isActive: true,
                    order: 100,
                    url: '/en/computers/notebooks',
                    children: [],
                    parents: []
                },
                {
                    nodeId: 7,
                    name: 'PCs & Workstations',
                    metaTitle: 'PCs & Workstations',
                    metaKeywords: 'PCs & Workstations',
                    metaDescription: 'PCs & Workstations',
                    isActive: true,
                    order: 90,
                    url: '/en/computers/pcs-&-workstations',
                    children: [],
                    parents: []
                },
                {
                    nodeId: 8,
                    name: 'Tablets',
                    metaTitle: 'Tablets',
                    metaKeywords: 'Tablets',
                    metaDescription: 'Tablets',
                    isActive: true,
                    order: 80,
                    url: '/en/computers/tablets',
                    children: [],
                    parents: []
                }
            ],
            parents: [
                {
                    nodeId: 1,
                    name: 'Demoshop',
                    metaTitle: 'Demoshop',
                    metaKeywords: 'English version of Demoshop',
                    metaDescription: 'English version of Demoshop',
                    isActive: true,
                    order: null,
                    url: '/en',
                    children: [],
                    parents: []
                }
            ]
        },
        links: {
            self: 'http://glue.de.spryker.local/category-nodes/5'
        }
    }
};

module.exports.categoriesGetParentIdError = {
    errors: [
        {
            code: '703',
            status: 404,
            detail: "Can't find category node with the given id."
        }
    ]
};
