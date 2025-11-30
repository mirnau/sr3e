import ActiveSkillsCreationShopping from "./ActiveSkillsCreationShopping.js";

export default class LanguageSkillCreationShopping extends ActiveSkillsCreationShopping {
  constructor(opts) { super(opts); this.pointsStore = opts.actorStoreManager.GetRWStore("creation.languagePoints"); }
}

