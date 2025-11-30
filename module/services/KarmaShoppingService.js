export default class KarmaShoppingService {

    currentFloor = -1;
    specFloor = new Map(); // Map<string, number>
    baseSkillType = null;
    baseAttribute = null;

    constructor(skill) {
        const system = skill.system;
        this.baseSkillType = system.skillType;

        const fieldName = `${this.baseSkillType}Skill`;
        const skillData = system[fieldName];

        this.currentFloor = skillData?.value ?? 0;
        this.baseAttribute = skillData?.linkedAttribute ?? null;

        for (const spec of skillData?.specializations ?? []) {
            if (spec.name) this.specFloor.set(spec.name, spec.value);
        }

        if (this.baseSkillType === "language") {
            const readwrite = system.languageSkill.readwrite;
            if (readwrite) {
                this.specFloor.set("Read/Write", readwrite.value ?? 0);
            }
        }
    }

    getSkillPrice(attributeRating, skillRating, isActive) {
        const nextRating = skillRating + 1;
        const doubleAttr = attributeRating * 2;

        if (nextRating <= attributeRating) {
            return isActive ? 1.5 : 1;
        } else if (nextRating <= doubleAttr) {
            return isActive ? 2 : 1.5;
        } else {
            return isActive ? 2.5 : 2;
        }
    }

    getSpecializationPrice(attributeRating, specRating, isActive) {
        const nextRating = specRating + 1;
        const doubleAttr = attributeRating * 2;

        if (nextRating <= attributeRating) {
            return 0.5;
        } else if (nextRating <= doubleAttr) {
            return 1.5;
        } else {
            return 2;
        }
    }

    returnKarmaForSkill(attributeRating, skillRating, isActive) {
        if ((skillRating > 0 && skillRating > currentFloor))
            return this.getSkillPrice(attributeRating, skillRating - 1, isActive);
        return 0;
    }

    returnKarmaForSpec(attributeRating, specRating, isActive) {
        if (specRating > 0)
            return this.getSpecializationPrice(attributeRating, specRating - 1, isActive);

        return 0;
    }
}