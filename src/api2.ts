import { LinearIssue, IssueCache } from "./types";
import { GRAPHQL_QUERIES } from "./constants";

// Simple GraphQL client implementation
class SimpleGraphQLClient {
  private endpoint: string;
  private headers: Record<string, string>;

  constructor(endpoint: string, headers: Record<string, string>) {
    this.endpoint = endpoint;
    this.headers = headers;
  }

  async request<T>(query: string, variables: any = {}): Promise<T> {
    console.log("Making GraphQL request to Linear API");
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.headers,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(
        `GraphQL error: ${data.errors.map((e: any) => e.message).join(", ")}`
      );
    }

    return data.data;
  }
}

export class LinearAPIService {
  private client: SimpleGraphQLClient;
  private cache: IssueCache = {};
  private cacheTimeout: number;
  private maxCacheSize: number;

  constructor(
    apiKey: string,
    cacheTimeout: number = 300000,
    maxCacheSize: number = 1000
  ) {
    this.client = new SimpleGraphQLClient("https://api.linear.app/graphql", {
      authorization: apiKey,
    });
    this.cacheTimeout = cacheTimeout;
    this.maxCacheSize = maxCacheSize;
  }

  updateApiKey(apiKey: string): void {
    this.client = new SimpleGraphQLClient("https://api.linear.app/graphql", {
      authorization: apiKey,
    });
  }

  async getIssue(identifier: string): Promise<LinearIssue | null> {
    console.log(`Getting issue: ${identifier}`);

    // Check cache first
    const cached = this.cache[identifier];
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`Returning cached issue: ${identifier}`);
      return cached.issue;
    }

    try {
      console.log(`Fetching issue from API: ${identifier}`);
      const response = await this.client.request<{ issue: LinearIssue }>(
        GRAPHQL_QUERIES.ISSUE_BY_IDENTIFIER,
        { identifier }
      );

      console.log("API Response:", response);

      if (response.issue) {
        // Update cache
        this.updateCache(identifier, response.issue);
        return response.issue;
      }

      return null;
    } catch (error) {
      console.error("Error fetching Linear issue:", error);
      return null;
    }
  }

  async getTeams(): Promise<Array<{ id: string; name: string; key: string }>> {
    try {
      const response = await this.client.request<{
        teams: { nodes: Array<{ id: string; name: string; key: string }> };
      }>(GRAPHQL_QUERIES.ORGANIZATION_TEAMS);

      return response.teams.nodes;
    } catch (error) {
      console.error("Error fetching Linear teams:", error);
      return [];
    }
  }

  private updateCache(identifier: string, issue: LinearIssue): void {
    // Remove oldest entries if cache is full
    if (Object.keys(this.cache).length >= this.maxCacheSize) {
      const oldestKey = Object.keys(this.cache).sort(
        (a, b) => this.cache[a].timestamp - this.cache[b].timestamp
      )[0];
      delete this.cache[oldestKey];
    }

    this.cache[identifier] = {
      issue,
      timestamp: Date.now(),
    };
  }

  clearCache(): void {
    this.cache = {};
  }

  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: Object.keys(this.cache).length,
      maxSize: this.maxCacheSize,
    };
  }
}
