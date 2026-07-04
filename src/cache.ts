import { Plugin, debounce, normalizePath } from "obsidian";
import {
  CachedIssue,
  CacheStatus,
  LinearIssue,
  PersistedCache,
} from "./types";
import { normalizeIdentifier } from "./constants";

const CACHE_FILE = "issue-cache.json";
const CACHE_VERSION = 1 as const;

/**
 * Disk-backed store of issue snapshots. Survives reloads and offline restarts,
 * so previously-seen shortcodes stay rendered and clickable even when Linear is
 * unreachable or access has been revoked.
 */
export class IssueCacheStore {
  private entries = new Map<string, CachedIssue>();
  private maxSize: number;
  private readonly persist: () => void;

  constructor(private plugin: Plugin, maxSize: number) {
    this.maxSize = maxSize;
    // Coalesce rapid writes; failures here must never disrupt rendering.
    this.persist = debounce(() => void this.flush(), 1500, false);
  }

  setMaxSize(maxSize: number): void {
    this.maxSize = maxSize;
  }

  private get path(): string {
    return normalizePath(`${this.plugin.manifest.dir}/${CACHE_FILE}`);
  }

  /** Load persisted snapshots from disk. Safe to call once on plugin load. */
  async load(): Promise<void> {
    try {
      const adapter = this.plugin.app.vault.adapter;
      if (!(await adapter.exists(this.path))) return;
      const raw = await adapter.read(this.path);
      const parsed = JSON.parse(raw) as PersistedCache;
      if (!parsed || parsed.version !== CACHE_VERSION || !parsed.entries) return;
      this.entries = new Map(Object.entries(parsed.entries));
    } catch {
      // Corrupt or unreadable cache is non-fatal: start empty, rebuild on use.
      this.entries = new Map();
    }
  }

  private async flush(): Promise<void> {
    try {
      const data: PersistedCache = {
        version: CACHE_VERSION,
        entries: Object.fromEntries(this.entries),
      };
      await this.plugin.app.vault.adapter.write(
        this.path,
        JSON.stringify(data)
      );
    } catch {
      // Best-effort persistence; the in-memory cache remains authoritative.
    }
  }

  /** Force any pending write immediately (used on unload). */
  async flushNow(): Promise<void> {
    await this.flush();
  }

  get(rawKey: string): CachedIssue | undefined {
    return this.entries.get(normalizeIdentifier(rawKey));
  }

  /** Store a freshly-fetched issue and mark it fresh. */
  set(rawKey: string, issue: LinearIssue): CachedIssue {
    const key = normalizeIdentifier(rawKey);
    const now = Date.now();
    const entry: CachedIssue = {
      issue,
      fetchedAt: now,
      lastAttempt: now,
      status: "fresh",
    };
    this.entries.set(key, entry);
    this.evictIfNeeded();
    this.persist();
    return entry;
  }

  /**
   * Record a failed revalidation without discarding the stored snapshot.
   * Returns the retained entry (if any) so callers can keep rendering it.
   */
  markStale(rawKey: string, status: CacheStatus): CachedIssue | undefined {
    const key = normalizeIdentifier(rawKey);
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    entry.lastAttempt = Date.now();
    entry.status = status;
    this.persist();
    return entry;
  }

  clear(): void {
    this.entries.clear();
    this.persist();
  }

  size(): number {
    return this.entries.size;
  }

  private evictIfNeeded(): void {
    if (this.entries.size <= this.maxSize) return;
    // Evict least-recently-fetched first.
    const sorted = [...this.entries.entries()].sort(
      (a, b) => a[1].fetchedAt - b[1].fetchedAt
    );
    const overflow = this.entries.size - this.maxSize;
    for (let i = 0; i < overflow; i++) {
      this.entries.delete(sorted[i][0]);
    }
  }
}
