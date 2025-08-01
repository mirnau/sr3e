import { localize } from "./utilities.js";

export default class ItemDataService {
   static getAllItemsOfType(name) {
      return game.items.filter((item) => item.type === name);
   }

   static getAllMetatypes(metatypes) {
      return metatypes
         .filter((m) => m && typeof m.name === "string" && typeof m.id === "string" && m.system?.priority)
         .map((metatype) => ({
            name: metatype.name,
            foundryitemid: metatype.id,
            priority: metatype.system.priority,
         }));
   }

   static getAllMagics(magics) {
      return [
         { priority: "E", name: "Unawakened", foundryitemid: "E-foundryItemId" },
         { priority: "D", name: "Unawakened", foundryitemid: "D-foundryItemId" },
         { priority: "C", name: "Unawakened", foundryitemid: "C-foundryItemId" },
         ...magics.map((magic) => {
            return {
               priority: magic.system.awakened.priority,
               name: magic.name,
               foundryitemid: magic.id,
            };
         }),
      ];
   }

   static getPriorities() {
      return {
         attributes: { A: 30, B: 27, C: 24, D: 21, E: 18 },
         skills: { A: 50, B: 40, C: 34, D: 30, E: 27 },
         resources: { A: 1000000, B: 400000, C: 90000, D: 20000, E: 5000 },
      };
   }

   static getDefaultHumanItem() {
      return {
         name: localize(CONFIG.sr3e.placeholders.human) ?? "Localization Error in metatype",
         type: "metatype",
         img: "systems/sr3e/textures/ai/humans.webp",
         system: {
            agerange: { min: 0, average: 30, max: 100 },
            physical: {
               height: { min: 150, average: 170, max: 220 },
               weight: { min: 50, average: 70, max: 250 },
            },
            attributeLimits: {
               strength: 6,
               quickness: 6,
               body: 6,
               charisma: 6,
               intelligence: 6,
               willpower: 6,
            },
            karma: {
               factor: 0.1,
            },
            movement: {
               factor: 3,
            },
            priority: "E",
            journalId: "", // Set to a real JournalEntry ID if needed
         },
      };
   }

   static getDefaultMagic() {
      return {
         name: localize(CONFIG.sr3e.placeholders.fullshaman) ?? "Localization Error in Magic",
         type: "magic",
         system: {
            awakened: {
               archetype: "magician",
               priority: "A",
            },
            magicianData: {
               magicianType: "Full",
               tradition: "Bear",
               drainResistanceAttribute: "Charisma",
               aspect: "",
               canAstrallyProject: true,
               totem: "Bear",
               spellPoints: 25,
            },
            adeptData: {
               powerPoints: 0,
            },
         },
      };
   }

   static getDifficultyGradings(config) {
      let difficulty = [
         "simple",
         "routine",
         "average",
         "challenging",
         "hard",
         "strenuous",
         "extreme",
         "nearlyimpossible",
      ];
      return Object.fromEntries(difficulty.map((key) => [key, localize(config.difficulty[key])]));
   }
}
