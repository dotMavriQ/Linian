import { GraphQLClient } from "graphql-request";
import { LinearIssue, IssueCache } from "./types";
import { GRAPHQL_QUERIES } from "./constants";

export class LinearAPIService {
  private client: GraphQLClient;
  private cache: IssueCache = {};
  private cacheTimeout: number;
  private maxCacheSize: number;

  constructor(
    apiKey: string,
    cacheTimeout: number = 300000,
    maxCacheSize: number = 1000
  ) {
    this.client = new GraphQLClient("https://api.linear.app/graphql", {
      headers: {
        authorization: apiKey,
      },
    });
    this.cacheTimeout = cacheTimeout;
    this.maxCacheSize = maxCacheSize;
  }

  updateApiKey(apiKey: string): void {
    this.client = new GraphQLClient("https://api.linear.app/graphql", {
      headers: {
        authorization: apiKey,
      },
    });
  }

  async getIssue(identifier: string): Promise<LinearIssue | null> {
    // Check cache first
    const cached = this.cache[identifier];
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.issue;
    }

    try {
      const response = await this.client.request<{ issue: LinearIssue }>(
        GRAPHQL_QUERIES.ISSUE_BY_IDENTIFIER,
        { identifier }
      );

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
