import { mount, unmount } from "svelte";
import ActiveSkillEditorApp from "../../ui/items/skill-editor/ActiveSkillEditorApp.svelte";
import KnowledgeSkillEditorApp from "../../ui/items/skill-editor/KnowledgeSkillEditorApp.svelte";
import LanguageSkillEditorApp from "../../ui/items/skill-editor/LanguageSkillEditorApp.svelte";

type SvelteApp = Record<string, unknown>;

export class SkillEditorApp extends foundry.applications.api.ApplicationV2 {
    #app?: SvelteApp;
    #actor: Actor;
    #skill: Item;
    #category?: "active" | "knowledge" | "language";
    /** MutationObserver used for injecting the commit button */
    private _commitMO: MutationObserver | null = null;

    // ─── Static helpers ───────────────────────────────────────────────────────

    static getAppIdFor(actorId: string, skillId: string): string {
        return `sr3e-active-skill-editor-${actorId}-${skillId}`;
    }

    static getExisting(actorId: string, skillId: string): foundry.applications.api.ApplicationV2 | undefined {
        const appId = SkillEditorApp.getAppIdFor(actorId, skillId);
        return Object.values(ui.windows as unknown as Record<string, foundry.applications.api.ApplicationV2>).find(
            (app) => app.id === appId
        );
    }

    static launch(actor: Actor, skill: Item, category?: "active" | "knowledge" | "language"): SkillEditorApp {
        const existing = SkillEditorApp.getExisting(actor.id!, (skill as Record<string, any>)._id ?? skill.id!);
        if (existing) {
            existing.bringToTop();
            return existing as SkillEditorApp;
        }
        const sheet = new SkillEditorApp(actor, skill, category);
        sheet.render(true);
        return sheet;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(actor: Actor, skill: Item, category?: "active" | "knowledge" | "language") {
        const appId = SkillEditorApp.getAppIdFor(actor.id!, (skill as Record<string, any>)._id ?? skill.id!);
        super({ id: appId });
        this.#actor = actor;
        this.#skill = skill;
        this.#category = category;
    }

    // ─── Default options ──────────────────────────────────────────────────────

    static override get DEFAULT_OPTIONS(): DeepPartial<foundry.applications.api.ApplicationV2.Configuration> {
        return {
            ...super.DEFAULT_OPTIONS,
            classes: ["sr3e", "sheet", "skill-editor"],
            window: {
                resizable: false,
            },
            position: {
                width: "auto" as unknown as number,
                height: "auto" as unknown as number,
            },
        };
    }

    override get title(): string {
        const skillLabel = localize(CONFIG.SR3E.SKILL?.skill ?? "SR3E.skill.skill");
        return `${skillLabel}: ${this.#skill.name}`;
    }

    // ─── Rendering lifecycle ──────────────────────────────────────────────────

    protected async _renderHTML(): Promise<unknown> {
        return "";
    }

    protected _replaceHTML(_result: unknown, windowContent: HTMLElement): void {
        if (this.#app) {
            unmount(this.#app);
            this.#app = undefined;
        }

        const skillSystem = (this.#skill.system as Record<string, any>);
        const skillType: string = this.#category ?? skillSystem.skillType ?? "active";

        const props = {
            actor: this.#actor,
            skill: this.#skill,
            app: this,
        };

        if (skillType === "active") {
            this.#app = mount(ActiveSkillEditorApp, { target: windowContent, props }) as SvelteApp;
        } else if (skillType === "knowledge") {
            this.#app = mount(KnowledgeSkillEditorApp, { target: windowContent, props }) as SvelteApp;
        } else if (skillType === "language") {
            this.#app = mount(LanguageSkillEditorApp, { target: windowContent, props }) as SvelteApp;
        }

        // Inject the commit button into the window header
        try {
            const form = windowContent.parentNode as HTMLElement | null;
            const header = form?.querySelector?.("header.window-header") as HTMLElement | null;
            if (header) this.#injectCommitButton(header);
        } catch { /* no-op */ }

    }

    // ─── Commit button ────────────────────────────────────────────────────────

    #injectCommitButton(header: HTMLElement): void {
        // Avoid duplicate injection
        if (header.querySelector?.('[data-action="sr3e-commit-skill"]')) return;

        const btn = document.createElement("button");
        btn.setAttribute("type", "button");
        btn.classList.add("header-control", "icon", "fa-solid", "fa-thumbs-up");
        btn.setAttribute("data-action", "sr3e-commit-skill");
        btn.setAttribute("data-responder", "yes");

        try {
            const title = localize(CONFIG.SR3E.COMMON.commit);
            btn.setAttribute("data-tooltip", title);
            btn.setAttribute("aria-label", title);
            btn.setAttribute("title", title);
        } catch {
            btn.setAttribute("data-tooltip", "Commit Changes");
            btn.setAttribute("aria-label", "Commit Changes");
            btn.setAttribute("title", "Commit Changes");
        }

        btn.textContent = "";
        btn.addEventListener("click", (ev) => {
            ev.preventDefault();
            try { (this as Record<string, any>).requestCommit?.(); } catch { /* no-op */ }
            try { this.close(); } catch { /* no-op */ }
        });

        const placeButton = (): boolean => {
            const closeBtn = header.querySelector('button[data-action="close"]');
            if (closeBtn) {
                header.insertBefore(btn, closeBtn);
                return true;
            }
            if (!btn.isConnected) header.appendChild(btn);
            return false;
        };

        const placed = placeButton();
        if (!placed) {
            try {
                const mo = new MutationObserver(() => {
                    if (placeButton()) {
                        try { mo.disconnect(); } catch { /* no-op */ }
                        this._commitMO = null;
                    }
                });
                mo.observe(header, { childList: true });
                this._commitMO = mo;
            } catch { /* no-op */ }
        }
    }

    // ─── Teardown ─────────────────────────────────────────────────────────────

    protected async _tearDown(options: DeepPartial<RenderOptions>): Promise<void> {
        if (this._commitMO) {
            try { this._commitMO.disconnect(); } catch { /* no-op */ }
            this._commitMO = null;
        }
        if (this.#app) {
            await unmount(this.#app);
            this.#app = undefined;
        }
        return super._tearDown(options);
    }
}

export default SkillEditorApp;
