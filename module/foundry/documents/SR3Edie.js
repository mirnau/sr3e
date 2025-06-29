// src/dice/SR3Edie.js
export default class SR3Edie extends foundry.dice.terms.Die {
   /** Keep the normal “d” so 10d still parses */
   static DENOMINATION = "d";

   /* ------------------------------------------------------------------ */
   /*  Declare custom modifiers so the parser accepts ! and !o            */
   /* ------------------------------------------------------------------ */
   static MODIFIERS = {
      ...foundry.dice.terms.Die.MODIFIERS,
      e: function () {
         this._explodeOpen = true;
         return this;
      },
      eo: function () {
         this._explodeOnce = true;
         return this;
      },
   };

   /* ------------------------------------------------------------------ */
   /*  Evaluation                                                        */
   /* ------------------------------------------------------------------ */
   _evaluateSync({ maximize = false, minimize = false } = {}) {
      this.results = [];
      const randomFace = () => super.randomFace({ maximize, minimize });

      // Decide what kind of roll we’re dealing with
      const hasBang = this.modifiers.includes("!");
      const hasBangOnce = this.modifiers.includes("!o");
      const explodeOnce = hasBangOnce; // true  → single extra roll
      const explode = hasBang || hasBangOnce;
      const canExplode = explode && !(maximize || minimize);

      for (let i = 0; i < this.number; i++) {
         let value = randomFace();
         let total = value;
         let exploded = false;

         if (canExplode && value === 6) {
            do {
               value = randomFace();
               total += value;
               exploded = true;
            } while (!explodeOnce && value === 6); // keep going unless !o
         }

         this.results.push({ result: total, active: true, exploded });
      }
      return this;
   }
   async _evaluateAsync(o = {}) {
      return this._evaluateSync(o);
   }

   /* ------------------------------------------------------------------ */
   /*  SR3E QoL getters                                                  */
   /* ------------------------------------------------------------------ */
   get successes() {
      return this.results.filter((r) => r.active && r.result >= 5).length;
   }
   get isBotch() {
      const active = this.results.filter((r) => r.active);
      return active.length > 0 && this.successes === 0 && active.every((r) => r.result === 1);
   }
   get isFailure() {
      return this.successes === 0 && !this.isBotch;
   }

   static ConfigureRollParser() {
      // Hook into the main parse method to preprocess the formula

      CONFIG.Dice.terms["d"] = SR3Edie;
      CONFIG.Dice.terms.SR3Edie = SR3Edie;
   }
}
