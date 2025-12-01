import { localize } from "@services/utilities.js";
import metatypeApp from "@apps/MetatypeApp.svelte";
import { Sr3eItemSheetBase } from "./Sr3eItemSheetBase";
import type { Component } from "svelte";

export default class MetatypeItemSheet extends Sr3eItemSheetBase {
  override get title(): string {
    return `${localize(CONFIG.sr3e.traits.metatype)}: ${this.item.name}`;
  }

  static override get DEFAULT_OPTIONS(): foundry.applications.types.ApplicationConfiguration {
    return {
      ...super.DEFAULT_OPTIONS,
      classes: [...(super.DEFAULT_OPTIONS.classes ?? []), "metatype"],
    };
  }

  protected getSvelteComponent(): Component {
    return metatypeApp;
  }
}
