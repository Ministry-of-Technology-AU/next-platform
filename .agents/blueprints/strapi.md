# Strapi API Integration with qs Library

This document explains how to use the restructured Strapi API integration that now uses the `qs` library for proper query string building.

## Overview

The Strapi API has been restructured to use the [`qs`](https://github.com/ljharb/qs) library, which is the same library that Strapi uses internally. This ensures compatibility and proper handling of complex nested queries.

## Key Improvements

1. **Proper Query String Building**: Uses `qs` library instead of custom `URLSearchParams` implementation
2. **Better Type Safety**: Enhanced TypeScript types for Strapi-specific parameters
3. **Complex Query Support**: Proper handling of nested filters, population, and relations
4. **Strapi-Compatible**: Generates query strings that match Strapi's expected format

## Installation

The required dependencies are already installed:
- `qs` - Query string library
- `@types/qs` - TypeScript types for qs

## Basic Usage

```typescript
import { strapiGet, strapiPost, strapiPut, strapiDelete } from './apis/strapi';

// Simple GET request
const articles = await strapiGet('/articles');

// GET with query parameters
const filteredArticles = await strapiGet('/articles', {
  filters: {
    title: {
      $containsi: 'tutorial'
    }
  },
  populate: '*'
});
```

## Query Parameters

### Filters

The `filters` parameter supports all Strapi filter operators:

```typescript
const articles = await strapiGet('/articles', {
  filters: {
    // Exact match
    status: {
      $eq: 'published'
    },
    
    // Contains (case insensitive)
    title: {
      $containsi: 'javascript'
    },
    
    // Date range
    publishedAt: {
      $between: ['2024-01-01', '2024-12-31']
    },
    
    // Array values
    category: {
      $in: ['tech', 'programming']
    },
    
    // Complex AND/OR conditions
    $or: [
      { title: { $containsi: 'react' } },
      { title: { $containsi: 'vue' } }
    ]
  }
});
```

### Population

The `populate` parameter supports various formats:

```typescript
// Populate all fields
const articles = await strapiGet('/articles', {
  populate: '*'
});

// Populate specific relations
const articles = await strapiGet('/articles', {
  populate: ['author', 'category']
});

// Nested population
const articles = await strapiGet('/articles', {
  populate: {
    author: {
      populate: ['avatar', 'socialLinks']
    },
    category: true,
    comments: {
      populate: ['author'],
      filters: {
        approved: { $eq: true }
      }
    }
  }
});
```

### Sorting

```typescript
// Single field sort
const articles = await strapiGet('/articles', {
  sort: { publishedAt: 'desc' }
});

// Multiple field sort
const articles = await strapiGet('/articles', {
  sort: ['publishedAt:desc', 'title:asc']
});
```

### Pagination

```typescript
const articles = await strapiGet('/articles', {
  pagination: {
    page: 1,
    pageSize: 25
  }
});

// Or use start/limit
const articles = await strapiGet('/articles', {
  pagination: {
    start: 0,
    limit: 10
  }
});
```

## Advanced Examples

### Complex Query with All Parameters

```typescript
const articles = await strapiGet('/articles', {
  filters: {
    $and: [
      {
        publishedAt: { $notNull: true }
      },
      {
        author: {
          name: { $eq: 'John Doe' }
        }
      }
    ]
  },
  populate: {
    author: {
      populate: ['avatar']
    },
    category: true,
    featuredImage: {
      populate: '*'
    }
  },
  sort: {
    publishedAt: 'desc'
  },
  pagination: {
    page: 1,
    pageSize: 10
  },
  locale: 'en'
});
```

### Creating and Updating Content

```typescript
// Create new article
const newArticle = await strapiPost('/articles', {
  data: {
    title: 'My New Article',
    content: 'Article content here...',
    author: 1,
    category: 2
  }
});

// Update existing article
const updatedArticle = await strapiPut('/articles/123', {
  data: {
    title: 'Updated Title'
  }
});
```

### Using the Generic Request Function

```typescript
import { strapiRequest } from './apis/strapi';

// With full type safety
interface ArticleResponse {
  data: {
    id: number;
    attributes: {
      title: string;
      content: string;
      publishedAt: string;
    };
  };
}

const article = await strapiRequest<ArticleResponse>({
  endpoint: '/articles/123',
  method: 'GET',
  queryParams: {
    populate: ['author', 'category']
  }
});
```

## Environment Variables

Make sure you have the following environment variables set:

```env
# Strapi Configuration
NEXT_PUBLIC_STRAPI_URL=https://your-strapi-instance.com/api
NEXT_PUBLIC_STRAPI_API_TOKEN=your_api_token_here

# Alternative server-side only variables
STRAPI_URL=https://your-strapi-instance.com/api
STRAPI_API_TOKEN=your_api_token_here
```

## Migration from Old Implementation

If you were using the old implementation, here are the key changes:

### Before (Old Implementation)
```typescript
// Old way with manual JSON.stringify
const articles = await strapiGet('/articles', {
  populate: JSON.stringify(['author', 'category'])
});
```

### After (New Implementation)
```typescript
// New way with proper typing
const articles = await strapiGet('/articles', {
  populate: ['author', 'category']
});
```

The new implementation automatically handles the query string building using `qs`, which ensures proper formatting for Strapi's API.

## Troubleshooting

1. **Complex Queries Not Working**: Make sure you're using the proper nested structure as shown in the examples
2. **Type Errors**: The new types are more strict. Check that your query parameters match the expected interfaces
3. **Query String Format**: The `qs` library now handles all query string formatting automatically

## Examples File

See `src/apis/strapi-examples.ts` for comprehensive examples of how to use all the features of the restructured Strapi API integration.
