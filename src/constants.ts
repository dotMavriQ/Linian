import { LinearSettings } from "./types";

export const DEFAULT_SETTINGS: LinearSettings = {
	apiKey: "",
	enablePriorityIcons: true,
	enableAssigneeAvatars: true,
	maxCacheSize: 1000,
	autoRefresh: true,
	staleAfterMs: 6 * 60 * 60 * 1000, // 6 hours
};

/**
 * Normalize a raw shortcode identifier to its canonical cache key.
 * Linear team keys are uppercase and its `eq` filter is case-sensitive, so we
 * upper-case everything; the numeric suffix is unaffected.
 */
export const normalizeIdentifier = (raw: string): string =>
	raw.trim().toUpperCase();

const SHORTCODE_PATTERN = "\\[(L_)?([A-Za-z]+(?:-[A-Za-z]*)?-\\d+)\\]";

export const LINEAR_SHORTCODE_REGEX = new RegExp(SHORTCODE_PATTERN, "gi");

export const createShortcodeRegex = () => new RegExp(SHORTCODE_PATTERN, "gi");

export const GRAPHQL_QUERIES = {
  ISSUE_BY_IDENTIFIER: `
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
					comments {
						nodes {
							id
						}
					}
					createdAt
					updatedAt
				}
			}
		}
	`,
  ORGANIZATION_TEAMS: `
		query Teams {
			teams {
				nodes {
					id
					name
					key
				}
			}
		}
	`,
};

export const STATUS_COLORS = {
  backlog: "#6b7280",
  unstarted: "#8b5cf6",
  started: "#3b82f6",
  completed: "#10b981",
  canceled: "#ef4444",
};

export const PRIORITY_ICONS: { [key: number]: string } = {
  0: "⚪", // No priority
  1: "🔵", // Low
  2: "🟡", // Medium
  3: "🟠", // High
  4: "🔴", // Urgent
};

export const PRIORITY_LABELS: { [key: number]: string } = {
  0: "No priority",
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Urgent",
};
