import { getNewsService, broadcastNews } from "@services/NewsService.svelte.js";

export function initializeNewsService() {
   getNewsService();
   const activeBroadcasters = game.actors.filter(
      (actor) => actor.type === "broadcaster" && actor.system.isBroadcasting
   );

   activeBroadcasters.forEach((actor) => {
      const headlines = actor.system.rollingNews ?? [];
      broadcastNews(actor.name, headlines);
   });
}
