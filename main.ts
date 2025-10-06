import {
  Plugin,
  MarkdownPostProcessor,
  MarkdownPostProcessorContext,
  MarkdownView,
} from "obsidian";
import { LinearAPIService } from "./src/api";
import { LinearRenderer } from "./src/renderer";
import { LinianSettingTab } from "./src/settings";
import { IssueDisplayMode, LinearSettings } from "./src/types";
import { DEFAULT_SETTINGS, createShortcodeRegex } from "./src/constants";
import { LinearViewPluginManager } from "./src/live-preview";

export default class LinianPlugin extends Plugin {
  settings: LinearSettings;
  private apiService: LinearAPIService | null = null;
  private renderer: LinearRenderer | null = null;
  private postProcessor: MarkdownPostProcessor;
  private viewPluginManager: LinearViewPluginManager;

  async onload() {
    console.log("Loading Linian plugin...");

    // Load settings
    await this.loadSettings();
    console.log("Loaded settings:", this.settings);

    // Initialize services if API key is available
    if (this.settings.apiKey) {
      console.log("API key found, initializing services");
      this.initializeServices();
    } else {
      console.log("No API key found in settings");
    }

    // Add settings tab
    this.addSettingTab(new LinianSettingTab(this.app, this));

    // Register markdown post processor for Reading Mode
    console.log("Registering markdown post processor");
    this.postProcessor = this.registerMarkdownPostProcessor(
      this.processLinearShortcodes.bind(this)
    );

    // Register editor extension for Live Preview Mode
    console.log("Registering live preview editor extension");
    this.viewPluginManager = new LinearViewPluginManager();
    if (this.apiService && this.renderer) {
      this.viewPluginManager.setServices(this.apiService, this.renderer);
      const viewPlugin = this.viewPluginManager.getViewPlugin();
      if (viewPlugin) {
        this.registerEditorExtension(viewPlugin);
      }
    }

    // Add commands
    this.addCommand({
      id: "refresh-linear-cache",
      name: "Refresh Linear Cache",
      callback: () => {
        if (this.apiService) {
          this.apiService.clearCache();
          // Force refresh of current view
          this.app.workspace.updateOptions();
        }
      },
    });

    // Add debugging command
    this.addCommand({
      id: "debug-linear-shortcodes",
      name: "Debug Linear Shortcodes",
      callback: () => {
        console.log("=== DEBUGGING LINEAR SHORTCODES ===");

        // Get current view content
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView) {
          const content = activeView.editor.getValue();
          console.log("Full page content:", content);

          const matches = content.match(createShortcodeRegex());
          console.log("Found matches in content:", matches);
        }

        // Find all elements containing shortcodes
        const elements = document.querySelectorAll("*");
        let foundElements = [];
        elements.forEach((el) => {
          if (
            el.textContent &&
            createShortcodeRegex().test(el.textContent)
          ) {
            foundElements.push({
              element: el,
              tagName: el.tagName,
              className: el.className,
              innerHTML: el.innerHTML,
              textContent: el.textContent,
            });
          }
        });
        console.log("Elements containing shortcodes:", foundElements);

        // Manually trigger processing on current content
        const currentLeaf = this.app.workspace.activeLeaf;
        if (currentLeaf && currentLeaf.view instanceof MarkdownView) {
          const markdownView = currentLeaf.view as MarkdownView;
          console.log(
            "Manually triggering processing on:",
            markdownView.contentEl
          );
          // Create a mock context for testing
          const mockContext = {
            docId: "debug",
            sourcePath: "debug",
            frontmatter: {},
            addChild: () => {},
            getSectionInfo: () => null,
          } as MarkdownPostProcessorContext;
          this.processLinearShortcodes(markdownView.contentEl, mockContext);
        }
      },
    });

