export async function handleCanvasItemDrop(_canvas, data) {
   if (data.type !== "Item") return;

   const { x, y } = data;
   const targetToken = canvas.tokens.placeables.find((t) => t.bounds.contains(x, y));
   if (!targetToken) return;

   const item = await fromUuid(data.uuid);
   if (!item) return;

   const tokenDoc = targetToken.document;
   const worldActor = game.actors.get(tokenDoc.actorId);
   if (!worldActor) {
      DEBUG && LOG.warn("[SR3E] No base actor for token", [__FILE__, __LINE__], tokenDoc);
      return;
   }

   const confirmed = await foundry.applications.api.DialogV2.confirm({
      title: "Lend Item",
      content: `Transfer <strong>${item.name}</strong> to <strong>${worldActor.name}</strong>?`,
   });
   if (!confirmed) return;

   await worldActor.createEmbeddedDocuments("Item", [item.toObject()]);
   DEBUG && LOG.info("[SR3E] Item added to target", [__FILE__, __LINE__], worldActor.name);

   if (item.actor?.id !== worldActor.id) {
      await game.actors.get(item.actor.id).deleteEmbeddedDocuments("Item", [item.id]);
      DEBUG && LOG.info("[SR3E] Item removed from source", [__FILE__, __LINE__], item.actor.name);
   }
}
