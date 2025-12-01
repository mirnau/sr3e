import WearableApp from "@apps/WearableApp.svelte";
import { Sr3eItemSheetBase } from "./Sr3eItemSheetBase";
import { localize } from "@services/utilities.js";
import type { Component } from "svelte";

export default class WearableItemSheet extends Sr3eItemSheetBase {
  override get title(): string {
    return `${localize(CONFIG.sr3e.wearable.wearable)}: ${this.item.name}`;
  }

  static override get DEFAULT_OPTIONS(): foundry.applications.types.ApplicationConfiguration {
    return {
      ...super.DEFAULT_OPTIONS,
      classes: [...(super.DEFAULT_OPTIONS.classes ?? []), "wearable"],
    };
  }

  protected getSvelteComponent(): Component {
    return WearableApp;
  }
}
