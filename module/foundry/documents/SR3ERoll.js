// Add this to your SR3Edie.js file
export default class SR3ERoll extends Roll {
   constructor(formula, data = {}, options = {}) {
      // Auto-fetch roll data if none provided
      if (Object.keys(data).length === 0) {
         const speaker = ChatMessage.getSpeaker();
         const actor = ChatMessage.getSpeakerActor(speaker);
         if (actor?.getRollData) {
            data = actor.getRollData();
         }
      }

      super(formula, data, options);
   }

   static create(formula, data = {}, options = {}) {
      // Preserve Roll.create behavior with auto roll data
      if (Object.keys(data).length === 0) {
         const speaker = ChatMessage.getSpeaker();
         const actor = ChatMessage.getSpeakerActor(speaker);
         if (actor?.getRollData) {
            data = actor.getRollData();
         }
      }

      return new this(formula, data, options);
   }

   // Update your Register method
   static Register() {
      CONFIG.Dice.rolls = [SR3ERoll];
      window.Roll = SR3ERoll;
   }
}