    console.log("Linian plugin loaded successfully");
  }

  onunload() {
    console.log("Unloading Linian plugin...");

    // Clean up services and prevent memory leaks
    if (this.apiService) {
      this.apiService.clearCache();
      this.apiService = null;
    }

    if (this.renderer) {
      this.renderer = null;
    }

    if (this.viewPluginManager) {
      this.viewPluginManager = null;
    }

    // Clear any remaining DOM elements
    const linianElements = document.querySelectorAll(
      ".linian-inline-issue"
    );
    linianElements.forEach((el) => el.remove());
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);

    // Update renderer settings if available
    if (this.renderer) {
      this.renderer.updateSettings(this.settings);
    }
  }

  updateAPIService(apiService: LinearAPIService) {
    this.apiService = apiService;
    this.initializeRenderer();
  }

  private initializeServices() {
    this.apiService = new LinearAPIService(
      this.settings.apiKey,
      this.settings.cacheTimeout,
      this.settings.maxCacheSize
    );
    this.initializeRenderer();
  }

  private initializeRenderer() {
    if (!this.apiService) return;

    this.renderer = new LinearRenderer(this.settings);

    // Update view plugin manager with services
    if (this.viewPluginManager) {
      this.viewPluginManager.setServices(this.apiService, this.renderer);
      const viewPlugin = this.viewPluginManager.getViewPlugin();
      if (viewPlugin) {
        this.registerEditorExtension(viewPlugin);
      }
    }
  }

  private async processLinearShortcodes(
    element: HTMLElement,
    context: MarkdownPostProcessorContext
  ) {
    console.log("processLinearShortcodes called with element:", element);
    console.log("Element innerHTML:", element.innerHTML);
    console.log("API Service:", !!this.apiService);
    console.log("Renderer:", !!this.renderer);
    console.log("Settings API Key:", !!this.settings.apiKey);

    // Initialize services if not already done and we have an API key
    if (!this.apiService && this.settings.apiKey) {
      console.log("Initializing services in post processor");
      this.initializeServices();
    }

    if (!this.apiService || !this.renderer) {
      console.log("Services not initialized, skipping processing");
      return; // Services not initialized
    }

    console.log("Processing Linear shortcodes in element:", element);

    // Convert inline issues to tags like the Jira plugin does
    await this.convertInlineIssuesToTags(element);
  }

  private async convertInlineIssuesToTags(el: HTMLElement): Promise<void> {
    if (!this.apiService || !this.renderer) {
      console.log("convertInlineIssuesToTags: Services not available");
      return;
    }

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];

    while (walker.nextNode()) {
      const current = walker.currentNode as Text;
      if (!current.nodeValue?.length) continue;
      if (current.parentElement?.closest(".linian-inline-issue")) continue;
      textNodes.push(current);
    }

    if (!textNodes.length) {
      console.log("No text nodes to process");
    }

    textNodes.forEach((textNode) => {
      const sourceText = textNode.nodeValue ?? "";
      const regex = createShortcodeRegex();

      let match: RegExpExecArray | null;
      let lastIndex = 0;
      let hasMatch = false;
      const fragment = document.createDocumentFragment();

      while ((match = regex.exec(sourceText)) !== null) {
        hasMatch = true;

        const precedingText = sourceText.slice(lastIndex, match.index);
        if (precedingText) {
          fragment.appendChild(document.createTextNode(precedingText));
        }

        const displayMode: IssueDisplayMode = match[1]
          ? "expanded"
          : "compact";
        const identifier = match[2];

        const container = document.createElement("span");
        container.className = "linian-inline-issue linian-container";
        container.setAttribute("data-issue-key", identifier);
        container.setAttribute("data-display-mode", displayMode);

        const loadingElement = this.renderer!.createLoadingElement(
          identifier,
          displayMode
        );
        container.appendChild(loadingElement);

        fragment.appendChild(container);
        lastIndex = regex.lastIndex;
      }

      if (!hasMatch) {
        return;
      }

      const trailingText = sourceText.slice(lastIndex);
      if (trailingText) {
        fragment.appendChild(document.createTextNode(trailingText));
      }

      textNode.parentNode?.replaceChild(fragment, textNode);
    });

    const inlineIssueTags = el.querySelectorAll(
      "span.linian-inline-issue:not([data-rendered])"
    );
    console.log("Found inline issue tags:", inlineIssueTags.length);

    for (const container of Array.from(inlineIssueTags)) {
      const issueKey = container.getAttribute("data-issue-key");
      const displayMode =
        (container.getAttribute("data-display-mode") as IssueDisplayMode) ||
        "compact";
      if (issueKey) {
        console.log(
          `Fetching issue: ${issueKey} (displayMode: ${displayMode})`
        );
        this.fetchAndRenderIssue(issueKey, container as HTMLElement, displayMode);
      }
    }
  }
  private async fetchAndRenderIssue(
    identifier: string,
    containerElement: HTMLElement,
    displayMode: IssueDisplayMode
  ): Promise<void> {
    if (!this.apiService || !this.renderer) return;

    try {
      console.log(`Fetching Linear issue: ${identifier}`);
      const issue = await this.apiService.getIssue(identifier);
      console.log("Fetched issue:", issue);

      if (issue) {
        const issueElement = this.renderer.createIssueElement(
          issue,
          displayMode
        );
        // Use replaceChildren like Jira plugin
        containerElement.replaceChildren(issueElement);
        containerElement.setAttribute("data-rendered", "true");
        console.log(`Rendered issue: ${identifier}`);
      } else {
        const errorElement = this.renderer.createErrorElement(
          identifier,
          displayMode
        );
        containerElement.replaceChildren(errorElement);
        containerElement.setAttribute("data-rendered", "true");
        console.log(`Issue not found: ${identifier}`);
      }
    } catch (error) {
      console.error("Error fetching Linear issue:", error);
      const errorElement = this.renderer.createErrorElement(
        identifier,
        displayMode
      );
      containerElement.replaceChildren(errorElement);
      containerElement.setAttribute("data-rendered", "true");
    }
  }
}
