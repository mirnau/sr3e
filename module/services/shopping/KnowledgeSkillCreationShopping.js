import ActiveSkillsCreationShopping from "./ActiveSkillsCreationShopping.js";

export default class KnowledgeSkillCreationShopping extends ActiveSkillsCreationShopping {
  constructor(opts) { super(opts); this.pointsStore = opts.actorStoreManager.GetRWStore("creation.knowledgePoints"); }
}

