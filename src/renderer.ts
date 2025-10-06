import { IssueDisplayMode, LinearIssue, LinearSettings } from "./types";
import { PRIORITY_ICONS } from "./constants";

export class LinearRenderer {
  private settings: LinearSettings;

  constructor(settings: LinearSettings) {
    this.settings = settings;
  }

  createIssueElement(
    issue: LinearIssue,
    displayMode: IssueDisplayMode = "compact"
  ): HTMLElement {
    const issueEl = document.createElement("a");
    issueEl.className = "linian-issue-link";
    if (displayMode === "expanded") {
      issueEl.classList.add("linian-issue-link--expanded");
    }
    issueEl.href = issue.url;
    issueEl.setAttribute(
      "aria-label",
      `Linear issue: ${issue.identifier} - ${issue.title}`
    );

    // Main content
    const contentEl = document.createElement("span");
    contentEl.className = "linian-issue-content";

    const shouldShowPriorityIcon =
      this.settings.enablePriorityIcons && issue.priority !== undefined;

    // Priority icon
    if (shouldShowPriorityIcon && displayMode === "compact") {
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

    if (displayMode === "expanded") {
      const leadingDot = document.createElement("span");
      leadingDot.className = "linian-expanded-dot linian-expanded-dot--leading";
      leadingDot.textContent = "●";
      leadingDot.style.color = issue.state.color;
      contentEl.appendChild(leadingDot);

      const titleEl = document.createElement("span");
      titleEl.className = "linian-issue-title";
      titleEl.textContent = issue.title;
      contentEl.appendChild(titleEl);

      const trailingDot = document.createElement("span");
      trailingDot.className =
        "linian-expanded-dot linian-expanded-dot--trailing";
      trailingDot.textContent = "•";
      trailingDot.style.color = issue.state.color;
      contentEl.appendChild(trailingDot);
    } else {
      const identifierEl = document.createElement("span");
      identifierEl.className = "linian-issue-identifier";
      identifierEl.textContent = issue.identifier;
      contentEl.appendChild(identifierEl);

      const statusEl = document.createElement("span");
      statusEl.className = "linian-status-indicator";
      statusEl.style.backgroundColor = issue.state.color;
      statusEl.setAttribute("title", issue.state.name);
      contentEl.appendChild(statusEl);
    }

    issueEl.appendChild(contentEl);

    if (
      displayMode === "compact" &&
      this.settings.enableAssigneeAvatars &&
      issue.assignee?.avatarUrl
    ) {
      const avatarEl = document.createElement("img");
      avatarEl.className = "linian-assignee-avatar";
      avatarEl.src = issue.assignee.avatarUrl;
      avatarEl.alt = issue.assignee.name;
      avatarEl.setAttribute("title", `Assigned to ${issue.assignee.name}`);
      issueEl.appendChild(avatarEl);
    }

    if (displayMode === "expanded") {
      this.attachTooltip(issueEl, issue);
    }

    return issueEl;
  }

  createLoadingElement(
    identifier: string,
    displayMode: IssueDisplayMode = "compact"
  ): HTMLElement {
    const loadingEl = document.createElement("span");
    loadingEl.className = "linian-loading";
    if (displayMode === "expanded") {
      loadingEl.classList.add("linian-loading--expanded");
      loadingEl.textContent = "Loading issue...";
    } else {
      loadingEl.textContent = identifier;
    }
    loadingEl.setAttribute("title", "Loading Linear issue...");
    return loadingEl;
  }

  createErrorElement(
    identifier: string,
    displayMode: IssueDisplayMode = "compact"
  ): HTMLElement {
    const errorEl = document.createElement("span");
    errorEl.className = "linian-error";
    if (displayMode === "expanded") {
      errorEl.classList.add("linian-error--expanded");
      errorEl.textContent = "Failed to load issue";
    } else {
      errorEl.textContent = identifier;
    }
    errorEl.setAttribute("title", "Failed to load Linear issue");
    return errorEl;
  }

  private attachTooltip(element: HTMLElement, issue: LinearIssue): void {
    let tooltipEl: HTMLElement | null = null;

    const showTooltip = () => {
      if (tooltipEl) return;

      tooltipEl = document.createElement("div");
      tooltipEl.className = "linian-tooltip";

      const titleEl = document.createElement("div");
      titleEl.className = "linian-tooltip-title";
      titleEl.textContent = issue.title;
      tooltipEl.appendChild(titleEl);

      const metaEl = document.createElement("div");
      metaEl.className = "linian-tooltip-meta";
      metaEl.innerHTML = `
        <span class="linian-tooltip-status" style="background-color: ${issue.state.color}">
          ${issue.state.name}
        </span>
        <span class="linian-tooltip-team">${issue.team.name}</span>
        ${
          issue.assignee
            ? `<span class="linian-tooltip-assignee">@${issue.assignee.name}</span>`
            : ""
        }
      `;
      tooltipEl.appendChild(metaEl);

      const idEl = document.createElement("div");
      idEl.className = "linian-tooltip-identifier";
      idEl.textContent = issue.identifier;
      tooltipEl.appendChild(idEl);

      if (issue.description) {
        const descEl = document.createElement("div");
        descEl.className = "linian-tooltip-description";
        const trimmed = issue.description.replace(/\s+/g, " ");
        const preview = trimmed.slice(0, 260);
        descEl.textContent =
          preview + (trimmed.length > preview.length ? "…" : "");
        tooltipEl.appendChild(descEl);
      }

      const rect = element.getBoundingClientRect();
      tooltipEl.style.position = "fixed";
      tooltipEl.style.top = `${rect.bottom + 8}px`;
      tooltipEl.style.left = `${rect.left}px`;
      tooltipEl.style.maxWidth = "360px";
      tooltipEl.style.zIndex = "1000";

      document.body.appendChild(tooltipEl);
    };

    const hideTooltip = () => {
      if (tooltipEl) {
        tooltipEl.remove();
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
