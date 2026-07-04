import { CachedIssue, IssueDisplayMode, LinearSettings } from "./types";
import { PRIORITY_ICONS, PRIORITY_LABELS } from "./constants";

export class LinearRenderer {
  private settings: LinearSettings;

  constructor(settings: LinearSettings) {
    this.settings = settings;
  }

  updateSettings(settings: LinearSettings): void {
    this.settings = settings;
  }

  /** Build the inline issue link from a cached snapshot. */
  createIssueElement(
    entry: CachedIssue,
    displayMode: IssueDisplayMode = "compact"
  ): HTMLAnchorElement {
    const { issue } = entry;
    const issueEl = document.createElement("a");
    issueEl.className = "linian-issue-link";
    if (displayMode === "expanded") {
      issueEl.classList.add("linian-issue-link--expanded");
    }
    if (entry.status !== "fresh") {
      issueEl.classList.add("linian-issue-link--cached");
    }
    issueEl.href = issue.url;
    issueEl.setAttribute(
      "aria-label",
      `Linear issue: ${issue.identifier} - ${issue.title}`
    );

    const contentEl = document.createElement("span");
    contentEl.className = "linian-issue-content";

    const showPriority =
      this.settings.enablePriorityIcons && issue.priority !== undefined;

    if (showPriority && displayMode === "compact") {
      const priorityEl = document.createElement("span");
      priorityEl.className = "linian-priority-icon";
      priorityEl.textContent =
        PRIORITY_ICONS[issue.priority as number] || PRIORITY_ICONS[0];
      priorityEl.setAttribute(
        "title",
        PRIORITY_LABELS[issue.priority as number] || PRIORITY_LABELS[0]
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
      loadingEl.textContent = "Loading issue…";
    } else {
      loadingEl.textContent = identifier;
    }
    loadingEl.setAttribute("title", "Loading Linear issue…");
    return loadingEl;
  }

  /** Shown only when there is no cached snapshot and Linear is unreachable. */
  createUnavailableElement(
    identifier: string,
    displayMode: IssueDisplayMode = "compact"
  ): HTMLElement {
    const el = document.createElement("span");
    el.className = "linian-unavailable";
    if (displayMode === "expanded") {
      el.classList.add("linian-unavailable--expanded");
    }
    el.textContent = identifier;
    el.setAttribute(
      "title",
      "Not cached yet and Linear is currently unreachable."
    );
    return el;
  }
}
