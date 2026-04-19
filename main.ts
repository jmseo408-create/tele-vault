import {
  App,
  ItemView,
  Plugin,
  PluginSettingTab,
  Setting,
  WorkspaceLeaf,
} from "obsidian";

interface TeleVaultSettings {
  telegramUrl: string;
  openOnStartup: boolean;
}

const DEFAULT_SETTINGS: TeleVaultSettings = {
  telegramUrl: "https://web.telegram.org/a/",
  openOnStartup: false,
};

const VIEW_TYPE_TELEVAULT = "televault-view";

class TeleVaultView extends ItemView {
  private plugin: TeleVaultPlugin;
  private webview: HTMLElement | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: TeleVaultPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_TELEVAULT;
  }

  getDisplayText(): string {
    return "Telegram";
  }

  getIcon(): string {
    return "send";
  }

  async onOpen() {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.addClass("televault-container");

    const toolbar = container.createDiv({ cls: "televault-toolbar" });

    const reloadBtn = toolbar.createEl("button", {
      cls: "televault-btn",
      text: "새로고침",
    });
    reloadBtn.addEventListener("click", () => this.reload());

    const homeBtn = toolbar.createEl("button", {
      cls: "televault-btn",
      text: "홈",
    });
    homeBtn.addEventListener("click", () => this.navigateHome());

    this.renderWebview(container);
  }

  private renderWebview(container: HTMLElement) {
    const webview = container.createEl(
      "webview" as keyof HTMLElementTagNameMap
    ) as HTMLElement;

    webview.setAttribute("src", this.plugin.settings.telegramUrl);
    webview.setAttribute("partition", "persist:televault");
    webview.setAttribute("allowpopups", "true");
    webview.addClass("televault-webview");

    this.webview = webview;
  }

  reload() {
    if (!this.webview) return;
    const anyWebview = this.webview as unknown as { reload?: () => void };
    if (typeof anyWebview.reload === "function") {
      anyWebview.reload();
    } else {
      this.webview.setAttribute("src", this.plugin.settings.telegramUrl);
    }
  }

  navigateHome() {
    if (!this.webview) return;
    this.webview.setAttribute("src", this.plugin.settings.telegramUrl);
  }

  async onClose() {
    this.webview = null;
  }
}

export default class TeleVaultPlugin extends Plugin {
  settings: TeleVaultSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    this.registerView(
      VIEW_TYPE_TELEVAULT,
      (leaf) => new TeleVaultView(leaf, this)
    );

    this.addRibbonIcon("send", "TeleVault 열기", () => {
      this.activateView();
    });

    this.addCommand({
      id: "open-televault",
      name: "Telegram 패널 열기",
      callback: () => this.activateView(),
    });

    this.addCommand({
      id: "reload-televault",
      name: "Telegram 패널 새로고침",
      callback: () => this.reloadActiveView(),
    });

    this.addSettingTab(new TeleVaultSettingTab(this.app, this));

    if (this.settings.openOnStartup) {
      this.app.workspace.onLayoutReady(() => this.activateView());
    }
  }

  async onunload() {
    // registerView 로 등록된 뷰는 Obsidian 이 자동 정리
  }

  async activateView() {
    const { workspace } = this.app;
    const existing = workspace.getLeavesOfType(VIEW_TYPE_TELEVAULT);

    if (existing.length > 0) {
      workspace.revealLeaf(existing[0]);
      return;
    }

    const leaf = workspace.getRightLeaf(false);
    if (!leaf) return;

    await leaf.setViewState({
      type: VIEW_TYPE_TELEVAULT,
      active: true,
    });

    workspace.revealLeaf(leaf);
  }

  reloadActiveView() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_TELEVAULT);
    for (const leaf of leaves) {
      const view = leaf.view;
      if (view instanceof TeleVaultView) {
        view.reload();
      }
    }
  }

  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class TeleVaultSettingTab extends PluginSettingTab {
  plugin: TeleVaultPlugin;

  constructor(app: App, plugin: TeleVaultPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Telegram URL")
      .setDesc("임베드할 Telegram Web 주소 (기본: web.telegram.org/a/)")
      .addText((text) =>
        text
          .setPlaceholder("https://web.telegram.org/a/")
          .setValue(this.plugin.settings.telegramUrl)
          .onChange(async (value) => {
            this.plugin.settings.telegramUrl =
              value.trim() || DEFAULT_SETTINGS.telegramUrl;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("시작 시 자동 열기")
      .setDesc("Obsidian 실행 시 Telegram 패널을 자동으로 엽니다.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.openOnStartup)
          .onChange(async (value) => {
            this.plugin.settings.openOnStartup = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
