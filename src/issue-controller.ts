import { LinearAPIService } from "./api";
import { IssueCacheStore } from "./cache";
import { LinearRenderer } from "./renderer";
import { CachedIssue, IssueDisplayMode, LinearSettings } from "./types";
import { normalizeIdentifier } from "./constants";

/**
 * Orchestrates cache-first, stale-while-revalidate rendering shared by both
 * Reading Mode and Live Preview. Guarantees:
 *  - a cached snapshot paints instantly (no loading flash, works offline);
 *  - Linear is contacted at most once per issue per session, and only when the
 *    snapshot is older than the configured freshness window;
 *  - a failed refresh never discards the cached snapshot.
 */
export class IssueController {
  private inFlight = new Map<string, Promise<CachedIssue | undefined>>();
  private revalidatedThisSession = new Set<string>();

  constructor(
    private api: LinearAPIService,
    private cache: IssueCacheStore,
    private renderer: LinearRenderer,
    private getSettings: () => LinearSettings,
    private openCard: (entry: CachedIssue) => void
  ) {}

  render(
    container: HTMLElement,
    rawKey: string,
    mode: IssueDisplayMode
  ): void {
    const key = normalizeIdentifier(rawKey);
    const cached = this.cache.get(key);

    if (cached) {
      this.paint(container, cached, mode);
      if (this.shouldRevalidate(cached)) {
        void this.ensureFresh(key).then((entry) => {
          if (entry) this.paint(container, entry, mode);
        });
      }
      return;
    }

    container.replaceChildren(this.renderer.createLoadingElement(key, mode));
    void this.ensureFresh(key).then((entry) => {
      if (entry) this.paint(container, entry, mode);
      else
        container.replaceChildren(
          this.renderer.createUnavailableElement(key, mode)
        );
    });
  }

  private paint(
    container: HTMLElement,
    entry: CachedIssue,
    mode: IssueDisplayMode
  ): void {
    const el = this.renderer.createIssueElement(entry, mode);
    el.addEventListener("click", (evt: MouseEvent) => {
      // Plain click opens the in-app card; modifier/middle click follows the
      // href straight to Linear.
      if (evt.ctrlKey || evt.metaKey || evt.button === 1) return;
      evt.preventDefault();
      this.openCard(entry);
    });
    container.replaceChildren(el);
  }

  private shouldRevalidate(entry: CachedIssue): boolean {
    const settings = this.getSettings();
    if (!settings.autoRefresh) return false;
    const key = normalizeIdentifier(entry.issue.identifier);
    if (this.revalidatedThisSession.has(key)) return false;
    return Date.now() - entry.fetchedAt >= settings.staleAfterMs;
  }

  /** Fetch once per id per session, deduped across concurrent callers. */
  private ensureFresh(rawKey: string): Promise<CachedIssue | undefined> {
    const key = normalizeIdentifier(rawKey);
    const existing = this.inFlight.get(key);
    if (existing) return existing;

    const promise = this.doFetch(key).finally(() => {
      this.inFlight.delete(key);
      this.revalidatedThisSession.add(key);
    });
    this.inFlight.set(key, promise);
    return promise;
  }

  private async doFetch(key: string): Promise<CachedIssue | undefined> {
    const result = await this.api.fetchIssue(key);
    switch (result.status) {
      case "ok":
        return this.cache.set(key, result.issue);
      case "not-found":
        // Deleted or access revoked — keep the snapshot, mark it inaccessible.
        return this.cache.markStale(key, "inaccessible");
      case "unreachable":
        // Offline / network / auth — keep the snapshot untouched.
        return this.cache.markStale(key, "unreachable");
    }
  }

  /**
   * Force the next render of every cached issue to revalidate (manual
   * "Refresh" command). Does not fetch here — repaint happens as notes
   * re-render.
   */
  resetSessionGuard(): void {
    this.revalidatedThisSession.clear();
  }
}
