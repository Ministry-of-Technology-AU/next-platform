'use strict';

var api = require('./api.js');

const homepageService = api.adminApi.enhanceEndpoints({
    addTagTypes: [
        'CountDocuments',
        'HomepageLayout'
    ]
}).injectEndpoints({
    endpoints: (builder)=>({
            getKeyStatistics: builder.query({
                query: ()=>'/admin/homepage/key-statistics',
                transformResponse: (response)=>response.data,
                providesTags: (_, _err)=>[
                        'HomepageKeyStatistics'
                    ]
            }),
            getCountDocuments: builder.query({
                query: ()=>'/content-manager/homepage/count-documents',
                transformResponse: (response)=>response.data,
                providesTags: (_, _err)=>[
                        'CountDocuments'
                    ]
            }),
            getHomepageLayout: builder.query({
                query: ()=>'/admin/homepage/layout',
                transformResponse: (r)=>r.data,
                providesTags: [
                    'HomepageLayout'
                ]
            }),
            updateHomepageLayout: builder.mutation({
                query: (body)=>({
                        url: '/admin/homepage/layout',
                        method: 'PUT',
                        data: body
                    }),
                transformResponse: (r)=>r.data,
                invalidatesTags: [
                    'HomepageLayout'
                ]
            })
        })
});
const { useGetKeyStatisticsQuery, useGetCountDocumentsQuery, useGetHomepageLayoutQuery, useUpdateHomepageLayoutMutation } = homepageService;

exports.useGetCountDocumentsQuery = useGetCountDocumentsQuery;
exports.useGetHomepageLayoutQuery = useGetHomepageLayoutQuery;
exports.useGetKeyStatisticsQuery = useGetKeyStatisticsQuery;
exports.useUpdateHomepageLayoutMutation = useUpdateHomepageLayoutMutation;
//# sourceMappingURL=homepage.js.map
