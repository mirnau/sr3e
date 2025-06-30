// src/dice/SR3Edie.js
export default class SR3Edie extends foundry.dice.terms.Die {
   /** Keep the normal “d” so 10d still parses */
   static DENOMINATION = "d";

   /* ------------------------------------------------------------------ */
   /*  Declare custom modifiers so the parser accepts ! and !o            */
   /* ------------------------------------------------------------------ */
   static MODIFIERS = {
      ...foundry.dice.terms.Die.MODIFIERS,
      x(mod) {
         return this;
      }, // disable core explode
   };

   /* ------------------------------------------------------------------ */
   /*  Evaluation                                                        */
   /* ------------------------------------------------------------------ */

   //Must support 1d6 for non exploding rolls
   //Must support 1d6x for uncapped exploding rolls (infinte recursion)
   //Must support 1d6xN where N is a positive number higher than 2 (If lower than two, use two anyway). N is the cap of the roll. When any individual die reaches the cap, the explosion ends and the accumulative result of the die is reported, just like with uncapped
   //Must not support xo or xo N, as they are not a part of Shadowrun Third Editionrules.
   //Must No dice generate new dice. Instead they accumulate their value. So if I roll six, it explodes, then I roll again and get value, the six sided die should report 11, and not spawn a new die.

   async _evaluate(opts = {}) {
      // async wrapper
      return this._evaluateSync(opts);
   }

   _evaluateSync({ maximize = false, minimize = false } = {}) {
      this.results = [];
      const randomFace = () => super.randomFace({ maximize, minimize });
      const explodeMod = this.modifiers.find((m) => /^x\d*$/.test(m));
      if (!explodeMod) {
         for (let i = 0; i < this.number; i++)
            this.results.push({ result: randomFace(), active: true, exploded: false });
         return this;
      }

      const cap = explodeMod === "x" ? Infinity : Math.max(2, parseInt(explodeMod.slice(1)));
      this._targetNumber = cap === Infinity ? null : cap;
      const canExplode = !(maximize || minimize);

      for (let i = 0; i < this.number; i++) {
         let total = 0;
         let didExplode = false;
         while (true) {
            const roll = randomFace();
            total += roll;
            if (roll === 6 && canExplode && total < cap) {
               didExplode = true;
            } else {
               break;
            }
         }
         this.results.push({ result: total, active: true, exploded: didExplode });
      }
      return this;
   }

   get successes() {
      if (this._targetNumber == null) return null;
      return this.results.filter((r) => r.active && r.result >= this._targetNumber).length;
   }
   get isBotch() {
      const active = this.results.filter((r) => r.active);
      return active.length && !this.successes && active.every((r) => r.result === 1);
   }
   get isFailure() {
      return !this.successes && !this.isBotch;
   }

   static Register() {
      CONFIG.Dice.terms.d = SR3Edie;
      CONFIG.Dice.terms.SR3Edie = SR3Edie;
   }
}
