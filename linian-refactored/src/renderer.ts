import { LinearIssue, LinearSettings } from "./types";
import { STATUS_COLORS, PRIORITY_ICONS } from "./constants";

export class LinearRenderer {
  private settings: LinearSettings;
  private containerEl: HTMLElement;

  constructor(settings: LinearSettings, containerEl: HTMLElement) {
    this.settings = settings;
    this.containerEl = containerEl;
  }

  createIssueElement(issue: LinearIssue): HTMLElement {
    const issueEl = document.createElement("a");
    issueEl.className = "linian-issue-link";
    issueEl.href = issue.url;
    issueEl.setAttribute(
      "aria-label",
      `Linear issue: ${issue.identifier} - ${issue.title}`
    );
    issueEl.setAttribute("data-tooltip-position", "top");

    // Main content
    const contentEl = document.createElement("span");
    contentEl.className = "linian-issue-content";

    // Priority icon
    if (this.settings.enablePriorityIcons && issue.priority !== undefined) {
      const priorityEl = document.createElement("span");
      priorityEl.className = "linian-priority-icon";
      priorityEl.textContent =
        PRIORITY_ICONS[issue.priority] || PRIORITY_ICONS[0];
      // Create priority label based on the number
      const priorityLabels = {
        0: "No priority",
        1: "Low",
        2: "Medium",
        3: "High",
        4: "Urgent",
      };
      priorityEl.setAttribute(
        "title",
        priorityLabels[issue.priority as keyof typeof priorityLabels] ||
          "No priority"
      );
      contentEl.appendChild(priorityEl);
    }

    // Issue identifier
    const identifierEl = document.createElement("span");
    identifierEl.className = "linian-issue-identifier";
    identifierEl.textContent = issue.identifier;
    contentEl.appendChild(identifierEl);

    // Status indicator
    const statusEl = document.createElement("span");
    statusEl.className = "linian-status-indicator";
    statusEl.style.backgroundColor = issue.state.color;
    statusEl.setAttribute("title", issue.state.name);
    contentEl.appendChild(statusEl);

    issueEl.appendChild(contentEl);

    // Assignee avatar
    if (this.settings.enableAssigneeAvatars && issue.assignee?.avatarUrl) {
      const avatarEl = document.createElement("img");
      avatarEl.className = "linian-assignee-avatar";
      avatarEl.src = issue.assignee.avatarUrl;
      avatarEl.alt = issue.assignee.name;
      avatarEl.setAttribute("title", `Assigned to ${issue.assignee.name}`);
      issueEl.appendChild(avatarEl);
    }

    // Add tooltip
    if (this.settings.enableTooltips) {
      this.addTooltip(issueEl, issue);
    }

    return issueEl;
  }

  createLoadingElement(identifier: string): HTMLElement {
    const loadingEl = document.createElement("span");
    loadingEl.className = "linian-loading";
    loadingEl.textContent = identifier;
    loadingEl.setAttribute("title", "Loading Linear issue...");
    return loadingEl;
  }

  createErrorElement(identifier: string): HTMLElement {
    const errorEl = document.createElement("span");
    errorEl.className = "linian-error";
    errorEl.textContent = identifier;
    errorEl.setAttribute("title", "Failed to load Linear issue");
    return errorEl;
  }

  private addTooltip(element: HTMLElement, issue: LinearIssue): void {
    let tooltipEl: HTMLElement | null = null;

    const showTooltip = (event: MouseEvent) => {
      if (tooltipEl) return;

      tooltipEl = document.createElement("div");
      tooltipEl.className = "linian-tooltip";

      const titleEl = document.createElement("div");
      titleEl.className = "linian-tooltip-title";
      titleEl.textContent = issue.title;

      const metaEl = document.createElement("div");
      metaEl.className = "linian-tooltip-meta";
      metaEl.innerHTML = `
				<span class="linian-tooltip-status" style="background-color: ${
          issue.state.color
        }">
					${issue.state.name}
				</span>
				<span class="linian-tooltip-team">${issue.team.name}</span>
				${
          issue.assignee
            ? `<span class="linian-tooltip-assignee">@${issue.assignee.name}</span>`
            : ""
        }
			`;

      // Add title and meta first
      tooltipEl.appendChild(titleEl);
      tooltipEl.appendChild(metaEl);

      // Add description last (proper UX order)
      if (issue.description) {
        const descEl = document.createElement("div");
        descEl.className = "linian-tooltip-description";
        descEl.textContent =
          issue.description.slice(0, 200) +
          (issue.description.length > 200 ? "..." : "");
        tooltipEl.appendChild(descEl);
      }

      // Position tooltip
      const rect = element.getBoundingClientRect();
      tooltipEl.style.position = "absolute";
      tooltipEl.style.top = `${rect.top - 10}px`;
      tooltipEl.style.left = `${rect.left}px`;
      tooltipEl.style.transform = "translateY(-100%)";
      tooltipEl.style.zIndex = "1000";

      document.body.appendChild(tooltipEl);
    };

    const hideTooltip = () => {
      if (tooltipEl) {
        document.body.removeChild(tooltipEl);
        tooltipEl = null;
      }
    };

    element.addEventListener("mouseenter", showTooltip);
    element.addEventListener("mouseleave", hideTooltip);
    element.addEventListener("click", hideTooltip);
  }

  updateSettings(settings: LinearSettings): void {
    this.settings = settings;
  }
}
