export default class SR3EChatMessage extends ChatMessage {
   getOpposedData() {
      return this.flags?.sr3e?.opposed;
   }

   isResolved() {
      return this.getOpposedData()?.resolved ?? false;
   }

   async markResolved(update = {}) {
      const data = foundry.utils.mergeObject(this.getOpposedData() ?? {}, update);
      data.resolved = true;
      data.pending = false;
      return this.update({ [`flags.sr3e.opposed`]: data });
   }

   static Register() {
      CONFIG.ChatMessage.documentClass = SR3EChatMessage;
      console.log("sr3e /// ---> SR3EChatMessage registered");
   }
}

