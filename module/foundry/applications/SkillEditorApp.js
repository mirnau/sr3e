import ActiveSkillEditorApp from "../../svelte/apps/components/skills/ActiveSkillEditorApp.svelte";
import KnowledgeSkillEditorApp from "../../svelte/apps/components/skills/KnowledgeSkillEditorApp.svelte";
import LanguageSkillEditorApp from "../../svelte/apps/components/skills/LanguageSkillEditorApp.svelte";
import { mount, unmount } from "svelte";

export default class ActiveSkillEditorSheet extends foundry.applications.api.ApplicationV2 {
	#app;

	static getAppIdFor(actorId, skillId) {
		return `sr3e-active-skill-editor-${actorId}-${skillId}`;
	}

	static getExisting(actorId, skillId) {
		const appId = this.getAppIdFor(actorId, skillId);
		return Object.values(ui.windows).find(app => app.id === appId);
	}

	static launch(actor, skill, config) {
		const existing = this.getExisting(actor.id, skill._id);
		if (existing) {
			existing.bringToTop();
			return existing;
		}
		const sheet = new this(actor, skill, config);
		sheet.render(true);
		return sheet;
	}

	constructor(actor, skill, config) {
		const appId = ActiveSkillEditorSheet.getAppIdFor(actor.id, skill._id);
		super({ id: appId });

		this.actor = actor;
		this.skill = skill;
		this.config = config;
	}

	static DEFAULT_OPTIONS = {
		classes: ["sr3e", "sheet", "item", "active-skill-editor"],
		window: {
			title: "Edit Skill",
			resizable: false
		},
		position: {
			width: "auto",
			height: "auto"
		},
	};

	// REQUIRED for ApplicationV2
	_renderHTML() {
		return null;
	}

	_replaceHTML(_, windowContent) {

		if (this.#app) {
			unmount(this.#app);
		}

		if (this.skill.system.skillType === "active") {
			this.#app = mount(ActiveSkillEditorApp, {
				target: windowContent,
				props: {
					actor: this.actor,
					skill: this.skill,
					config: this.config,
					app: this
				}
			});
		}
		else if (this.skill.system.skillType === "knowledge") {
			this.#app = mount(KnowledgeSkillEditorApp, {
				target: windowContent,
				props: {
					actor: this.actor,
					skill: this.skill,
					config: this.config,
					app: this
				}
			});
		}
		else if (this.skill.system.skillType === "language") {
			this.#app = mount(LanguageSkillEditorApp, {
				target: windowContent,
				props: {
					actor: this.actor,
					skill: this.skill,
					config: this.config,
					app: this
				}
			});
		}

		// Inject header commit button next to close control
		try {
			const form = windowContent.parentNode;
			const header = form?.querySelector?.("header.window-header");
			if (header) this.#injectCommitButton(header);
		} catch {}

		return windowContent;
	}

	#injectCommitButton(header) {
		// Avoid duplicates
		if (header.querySelector?.('[data-action="sr3e-commit-skill"]')) return;

        // Commit control as a real header button (match Foundry header style)
        const btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.classList.add('header-control', 'icon', 'fa-solid', 'fa-thumbs-up');
        btn.setAttribute('data-action', 'sr3e-commit-skill');
        btn.setAttribute('data-responder', 'yes');
        try {
            const title = game?.i18n?.localize?.(this.config?.karma?.commit) ?? 'Commit Changes';
            btn.setAttribute('data-tooltip', title);
            btn.setAttribute('aria-label', title);
            btn.setAttribute('title', title);
        } catch { btn.setAttribute('data-tooltip', 'Commit Changes'); btn.setAttribute('aria-label', 'Commit Changes'); btn.setAttribute('title', 'Commit Changes'); }
        btn.textContent = '';
		btn.addEventListener('click', (ev) => {
			ev.preventDefault();
			try { this.requestCommit?.(); } catch {}
			try { this.close(); } catch {}
		});

        const placeButton = () => {
            const closeBtn = header.querySelector('button[data-action="close"]');
            if (closeBtn) {
                header.insertBefore(btn, closeBtn);
                return true;
            }
            // Temporarily append; will be repositioned once Close exists
            if (!btn.isConnected) header.appendChild(btn);
            return false;
        };

        const placed = placeButton();
        if (!placed) {
            // Reposition when Close button is created
            try {
                const mo = new MutationObserver(() => {
                    if (placeButton()) {
                        try { mo.disconnect(); } catch {}
                        this._commitMO = null;
                    }
                });
                mo.observe(header, { childList: true });
                this._commitMO = mo;
            } catch {}
        }
	}

	async _tearDown() {

		if (this._commitMO) { try { this._commitMO.disconnect(); } catch {} this._commitMO = null; }
		if (this.#app) await unmount(this.#app);
		this.#app = null;
		return super._tearDown();
	}
}
