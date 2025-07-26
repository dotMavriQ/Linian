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
  createdAt: string;
  updatedAt: string;
}

export interface LinearSettings {
  apiKey: string;
  organizationId?: string;
  defaultTeam?: string;
  enableTooltips: boolean;
  enablePriorityIcons: boolean;
  enableAssigneeAvatars: boolean;
  cacheTimeout: number;
  maxCacheSize: number;
}

export interface IssueCache {
  [key: string]: {
    issue: LinearIssue;
    timestamp: number;
  };
}
