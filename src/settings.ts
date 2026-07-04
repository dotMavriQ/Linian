import { App, PluginSettingTab, Setting } from "obsidian";
import LinianPlugin from "../main";

const STALE_PRESETS: Record<string, number> = {
  "1 hour": 60 * 60 * 1000,
  "6 hours": 6 * 60 * 60 * 1000,
  "24 hours": 24 * 60 * 60 * 1000,
};

export class LinianSettingTab extends PluginSettingTab {
  plugin: LinianPlugin;

  constructor(app: App, plugin: LinianPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Linear API key")
      .setDesc("Generate a personal API key in Linear: Settings → API.")
      .addText((text) =>
        text
          .setPlaceholder("lin_api_…")
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Test connection")
      .setDesc("Verify the API key can reach your Linear workspace.")
      .addButton((button) =>
        button.setButtonText("Test").onClick(async () => {
          button.setButtonText("Testing…").setDisabled(true);
          const teams = await this.plugin.api.getTeams();
          if (teams.length > 0) {
            button.setButtonText("✓ Connected").setCta();
          } else {
            button.setButtonText("✗ Failed").removeCta();
          }
          window.setTimeout(() => {
            button.setButtonText("Test").setDisabled(false).removeCta();
          }, 3000);
        })
      );

    new Setting(containerEl).setName("Display").setHeading();

    new Setting(containerEl)
      .setName("Show priority icons")
      .setDesc("Display a priority icon next to compact issue identifiers.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enablePriorityIcons)
          .onChange(async (value) => {
            this.plugin.settings.enablePriorityIcons = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Show assignee avatars")
      .setDesc("Display the assignee's avatar on compact issues.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableAssigneeAvatars)
          .onChange(async (value) => {
            this.plugin.settings.enableAssigneeAvatars = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl).setName("Sync").setHeading();

    new Setting(containerEl)
      .setName("Background refresh")
      .setDesc(
        "Quietly revalidate cached issues when they age. Cached data is always kept if a refresh fails."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoRefresh)
          .onChange(async (value) => {
            this.plugin.settings.autoRefresh = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Refresh after")
      .setDesc("How long a cached issue stays fresh before a background refresh.")
      .addDropdown((dropdown) => {
        for (const label of Object.keys(STALE_PRESETS)) {
          dropdown.addOption(label, label);
        }
        const current =
          Object.keys(STALE_PRESETS).find(
            (l) => STALE_PRESETS[l] === this.plugin.settings.staleAfterMs
          ) ?? "6 hours";
        dropdown.setValue(current).onChange(async (label) => {
          this.plugin.settings.staleAfterMs = STALE_PRESETS[label];
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl).setName("Cache").setHeading();

    new Setting(containerEl)
      .setName("Maximum cached issues")
      .setDesc("Least-recently-fetched issues are evicted beyond this limit.")
      .addSlider((slider) =>
        slider
          .setLimits(100, 5000, 100)
          .setValue(this.plugin.settings.maxCacheSize)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.maxCacheSize = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Clear cache")
      .setDesc(
        `Delete all ${this.plugin.cache.size()} saved issue snapshots. Offline previews will be unavailable until issues are fetched again.`
      )
      .addButton((button) =>
        button
          .setButtonText("Clear")
          .setWarning()
          .onClick(() => {
            this.plugin.cache.clear();
            button.setButtonText("✓ Cleared");
            window.setTimeout(() => this.display(), 1200);
          })
      );
  }
}
