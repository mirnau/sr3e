/**
 * SR3E System Configuration
 * Contains all i18n string keys for the Shadowrun 3rd Edition system
 */

export const sr3e = {
  ammunition: {
    ammunition: "sr3e.ammunition.ammunition",
    type: "sr3e.ammunition.type",
    rounds: "sr3e.ammunition.rounds",
    maxcapacity: "sr3e.ammunition.maxcapacity",
    class: "sr3e.ammunition.class",
    empty: "sr3e.ammunition.empty",
    requiredClass: "sr3e.ammunition.requiredClass",
  },

  button: {
    attack: "sr3e.button.attack",
    challenge: "sr3e.button.challenge",
    defend: "sr3e.button.defend",
    fullDefend: "sr3e.button.fullDefend",
    roll: "sr3e.button.roll",
    dodge: "sr3e.button.dodge",
    fire: "sr3e.button.fire",
    resist: "sr3e.button.resist",
  },

  label: {
    challenge: "sr3e.label.challenge",
    roll: "sr3e.label.roll",
    dodge: "sr3e.label.dodge",
  },

  warn: {
    defaultNotAllowed: "sr3e.warn.defaultNotAllowed",
    defaultTN8: "sr3e.warn.defaultTN8",
    procedureBusy: "sr3e.warn.procedureBusy",
  },

  error: {
    challengeFailed: "sr3e.error.challengeFailed",
  },

  attributes: {
    attributes: "sr3e.attributes.attributes",
    body: "sr3e.attributes.body",
    quickness: "sr3e.attributes.quickness",
    strength: "sr3e.attributes.strength",
    charisma: "sr3e.attributes.charisma",
    intelligence: "sr3e.attributes.intelligence",
    willpower: "sr3e.attributes.willpower",
    magic: "sr3e.attributes.magic",
    initiative: "sr3e.attributes.initiative",
    modifiers: "sr3e.attributes.modifiers",
    limits: "sr3e.attributes.limits",
    essence: "sr3e.attributes.essence",
    reaction: "sr3e.attributes.reaction",
  },

  broadcaster: {
    broadcaster: "sr3e.broadcaster.broadcaster",
  },

  // Mechanical (Actor type)
  mechanical: {
    mechanical: "sr3e.mechanical.mechanical",
    category: "sr3e.mechanical.category",
    power: "sr3e.mechanical.power",
    handling: "sr3e.mechanical.handling",
    speed: "sr3e.mechanical.speed",
    accel: "sr3e.mechanical.accel",
    body: "sr3e.mechanical.body",
    armor: "sr3e.mechanical.armor",
    signature: "sr3e.mechanical.signature",
    autonav: "sr3e.mechanical.autonav",
    pilot: "sr3e.mechanical.pilot",
    sensor: "sr3e.mechanical.sensor",
    cargo: "sr3e.mechanical.cargo",
    load: "sr3e.mechanical.load",
    speedTurbo: "sr3e.mechanical.speedTurbo",
    accelTurbo: "sr3e.mechanical.accelTurbo",
    seating: "sr3e.mechanical.seating",
    entryPoints: "sr3e.mechanical.entryPoints",
    setupBreakdownMinutes: "sr3e.mechanical.setupBreakdownMinutes",
    landingTakeoff: "sr3e.mechanical.landingTakeoff",
    riggerAdaptation: "sr3e.mechanical.riggerAdaptation",
    remoteControlInterface: "sr3e.mechanical.remoteControlInterface",
    performance: "sr3e.mechanical.performance",
    capacity: "sr3e.mechanical.capacity",
    droneOps: "sr3e.mechanical.droneOps",
    medium: {
      air: "sr3e.mechanical.medium.air",
      land: "sr3e.mechanical.medium.land",
      water: "sr3e.mechanical.medium.water",
      drone: "sr3e.mechanical.medium.drone",
    },
    mounts: {
      title: "sr3e.mechanical.mounts.title",
      firmpoints: "sr3e.mechanical.mounts.firmpoints",
      hardpoints: "sr3e.mechanical.mounts.hardpoints",
      turrets: "sr3e.mechanical.mounts.turrets",
      externalFixed: "sr3e.mechanical.mounts.externalFixed",
      internalFixed: "sr3e.mechanical.mounts.internalFixed",
      pintles: "sr3e.mechanical.mounts.pintles",
      miniTurrets: "sr3e.mechanical.mounts.miniTurrets",
    },
  },

  // Mechanical enumerations
  mechanicalCategories: {
    car: "sr3e.mechanicalCategories.car",
    truck: "sr3e.mechanicalCategories.truck",
    bike: "sr3e.mechanicalCategories.bike",
    hovercraft: "sr3e.mechanicalCategories.hovercraft",
    boat: "sr3e.mechanicalCategories.boat",
    ship: "sr3e.mechanicalCategories.ship",
    submarine: "sr3e.mechanicalCategories.submarine",
    fixedWing: "sr3e.mechanicalCategories.fixedWing",
    rotor: "sr3e.mechanicalCategories.rotor",
    vectoredThrust: "sr3e.mechanicalCategories.vectoredThrust",
    lta: "sr3e.mechanicalCategories.lta",
    security: "sr3e.mechanicalCategories.security",
    military: "sr3e.mechanicalCategories.military",
    tBird: "sr3e.mechanicalCategories.tBird",
    drone: "sr3e.mechanicalCategories.drone",
  },

  powerSources: {
    electric: "sr3e.powerSources.electric",
    petrochem: "sr3e.powerSources.petrochem",
    methanol: "sr3e.powerSources.methanol",
    fusion: "sr3e.powerSources.fusion",
    sail: "sr3e.powerSources.sail",
    other: "sr3e.powerSources.other",
  },

  landingTakeoff: {
    VTOL: "sr3e.landingTakeoff.VTOL",
    VSTOL: "sr3e.landingTakeoff.VSTOL",
    Runway: "sr3e.landingTakeoff.Runway",
    LaunchRecovery: "sr3e.landingTakeoff.LaunchRecovery",
  },

  difficulty: {
    simple: "sr3e.difficulty.simple",
    routine: "sr3e.difficulty.routine",
    average: "sr3e.difficulty.average",
    challenging: "sr3e.difficulty.challenging",
    hard: "sr3e.difficulty.hard",
    strenuous: "sr3e.difficulty.strenuous",
    extreme: "sr3e.difficulty.extreme",
    nearlyimpossible: "sr3e.difficulty.nearlyimpossible",
  },

  effects: {
    effectscomposer: "sr3e.effects.effectscomposer",
    name: "sr3e.effects.name",
    transfer: "sr3e.effects.transfer",
    disabled: "sr3e.effects.disabled",
    durationType: "sr3e.effects.durationType",
    durationValue: "sr3e.effects.durationValue",
    attributeKey: "sr3e.effects.attributeKey",
    changeMode: "sr3e.effects.changeMode",
    value: "sr3e.effects.value",
    priority: "sr3e.effects.priority",
    contributes: "sr3e.effects.contributes",
    actions: "sr3e.effects.actions",
    addChange: "sr3e.effects.addChange",
    noMatch: "sr3e.effects.noMatch",
    selectProperty: "sr3e.effects.selectProperty",
    permanent: "sr3e.effects.permanent",
    changesHeader: "sr3e.effects.changesHeader",
    target: "sr3e.effects.target",
  },

  health: {
    health: "sr3e.health.health",
    overflow: "sr3e.health.overflow",
    penalty: "sr3e.health.penalty",
  },

  modal: {
    confirm: "sr3e.modal.confirm",
    decline: "sr3e.modal.decline",
    deleteskill: "sr3e.modal.deleteskill",
    deleteskilltitle: "sr3e.modal.deleteskilltitle",
    exitattributesassignment: "sr3e.modal.exitattributesassignment",
    exitcreationmode: "sr3e.modal.exitcreationmode",
    exitattributesassignmenttitle: "sr3e.modal.exitattributesassignmenttitle",
    exitcreationmodetitle: "sr3e.modal.exitcreationmodetitle",
  },

  skill: {
    active: "sr3e.skill.active",
    addlingo: "sr3e.skill.addlingo",
    addspecialization: "sr3e.skill.addspecialization",
    knowledge: "sr3e.skill.knowledge",
    language: "sr3e.skill.language",
    lingos: "sr3e.skill.lingos",
    linkedAttribute: "sr3e.skill.linkedAttribute",
    newspecialization: "sr3e.skill.newspecialization",
    onlyonespecializationatcreation: "sr3e.skill.onlyonespecializationatcreation",
    readwrite: "sr3e.skill.readwrite",
    skill: "sr3e.skill.skill",
    specializations: "sr3e.skill.specializations",
  },

  initiative: {
    augmentedReaction: "sr3e.initiative.augmentedReaction",
    initiative: "sr3e.initiative.initiative",
    initiativeDice: "sr3e.initiative.initiativeDice",
    natuaralReaction: "sr3e.initiative.naturalReaction",
    reaction: "sr3e.initiative.reaction",
    reactionPenalty: "sr3e.initiative.reactionPenalty",
  },

  inventory: {
    inventory: "sr3e.inventory.inventory",
    favourites: "sr3e.inventory.favourites",
    equipped: "sr3e.inventory.equipped",
  },

  common: {
    max: "sr3e.common.max",
    min: "sr3e.common.min",
    average: "sr3e.common.average",
    description: "sr3e.common.description",
    priority: "sr3e.common.priority",
    other: "sr3e.common.other",
    custom: "sr3e.common.custom",
    details: "sr3e.common.details",
    isdefaulting: "sr3e.common.isdefaulting",
    unknown: "sr3e.common.unknown",
  },

  dicepools: {
    dicepools: "sr3e.dicepools.dicepools",
    astral: "sr3e.dicepools.astral",
    combat: "sr3e.dicepools.combat",
    control: "sr3e.dicepools.control",
    hacking: "sr3e.dicepools.hacking",
    spell: "sr3e.dicepools.spell",
    associateselect: "sr3e.dicepools.associateselect",
  },

  chat: {
    contestexpried: "sr3e.chat.contestexpried",
    resist: "sr3e.chat.resist",
  },

  dodge: {
    dodge: "sr3e.dodge.dodge",
    yes: "sr3e.dodge.yes",
    no: "sr3e.dodge.no",
  },

  gadget: {
    gadget: "sr3e.gadget.gadget",
    type: "sr3e.gadget.type",
  },

  karma: {
    karma: "sr3e.karma.karma",
    goodkarma: "sr3e.karma.goodkarma",
    karmapool: "sr3e.karma.karmapool",
    advancementratio: "sr3e.karma.advancementratio",
    miraculoussurvival: "sr3e.karma.miraculoussurvival",
    lifetimekarma: "sr3e.karma.lifetimekarma",
    commitselected: "sr3e.karma.commitselected",
    selectall: "sr3e.karma.selectall",
    deselectall: "sr3e.karma.deselectall",
    commit: "sr3e.karma.commit",
  },

  movement: {
    movement: "sr3e.movement.movement",
    walking: "sr3e.movement.walking",
    running: "sr3e.movement.running",
    runSpeedModifier: "sr3e.movement.runSpeedModifier",
  },

  placeholders: {
    human: "sr3e.placeholders.human",
    fullshaman: "sr3e.placeholders.fullshaman",
    selectanoption: "sr3e.placeholders.selectanoption",
  },

  karmamanager: {
    character: "sr3e.karmamanager.character",
    npc: "sr3e.karmamanager.npc",
  },

  sheet: {
    playercharacter: "sr3e.sheet.playercharacter",
    details: "sr3e.sheet.details",
    viewbackground: "sr3e.sheet.viewbackground",
    buyupgrades: "sr3e.sheet.buyupgrades",
    searchJournals: "sr3e.sheet.searchJournals",
    createCharacter: "sr3e.sheet.createCharacter",
    cancel: "sr3e.sheet.cancel",
    randomize: "sr3e.sheet.randomize",
    clear: "sr3e.sheet.clear",
    chooseanoption: "sr3e.sheet.chooseanoption",
    attributepoints: "sr3e.sheet.attributepoints",
    skillpoints: "sr3e.sheet.skillpoints",
    resources: "sr3e.sheet.resources",
    quote: "sr3e.sheet.quote",
    delete: "sr3e.sheet.delete",
    edit: "sr3e.sheet.edit",
  },

  traits: {
    age: "sr3e.traits.age",
    height: "sr3e.traits.height",
    weight: "sr3e.traits.weight",
    agerange: "sr3e.traits.agerange",
    metatype: "sr3e.traits.metatype",
    child: "sr3e.traits.child",
    adolecent: "sr3e.traits.adolecent",
    youngadult: "sr3e.traits.youngadult",
    adult: "sr3e.traits.adult",
    middleage: "sr3e.traits.middleage",
    goldenyears: "sr3e.traits.goldenyears",
    ancient: "sr3e.traits.ancient",
  },

  vision: {
    vision: "sr3e.vision.vision",
    type: "sr3e.vision.type",
    normalvision: "sr3e.vision.normalvision",
    thermographic: "sr3e.vision.thermographic",
    lowlight: "sr3e.vision.lowlight",
  },

  userconfig: {
    setPlayerName: "sr3e.userconfig.setPlayerName",
    playerName: "sr3e.userconfig.playerName",
    avatar: "sr3e.userconfig.avatar",
    imageFile: "sr3e.userconfig.imageFile",
    openFilePicker: "sr3e.userconfig.openFilePicker",
    choosePlayerColor: "sr3e.userconfig.choosePlayerColor",
    playersPreferredPronoun: "sr3e.userconfig.playersPreferredPronoun",
    selectMainCharacter: "sr3e.userconfig.selectMainCharacter",
    saveSettings: "sr3e.userconfig.saveSettings",
    saveUserSettings: "sr3e.userconfig.saveUserSettings",
  },

  storytellerscreen: {
    storytellerscreen: "sr3e.storytellerscreen.storytellerscreen",
    refreshcombatpool: "sr3e.storytellerscreen.refreshcombatpool",
    refreshastralpool: "sr3e.storytellerscreen.refreshastralpool",
    refreshhackingpool: "sr3e.storytellerscreen.refreshhackingpool",
    refreshcontrolpool: "sr3e.storytellerscreen.refreshcontrolpool",
    refreshspellpool: "sr3e.storytellerscreen.refreshspellpool",
    refreshkarma: "sr3e.storytellerscreen.refreshkarmapool",
    refresh: "sr3e.storytellerscreen.refresh",
  },

  magic: {
    magic: "sr3e.magic.magic",
    adept: "sr3e.magic.adept",
    magician: "sr3e.magic.magician",
    fullmage: "sr3e.magic.fullmage",
    aspectedmage: "sr3e.magic.aspectedmage",
    conjurer: "sr3e.magic.conjurer",
    sorcerer: "sr3e.magic.sorcerer ",
    elementalist: "sr3e.magic.elementalist",
    hermetic: "sr3e.magic.hermetic",
    shamanic: "sr3e.magic.shamanic",
    adeptnote: "sr3e.magic.adeptnote",
    shamannote: "sr3e.magic.shamannote",
    type: "sr3e.magic.type",
    magicianType: "sr3e.magic.magicianType",
    tradition: "sr3e.magic.tradition",
    aspect: "sr3e.magic.aspect",
    canAstrallyProject: "sr3e.magic.canAstrallyProject",
    usesPowers: "sr3e.magic.usesPowers",
    focus: "sr3e.magic.focus",
    resistanceAttribute: "sr3e.magic.resistanceAttribute",
    totem: "sr3e.magic.totem",
    priority: "sr3e.magic.priority",
    spellPoints: "sr3e.magic.spellPoints",
    powerPoints: "sr3e.magic.powerPoints",
    spell: "sr3e.magic.spell",
  },

  notifications: {
    assignattributesfirst: "sr3e.notifications.assignattributesfirst",
    skillpointsrefund: "sr3e.notifications.skillpointsrefund",
    skillpricecrossedthreshold: "sr3e.notifications.skillpricecrossedthreshold",
    warnnogadgettypeselected: "sr3e.notifications.warnnogadgettypeselected",
  },

  procedure: {
    difficulty: "sr3e.procedure.difficulty",
    challenge: "sr3e.procedure.challenge",
    roll: "sr3e.procedure.roll",
    standardDefense: "sr3e.procedure.standardDefense",
    fullDefense: "sr3e.procedure.fullDefense",
    fire: "sr3e.procedure.fire",
    attack: "sr3e.procedure.attack",
    resist: "sr3e.procedure.resist",
    challengeFailed: "sr3e.procedure.challengeFailed",
    defaultNotAllowed: "sr3e.procedure.defaultNotAllowed",
    defaultTN8: "sr3e.procedure.defaultTN8",
    contestexpired: "sr3e.procedure.contestexpired",
    weapondifficulty: "sr3e.procedure.weapondifficulty",
    dodgeTitle: "sr3e.procedure.dodgetitle",
    dodge: "sr3e.procedure.dodge",
    dodgebutton: "sr3e.procedure.dodgebutton",
    dodgedescription: "sr3e.procedure.dodgedescription",
  },

  time: {
    days: "sr3e.time.days",
    hours: "sr3e.time.hours",
    minutes: "sr3e.time.minutes",
    seconds: "sr3e.time.seconds",
    rounds: "sr3e.time.rounds",
    turns: "sr3e.time.turns",
    months: "sr3e.time.months",
    years: "sr3e.time.years",
  },

  combosearch: {
    noresult: "sr3e.combosearch.noresult",
    search: "sr3e.combosearch.search",
  },

  transaction: {
    transaction: "sr3e.transaction.transaction",
    creditstick: "sr3e.transaction.creditstick",
    recurrent: "sr3e.transaction.recurrent",
    asset: "sr3e.transaction.asset",
    income: "sr3e.transaction.income",
    debt: "sr3e.transaction.debt",
    expense: "sr3e.transaction.expense",
    select: "sr3e.transaction.select",
  },

  weapon: {
    damageType: "sr3e.weapon.damageType",
    ammunitionClass: "sr3e.weapon.ammunitionClass",
    weapon: "sr3e.weapon.weapon",
    weaponStats: "sr3e.weapon.weaponStats",
    damage: "sr3e.weapon.damage",
    mode: "sr3e.weapon.mode",
    range: "sr3e.weapon.range",
    recoilCompensation: "sr3e.weapon.recoilCompensation",
    currentClip: "sr3e.weapon.currentClip",
    manual: "sr3e.weapon.manual",
    semiauto: "sr3e.weapon.semiauto",
    fullauto: "sr3e.weapon.fullauto",
    blade: "sr3e.weapon.blade",
    explosive: "sr3e.weapon.explosive",
    blunt: "sr3e.weapon.blunt",
    energy: "sr3e.weapon.energy",
    rangebandshort: "sr3e.weapon.rangebandshort",
    rangebandmedium: "sr3e.weapon.rangebandmedium",
    rangebandlong: "sr3e.weapon.rangebandlong",
    rangebandextreme: "sr3e.weapon.rangebandextreme",
    rangeband: "sr3e.weapon.rangeband",
    reloadMechanism: "sr3e.weapon.reloadMechanism",
  },

  commodity: {
    commodity: "sr3e.commodity.commodity",
    days: "sr3e.commodity.days",
    cost: "sr3e.commodity.cost",
    streetIndex: "sr3e.commodity.streetIndex",
    restrictionLevel: "sr3e.commodity.restrictionLevel",
    legalstatus: "sr3e.commodity.legalstatus",
    legalpermit: "sr3e.commodity.legalpermit",
    legalenforcementpriority: "sr3e.commodity.legalenforcementpriority",
    isBroken: "sr3e.commodity.isBroken",
  },

  portability: {
    portability: "sr3e.portability.portability",
    concealability: "sr3e.portability.concealability",
    weight: "sr3e.portability.weight",
  },

  ammunitionType: {
    regular: "sr3e.ammunitionType.regular",
    apds: "sr3e.ammunitionType.apds",
    explosive: "sr3e.ammunitionType.explosive",
    gel: "sr3e.ammunitionType.gel",
    capsule: "sr3e.ammunitionType.capsule",
    tracer: "sr3e.ammunitionType.tracer",
    flechette: "sr3e.ammunitionType.flechette",
    incendiary: "sr3e.ammunitionType.incendiary",
    tracker: "sr3e.ammunitionType.tracker",
  },

  ammunitionClass: {
    holdout: "sr3e.ammunitionClass.holdout",
    lightPistol: "sr3e.ammunitionClass.lightPistol",
    heavyPistol: "sr3e.ammunitionClass.heavyPistol",
    smg: "sr3e.ammunitionClass.smg",
    shotgun: "sr3e.ammunitionClass.shotgun",
    assaultRifle: "sr3e.ammunitionClass.assaultRifle",
    sportingRifle: "sr3e.ammunitionClass.sportingRifle",
    sniperRifle: "sr3e.ammunitionClass.sniperRifle",
    lmg: "sr3e.ammunitionClass.lmg",
    mmg: "sr3e.ammunitionClass.mmg",
    hmg: "sr3e.ammunitionClass.hmg",
    assaultCannon: "sr3e.ammunitionClass.assaultCannon",
    grenadeLauncher: "sr3e.ammunitionClass.grenadeLauncher",
    missileLauncher: "sr3e.ammunitionClass.missileLauncher",
    taser: "sr3e.ammunitionClass.taser",
    bow: "sr3e.ammunitionClass.bow",
    crossbow: "sr3e.ammunitionClass.crossbow",
  },

  damageType: {
    l: "sr3e.damageType.l",
    m: "sr3e.damageType.m",
    s: "sr3e.damageType.s",
    d: "sr3e.damageType.d",
    lStun: "sr3e.damageType.lStun",
    mStun: "sr3e.damageType.mStun",
    sStun: "sr3e.damageType.sStun",
    dStun: "sr3e.damageType.dStun",
  },

  weaponMode: {
    manual: "sr3e.weaponMode.manual",
    semiauto: "sr3e.weaponMode.semiauto",
    burst: "sr3e.weaponMode.burst",
    fullauto: "sr3e.weaponMode.fullauto",
    blade: "sr3e.weaponMode.blade",
    explosive: "sr3e.weaponMode.explosive",
    energy: "sr3e.weaponMode.energy",
    blunt: "sr3e.weaponMode.blunt",
  },

  legalstatus: {
    L: "sr3e.legalstatus.L",
    R: "sr3e.legalstatus.R",
    I: "sr3e.legalstatus.I",
  },

  legalpermit: {
    1: "sr3e.legalpermit.1",
    2: "sr3e.legalpermit.2",
    3: "sr3e.legalpermit.3",
    4: "sr3e.legalpermit.4",
    N: "sr3e.legalpermit.N",
  },

  legalpriority: {
    1: "sr3e.legalpriority.1",
    2: "sr3e.legalpriority.2",
    3: "sr3e.legalpriority.3",
    4: "sr3e.legalpriority.4",
    X: "sr3e.legalpriority.X",
  },

  reloadMechanism: {
    c: "sr3e.reloadMechanism.c",
    b: "sr3e.reloadMechanism.b",
    m: "sr3e.reloadMechanism.m",
    cy: "sr3e.reloadMechanism.cy",
    belt: "sr3e.reloadMechanism.belt",
  },

  gadgettypes: {
    weaponmod: "sr3e.gadgettypes.weaponmod",
  },

  focus: {
    focus: "sr3e.focus.focus",
  },

  wearable: {
    wearables: "sr3e.wearable.wearables",
    wearable: "sr3e.wearable.wearable",
    apparel: "sr3e.wearable.apparel",
    ballistic: "sr3e.wearable.ballistic",
    impact: "sr3e.wearable.impact",
    canlayer: "sr3e.wearable.canlayer",
  },

  magicianTypes: {
    fullmage: "sr3e.magicianTypes.fullmage",
    aspectedmage: "sr3e.magicianTypes.aspectedmage",
  },

  aspects: {
    conjurer: "sr3e.aspects.conjurer",
    sorcerer: "sr3e.aspects.sorcerer",
    elementalist: "sr3e.aspects.elementalist",
    custom: "sr3e.aspects.custom",
  },

  resistanceAttributes: {
    willpower: "sr3e.resistanceAttributes.willpower",
    charisma: "sr3e.resistanceAttributes.charisma",
    intelligence: "sr3e.resistanceAttributes.intelligence",
  },

  traditions: {
    hermetic: "sr3e.traditions.hermetic",
    shamanic: "sr3e.traditions.shamanic",
    other: "sr3e.traditions.other",
  },

  archetypes: {
    adept: "sr3e.archetypes.adept",
    magician: "sr3e.archetypes.magician",
  },

  // Active Effects heading
  activeeffects: {
    activeeffects: "sr3e.activeeffects.activeeffects",
  },

  // Tech Interface (Cyberdeck, Cyberterminal, RC Deck)
  techinterface: {
    techinterface: "sr3e.techinterface.techinterface",
    subtype: "sr3e.techinterface.subtype",
    make: "sr3e.techinterface.make",
    model: "sr3e.techinterface.model",
    matrix: "sr3e.techinterface.matrix",
    persona: "sr3e.techinterface.persona",
    mpcp: "sr3e.techinterface.mpcp",
    bod: "sr3e.techinterface.bod",
    evasion: "sr3e.techinterface.evasion",
    masking: "sr3e.techinterface.masking",
    sensor: "sr3e.techinterface.sensor",
    hardening: "sr3e.techinterface.hardening",
    activeMp: "sr3e.techinterface.activeMp",
    storageMp: "sr3e.techinterface.storageMp",
    ioMpPerCT: "sr3e.techinterface.ioMpPerCT",
    responseIncrease: "sr3e.techinterface.responseIncrease",
    programs: "sr3e.techinterface.programs",
    programUuid: "sr3e.techinterface.programUuid",
    programKind: "sr3e.techinterface.programKind",
    programTag: "sr3e.techinterface.programTag",
    programRating: "sr3e.techinterface.programRating",
    programActive: "sr3e.techinterface.programActive",
    rigger: "sr3e.techinterface.rigger",
    rating: "sr3e.techinterface.rating",
    fluxRating: "sr3e.techinterface.fluxRating",
    subscribers: "sr3e.techinterface.subscribers",
    subscriberId: "sr3e.techinterface.subscriberId",
    riggerModes: "sr3e.techinterface.riggerModes",
  },

  techinterfaceSubtypes: {
    cyberdeck: "sr3e.techinterfaceSubtypes.cyberdeck",
    cyberterminal: "sr3e.techinterfaceSubtypes.cyberterminal",
    rcdeck: "sr3e.techinterfaceSubtypes.rcdeck",
  },

  programKinds: {
    operational: "sr3e.programKinds.operational",
    special: "sr3e.programKinds.special",
    offensive: "sr3e.programKinds.offensive",
    defensive: "sr3e.programKinds.defensive",
  },

  riggerModes: {
    "captains-chair": "sr3e.riggerModes.captainschair",
    primary: "sr3e.riggerModes.primary",
    secondary: "sr3e.riggerModes.secondary",
  },

  spelltype: {
    mana: "sr3e.spelltype.mana",
    physical: "sr3e.spelltype.physical",
  },

  spellcategory: {
    combat: "sr3e.spellcategory.combat",
    detection: "sr3e.spellcategory.detection",
    health: "sr3e.spellcategory.health",
    illusion: "sr3e.spellcategory.illusion",
    manipulation: "sr3e.spellcategory.manipulation",
  },

  spellrange: {
    los: "sr3e.spellrange.los",
    losa: "sr3e.spellrange.losa",
    touch: "sr3e.spellrange.touch",
    self: "sr3e.spellrange.self",
  },

  // Prefer this over not nesting
  dropdown: {
    spelltype: {
      physical: "sr3e.dropdown.spelltype.physical",
      mana: "sr3e.dropdown.spelltype.mana",
    },
    spellduration: {
      instant: "sr3e.dropdown.spellduration.instant",
      sustained: "sr3e.dropdown.spellduration.sustained",
      permanent: "sr3e.dropdown.spellduration.permanent",
    },
  },
} as const;

export type Sr3eConfig = typeof sr3e;
