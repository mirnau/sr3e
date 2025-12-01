import TechInterfaceApp from "@apps/TechInterfaceApp.svelte";
import { Sr3eItemSheetBase } from "./Sr3eItemSheetBase";
import { localize } from "@services/utilities.js";
import type { Component } from "svelte";

export default class TechInterfaceItemSheet extends Sr3eItemSheetBase {
  override get title(): string {
    return `${localize(CONFIG.sr3e.techinterface.techinterface)}: ${this.item.name}`;
  }

  static override get DEFAULT_OPTIONS(): foundry.applications.types.ApplicationConfiguration {
    return {
      ...super.DEFAULT_OPTIONS,
      classes: [...(super.DEFAULT_OPTIONS.classes ?? []), "techinterface"],
    };
  }

  protected getSvelteComponent(): Component {
    return TechInterfaceApp;
  }
}
