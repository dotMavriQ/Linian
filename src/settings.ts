import { App, PluginSettingTab, Setting } from "obsidian";
import LinianPlugin from "../main";
import { LinearAPIService } from "./api";

export class LinianSettingTab extends PluginSettingTab {
  plugin: LinianPlugin;
  private apiService: LinearAPIService | null = null;

  constructor(app: App, plugin: LinianPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Linian Settings" });

    // API Key Setting
    new Setting(containerEl)
      .setName("Linear API Key")
      .setDesc(
        "Your Linear API key. You can generate one in Linear Settings > API."
      )
      .addText((text) =>
        text
          .setPlaceholder("lin_api_...")
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();

            // Update API service
            if (value) {
              this.apiService = new LinearAPIService(
                value,
                this.plugin.settings.cacheTimeout,
                this.plugin.settings.maxCacheSize
              );
              this.plugin.updateAPIService(this.apiService);
            }
          })
      );

    // Test Connection Button
    new Setting(containerEl)
      .setName("Test Connection")
      .setDesc("Test your Linear API connection")
      .addButton((button) =>
        button
          .setButtonText("Test")
          .setDisabled(!this.plugin.settings.apiKey)
          .onClick(async () => {
            if (!this.apiService && this.plugin.settings.apiKey) {
              this.apiService = new LinearAPIService(
                this.plugin.settings.apiKey
              );
            }

            if (this.apiService) {
              button.setButtonText("Testing...");
              button.setDisabled(true);

              try {
                const teams = await this.apiService.getTeams();
                if (teams.length > 0) {
                  button.setButtonText("✓ Connected");
                  button.setCta();
                } else {
                  button.setButtonText("✗ Failed");
                  button.removeCta();
                }
              } catch (error) {
                button.setButtonText("✗ Error");
                button.removeCta();
              }

              setTimeout(() => {
                button.setButtonText("Test");
                button.setDisabled(false);
                button.removeCta();
              }, 3000);
            }
          })
      );

    // Display Options
    containerEl.createEl("h3", { text: "Display Options" });

    new Setting(containerEl)
      .setName("Enable Tooltips")
      .setDesc("Show detailed issue information on hover")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableTooltips)
          .onChange(async (value) => {
            this.plugin.settings.enableTooltips = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Show Priority Icons")
      .setDesc("Display priority icons next to issue identifiers")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enablePriorityIcons)
          .onChange(async (value) => {
            this.plugin.settings.enablePriorityIcons = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Show Assignee Avatars")
      .setDesc("Display assignee avatars for issues")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableAssigneeAvatars)
          .onChange(async (value) => {
            this.plugin.settings.enableAssigneeAvatars = value;
            await this.plugin.saveSettings();
          })
      );

    // Performance Settings
    containerEl.createEl("h3", { text: "Performance" });

    new Setting(containerEl)
      .setName("Cache Timeout")
      .setDesc("How long to cache issue data (in minutes)")
      .addSlider((slider) =>
        slider
          .setLimits(1, 60, 1)
          .setValue(this.plugin.settings.cacheTimeout / 60000)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.cacheTimeout = value * 60000;
            await this.plugin.saveSettings();

            if (this.apiService) {
              // Recreate API service with new cache timeout
              this.apiService = new LinearAPIService(
                this.plugin.settings.apiKey,
                this.plugin.settings.cacheTimeout,
                this.plugin.settings.maxCacheSize
              );
              this.plugin.updateAPIService(this.apiService);
            }
          })
      );

    new Setting(containerEl)
      .setName("Max Cache Size")
      .setDesc("Maximum number of issues to cache")
      .addSlider((slider) =>
        slider
          .setLimits(100, 5000, 100)
          .setValue(this.plugin.settings.maxCacheSize)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.maxCacheSize = value;
            await this.plugin.saveSettings();

            if (this.apiService) {
              // Recreate API service with new cache size
              this.apiService = new LinearAPIService(
                this.plugin.settings.apiKey,
                this.plugin.settings.cacheTimeout,
                this.plugin.settings.maxCacheSize
              );
              this.plugin.updateAPIService(this.apiService);
            }
          })
      );

    // Cache Management
    new Setting(containerEl)
      .setName("Clear Cache")
      .setDesc("Clear all cached issue data")
      .addButton((button) =>
        button
          .setButtonText("Clear Cache")
          .setWarning()
          .onClick(() => {
            if (this.apiService) {
              this.apiService.clearCache();
              button.setButtonText("✓ Cleared");
              setTimeout(() => {
                button.setButtonText("Clear Cache");
              }, 2000);
            }
          })
      );

    // Cache Stats
    if (this.apiService) {
      const stats = this.apiService.getCacheStats();
      containerEl.createEl("p", {
        text: `Cache: ${stats.size}/${stats.maxSize} items`,
        cls: "setting-item-description",
      });
    }
  }
}
