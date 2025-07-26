## API Integration

The plugin uses Linear's GraphQL API. Here are the key queries:

### Get Issue by Identifier
```graphql
query FindIssue($teamKey: String!, $number: Float!) {
  issues(filter: { 
    team: { key: { eq: $teamKey } }, 
    number: { eq: $number } 
  }) {
    nodes {
      id
      identifier
      title
      description
      url
      priority
      state {
        id
        name
        color
      }
      assignee {
        id
        name
        avatarUrl
      }
      team {
        id
        key
        name
      }
      createdAt
      updatedAt
    }
  }
}
```

### Get Organization Teams
```graphql
query Teams {
  teams {
    nodes {
      id
      name
      key
    }
  }
}
```

## Architecture

The plugin is structured with clear separation of concerns:

- **main.ts**: Plugin entry point and markdown post-processing
- **api.ts**: Linear API service with caching
- **renderer.ts**: DOM manipulation and styling
- **settings.ts**: Configuration UI
- **types.ts**: TypeScript interfaces
- **constants.ts**: Configuration and static data

## Plugin Lifecycle

1. **Initialization**: Load settings and initialize services
2. **Markdown Processing**: Scan text for Linear shortcodes
3. **API Fetching**: Retrieve issue data with caching
4. **Rendering**: Replace shortcodes with styled links
5. **Interaction**: Handle tooltips and click events

## Performance Considerations

- **Caching**: Issues are cached to minimize API calls
- **Async Processing**: Non-blocking issue fetching
- **DOM Efficiency**: Minimal DOM manipulation
- **Memory Management**: Automatic cache cleanup
