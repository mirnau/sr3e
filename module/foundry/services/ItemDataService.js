import { localize } from "../../svelteHelpers.js";

export default class ItemDataService {

    static getAllItemsOfType(name) {
        return game.items.filter((item) => item.type === name);
    }

    static getAllMetaHumans(metahumans) {
        return metahumans.map(metahuman => {
            return {
                name: metahuman.name,
                foundryitemid: metahuman.id,
                priority: metahuman.system.priority,
            };
        });
    }

    static getAllMagics(magics) {
        return [
            { priority: "E", name: "Unawakened", foundryitemid: "E-foundryItemId" },
            { priority: "D", name: "Unawakened", foundryitemid: "D-foundryItemId" },
            { priority: "C", name: "Unawakened", foundryitemid: "C-foundryItemId" },
            ...magics.map(magic => {

                return {
                    priority: magic.system.awakened.priority,
                    name: magic.name,
                    foundryitemid: magic.id,
                };
            })
        ];
    }

    static getPriorities() {
        return {
            attributes: { A: 30, B: 27, C: 24, D: 21, E: 18 },
            skills: { A: 50, B: 40, C: 34, D: 30, E: 27 },
            resources: { A: 1000000, B: 400000, C: 90000, D: 20000, E: 5000 }
        };
    }

    static getHumanItem() {
        return game.items.find(
                (i) => i.type === "metahuman" && i.name === "Human")
    }

    static getDefaultHumanItem() {
        return {
            name: localize(CONFIG.sr3e.traits.human),
            type: "metahuman",
            img: "systems/sr3e/textures/ai-generated/humans.webp",
            system: {
                lifespan: { min: 10, average: 30, max: 100 },
                physical: {
                    height: { min: 150, average: 170, max: 200 },
                    weight: { min: 50, average: 70, max: 120 }
                },
                modifiers: {
                    strength: 0,
                    quickness: 0,
                    body: 0,
                    charisma: 0,
                    intelligence: 0,
                    willpower: 0
                },
                attributeLimits: {
                    strength: 6,
                    quickness: 6,
                    body: 6,
                    charisma: 6,
                    intelligence: 6,
                    willpower: 6
                },
                karmaAdvancementFraction: { value: 0.1 },
                vision: {
                    type: "Normal",
                    description: "Standard human vision",
                    rules: { darknessPenaltyNegation: "" }
                },
                priority: "E",
                description: "<p>Humans are the baseline metatype, versatile and adaptive.</p>"
            }
        };
    }

    static getDefaultMagic() {
        return {
            name: localize(config.placeholders.fullshaman),
            type: "magic",
            system: {
                type: "Full",
                priority: "A",
                focus: "None",
                drainResistanceAttribute: "Charisma",
                totem: "Bear"
            }
        };
    }
}
