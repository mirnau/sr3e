import SkillApp from "@apps/SkillApp.svelte";
import { Sr3eItemSheetBase } from "./Sr3eItemSheetBase";
import { localize } from "@services/utilities.js";
import type { Component } from "svelte";

export default class SkillItemSheet extends Sr3eItemSheetBase {
  override get title(): string {
    const type = this.item.system.skillType ?? "active";
    const typeLabel = localize(CONFIG.sr3e.skill[type]);
    return `${typeLabel}: ${this.item.name}`;
  }

  static override get DEFAULT_OPTIONS(): foundry.applications.types.ApplicationConfiguration {
    return {
      ...super.DEFAULT_OPTIONS,
      classes: [...(super.DEFAULT_OPTIONS.classes ?? []), "skill"],
    };
  }

  protected getSvelteComponent(): Component {
    return SkillApp;
  }

  protected override getSvelteProps(windowContent: HTMLElement): Record<string, any> {
    return {
      ...super.getSvelteProps(windowContent),
      onTitleChange: (newTitle: string) => {
        const titleElement = this.element.querySelector('.window-title');
        if (titleElement) {
          titleElement.textContent = newTitle;
        }
      },
    };
  }
}
