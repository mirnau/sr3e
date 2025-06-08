import ActiveSkillEditorApp from "../../svelte/apps/components/skills/ActiveSkillEditorApp.svelte";
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
		classes: ["sr3e", "sheet", "item"],
		window: {
			title: "Edit Skill",
			resizable: false
		},
		position: { 
			width: "auto",
			height: "auto" 
		}
	};

	// REQUIRED for ApplicationV2
	_renderHTML() {
		return null;
	}

	_replaceHTML(_, element) {
		this.#app = mount(ActiveSkillEditorApp, {
			target: element,
			props: {
				actor: this.actor,
				skill: this.skill,
				config: this.config
			}
		});
		return element;
	}

	async close(options) {
		if (this.#app) {
			await unmount(this.#app);
			this.#app = null;
		}
		return super.close(options);
	}
}