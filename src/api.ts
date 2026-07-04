import { requestUrl } from "obsidian";
import { LinearIssue } from "./types";
import { GRAPHQL_QUERIES, normalizeIdentifier } from "./constants";

const LINEAR_ENDPOINT = "https://api.linear.app/graphql";

/**
 * Outcome of a live fetch. `unreachable` means we could not talk to Linear
 * (offline / network / auth) and any cached snapshot should be kept as-is.
 * `not-found` means Linear responded but the issue is gone or no longer
 * visible (deleted / access revoked) — the snapshot is also kept.
 */
export type FetchResult =
  | { status: "ok"; issue: LinearIssue }
  | { status: "not-found" }
  | { status: "unreachable" };

export class LinearAPIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  updateApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Fetch a single issue by identifier. Uses Obsidian's `requestUrl` so the
   * request runs in the main process — no CORS/CSP restrictions, works on
   * mobile.
   */
  async fetchIssue(identifier: string): Promise<FetchResult> {
    const match = normalizeIdentifier(identifier).match(/^([A-Z]+)-(\d+)$/);
    if (!match) return { status: "not-found" };

    const teamKey = match[1];
    const number = parseInt(match[2], 10);

    let response;
    try {
      response = await requestUrl({
        url: LINEAR_ENDPOINT,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.apiKey,
        },
        body: JSON.stringify({
          query: GRAPHQL_QUERIES.ISSUE_BY_IDENTIFIER,
          variables: { teamKey, number },
        }),
        throw: false,
      });
    } catch {
      // Network failure / offline.
      return { status: "unreachable" };
    }

    if (response.status < 200 || response.status >= 300) {
      // Auth failure or server error — treat as transient, keep any cache.
      return { status: "unreachable" };
    }

    const payload = response.json as {
      data?: {
        issues?: {
          nodes?: Array<LinearIssue & { comments?: { nodes?: unknown[] } }>;
        };
      };
      errors?: unknown;
    };

    if (payload.errors) {
      return { status: "unreachable" };
    }

    const node = payload.data?.issues?.nodes?.[0];
    if (node) {
      // Collapse the comment list to a count and drop it to keep the cache lean.
      const { comments, ...issue } = node;
      issue.commentCount = comments?.nodes?.length ?? 0;
      return { status: "ok", issue };
    }

    // Responded cleanly but the issue is not visible to this key anymore.
    return { status: "not-found" };
  }

  /** Used by the settings "Test Connection" button. */
  async getTeams(): Promise<Array<{ id: string; name: string; key: string }>> {
    try {
      const response = await requestUrl({
        url: LINEAR_ENDPOINT,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.apiKey,
        },
        body: JSON.stringify({ query: GRAPHQL_QUERIES.ORGANIZATION_TEAMS }),
        throw: false,
      });
      if (response.status < 200 || response.status >= 300) return [];
      const payload = response.json as {
        data?: { teams?: { nodes?: Array<{ id: string; name: string; key: string }> } };
      };
      return payload.data?.teams?.nodes ?? [];
    } catch {
      return [];
    }
  }
}
