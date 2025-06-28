export default class SR3Edie extends foundry.dice.terms.Die {
   /**  The letter the parser looks for (keep "d" so "6d6" still works) */
   static DENOMINATION = "d";

   constructor({ number = 1, faces = 6, modifiers = [], ...rest } = {}) {
      // Make sure faces is always 6 and store modifiers array
      super({ number, faces, modifiers, ...rest });
   }

   /* ------------------------------------------------------------------ */
   /*  Core evaluation                                                   */
   /* ------------------------------------------------------------------ */

   /** Sync path (called by `_evaluate` internally when deterministic) */

   _evaluateSync({ maximize = false, minimize = false } = {}) {
      this.results = [];

      // helper that respects maximise/minimise flags
      const randomFace = () => super.randomFace({ maximize, minimize });

      for (let i = 0; i < this.number; i++) {
         let value = randomFace(); // first roll
         let total = value; // running total for this die
         let didExplode = false;

         // open-ended Shadowrun explosions
         const canExplode = !(maximize || minimize);
         while (canExplode && value === 6) {
            value = randomFace();
            total += value;
            didExplode = true;
         }

         // push a *single* result representing the whole chain
         this.results.push({
            result: total,
            active: true,
            exploded: didExplode, // lets the UI apply the “exploded” CSS
         });
      }
      return this;
   }

   async _evaluateAsync(opts = {}) {
      return this._evaluateSync(opts);
   }

   /* ------------------------------------------------------------------ */
   /*  Helpers                                                           */
   /* ------------------------------------------------------------------ */

   /** Roll and convert the face value to a standard result object */
   _randomFace(opts) {
      // Die#_roll eventually calls Die#randomFace, so skip the extra await here
      return super.randomFace();
   }

   /** Push a result object in the structure the core UI expects */
   _pushResult(value, extra = {}) {
      this.results.push({ result: value, active: true, ...extra });
   }

   /* ------------------------------------------------------------------ */
   /*  SR3E quality-of-life getters                                      */
   /* ------------------------------------------------------------------ */

   /** Standard success ≥5 */
   get successes() {
      return this.results.filter((r) => r.active && r.result >= 5).length;
   }
   /** Traditional botch (any 1 and no successes) */
   get isBotch() {
      const ones = this.results.filter((r) => r.active && r.result === 1).length;
      return ones > 0 && this.successes === 0;
   }

   /* ------------------------------------------------------------------ */
   /*  Registration helper                                               */
   /* ------------------------------------------------------------------ */

   static register() {
      // Replace the default d6 term *once*, during init
      CONFIG.Dice.terms[this.DENOMINATION] = this;
      CONFIG.Dice.terms[this.name] = this; // direct construction
   }
}
