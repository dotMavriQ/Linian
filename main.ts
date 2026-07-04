import { Plugin, MarkdownPostProcessorContext } from "obsidian";
import { LinearAPIService } from "./src/api";
import { LinearRenderer } from "./src/renderer";
import { IssueCacheStore } from "./src/cache";
import { IssueController } from "./src/issue-controller";
import { IssueCard } from "./src/card";
import { LinianSettingTab } from "./src/settings";
import { CachedIssue, IssueDisplayMode, LinearSettings } from "./src/types";
import { DEFAULT_SETTINGS, createShortcodeRegex } from "./src/constants";
import { LinearViewPluginManager } from "./src/live-preview";

export default class LinianPlugin extends Plugin {
  settings: LinearSettings;
  api: LinearAPIService;
  cache: IssueCacheStore;
  private renderer: LinearRenderer;
  private controller: IssueController;
  private viewPluginManager: LinearViewPluginManager;

  async onload() {
    await this.loadSettings();

    // Persistent, offline-first cache.
    this.cache = new IssueCacheStore(this, this.settings.maxCacheSize);
    await this.cache.load();

    this.api = new LinearAPIService(this.settings.apiKey);
    this.renderer = new LinearRenderer(this.settings);
    this.controller = new IssueController(
      this.api,
      this.cache,
      this.renderer,
      () => this.settings,
      (entry: CachedIssue) => new IssueCard(this.app, entry).open()
    );

    this.addSettingTab(new LinianSettingTab(this.app, this));

    // Reading Mode.
    this.registerMarkdownPostProcessor(
      this.processLinearShortcodes.bind(this)
    );

    // Live Preview (registered once; the controller reference is stable).
    this.viewPluginManager = new LinearViewPluginManager();
    this.viewPluginManager.setController(this.controller);
    const viewPlugin = this.viewPluginManager.getViewPlugin();
    if (viewPlugin) this.registerEditorExtension(viewPlugin);

    this.addCommand({
      id: "refresh-linear-cache",
      name: "Refresh Linear cache",
      callback: () => {
        this.controller.resetSessionGuard();
        this.app.workspace.updateOptions();
      },
    });
  }

  async onunload() {
    // Persist the cache so snapshots survive restarts and offline sessions.
    if (this.cache) await this.cache.flushNow();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.renderer?.updateSettings(this.settings);
    this.api?.updateApiKey(this.settings.apiKey);
    this.cache?.setMaxSize(this.settings.maxCacheSize);
    // Re-render open notes so setting changes take effect immediately.
    this.app.workspace.updateOptions();
  }

  private processLinearShortcodes(
    element: HTMLElement,
    _context: MarkdownPostProcessorContext
  ): void {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    while (walker.nextNode()) {
      const current = walker.currentNode as Text;
      if (!current.nodeValue?.length) continue;
      if (current.parentElement?.closest(".linian-inline-issue")) continue;
      textNodes.push(current);
    }

    for (const textNode of textNodes) {
      const sourceText = textNode.nodeValue ?? "";
      const regex = createShortcodeRegex();
      const fragment = document.createDocumentFragment();
      const pending: Array<{
        container: HTMLElement;
        key: string;
        mode: IssueDisplayMode;
      }> = [];

      let match: RegExpExecArray | null;
      let lastIndex = 0;
      let hasMatch = false;

      while ((match = regex.exec(sourceText)) !== null) {
        hasMatch = true;
        const preceding = sourceText.slice(lastIndex, match.index);
        if (preceding) fragment.appendChild(document.createTextNode(preceding));

        const mode: IssueDisplayMode = match[1] ? "expanded" : "compact";
        const container = document.createElement("span");
        container.className = "linian-inline-issue linian-container";
        fragment.appendChild(container);
        pending.push({ container, key: match[2], mode });

        lastIndex = regex.lastIndex;
      }

      if (!hasMatch) continue;

      const trailing = sourceText.slice(lastIndex);
      if (trailing) fragment.appendChild(document.createTextNode(trailing));

      textNode.parentNode?.replaceChild(fragment, textNode);

      for (const { container, key, mode } of pending) {
        this.controller.render(container, key, mode);
      }
    }
  }
}
