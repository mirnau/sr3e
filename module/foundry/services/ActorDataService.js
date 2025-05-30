import { localize } from "../../svelteHelpers.js";

export default class ActorDataService {

    static prepareSkills(items) {
        return {
            active: this._categorizeAndSortSkills(
                items.filter(item => item.type === "skill" && item.system.skillType === "activeSkill"),
                item => item.system.activeSkill.linkedAttribute
            ),
            knowledge: this._categorizeAndSortSkills(
                items.filter(item => item.type === "skill" && item.system.skillType === "knowledgeSkill"),
                item => item.system.knowledgeSkill.linkedAttribute
            ),
            language: this._sortSkillsByName(
                items.filter(item => item.type === "skill" && item.system.skillType === "languageSkill")
            ),
        };
    }

    static prepareLanguages(items) {
        return items
            .filter(item => item.type === "skill" && item.system.skillType === "languageSkill")
            .map(item => {
                const languageData = {
                    id: item.id,
                    name: item.name,
                    skills: [
                        {
                            type: localize(CONFIG.sr3e.skill.speak),
                            value: item.system.languageSkill.speak?.value,
                            specializations: item.system.languageSkill.speak.specializations,
                        },
                        {
                            type: localize(CONFIG.sr3e.skill.read),
                            value: item.system.languageSkill.read?.value,
                            specializations: item.system.languageSkill.read.specializations,
                        },
                        {
                            type: localize(CONFIG.sr3e.skill.write),
                            value: item.system.languageSkill.write?.value,
                            specializations: item.system.languageSkill.write.specializations,
                        },
                    ],
                };
                return languageData;
            });
    }

    static _categorizeAndSortSkills(skills, keyFn) {
        const categories = skills.reduce((acc, skill) => {
            const category = keyFn(skill) || "uncategorized";
            if (!acc[category]) acc[category] = [];
            acc[category].push(skill);
            return acc;
        }, {});
        Object.keys(categories).forEach(key => categories[key].sort((a, b) => a.name.localeCompare(b.name)));
        return categories;
    }

    static _sortSkillsByName(skills) {
        return skills.sort((a, b) => a.name.localeCompare(b.name));
    }

    static getLocalizedLinkingAttibutes() {
        return {
            body: localize(CONFIG.sr3e.attributes.body),
            quickness: localize(CONFIG.sr3e.attributes.quickness),
            strength: localize(CONFIG.sr3e.attributes.strength),
            charisma: localize(CONFIG.sr3e.attributes.charisma),
            intelligence: localize(CONFIG.sr3e.attributes.intelligence),
            willpower: localize(CONFIG.sr3e.attributes.willpower),
            reaction: localize(CONFIG.sr3e.attributes.reaction),
            magic: localize(CONFIG.sr3e.attributes.reaction),
        };
    }

    static getCharacterCreationStats() {
        return {
            attributes: [
                { priority: "A", points: 30 },
                { priority: "B", points: 27 },
                { priority: "C", points: 24 },
                { priority: "D", points: 21 },
                { priority: "E", points: 18 },
            ],
            skills: [
                { priority: "A", points: 50 },
                { priority: "B", points: 40 },
                { priority: "C", points: 34 },
                { priority: "D", points: 30 },
                { priority: "E", points: 27 },
            ],
            resources: [
                { priority: "A", points: 1000000 },
                { priority: "B", points: 400000 },
                { priority: "C", points: 90000 },
                { priority: "D", points: 20000 },
                { priority: "E", points: 5000 },
            ]
        };
    }

}