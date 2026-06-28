import { mount, unmount } from "svelte";
import JournalSearchContent from "../ui/dialogs/JournalSearchContent.svelte";
import type { JournalOption } from "../ui/common-components/journalViewerContent";

type JournalSearchOptions = {
   config?: any;
   onPreview?: (result: JournalOption) => void;
   onClose?: (result: JournalOption | null) => void;
};

export default class JournalSearchApp extends foundry.applications.api.ApplicationV2 {
   #config: any;
   #onPreview?: (result: JournalOption) => void;
   #onClose?: (result: JournalOption | null) => void;
   #svelteApp?: Record<string, unknown>;
   #resolved = false;

   constructor(options: JournalSearchOptions = {}) {
      super({ id: `sr3e-journal-search-${foundry.utils.randomID()}` });
      this.#config = options.config ?? {};
      this.#onPreview = options.onPreview;
      this.#onClose = options.onClose;
   }

   static override get DEFAULT_OPTIONS(): DeepPartial<foundry.applications.api.ApplicationV2.Configuration> {
      return {
         ...super.DEFAULT_OPTIONS,
         classes: ["sr3e", "sheet", "staticlayout", "journal-search"],
         window: {
            resizable: false,
            title: "Search Journal Entries",
         },
         position: {
            width: 420,
            height: "auto" as unknown as number,
         },
      };
   }

   protected async _renderHTML(): Promise<unknown> {
      return "";
   }

   protected _replaceHTML(_result: unknown, windowContent: HTMLElement): void {
      if (this.#svelteApp) unmount(this.#svelteApp);

      this.#svelteApp = mount(JournalSearchContent, {
         target: windowContent,
         props: {
            config: this.#config,
            onselect: this.#onPreview,
            onclose: (result: JournalOption | null) => this.#resolve(result),
         },
      }) as Record<string, unknown>;
   }

   override async close(options = {}): Promise<this> {
      if (this.#svelteApp) {
         await unmount(this.#svelteApp);
         this.#svelteApp = undefined;
      }

      if (!this.#resolved) this.#resolve(null, false);
      return super.close(options);
   }

   #resolve(result: JournalOption | null, close = true): void {
      if (this.#resolved) return;
      this.#resolved = true;
      this.#onClose?.(result);
      if (close) void this.close();
   }
}
