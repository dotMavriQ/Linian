export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  url: string;
  state: {
    id: string;
    name: string;
    color: string;
    type: string;
  };
  priority?: number; // Fixed: Linear API returns priority as a number (0-4)
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  team: {
    id: string;
    name: string;
    key: string;
  };
  /** Number of comments on the issue at fetch time. */
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type IssueDisplayMode = "compact" | "expanded";

export interface LinearSettings {
  apiKey: string;
  enablePriorityIcons: boolean;
  enableAssigneeAvatars: boolean;
  maxCacheSize: number;
  /** Automatically revalidate cached issues in the background when they age. */
  autoRefresh: boolean;
  /** How long a cached snapshot stays "fresh" before a background refresh (ms). */
  staleAfterMs: number;
}

/** Freshness of a cached snapshot relative to the live Linear data. */
export type CacheStatus =
  | "fresh" // last fetch succeeded
  | "unreachable" // last refresh failed (offline / network)
  | "inaccessible"; // Linear returned no issue (deleted or access revoked)

/** A persisted snapshot of an issue plus the metadata needed for SWR. */
export interface CachedIssue {
  issue: LinearIssue;
  /** Timestamp of the last successful retrieval of `issue`. */
  fetchedAt: number;
  /** Timestamp of the last revalidation attempt (success or failure). */
  lastAttempt: number;
  status: CacheStatus;
}

/** On-disk shape of the issue cache. */
export interface PersistedCache {
  version: 1;
  entries: Record<string, CachedIssue>;
}
