import {
  App,
  ButtonComponent,
  Component,
  MarkdownRenderer,
  Modal,
} from "obsidian";
import { CachedIssue } from "./types";
import { PRIORITY_ICONS, PRIORITY_LABELS } from "./constants";

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hrs = Math.round(min / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/**
 * A minimal, offline-capable preview of an issue built entirely from the
 * cached snapshot, with a button to open the live issue in Linear.
 */
export class IssueCard extends Modal {
  private component = new Component();

  constructor(app: App, private entry: CachedIssue) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    const { issue, status, fetchedAt } = this.entry;
    contentEl.addClass("linian-card");

    const header = contentEl.createDiv({ cls: "linian-card-header" });
    header.createEl("span", {
      cls: "linian-card-identifier",
      text: issue.identifier,
    });
    const statusPill = header.createEl("span", {
      cls: "linian-card-status",
      text: issue.state.name,
    });
    statusPill.style.backgroundColor = issue.state.color;

    contentEl.createEl("h3", { cls: "linian-card-title", text: issue.title });

    const meta = contentEl.createDiv({ cls: "linian-card-meta" });
    meta.createEl("span", {
      cls: "linian-card-team",
      text: issue.team.name,
    });
    if (issue.assignee) {
      meta.createEl("span", {
        cls: "linian-card-assignee",
        text: `@${issue.assignee.name}`,
      });
    }
    if (issue.priority !== undefined) {
      meta.createEl("span", {
        cls: "linian-card-priority",
        text: `${PRIORITY_ICONS[issue.priority] || PRIORITY_ICONS[0]} ${
          PRIORITY_LABELS[issue.priority] || PRIORITY_LABELS[0]
        }`,
      });
    }
    if (issue.commentCount !== undefined) {
      const n = issue.commentCount;
      meta.createEl("span", {
        cls: "linian-card-comments",
        text: `💬 ${n} comment${n === 1 ? "" : "s"}`,
      });
    }

    if (issue.description) {
      this.component.load();
      const descEl = contentEl.createDiv({ cls: "linian-card-description" });
      // Render the full Markdown body; the container scrolls when it overflows.
      void MarkdownRenderer.render(
        this.app,
        issue.description,
        descEl,
        "",
        this.component
      );
    }

    const footer = contentEl.createDiv({ cls: "linian-card-footer" });
    const note = footer.createEl("span", { cls: "linian-card-freshness" });
    if (status === "fresh") {
      note.setText(`Updated ${formatRelative(fetchedAt)}`);
    } else if (status === "inaccessible") {
      note.addClass("linian-card-freshness--warn");
      note.setText(
        `Saved copy — no longer accessible in Linear (last updated ${formatRelative(
          fetchedAt
        )})`
      );
    } else {
      note.addClass("linian-card-freshness--warn");
      note.setText(
        `Saved copy — Linear unreachable (last updated ${formatRelative(
          fetchedAt
        )})`
      );
    }

    new ButtonComponent(footer)
      .setButtonText("Open in Linear")
      .setCta()
      .onClick(() => window.open(issue.url, "_blank"));
  }

  onClose(): void {
    this.component.unload();
    this.contentEl.empty();
  }
}
