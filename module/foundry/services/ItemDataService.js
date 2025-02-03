export default class ItemDataService {
    
    static getDefaultHumanItem() {
        return (
            {
                name: "Human",
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
            }
        );
    }
    
    static getDefaultMagic() {
        return {
            name: "Full Shaman",
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