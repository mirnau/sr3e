export default class OpenRollService {
   static #sessions = new Map();

   /** Start an opposed roll initiated by an actor */
   static async start({ initiator, target, rollData, isSilent = false }) {
      const initiatorRoll = await SR3eRoll.fromData(rollData).evaluate({ async: true });

      const session = {
         id: randomID(),
         initiator,
         target,
         initiatorRoll,
         targetRoll: null,
         isSilent,
         timestamp: Date.now(),
         resolved: false,
      };

      this.#sessions.set(session.id, session);

      if (isSilent) {
         await this.#handleSilent(session);
      } else {
         await this.#promptTarget(session);
      }
   }

   static async resolveTargetRoll(sessionId, targetRoll) {
      const session = this.#sessions.get(sessionId);
      if (!session) throw new Error(`No session found for ID ${sessionId}`);

      session.targetRoll = targetRoll;
      session.resolved = true;

      const initiatorHits = this.#countSuccesses(session.initiatorRoll);
      const targetHits = this.#countSuccesses(session.targetRoll);
      const netSuccesses = initiatorHits - targetHits;

      if (!session.isSilent) {
         await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: session.initiator }),
            content: await renderOpposedRollMessage(session, netSuccesses),
         });
      } else {
         if (netSuccesses <= 0) {
            Hooks.callAll("sr3e.stealthBroken", {
               attacker: session.initiator,
               target: session.target,
               netSuccesses,
            });
         }
      }

      Hooks.callAll("sr3e.opposedRollResolved", { session, netSuccesses });
   }

   static #countSuccesses(roll) {
      return roll.terms[0].results.filter(r => r.result >= 5).length;
   }

   static async #promptTarget(session) {
      game.sr3e.promptOpposedRoll?.(session.target, session.id);
   }

   static async #handleSilent(session) {
      const perceptionSkill = session.target.items.find(i =>
         i.system?.skillType === "active" && i.name.toLowerCase().includes("perception"),
      );

      const perceptionRoll = await SR3eRoll.fromData({
         dice: perceptionSkill?.system.dice ?? 0,
         options: {
            targetNumber: 4,
            modifiers: [],
            explodes: true,
         },
      }).evaluate({ async: true });

      await this.resolveTargetRoll(session.id, perceptionRoll);
   }

   static getSession(id) {
      return this.#sessions.get(id);
   }
}
