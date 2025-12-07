<script lang="ts">
   import type { Writable } from "svelte/store";
   import type { IStoreManager } from "../../utilities/IStoreManager";
   import type SR3EActor from "../../documents/SR3EActor";
   import { StoreManager } from "../../utilities/StoreManager.svelte";
   import { randomInRange } from "../../utilities/MathUtils";

   const {
      actor,
   }: {
      actor: SR3EActor;
   } = $props();

   const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

   let malfunctioningIndexes: number[] = [];
   let actorNameStore = $state<Writable<string> | null>(null);

   $effect(() => {
      if (!actor) return;

      storeManager.Subscribe(actor);
      actorNameStore = storeManager.GetShallowStore<string>(
         actor,
         "actorName",
         actor.name as string,
      );

      return () => {
         storeManager.Unsubscribe(actor);
      };
   });

   let name = $derived(actorNameStore ? $actorNameStore : "") as string;
   let neonHTML = $derived(getNeonHtml(name));

   function escapeHtml(text: string): string {
      const map: Record<string, string> = {
         "&": "&amp;",
         "<": "&lt;",
         ">": "&gt;",
         '"': "&quot;",
         "'": "&#039;",
      };
      return text.replace(/[&<>"']/g, (m) => map[m]!);
   }

   function getNeonHtml(name: string): string {
      malfunctioningIndexes = [];

      if (name.length < 4) {
         malfunctioningIndexes.push(randomInRange(0, name.length - 1));
      } else {
         const malfunctionInNplaces: number = name.length % 4;

         for (let i = 0; i < malfunctionInNplaces; i++) {
            let index: number;
            do {
               index = randomInRange(0, name.length - 1);
            } while (malfunctioningIndexes.includes(index));
            malfunctioningIndexes.push(index);
         }
      }

      return [...name]
         .map((char: string, index: number) =>
            malfunctioningIndexes.includes(index)
               ? `<div class="neon-name-text malfunc">${escapeHtml(char)}</div>`
               : `<div class="neon-name-text">${escapeHtml(char)}</div>`,
         )
         .join("");
   }
</script>

<div class="neon-name">
   {@html neonHTML}
</div>
