import { mount, unmount } from "svelte";
import type { Component } from "svelte";

/**
 * Abstract base class for all SR3E Item sheets that use Svelte components.
 * Handles common lifecycle, rendering, and configuration.
 */
export abstract class Sr3eItemSheetBase extends foundry.applications.sheets.ItemSheetV2 {
  /** The mounted Svelte component instance */
  #component: Record<string, any> | null = null;

  /**
   * The Item document associated with this sheet.
   * Inherited from ItemSheetV2.
   */
  declare document: foundry.documents.BaseItem;

  /**
   * Convenience accessor for the item document.
   */
  get item(): foundry.documents.BaseItem {
    return this.document;
  }

  /**
   * The title of the sheet window.
   * Override this in subclasses to provide a custom title.
   */
  abstract override get title(): string;

  /**
   * Get the Svelte component class to mount for this sheet.
   * @abstract
   */
  protected abstract getSvelteComponent(): Component;

  /**
   * Get the props to pass to the Svelte component.
   * Override this method if you need custom props beyond item and config.
   * @param windowContent - The DOM element where the component is mounted
   * @returns Props object to pass to the Svelte component
   */
  protected getSvelteProps(windowContent: HTMLElement): Record<string, any> {
    return {
      item: this.document,
      config: CONFIG.sr3e,
    };
  }

  static get DEFAULT_OPTIONS(): foundry.applications.types.ApplicationConfiguration {
    return {
      ...super.DEFAULT_OPTIONS,
      id: `sr3e-item-sheet-${foundry.utils.randomID()}`,
      classes: ["sr3e", "sheet", "item"],
      template: null,
      position: { width: "auto", height: "auto" },
      window: {
        resizable: false,
      },
      tag: "form",
      submitOnChange: true,
      closeOnSubmit: false,
    };
  }

  /**
   * No HTML rendering needed - Svelte handles everything.
   */
  protected override _renderHTML(): Promise<HTMLElement | null> {
    return Promise.resolve(null);
  }

  /**
   * Replace HTML with the Svelte component.
   * Unmounts any existing component and mounts a fresh instance.
   */
  protected override _replaceHTML(
    result: HTMLElement | null,
    windowContent: HTMLElement
  ): HTMLElement {
    // Unmount existing component if present
    if (this.#component) {
      unmount(this.#component);
      this.#component = null;
    }

    // Mount the new Svelte component
    const SvelteComponent = this.getSvelteComponent();
    const props = this.getSvelteProps(windowContent);

    this.#component = mount(SvelteComponent, {
      target: windowContent,
      props,
    });

    return windowContent;
  }

  /**
   * Override form submission - Svelte manages all state reactively.
   */
  protected override _onSubmit(event: Event): void {
    // Prevent default form submission since Svelte handles state
    return;
  }

  /**
   * Clean up the Svelte component when the sheet is closed.
   */
  override async close(options?: foundry.applications.types.ApplicationClosingOptions): Promise<this> {
    if (this.#component) {
      unmount(this.#component);
      this.#component = null;
    }
    return super.close(options);
  }
}
