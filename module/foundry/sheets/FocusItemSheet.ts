import FocusApp from "@apps/FocusApp.svelte";
import { Sr3eItemSheetBase } from "./Sr3eItemSheetBase";
import { localize } from "@services/utilities.js";
import type { Component } from "svelte";

export default class FocusItemSheet extends Sr3eItemSheetBase {
  override get title(): string {
    return `${localize(CONFIG.sr3e.focus.focus)}: ${this.item.name}`;
  }

  static override get DEFAULT_OPTIONS(): foundry.applications.types.ApplicationConfiguration {
    return {
      ...super.DEFAULT_OPTIONS,
      classes: [...(super.DEFAULT_OPTIONS.classes ?? []), "focus"],
    };
  }

  protected getSvelteComponent(): Component {
    return FocusApp;
  }
}
