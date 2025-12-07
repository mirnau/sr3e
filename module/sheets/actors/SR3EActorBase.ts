import { unmount } from "svelte";

export class SR3EActorBase extends foundry.applications.sheets.ActorSheetV2 {

    protected apps: Record<string, any>[] = [];

    get title() {
        return this.actor.name;
    }

    protected async _renderHTML(_context: any, _options: DeepPartial<RenderOptions>): Promise<unknown> {
        // Skip default template rendering; Svelte takes over in _replaceHTML.
        return "";
    }

    protected _unmountAllApps(): void {
        for (const app of this.apps) {
            unmount(app);
        }
        this.apps = [];
    }
}
