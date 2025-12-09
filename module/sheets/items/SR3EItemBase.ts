import { unmount } from "svelte";

export class SR3EItemBase extends foundry.applications.sheets.ItemSheetV2 {
    protected apps: Record<string, any>[] = [];

    get title() {
        return this.item.name;
    }

    protected async _renderHTML(_context: unknown, _options: DeepPartial<RenderOptions>): Promise<unknown> {
        // Skip default template rendering; Svelte takes over in _replaceHTML.
        return "";
    }

    protected _unmountAllApps(): void {
        for (const app of this.apps) {
            unmount(app);
        }
        this.apps = [];
    }

    protected _tearDown(options: DeepPartial<RenderOptions>): void {
        this._unmountAllApps();
        super._tearDown(options);
    }

    protected _onSubmit(_: Event): void {
        // Prevent default form submission
        return;
    }
}
