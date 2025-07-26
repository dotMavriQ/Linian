import { LinearSettings } from "./types";

export const DEFAULT_SETTINGS: LinearSettings = {
  apiKey: "",
  organizationId: "",
  defaultTeam: "",
  enableTooltips: true,
  enablePriorityIcons: true,
  enableAssigneeAvatars: true,
  cacheTimeout: 300000, // 5 minutes
  maxCacheSize: 1000,
};

export const LINEAR_SHORTCODE_REGEX = /\[([A-Za-z]+(?:-[A-Za-z]*)?-\d+)\]/gi;

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
