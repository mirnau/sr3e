class Log {
  static error(message, sender, obj) {
    this._print("❌", "coral", message, sender, obj);
  }
  static warn(message, sender, obj) {
    this._print("⚠️", "orange", message, sender, obj);
  }
  static info(message, sender, obj) {
    this._print("ℹ️", "lightblue", message, sender, obj);
  }
  static success(message, sender, obj) {
    this._print("✅", "lightgreen", message, sender, obj);
  }
  static inspect(message, sender, obj) {
    this._print("🔎", "mediumpurple", message, sender, obj);
  }
  static _print(icon, color, message, sender, obj) {
    const iconStyle = `font-weight: bold; color: ${color};`;
    const sr3eStyle = `font-weight: bold; color: ${color};`;
    const msgStyle = "color: orange;";
    const senderStyle = `font-weight: bold; color: ${color};`;
    if (obj !== void 0) {
      console.log(
        `%c${icon} | %csr3e | %c${message} in %c${sender}`,
        iconStyle,
        sr3eStyle,
        msgStyle,
        senderStyle,
        obj
      );
    } else {
      console.log(
        `%c${icon} | %csr3e | %c${message} in %c${sender}`,
        iconStyle,
        sr3eStyle,
        msgStyle,
        senderStyle
      );
    }
  }
}
class Profile extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      names: new foundry.data.fields.ArrayField(
        new foundry.data.fields.SchemaField({
          alias: new foundry.data.fields.StringField({
            required: false,
            initial: ""
          })
        }),
        {
          required: true,
          initial: []
        }
      ),
      metaHumanity: new foundry.data.fields.StringField({
        required: false,
        initial: ""
      }),
      // Image
      img: new foundry.data.fields.StringField({
        required: false,
        initial: "systems/sr3e/textures/ai-generated/humans.webp"
      }),
      // Pronouns
      pronouns: new foundry.data.fields.StringField({
        required: false,
        initial: "Them/They"
      }),
      // Age
      age: new foundry.data.fields.NumberField({
        required: false,
        initial: 0,
        integer: true
      }),
      // Weight
      weight: new foundry.data.fields.NumberField({
        required: false,
        initial: 0,
        integer: true
      }),
      // Height
      height: new foundry.data.fields.NumberField({
        required: false,
        initial: 0,
        integer: true
      }),
      // Quote
      quote: new foundry.data.fields.StringField({
        required: false,
        initial: "Alea iacta es"
      }),
      // Persistent boolean for the panel state
      isDetailsOpen: new foundry.data.fields.BooleanField({
        required: false,
        initial: false
        // Default value for the panel state
      })
    };
  }
}
class SimpleStat extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      total: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true
      }),
      value: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true
      }),
      mod: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true
      })
    };
  }
}
class ComplexStat extends SimpleStat {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      meta: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true
      })
    };
  }
}
class AttributesModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      // Attributes using ComplexStat (with meta)
      body: new foundry.data.fields.SchemaField(ComplexStat.defineSchema()),
      quickness: new foundry.data.fields.SchemaField(ComplexStat.defineSchema()),
      strength: new foundry.data.fields.SchemaField(ComplexStat.defineSchema()),
      charisma: new foundry.data.fields.SchemaField(ComplexStat.defineSchema()),
      intelligence: new foundry.data.fields.SchemaField(ComplexStat.defineSchema()),
      willpower: new foundry.data.fields.SchemaField(ComplexStat.defineSchema()),
      // Attributes using SimpleStat (without meta)
      initiative: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      reaction: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      magic: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      essence: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      // Attributes using SimpleStat (formerly base, now value)
      combat: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      astral: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      hacking: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      control: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      spell: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      walking: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      running: new foundry.data.fields.SchemaField(SimpleStat.defineSchema())
    };
  }
}
class Creation extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      attributePoints: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true
      }),
      activePoints: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true
      }),
      knowledgePoints: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true
      }),
      languagePoints: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true
      })
    };
  }
}
class KarmaModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      goodKarma: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true
      }),
      karmaPool: new foundry.data.fields.NumberField({
        required: true,
        initial: 1,
        integer: true
      }),
      lifetimeKarma: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true
      }),
      miraculousSurvival: new foundry.data.fields.BooleanField({
        required: true,
        initial: false
      })
    };
  }
}
class HealthModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      stun: new foundry.data.fields.ArrayField(
        new foundry.data.fields.BooleanField({
          required: true
        }),
        {
          required: true,
          initial: Array(10).fill(false)
          // Default to 10 false values
        }
      ),
      physical: new foundry.data.fields.ArrayField(
        new foundry.data.fields.BooleanField({
          required: true
        }),
        {
          required: true,
          initial: Array(10).fill(false)
          // Default to 10 false values
        }
      ),
      overflow: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true
      }),
      penalty: new foundry.data.fields.NumberField({
        // Fix the typo here
        required: true,
        initial: 0,
        integer: true
      })
    };
  }
}
class CharacterModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      attributes: new foundry.data.fields.SchemaField(AttributesModel.defineSchema()),
      profile: new foundry.data.fields.SchemaField(Profile.defineSchema()),
      creation: new foundry.data.fields.SchemaField(Creation.defineSchema()),
      karma: new foundry.data.fields.SchemaField(KarmaModel.defineSchema()),
      health: new foundry.data.fields.SchemaField(HealthModel.defineSchema()),
      journalEntryUuid: new foundry.data.fields.StringField({
        required: false,
        initial: ""
      })
    };
  }
}
class CharacterActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["sr3e", "sheet", "character"],
      template: "systems/sr3e/default.html",
      left: 200,
      top: 200
    });
  }
  /** @override prevent submission, since Svelte is managing state */
  _onSubmit(event2) {
    return;
  }
}
class MetahumanModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      // agerange
      agerange: new foundry.data.fields.SchemaField({
        min: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        }),
        average: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        }),
        max: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        })
      }),
      // Physical: height & weight
      physical: new foundry.data.fields.SchemaField({
        height: new foundry.data.fields.SchemaField({
          min: new foundry.data.fields.NumberField({
            required: true,
            initial: 0,
            integer: true
          }),
          average: new foundry.data.fields.NumberField({
            required: true,
            initial: 0,
            integer: true
          }),
          max: new foundry.data.fields.NumberField({
            required: true,
            initial: 0,
            integer: true
          })
        }),
        weight: new foundry.data.fields.SchemaField({
          min: new foundry.data.fields.NumberField({
            required: true,
            initial: 0,
            integer: true
          }),
          average: new foundry.data.fields.NumberField({
            required: true,
            initial: 0,
            integer: true
          }),
          max: new foundry.data.fields.NumberField({
            required: true,
            initial: 0,
            integer: true
          })
        })
      }),
      // Modifiers
      modifiers: new foundry.data.fields.SchemaField({
        strength: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        }),
        quickness: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        }),
        body: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        }),
        charisma: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        }),
        intelligence: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        }),
        willpower: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        })
      }),
      // Attribute limits
      attributeLimits: new foundry.data.fields.SchemaField({
        strength: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        }),
        quickness: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        }),
        body: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        }),
        charisma: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        }),
        intelligence: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        }),
        willpower: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        })
      }),
      // The running speed modifier
      movement: new foundry.data.fields.SchemaField({
        base: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        }),
        modifier: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        })
      }),
      // Karma advancement fraction
      karma: new foundry.data.fields.SchemaField({
        factor: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        })
      }),
      // Vision
      vision: new foundry.data.fields.SchemaField({
        type: new foundry.data.fields.StringField({
          required: true,
          initial: ""
        }),
        description: new foundry.data.fields.StringField({
          required: true,
          initial: ""
        }),
        rules: new foundry.data.fields.SchemaField({
          darknessPenaltyNegation: new foundry.data.fields.StringField({
            required: true,
            initial: ""
          })
        })
      }),
      // Priority
      priority: new foundry.data.fields.StringField({
        required: true,
        initial: ""
      }),
      // Description
      description: new foundry.data.fields.StringField({
        required: true,
        initial: ""
      })
    };
  }
}
class MagicItemSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "systems/sr3e/default.html",
      width: "100%",
      height: "100%",
      left: 200,
      top: 200,
      classes: ["sr3e", "sheet", "item"],
      resizable: false
    });
  }
  /** @override prevent submission, since Svelte is managing state */
  _onSubmit(event2) {
    return;
  }
}
const PUBLIC_VERSION = "5";
if (typeof window !== "undefined")
  (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(PUBLIC_VERSION);
let legacy_mode_flag = false;
let tracing_mode_flag = false;
function enable_legacy_mode_flag() {
  legacy_mode_flag = true;
}
enable_legacy_mode_flag();
const EACH_ITEM_REACTIVE = 1;
const EACH_INDEX_REACTIVE = 1 << 1;
const EACH_IS_CONTROLLED = 1 << 2;
const EACH_IS_ANIMATED = 1 << 3;
const EACH_ITEM_IMMUTABLE = 1 << 4;
const PROPS_IS_IMMUTABLE = 1;
const PROPS_IS_RUNES = 1 << 1;
const PROPS_IS_UPDATED = 1 << 2;
const PROPS_IS_BINDABLE = 1 << 3;
const PROPS_IS_LAZY_INITIAL = 1 << 4;
const TRANSITION_IN = 1;
const TRANSITION_OUT = 1 << 1;
const TRANSITION_GLOBAL = 1 << 2;
const TEMPLATE_USE_IMPORT_NODE = 1 << 1;
const UNINITIALIZED = Symbol();
const PASSIVE_EVENTS = ["touchstart", "touchmove"];
function is_passive_event(name) {
  return PASSIVE_EVENTS.includes(name);
}
const DEV = false;
var is_array = Array.isArray;
var index_of = Array.prototype.indexOf;
var array_from = Array.from;
var define_property = Object.defineProperty;
var get_descriptor = Object.getOwnPropertyDescriptor;
var get_descriptors = Object.getOwnPropertyDescriptors;
var object_prototype = Object.prototype;
var array_prototype = Array.prototype;
var get_prototype_of = Object.getPrototypeOf;
function is_function(thing) {
  return typeof thing === "function";
}
const noop = () => {
};
function run(fn) {
  return fn();
}
function run_all(arr) {
  for (var i = 0; i < arr.length; i++) {
    arr[i]();
  }
}
const DERIVED = 1 << 1;
const EFFECT = 1 << 2;
const RENDER_EFFECT = 1 << 3;
const BLOCK_EFFECT = 1 << 4;
const BRANCH_EFFECT = 1 << 5;
const ROOT_EFFECT = 1 << 6;
const BOUNDARY_EFFECT = 1 << 7;
const UNOWNED = 1 << 8;
const DISCONNECTED = 1 << 9;
const CLEAN = 1 << 10;
const DIRTY = 1 << 11;
const MAYBE_DIRTY = 1 << 12;
const INERT = 1 << 13;
const DESTROYED = 1 << 14;
const EFFECT_RAN = 1 << 15;
const EFFECT_TRANSPARENT = 1 << 16;
const LEGACY_DERIVED_PROP = 1 << 17;
const HEAD_EFFECT = 1 << 19;
const EFFECT_HAS_DERIVED = 1 << 20;
const STATE_SYMBOL = Symbol("$state");
const LEGACY_PROPS = Symbol("legacy props");
const LOADING_ATTR_SYMBOL = Symbol("");
function equals(value) {
  return value === this.v;
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
}
function safe_equals(value) {
  return !safe_not_equal(value, this.v);
}
function effect_in_teardown(rune) {
  {
    throw new Error(`https://svelte.dev/e/effect_in_teardown`);
  }
}
function effect_in_unowned_derived() {
  {
    throw new Error(`https://svelte.dev/e/effect_in_unowned_derived`);
  }
}
function effect_orphan(rune) {
  {
    throw new Error(`https://svelte.dev/e/effect_orphan`);
  }
}
function effect_update_depth_exceeded() {
  {
    throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
  }
}
function props_invalid_value(key) {
  {
    throw new Error(`https://svelte.dev/e/props_invalid_value`);
  }
}
function state_descriptors_fixed() {
  {
    throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
  }
}
function state_prototype_fixed() {
  {
    throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
  }
}
function state_unsafe_local_read() {
  {
    throw new Error(`https://svelte.dev/e/state_unsafe_local_read`);
  }
}
function state_unsafe_mutation() {
  {
    throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
  }
}
function source(v, stack) {
  var signal = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v,
    reactions: null,
    equals,
    rv: 0,
    wv: 0
  };
  return signal;
}
// @__NO_SIDE_EFFECTS__
function mutable_source(initial_value, immutable = false) {
  var _a;
  const s = source(initial_value);
  if (!immutable) {
    s.equals = safe_equals;
  }
  if (legacy_mode_flag && component_context !== null && component_context.l !== null) {
    ((_a = component_context.l).s ?? (_a.s = [])).push(s);
  }
  return s;
}
function mutable_state(v, immutable = false) {
  return /* @__PURE__ */ push_derived_source(/* @__PURE__ */ mutable_source(v, immutable));
}
// @__NO_SIDE_EFFECTS__
function push_derived_source(source2) {
  if (active_reaction !== null && !untracking && (active_reaction.f & DERIVED) !== 0) {
    if (derived_sources === null) {
      set_derived_sources([source2]);
    } else {
      derived_sources.push(source2);
    }
  }
  return source2;
}
function mutate(source2, value) {
  set(
    source2,
    untrack(() => get$1(source2))
  );
  return value;
}
function set(source2, value) {
  if (active_reaction !== null && !untracking && is_runes() && (active_reaction.f & (DERIVED | BLOCK_EFFECT)) !== 0 && // If the source was created locally within the current derived, then
  // we allow the mutation.
  (derived_sources === null || !derived_sources.includes(source2))) {
    state_unsafe_mutation();
  }
  return internal_set(source2, value);
}
function internal_set(source2, value) {
  if (!source2.equals(value)) {
    source2.v;
    source2.v = value;
    source2.wv = increment_write_version();
    mark_reactions(source2, DIRTY);
    if (is_runes() && active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0) {
      if (untracked_writes === null) {
        set_untracked_writes([source2]);
      } else {
        untracked_writes.push(source2);
      }
    }
  }
  return value;
}
function mark_reactions(signal, status) {
  var reactions = signal.reactions;
  if (reactions === null) return;
  var runes = is_runes();
  var length = reactions.length;
  for (var i = 0; i < length; i++) {
    var reaction = reactions[i];
    var flags2 = reaction.f;
    if ((flags2 & DIRTY) !== 0) continue;
    if (!runes && reaction === active_effect) continue;
    set_signal_status(reaction, status);
    if ((flags2 & (CLEAN | UNOWNED)) !== 0) {
      if ((flags2 & DERIVED) !== 0) {
        mark_reactions(
          /** @type {Derived} */
          reaction,
          MAYBE_DIRTY
        );
      } else {
        schedule_effect(
          /** @type {Effect} */
          reaction
        );
      }
    }
  }
}
let hydrating = false;
function proxy(value, parent = null, prev) {
  if (typeof value !== "object" || value === null || STATE_SYMBOL in value) {
    return value;
  }
  const prototype = get_prototype_of(value);
  if (prototype !== object_prototype && prototype !== array_prototype) {
    return value;
  }
  var sources = /* @__PURE__ */ new Map();
  var is_proxied_array = is_array(value);
  var version = source(0);
  if (is_proxied_array) {
    sources.set("length", source(
      /** @type {any[]} */
      value.length
    ));
  }
  var metadata;
  return new Proxy(
    /** @type {any} */
    value,
    {
      defineProperty(_, prop2, descriptor) {
        if (!("value" in descriptor) || descriptor.configurable === false || descriptor.enumerable === false || descriptor.writable === false) {
          state_descriptors_fixed();
        }
        var s = sources.get(prop2);
        if (s === void 0) {
          s = source(descriptor.value);
          sources.set(prop2, s);
        } else {
          set(s, proxy(descriptor.value, metadata));
        }
        return true;
      },
      deleteProperty(target, prop2) {
        var s = sources.get(prop2);
        if (s === void 0) {
          if (prop2 in target) {
            sources.set(prop2, source(UNINITIALIZED));
          }
        } else {
          if (is_proxied_array && typeof prop2 === "string") {
            var ls = (
              /** @type {Source<number>} */
              sources.get("length")
            );
            var n = Number(prop2);
            if (Number.isInteger(n) && n < ls.v) {
              set(ls, n);
            }
          }
          set(s, UNINITIALIZED);
          update_version(version);
        }
        return true;
      },
      get(target, prop2, receiver) {
        var _a;
        if (prop2 === STATE_SYMBOL) {
          return value;
        }
        var s = sources.get(prop2);
        var exists = prop2 in target;
        if (s === void 0 && (!exists || ((_a = get_descriptor(target, prop2)) == null ? void 0 : _a.writable))) {
          s = source(proxy(exists ? target[prop2] : UNINITIALIZED, metadata));
          sources.set(prop2, s);
        }
        if (s !== void 0) {
          var v = get$1(s);
          return v === UNINITIALIZED ? void 0 : v;
        }
        return Reflect.get(target, prop2, receiver);
      },
      getOwnPropertyDescriptor(target, prop2) {
        var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
        if (descriptor && "value" in descriptor) {
          var s = sources.get(prop2);
          if (s) descriptor.value = get$1(s);
        } else if (descriptor === void 0) {
          var source2 = sources.get(prop2);
          var value2 = source2 == null ? void 0 : source2.v;
          if (source2 !== void 0 && value2 !== UNINITIALIZED) {
            return {
              enumerable: true,
              configurable: true,
              value: value2,
              writable: true
            };
          }
        }
        return descriptor;
      },
      has(target, prop2) {
        var _a;
        if (prop2 === STATE_SYMBOL) {
          return true;
        }
        var s = sources.get(prop2);
        var has = s !== void 0 && s.v !== UNINITIALIZED || Reflect.has(target, prop2);
        if (s !== void 0 || active_effect !== null && (!has || ((_a = get_descriptor(target, prop2)) == null ? void 0 : _a.writable))) {
          if (s === void 0) {
            s = source(has ? proxy(target[prop2], metadata) : UNINITIALIZED);
            sources.set(prop2, s);
          }
          var value2 = get$1(s);
          if (value2 === UNINITIALIZED) {
            return false;
          }
        }
        return has;
      },
      set(target, prop2, value2, receiver) {
        var _a;
        var s = sources.get(prop2);
        var has = prop2 in target;
        if (is_proxied_array && prop2 === "length") {
          for (var i = value2; i < /** @type {Source<number>} */
          s.v; i += 1) {
            var other_s = sources.get(i + "");
            if (other_s !== void 0) {
              set(other_s, UNINITIALIZED);
            } else if (i in target) {
              other_s = source(UNINITIALIZED);
              sources.set(i + "", other_s);
            }
          }
        }
        if (s === void 0) {
          if (!has || ((_a = get_descriptor(target, prop2)) == null ? void 0 : _a.writable)) {
            s = source(void 0);
            set(s, proxy(value2, metadata));
            sources.set(prop2, s);
          }
        } else {
          has = s.v !== UNINITIALIZED;
          set(s, proxy(value2, metadata));
        }
        var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
        if (descriptor == null ? void 0 : descriptor.set) {
          descriptor.set.call(receiver, value2);
        }
        if (!has) {
          if (is_proxied_array && typeof prop2 === "string") {
            var ls = (
              /** @type {Source<number>} */
              sources.get("length")
            );
            var n = Number(prop2);
            if (Number.isInteger(n) && n >= ls.v) {
              set(ls, n + 1);
            }
          }
          update_version(version);
        }
        return true;
      },
      ownKeys(target) {
        get$1(version);
        var own_keys = Reflect.ownKeys(target).filter((key2) => {
          var source3 = sources.get(key2);
          return source3 === void 0 || source3.v !== UNINITIALIZED;
        });
        for (var [key, source2] of sources) {
          if (source2.v !== UNINITIALIZED && !(key in target)) {
            own_keys.push(key);
          }
        }
        return own_keys;
      },
      setPrototypeOf() {
        state_prototype_fixed();
      }
    }
  );
}
function update_version(signal, d = 1) {
  set(signal, signal.v + d);
}
function get_proxied_value(value) {
  if (value !== null && typeof value === "object" && STATE_SYMBOL in value) {
    return value[STATE_SYMBOL];
  }
  return value;
}
function is(a, b) {
  return Object.is(get_proxied_value(a), get_proxied_value(b));
}
var $window;
var first_child_getter;
var next_sibling_getter;
function init_operations() {
  if ($window !== void 0) {
    return;
  }
  $window = window;
  var element_prototype = Element.prototype;
  var node_prototype = Node.prototype;
  first_child_getter = get_descriptor(node_prototype, "firstChild").get;
  next_sibling_getter = get_descriptor(node_prototype, "nextSibling").get;
  element_prototype.__click = void 0;
  element_prototype.__className = "";
  element_prototype.__attributes = null;
  element_prototype.__styles = null;
  element_prototype.__e = void 0;
  Text.prototype.__t = void 0;
}
function create_text(value = "") {
  return document.createTextNode(value);
}
// @__NO_SIDE_EFFECTS__
function get_first_child(node) {
  return first_child_getter.call(node);
}
// @__NO_SIDE_EFFECTS__
function get_next_sibling(node) {
  return next_sibling_getter.call(node);
}
function child(node, is_text) {
  {
    return /* @__PURE__ */ get_first_child(node);
  }
}
function sibling(node, count = 1, is_text = false) {
  let next_sibling = node;
  while (count--) {
    next_sibling = /** @type {TemplateNode} */
    /* @__PURE__ */ get_next_sibling(next_sibling);
  }
  {
    return next_sibling;
  }
}
function clear_text_content(node) {
  node.textContent = "";
}
// @__NO_SIDE_EFFECTS__
function derived(fn) {
  var flags2 = DERIVED | DIRTY;
  if (active_effect === null) {
    flags2 |= UNOWNED;
  } else {
    active_effect.f |= EFFECT_HAS_DERIVED;
  }
  var parent_derived = active_reaction !== null && (active_reaction.f & DERIVED) !== 0 ? (
    /** @type {Derived} */
    active_reaction
  ) : null;
  const signal = {
    children: null,
    ctx: component_context,
    deps: null,
    equals,
    f: flags2,
    fn,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      null
    ),
    wv: 0,
    parent: parent_derived ?? active_effect
  };
  if (parent_derived !== null) {
    (parent_derived.children ?? (parent_derived.children = [])).push(signal);
  }
  return signal;
}
// @__NO_SIDE_EFFECTS__
function derived_safe_equal(fn) {
  const signal = /* @__PURE__ */ derived(fn);
  signal.equals = safe_equals;
  return signal;
}
function destroy_derived_children(derived2) {
  var children = derived2.children;
  if (children !== null) {
    derived2.children = null;
    for (var i = 0; i < children.length; i += 1) {
      var child2 = children[i];
      if ((child2.f & DERIVED) !== 0) {
        destroy_derived(
          /** @type {Derived} */
          child2
        );
      } else {
        destroy_effect(
          /** @type {Effect} */
          child2
        );
      }
    }
  }
}
function get_derived_parent_effect(derived2) {
  var parent = derived2.parent;
  while (parent !== null) {
    if ((parent.f & DERIVED) === 0) {
      return (
        /** @type {Effect} */
        parent
      );
    }
    parent = parent.parent;
  }
  return null;
}
function execute_derived(derived2) {
  var value;
  var prev_active_effect = active_effect;
  set_active_effect(get_derived_parent_effect(derived2));
  {
    try {
      destroy_derived_children(derived2);
      value = update_reaction(derived2);
    } finally {
      set_active_effect(prev_active_effect);
    }
  }
  return value;
}
function update_derived(derived2) {
  var value = execute_derived(derived2);
  var status = (skip_reaction || (derived2.f & UNOWNED) !== 0) && derived2.deps !== null ? MAYBE_DIRTY : CLEAN;
  set_signal_status(derived2, status);
  if (!derived2.equals(value)) {
    derived2.v = value;
    derived2.wv = increment_write_version();
  }
}
function destroy_derived(derived2) {
  destroy_derived_children(derived2);
  remove_reactions(derived2, 0);
  set_signal_status(derived2, DESTROYED);
  derived2.v = derived2.children = derived2.deps = derived2.ctx = derived2.reactions = null;
}
function validate_effect(rune) {
  if (active_effect === null && active_reaction === null) {
    effect_orphan();
  }
  if (active_reaction !== null && (active_reaction.f & UNOWNED) !== 0) {
    effect_in_unowned_derived();
  }
  if (is_destroying_effect) {
    effect_in_teardown();
  }
}
function push_effect(effect2, parent_effect) {
  var parent_last = parent_effect.last;
  if (parent_last === null) {
    parent_effect.last = parent_effect.first = effect2;
  } else {
    parent_last.next = effect2;
    effect2.prev = parent_last;
    parent_effect.last = effect2;
  }
}
function create_effect(type, fn, sync, push2 = true) {
  var is_root = (type & ROOT_EFFECT) !== 0;
  var parent_effect = active_effect;
  var effect2 = {
    ctx: component_context,
    deps: null,
    deriveds: null,
    nodes_start: null,
    nodes_end: null,
    f: type | DIRTY,
    first: null,
    fn,
    last: null,
    next: null,
    parent: is_root ? null : parent_effect,
    prev: null,
    teardown: null,
    transitions: null,
    wv: 0
  };
  if (sync) {
    var previously_flushing_effect = is_flushing_effect;
    try {
      set_is_flushing_effect(true);
      update_effect(effect2);
      effect2.f |= EFFECT_RAN;
    } catch (e) {
      destroy_effect(effect2);
      throw e;
    } finally {
      set_is_flushing_effect(previously_flushing_effect);
    }
  } else if (fn !== null) {
    schedule_effect(effect2);
  }
  var inert = sync && effect2.deps === null && effect2.first === null && effect2.nodes_start === null && effect2.teardown === null && (effect2.f & (EFFECT_HAS_DERIVED | BOUNDARY_EFFECT)) === 0;
  if (!inert && !is_root && push2) {
    if (parent_effect !== null) {
      push_effect(effect2, parent_effect);
    }
    if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0) {
      var derived2 = (
        /** @type {Derived} */
        active_reaction
      );
      (derived2.children ?? (derived2.children = [])).push(effect2);
    }
  }
  return effect2;
}
function teardown(fn) {
  const effect2 = create_effect(RENDER_EFFECT, null, false);
  set_signal_status(effect2, CLEAN);
  effect2.teardown = fn;
  return effect2;
}
function user_effect(fn) {
  validate_effect();
  var defer = active_effect !== null && (active_effect.f & BRANCH_EFFECT) !== 0 && component_context !== null && !component_context.m;
  if (defer) {
    var context = (
      /** @type {ComponentContext} */
      component_context
    );
    (context.e ?? (context.e = [])).push({
      fn,
      effect: active_effect,
      reaction: active_reaction
    });
  } else {
    var signal = effect(fn);
    return signal;
  }
}
function user_pre_effect(fn) {
  validate_effect();
  return render_effect(fn);
}
function component_root(fn) {
  const effect2 = create_effect(ROOT_EFFECT, fn, true);
  return (options = {}) => {
    return new Promise((fulfil) => {
      if (options.outro) {
        pause_effect(effect2, () => {
          destroy_effect(effect2);
          fulfil(void 0);
        });
      } else {
        destroy_effect(effect2);
        fulfil(void 0);
      }
    });
  };
}
function effect(fn) {
  return create_effect(EFFECT, fn, false);
}
function legacy_pre_effect(deps, fn) {
  var context = (
    /** @type {ComponentContextLegacy} */
    component_context
  );
  var token = { effect: null, ran: false };
  context.l.r1.push(token);
  token.effect = render_effect(() => {
    deps();
    if (token.ran) return;
    token.ran = true;
    set(context.l.r2, true);
    untrack(fn);
  });
}
function legacy_pre_effect_reset() {
  var context = (
    /** @type {ComponentContextLegacy} */
    component_context
  );
  render_effect(() => {
    if (!get$1(context.l.r2)) return;
    for (var token of context.l.r1) {
      var effect2 = token.effect;
      if ((effect2.f & CLEAN) !== 0) {
        set_signal_status(effect2, MAYBE_DIRTY);
      }
      if (check_dirtiness(effect2)) {
        update_effect(effect2);
      }
      token.ran = false;
    }
    context.l.r2.v = false;
  });
}
function render_effect(fn) {
  return create_effect(RENDER_EFFECT, fn, true);
}
function template_effect(fn, thunks = [], d = derived) {
  const deriveds = thunks.map(d);
  const effect2 = () => fn(...deriveds.map(get$1));
  return block(effect2);
}
function block(fn, flags2 = 0) {
  return create_effect(RENDER_EFFECT | BLOCK_EFFECT | flags2, fn, true);
}
function branch(fn, push2 = true) {
  return create_effect(RENDER_EFFECT | BRANCH_EFFECT, fn, true, push2);
}
function execute_effect_teardown(effect2) {
  var teardown2 = effect2.teardown;
  if (teardown2 !== null) {
    const previously_destroying_effect = is_destroying_effect;
    const previous_reaction = active_reaction;
    set_is_destroying_effect(true);
    set_active_reaction(null);
    try {
      teardown2.call(null);
    } finally {
      set_is_destroying_effect(previously_destroying_effect);
      set_active_reaction(previous_reaction);
    }
  }
}
function destroy_effect_deriveds(signal) {
  var deriveds = signal.deriveds;
  if (deriveds !== null) {
    signal.deriveds = null;
    for (var i = 0; i < deriveds.length; i += 1) {
      destroy_derived(deriveds[i]);
    }
  }
}
function destroy_effect_children(signal, remove_dom = false) {
  var effect2 = signal.first;
  signal.first = signal.last = null;
  while (effect2 !== null) {
    var next = effect2.next;
    destroy_effect(effect2, remove_dom);
    effect2 = next;
  }
}
function destroy_block_effect_children(signal) {
  var effect2 = signal.first;
  while (effect2 !== null) {
    var next = effect2.next;
    if ((effect2.f & BRANCH_EFFECT) === 0) {
      destroy_effect(effect2);
    }
    effect2 = next;
  }
}
function destroy_effect(effect2, remove_dom = true) {
  var removed = false;
  if ((remove_dom || (effect2.f & HEAD_EFFECT) !== 0) && effect2.nodes_start !== null) {
    var node = effect2.nodes_start;
    var end = effect2.nodes_end;
    while (node !== null) {
      var next = node === end ? null : (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_next_sibling(node)
      );
      node.remove();
      node = next;
    }
    removed = true;
  }
  destroy_effect_children(effect2, remove_dom && !removed);
  destroy_effect_deriveds(effect2);
  remove_reactions(effect2, 0);
  set_signal_status(effect2, DESTROYED);
  var transitions = effect2.transitions;
  if (transitions !== null) {
    for (const transition2 of transitions) {
      transition2.stop();
    }
  }
  execute_effect_teardown(effect2);
  var parent = effect2.parent;
  if (parent !== null && parent.first !== null) {
    unlink_effect(effect2);
  }
  effect2.next = effect2.prev = effect2.teardown = effect2.ctx = effect2.deps = effect2.fn = effect2.nodes_start = effect2.nodes_end = null;
}
function unlink_effect(effect2) {
  var parent = effect2.parent;
  var prev = effect2.prev;
  var next = effect2.next;
  if (prev !== null) prev.next = next;
  if (next !== null) next.prev = prev;
  if (parent !== null) {
    if (parent.first === effect2) parent.first = next;
    if (parent.last === effect2) parent.last = prev;
  }
}
function pause_effect(effect2, callback) {
  var transitions = [];
  pause_children(effect2, transitions, true);
  run_out_transitions(transitions, () => {
    destroy_effect(effect2);
    if (callback) callback();
  });
}
function run_out_transitions(transitions, fn) {
  var remaining = transitions.length;
  if (remaining > 0) {
    var check = () => --remaining || fn();
    for (var transition2 of transitions) {
      transition2.out(check);
    }
  } else {
    fn();
  }
}
function pause_children(effect2, transitions, local) {
  if ((effect2.f & INERT) !== 0) return;
  effect2.f ^= INERT;
  if (effect2.transitions !== null) {
    for (const transition2 of effect2.transitions) {
      if (transition2.is_global || local) {
        transitions.push(transition2);
      }
    }
  }
  var child2 = effect2.first;
  while (child2 !== null) {
    var sibling2 = child2.next;
    var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || (child2.f & BRANCH_EFFECT) !== 0;
    pause_children(child2, transitions, transparent ? local : false);
    child2 = sibling2;
  }
}
function resume_effect(effect2) {
  resume_children(effect2, true);
}
function resume_children(effect2, local) {
  if ((effect2.f & INERT) === 0) return;
  effect2.f ^= INERT;
  if ((effect2.f & CLEAN) === 0) {
    effect2.f ^= CLEAN;
  }
  if (check_dirtiness(effect2)) {
    set_signal_status(effect2, DIRTY);
    schedule_effect(effect2);
  }
  var child2 = effect2.first;
  while (child2 !== null) {
    var sibling2 = child2.next;
    var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || (child2.f & BRANCH_EFFECT) !== 0;
    resume_children(child2, transparent ? local : false);
    child2 = sibling2;
  }
  if (effect2.transitions !== null) {
    for (const transition2 of effect2.transitions) {
      if (transition2.is_global || local) {
        transition2.in();
      }
    }
  }
}
let is_micro_task_queued$1 = false;
let current_queued_micro_tasks = [];
function process_micro_tasks() {
  is_micro_task_queued$1 = false;
  const tasks = current_queued_micro_tasks.slice();
  current_queued_micro_tasks = [];
  run_all(tasks);
}
function queue_micro_task(fn) {
  if (!is_micro_task_queued$1) {
    is_micro_task_queued$1 = true;
    queueMicrotask(process_micro_tasks);
  }
  current_queued_micro_tasks.push(fn);
}
function lifecycle_outside_component(name) {
  {
    throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
  }
}
let is_throwing_error = false;
let is_micro_task_queued = false;
let last_scheduled_effect = null;
let is_flushing_effect = false;
let is_destroying_effect = false;
function set_is_flushing_effect(value) {
  is_flushing_effect = value;
}
function set_is_destroying_effect(value) {
  is_destroying_effect = value;
}
let queued_root_effects = [];
let flush_count = 0;
let dev_effect_stack = [];
let active_reaction = null;
let untracking = false;
function set_active_reaction(reaction) {
  active_reaction = reaction;
}
let active_effect = null;
function set_active_effect(effect2) {
  active_effect = effect2;
}
let derived_sources = null;
function set_derived_sources(sources) {
  derived_sources = sources;
}
let new_deps = null;
let skipped_deps = 0;
let untracked_writes = null;
function set_untracked_writes(value) {
  untracked_writes = value;
}
let write_version = 1;
let read_version = 0;
let skip_reaction = false;
let captured_signals = null;
let component_context = null;
function increment_write_version() {
  return ++write_version;
}
function is_runes() {
  return !legacy_mode_flag || component_context !== null && component_context.l === null;
}
function check_dirtiness(reaction) {
  var _a;
  var flags2 = reaction.f;
  if ((flags2 & DIRTY) !== 0) {
    return true;
  }
  if ((flags2 & MAYBE_DIRTY) !== 0) {
    var dependencies = reaction.deps;
    var is_unowned = (flags2 & UNOWNED) !== 0;
    if (dependencies !== null) {
      var i;
      var dependency;
      var is_disconnected = (flags2 & DISCONNECTED) !== 0;
      var is_unowned_connected = is_unowned && active_effect !== null && !skip_reaction;
      var length = dependencies.length;
      if (is_disconnected || is_unowned_connected) {
        for (i = 0; i < length; i++) {
          dependency = dependencies[i];
          if (is_disconnected || !((_a = dependency == null ? void 0 : dependency.reactions) == null ? void 0 : _a.includes(reaction))) {
            (dependency.reactions ?? (dependency.reactions = [])).push(reaction);
          }
        }
        if (is_disconnected) {
          reaction.f ^= DISCONNECTED;
        }
      }
      for (i = 0; i < length; i++) {
        dependency = dependencies[i];
        if (check_dirtiness(
          /** @type {Derived} */
          dependency
        )) {
          update_derived(
            /** @type {Derived} */
            dependency
          );
        }
        if (dependency.wv > reaction.wv) {
          return true;
        }
      }
    }
    if (!is_unowned || active_effect !== null && !skip_reaction) {
      set_signal_status(reaction, CLEAN);
    }
  }
  return false;
}
function propagate_error(error, effect2) {
  var current = effect2;
  while (current !== null) {
    if ((current.f & BOUNDARY_EFFECT) !== 0) {
      try {
        current.fn(error);
        return;
      } catch {
        current.f ^= BOUNDARY_EFFECT;
      }
    }
    current = current.parent;
  }
  is_throwing_error = false;
  throw error;
}
function should_rethrow_error(effect2) {
  return (effect2.f & DESTROYED) === 0 && (effect2.parent === null || (effect2.parent.f & BOUNDARY_EFFECT) === 0);
}
function handle_error(error, effect2, previous_effect, component_context2) {
  if (is_throwing_error) {
    if (previous_effect === null) {
      is_throwing_error = false;
    }
    if (should_rethrow_error(effect2)) {
      throw error;
    }
    return;
  }
  if (previous_effect !== null) {
    is_throwing_error = true;
  }
  {
    propagate_error(error, effect2);
    return;
  }
}
function schedule_possible_effect_self_invalidation(signal, effect2, depth = 0) {
  var reactions = signal.reactions;
  if (reactions === null) return;
  for (var i = 0; i < reactions.length; i++) {
    var reaction = reactions[i];
    if ((reaction.f & DERIVED) !== 0) {
      schedule_possible_effect_self_invalidation(
        /** @type {Derived} */
        reaction,
        effect2,
        depth + 1
      );
    } else if (effect2 === reaction) {
      if (depth === 0) {
        set_signal_status(reaction, DIRTY);
      } else if ((reaction.f & CLEAN) !== 0) {
        set_signal_status(reaction, MAYBE_DIRTY);
      }
      schedule_effect(
        /** @type {Effect} */
        reaction
      );
    }
  }
}
function update_reaction(reaction) {
  var _a;
  var previous_deps = new_deps;
  var previous_skipped_deps = skipped_deps;
  var previous_untracked_writes = untracked_writes;
  var previous_reaction = active_reaction;
  var previous_skip_reaction = skip_reaction;
  var prev_derived_sources = derived_sources;
  var previous_component_context = component_context;
  var previous_untracking = untracking;
  var flags2 = reaction.f;
  new_deps = /** @type {null | Value[]} */
  null;
  skipped_deps = 0;
  untracked_writes = null;
  active_reaction = (flags2 & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;
  skip_reaction = !is_flushing_effect && (flags2 & UNOWNED) !== 0;
  derived_sources = null;
  component_context = reaction.ctx;
  untracking = false;
  read_version++;
  try {
    var result = (
      /** @type {Function} */
      (0, reaction.fn)()
    );
    var deps = reaction.deps;
    if (new_deps !== null) {
      var i;
      remove_reactions(reaction, skipped_deps);
      if (deps !== null && skipped_deps > 0) {
        deps.length = skipped_deps + new_deps.length;
        for (i = 0; i < new_deps.length; i++) {
          deps[skipped_deps + i] = new_deps[i];
        }
      } else {
        reaction.deps = deps = new_deps;
      }
      if (!skip_reaction) {
        for (i = skipped_deps; i < deps.length; i++) {
          ((_a = deps[i]).reactions ?? (_a.reactions = [])).push(reaction);
        }
      }
    } else if (deps !== null && skipped_deps < deps.length) {
      remove_reactions(reaction, skipped_deps);
      deps.length = skipped_deps;
    }
    if (is_runes() && untracked_writes !== null && (reaction.f & (DERIVED | MAYBE_DIRTY | DIRTY)) === 0) {
      for (i = 0; i < /** @type {Source[]} */
      untracked_writes.length; i++) {
        schedule_possible_effect_self_invalidation(
          untracked_writes[i],
          /** @type {Effect} */
          reaction
        );
      }
    }
    if (previous_reaction !== null) {
      read_version++;
    }
    return result;
  } finally {
    new_deps = previous_deps;
    skipped_deps = previous_skipped_deps;
    untracked_writes = previous_untracked_writes;
    active_reaction = previous_reaction;
    skip_reaction = previous_skip_reaction;
    derived_sources = prev_derived_sources;
    component_context = previous_component_context;
    untracking = previous_untracking;
  }
}
function remove_reaction(signal, dependency) {
  let reactions = dependency.reactions;
  if (reactions !== null) {
    var index2 = index_of.call(reactions, signal);
    if (index2 !== -1) {
      var new_length = reactions.length - 1;
      if (new_length === 0) {
        reactions = dependency.reactions = null;
      } else {
        reactions[index2] = reactions[new_length];
        reactions.pop();
      }
    }
  }
  if (reactions === null && (dependency.f & DERIVED) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (new_deps === null || !new_deps.includes(dependency))) {
    set_signal_status(dependency, MAYBE_DIRTY);
    if ((dependency.f & (UNOWNED | DISCONNECTED)) === 0) {
      dependency.f ^= DISCONNECTED;
    }
    remove_reactions(
      /** @type {Derived} **/
      dependency,
      0
    );
  }
}
function remove_reactions(signal, start_index) {
  var dependencies = signal.deps;
  if (dependencies === null) return;
  for (var i = start_index; i < dependencies.length; i++) {
    remove_reaction(signal, dependencies[i]);
  }
}
function update_effect(effect2) {
  var flags2 = effect2.f;
  if ((flags2 & DESTROYED) !== 0) {
    return;
  }
  set_signal_status(effect2, CLEAN);
  var previous_effect = active_effect;
  var previous_component_context = component_context;
  active_effect = effect2;
  try {
    if ((flags2 & BLOCK_EFFECT) !== 0) {
      destroy_block_effect_children(effect2);
    } else {
      destroy_effect_children(effect2);
    }
    destroy_effect_deriveds(effect2);
    execute_effect_teardown(effect2);
    var teardown2 = update_reaction(effect2);
    effect2.teardown = typeof teardown2 === "function" ? teardown2 : null;
    effect2.wv = write_version;
    var deps = effect2.deps;
    var dep;
    if (DEV && tracing_mode_flag && (effect2.f & DIRTY) !== 0 && deps !== null) ;
    if (DEV) ;
  } catch (error) {
    handle_error(error, effect2, previous_effect, previous_component_context || effect2.ctx);
  } finally {
    active_effect = previous_effect;
  }
}
function infinite_loop_guard() {
  if (flush_count > 1e3) {
    flush_count = 0;
    try {
      effect_update_depth_exceeded();
    } catch (error) {
      if (last_scheduled_effect !== null) {
        {
          handle_error(error, last_scheduled_effect, null);
        }
      } else {
        throw error;
      }
    }
  }
  flush_count++;
}
function flush_queued_root_effects(root_effects) {
  var length = root_effects.length;
  if (length === 0) {
    return;
  }
  infinite_loop_guard();
  var previously_flushing_effect = is_flushing_effect;
  is_flushing_effect = true;
  try {
    for (var i = 0; i < length; i++) {
      var effect2 = root_effects[i];
      if ((effect2.f & CLEAN) === 0) {
        effect2.f ^= CLEAN;
      }
      var collected_effects = [];
      process_effects(effect2, collected_effects);
      flush_queued_effects(collected_effects);
    }
  } finally {
    is_flushing_effect = previously_flushing_effect;
  }
}
function flush_queued_effects(effects) {
  var length = effects.length;
  if (length === 0) return;
  for (var i = 0; i < length; i++) {
    var effect2 = effects[i];
    if ((effect2.f & (DESTROYED | INERT)) === 0) {
      try {
        if (check_dirtiness(effect2)) {
          update_effect(effect2);
          if (effect2.deps === null && effect2.first === null && effect2.nodes_start === null) {
            if (effect2.teardown === null) {
              unlink_effect(effect2);
            } else {
              effect2.fn = null;
            }
          }
        }
      } catch (error) {
        handle_error(error, effect2, null, effect2.ctx);
      }
    }
  }
}
function process_deferred() {
  is_micro_task_queued = false;
  if (flush_count > 1001) {
    return;
  }
  const previous_queued_root_effects = queued_root_effects;
  queued_root_effects = [];
  flush_queued_root_effects(previous_queued_root_effects);
  if (!is_micro_task_queued) {
    flush_count = 0;
    last_scheduled_effect = null;
  }
}
function schedule_effect(signal) {
  {
    if (!is_micro_task_queued) {
      is_micro_task_queued = true;
      queueMicrotask(process_deferred);
    }
  }
  last_scheduled_effect = signal;
  var effect2 = signal;
  while (effect2.parent !== null) {
    effect2 = effect2.parent;
    var flags2 = effect2.f;
    if ((flags2 & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
      if ((flags2 & CLEAN) === 0) return;
      effect2.f ^= CLEAN;
    }
  }
  queued_root_effects.push(effect2);
}
function process_effects(effect2, collected_effects) {
  var current_effect = effect2.first;
  var effects = [];
  main_loop: while (current_effect !== null) {
    var flags2 = current_effect.f;
    var is_branch = (flags2 & BRANCH_EFFECT) !== 0;
    var is_skippable_branch = is_branch && (flags2 & CLEAN) !== 0;
    var sibling2 = current_effect.next;
    if (!is_skippable_branch && (flags2 & INERT) === 0) {
      if ((flags2 & RENDER_EFFECT) !== 0) {
        if (is_branch) {
          current_effect.f ^= CLEAN;
        } else {
          try {
            if (check_dirtiness(current_effect)) {
              update_effect(current_effect);
            }
          } catch (error) {
            handle_error(error, current_effect, null, current_effect.ctx);
          }
        }
        var child2 = current_effect.first;
        if (child2 !== null) {
          current_effect = child2;
          continue;
        }
      } else if ((flags2 & EFFECT) !== 0) {
        effects.push(current_effect);
      }
    }
    if (sibling2 === null) {
      let parent = current_effect.parent;
      while (parent !== null) {
        if (effect2 === parent) {
          break main_loop;
        }
        var parent_sibling = parent.next;
        if (parent_sibling !== null) {
          current_effect = parent_sibling;
          continue main_loop;
        }
        parent = parent.parent;
      }
    }
    current_effect = sibling2;
  }
  for (var i = 0; i < effects.length; i++) {
    child2 = effects[i];
    collected_effects.push(child2);
    process_effects(child2, collected_effects);
  }
}
function get$1(signal) {
  var _a;
  var flags2 = signal.f;
  var is_derived = (flags2 & DERIVED) !== 0;
  if (is_derived && (flags2 & DESTROYED) !== 0) {
    var value = execute_derived(
      /** @type {Derived} */
      signal
    );
    destroy_derived(
      /** @type {Derived} */
      signal
    );
    return value;
  }
  if (captured_signals !== null) {
    captured_signals.add(signal);
  }
  if (active_reaction !== null && !untracking) {
    if (derived_sources !== null && derived_sources.includes(signal)) {
      state_unsafe_local_read();
    }
    var deps = active_reaction.deps;
    if (signal.rv < read_version) {
      signal.rv = read_version;
      if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
        skipped_deps++;
      } else if (new_deps === null) {
        new_deps = [signal];
      } else {
        new_deps.push(signal);
      }
    }
  } else if (is_derived && /** @type {Derived} */
  signal.deps === null) {
    var derived2 = (
      /** @type {Derived} */
      signal
    );
    var parent = derived2.parent;
    var target = derived2;
    while (parent !== null) {
      if ((parent.f & DERIVED) !== 0) {
        var parent_derived = (
          /** @type {Derived} */
          parent
        );
        target = parent_derived;
        parent = parent_derived.parent;
      } else {
        var parent_effect = (
          /** @type {Effect} */
          parent
        );
        if (!((_a = parent_effect.deriveds) == null ? void 0 : _a.includes(target))) {
          (parent_effect.deriveds ?? (parent_effect.deriveds = [])).push(target);
        }
        break;
      }
    }
  }
  if (is_derived) {
    derived2 = /** @type {Derived} */
    signal;
    if (check_dirtiness(derived2)) {
      update_derived(derived2);
    }
  }
  return signal.v;
}
function capture_signals(fn) {
  var previous_captured_signals = captured_signals;
  captured_signals = /* @__PURE__ */ new Set();
  var captured = captured_signals;
  var signal;
  try {
    untrack(fn);
    if (previous_captured_signals !== null) {
      for (signal of captured_signals) {
        previous_captured_signals.add(signal);
      }
    }
  } finally {
    captured_signals = previous_captured_signals;
  }
  return captured;
}
function invalidate_inner_signals(fn) {
  var captured = capture_signals(() => untrack(fn));
  for (var signal of captured) {
    if ((signal.f & LEGACY_DERIVED_PROP) !== 0) {
      for (
        const dep of
        /** @type {Derived} */
        signal.deps || []
      ) {
        if ((dep.f & DERIVED) === 0) {
          internal_set(dep, dep.v);
        }
      }
    } else {
      internal_set(signal, signal.v);
    }
  }
}
function untrack(fn) {
  var previous_untracking = untracking;
  try {
    untracking = true;
    return fn();
  } finally {
    untracking = previous_untracking;
  }
}
const STATUS_MASK = -7169;
function set_signal_status(signal, status) {
  signal.f = signal.f & STATUS_MASK | status;
}
function push(props, runes = false, fn) {
  component_context = {
    p: component_context,
    c: null,
    e: null,
    m: false,
    s: props,
    x: null,
    l: null
  };
  if (legacy_mode_flag && !runes) {
    component_context.l = {
      s: null,
      u: null,
      r1: [],
      r2: source(false)
    };
  }
}
function pop(component) {
  const context_stack_item = component_context;
  if (context_stack_item !== null) {
    const component_effects = context_stack_item.e;
    if (component_effects !== null) {
      var previous_effect = active_effect;
      var previous_reaction = active_reaction;
      context_stack_item.e = null;
      try {
        for (var i = 0; i < component_effects.length; i++) {
          var component_effect = component_effects[i];
          set_active_effect(component_effect.effect);
          set_active_reaction(component_effect.reaction);
          effect(component_effect.fn);
        }
      } finally {
        set_active_effect(previous_effect);
        set_active_reaction(previous_reaction);
      }
    }
    component_context = context_stack_item.p;
    context_stack_item.m = true;
  }
  return (
    /** @type {T} */
    {}
  );
}
function deep_read_state(value) {
  if (typeof value !== "object" || !value || value instanceof EventTarget) {
    return;
  }
  if (STATE_SYMBOL in value) {
    deep_read(value);
  } else if (!Array.isArray(value)) {
    for (let key in value) {
      const prop2 = value[key];
      if (typeof prop2 === "object" && prop2 && STATE_SYMBOL in prop2) {
        deep_read(prop2);
      }
    }
  }
}
function deep_read(value, visited = /* @__PURE__ */ new Set()) {
  if (typeof value === "object" && value !== null && // We don't want to traverse DOM elements
  !(value instanceof EventTarget) && !visited.has(value)) {
    visited.add(value);
    if (value instanceof Date) {
      value.getTime();
    }
    for (let key in value) {
      try {
        deep_read(value[key], visited);
      } catch (e) {
      }
    }
    const proto = get_prototype_of(value);
    if (proto !== Object.prototype && proto !== Array.prototype && proto !== Map.prototype && proto !== Set.prototype && proto !== Date.prototype) {
      const descriptors = get_descriptors(proto);
      for (let key in descriptors) {
        const get2 = descriptors[key].get;
        if (get2) {
          try {
            get2.call(value);
          } catch (e) {
          }
        }
      }
    }
  }
}
let listening_to_form_reset = false;
function add_form_reset_listener() {
  if (!listening_to_form_reset) {
    listening_to_form_reset = true;
    document.addEventListener(
      "reset",
      (evt) => {
        Promise.resolve().then(() => {
          var _a;
          if (!evt.defaultPrevented) {
            for (
              const e of
              /**@type {HTMLFormElement} */
              evt.target.elements
            ) {
              (_a = e.__on_r) == null ? void 0 : _a.call(e);
            }
          }
        });
      },
      // In the capture phase to guarantee we get noticed of it (no possiblity of stopPropagation)
      { capture: true }
    );
  }
}
function without_reactive_context(fn) {
  var previous_reaction = active_reaction;
  var previous_effect = active_effect;
  set_active_reaction(null);
  set_active_effect(null);
  try {
    return fn();
  } finally {
    set_active_reaction(previous_reaction);
    set_active_effect(previous_effect);
  }
}
function listen_to_event_and_reset_event(element, event2, handler, on_reset = handler) {
  element.addEventListener(event2, () => without_reactive_context(handler));
  const prev = element.__on_r;
  if (prev) {
    element.__on_r = () => {
      prev();
      on_reset(true);
    };
  } else {
    element.__on_r = () => on_reset(true);
  }
  add_form_reset_listener();
}
const all_registered_events = /* @__PURE__ */ new Set();
const root_event_handles = /* @__PURE__ */ new Set();
function create_event(event_name, dom, handler, options = {}) {
  function target_handler(event2) {
    if (!options.capture) {
      handle_event_propagation.call(dom, event2);
    }
    if (!event2.cancelBubble) {
      return without_reactive_context(() => {
        return handler == null ? void 0 : handler.call(this, event2);
      });
    }
  }
  if (event_name.startsWith("pointer") || event_name.startsWith("touch") || event_name === "wheel") {
    queue_micro_task(() => {
      dom.addEventListener(event_name, target_handler, options);
    });
  } else {
    dom.addEventListener(event_name, target_handler, options);
  }
  return target_handler;
}
function event(event_name, dom, handler, capture, passive) {
  var options = { capture, passive };
  var target_handler = create_event(event_name, dom, handler, options);
  if (dom === document.body || dom === window || dom === document) {
    teardown(() => {
      dom.removeEventListener(event_name, target_handler, options);
    });
  }
}
function handle_event_propagation(event2) {
  var _a;
  var handler_element = this;
  var owner_document = (
    /** @type {Node} */
    handler_element.ownerDocument
  );
  var event_name = event2.type;
  var path = ((_a = event2.composedPath) == null ? void 0 : _a.call(event2)) || [];
  var current_target = (
    /** @type {null | Element} */
    path[0] || event2.target
  );
  var path_idx = 0;
  var handled_at = event2.__root;
  if (handled_at) {
    var at_idx = path.indexOf(handled_at);
    if (at_idx !== -1 && (handler_element === document || handler_element === /** @type {any} */
    window)) {
      event2.__root = handler_element;
      return;
    }
    var handler_idx = path.indexOf(handler_element);
    if (handler_idx === -1) {
      return;
    }
    if (at_idx <= handler_idx) {
      path_idx = at_idx;
    }
  }
  current_target = /** @type {Element} */
  path[path_idx] || event2.target;
  if (current_target === handler_element) return;
  define_property(event2, "currentTarget", {
    configurable: true,
    get() {
      return current_target || owner_document;
    }
  });
  var previous_reaction = active_reaction;
  var previous_effect = active_effect;
  set_active_reaction(null);
  set_active_effect(null);
  try {
    var throw_error;
    var other_errors = [];
    while (current_target !== null) {
      var parent_element = current_target.assignedSlot || current_target.parentNode || /** @type {any} */
      current_target.host || null;
      try {
        var delegated = current_target["__" + event_name];
        if (delegated !== void 0 && !/** @type {any} */
        current_target.disabled) {
          if (is_array(delegated)) {
            var [fn, ...data] = delegated;
            fn.apply(current_target, [event2, ...data]);
          } else {
            delegated.call(current_target, event2);
          }
        }
      } catch (error) {
        if (throw_error) {
          other_errors.push(error);
        } else {
          throw_error = error;
        }
      }
      if (event2.cancelBubble || parent_element === handler_element || parent_element === null) {
        break;
      }
      current_target = parent_element;
    }
    if (throw_error) {
      for (let error of other_errors) {
        queueMicrotask(() => {
          throw error;
        });
      }
      throw throw_error;
    }
  } finally {
    event2.__root = handler_element;
    delete event2.currentTarget;
    set_active_reaction(previous_reaction);
    set_active_effect(previous_effect);
  }
}
function create_fragment_from_html(html2) {
  var elem = document.createElement("template");
  elem.innerHTML = html2;
  return elem.content;
}
function assign_nodes(start, end) {
  var effect2 = (
    /** @type {Effect} */
    active_effect
  );
  if (effect2.nodes_start === null) {
    effect2.nodes_start = start;
    effect2.nodes_end = end;
  }
}
// @__NO_SIDE_EFFECTS__
function template(content, flags2) {
  var use_import_node = (flags2 & TEMPLATE_USE_IMPORT_NODE) !== 0;
  var node;
  var has_start = !content.startsWith("<!>");
  return () => {
    if (node === void 0) {
      node = create_fragment_from_html(has_start ? content : "<!>" + content);
      node = /** @type {Node} */
      /* @__PURE__ */ get_first_child(node);
    }
    var clone = (
      /** @type {TemplateNode} */
      use_import_node ? document.importNode(node, true) : node.cloneNode(true)
    );
    {
      assign_nodes(clone, clone);
    }
    return clone;
  };
}
function append(anchor, dom) {
  if (anchor === null) {
    return;
  }
  anchor.before(
    /** @type {Node} */
    dom
  );
}
let should_intro = true;
function set_text(text, value) {
  var str = value == null ? "" : typeof value === "object" ? value + "" : value;
  if (str !== (text.__t ?? (text.__t = text.nodeValue))) {
    text.__t = str;
    text.nodeValue = str == null ? "" : str + "";
  }
}
function mount(component, options) {
  return _mount(component, options);
}
const document_listeners = /* @__PURE__ */ new Map();
function _mount(Component, { target, anchor, props = {}, events, context, intro = true }) {
  init_operations();
  var registered_events = /* @__PURE__ */ new Set();
  var event_handle = (events2) => {
    for (var i = 0; i < events2.length; i++) {
      var event_name = events2[i];
      if (registered_events.has(event_name)) continue;
      registered_events.add(event_name);
      var passive = is_passive_event(event_name);
      target.addEventListener(event_name, handle_event_propagation, { passive });
      var n = document_listeners.get(event_name);
      if (n === void 0) {
        document.addEventListener(event_name, handle_event_propagation, { passive });
        document_listeners.set(event_name, 1);
      } else {
        document_listeners.set(event_name, n + 1);
      }
    }
  };
  event_handle(array_from(all_registered_events));
  root_event_handles.add(event_handle);
  var component = void 0;
  var unmount2 = component_root(() => {
    var anchor_node = anchor ?? target.appendChild(create_text());
    branch(() => {
      if (context) {
        push({});
        var ctx = (
          /** @type {ComponentContext} */
          component_context
        );
        ctx.c = context;
      }
      if (events) {
        props.$$events = events;
      }
      should_intro = intro;
      component = Component(anchor_node, props) || {};
      should_intro = true;
      if (context) {
        pop();
      }
    });
    return () => {
      var _a;
      for (var event_name of registered_events) {
        target.removeEventListener(event_name, handle_event_propagation);
        var n = (
          /** @type {number} */
          document_listeners.get(event_name)
        );
        if (--n === 0) {
          document.removeEventListener(event_name, handle_event_propagation);
          document_listeners.delete(event_name);
        } else {
          document_listeners.set(event_name, n);
        }
      }
      root_event_handles.delete(event_handle);
      if (anchor_node !== anchor) {
        (_a = anchor_node.parentNode) == null ? void 0 : _a.removeChild(anchor_node);
      }
    };
  });
  mounted_components.set(component, unmount2);
  return component;
}
let mounted_components = /* @__PURE__ */ new WeakMap();
function unmount(component, options) {
  const fn = mounted_components.get(component);
  if (fn) {
    mounted_components.delete(component);
    return fn(options);
  }
  return Promise.resolve();
}
function if_block(node, fn, elseif = false) {
  var anchor = node;
  var consequent_effect = null;
  var alternate_effect = null;
  var condition = UNINITIALIZED;
  var flags2 = elseif ? EFFECT_TRANSPARENT : 0;
  var has_branch = false;
  const set_branch = (fn2, flag = true) => {
    has_branch = true;
    update_branch(flag, fn2);
  };
  const update_branch = (new_condition, fn2) => {
    if (condition === (condition = new_condition)) return;
    if (condition) {
      if (consequent_effect) {
        resume_effect(consequent_effect);
      } else if (fn2) {
        consequent_effect = branch(() => fn2(anchor));
      }
      if (alternate_effect) {
        pause_effect(alternate_effect, () => {
          alternate_effect = null;
        });
      }
    } else {
      if (alternate_effect) {
        resume_effect(alternate_effect);
      } else if (fn2) {
        alternate_effect = branch(() => fn2(anchor));
      }
      if (consequent_effect) {
        pause_effect(consequent_effect, () => {
          consequent_effect = null;
        });
      }
    }
  };
  block(() => {
    has_branch = false;
    fn(set_branch);
    if (!has_branch) {
      update_branch(null, null);
    }
  }, flags2);
}
function index(_, i) {
  return i;
}
function pause_effects(state, items, controlled_anchor, items_map) {
  var transitions = [];
  var length = items.length;
  for (var i = 0; i < length; i++) {
    pause_children(items[i].e, transitions, true);
  }
  var is_controlled = length > 0 && transitions.length === 0 && controlled_anchor !== null;
  if (is_controlled) {
    var parent_node = (
      /** @type {Element} */
      /** @type {Element} */
      controlled_anchor.parentNode
    );
    clear_text_content(parent_node);
    parent_node.append(
      /** @type {Element} */
      controlled_anchor
    );
    items_map.clear();
    link(state, items[0].prev, items[length - 1].next);
  }
  run_out_transitions(transitions, () => {
    for (var i2 = 0; i2 < length; i2++) {
      var item = items[i2];
      if (!is_controlled) {
        items_map.delete(item.k);
        link(state, item.prev, item.next);
      }
      destroy_effect(item.e, !is_controlled);
    }
  });
}
function each(node, flags2, get_collection, get_key, render_fn, fallback_fn = null) {
  var anchor = node;
  var state = { flags: flags2, items: /* @__PURE__ */ new Map(), first: null };
  var is_controlled = (flags2 & EACH_IS_CONTROLLED) !== 0;
  if (is_controlled) {
    var parent_node = (
      /** @type {Element} */
      node
    );
    anchor = parent_node.appendChild(create_text());
  }
  var fallback = null;
  var was_empty = false;
  var each_array = /* @__PURE__ */ derived_safe_equal(() => {
    var collection = get_collection();
    return is_array(collection) ? collection : collection == null ? [] : array_from(collection);
  });
  block(() => {
    var array = get$1(each_array);
    var length = array.length;
    if (was_empty && length === 0) {
      return;
    }
    was_empty = length === 0;
    {
      var effect2 = (
        /** @type {Effect} */
        active_reaction
      );
      reconcile(
        array,
        state,
        anchor,
        render_fn,
        flags2,
        (effect2.f & INERT) !== 0,
        get_key,
        get_collection
      );
    }
    if (fallback_fn !== null) {
      if (length === 0) {
        if (fallback) {
          resume_effect(fallback);
        } else {
          fallback = branch(() => fallback_fn(anchor));
        }
      } else if (fallback !== null) {
        pause_effect(fallback, () => {
          fallback = null;
        });
      }
    }
    get$1(each_array);
  });
}
function reconcile(array, state, anchor, render_fn, flags2, is_inert, get_key, get_collection) {
  var _a, _b, _c, _d;
  var is_animated = (flags2 & EACH_IS_ANIMATED) !== 0;
  var should_update = (flags2 & (EACH_ITEM_REACTIVE | EACH_INDEX_REACTIVE)) !== 0;
  var length = array.length;
  var items = state.items;
  var first = state.first;
  var current = first;
  var seen;
  var prev = null;
  var to_animate;
  var matched = [];
  var stashed = [];
  var value;
  var key;
  var item;
  var i;
  if (is_animated) {
    for (i = 0; i < length; i += 1) {
      value = array[i];
      key = get_key(value, i);
      item = items.get(key);
      if (item !== void 0) {
        (_a = item.a) == null ? void 0 : _a.measure();
        (to_animate ?? (to_animate = /* @__PURE__ */ new Set())).add(item);
      }
    }
  }
  for (i = 0; i < length; i += 1) {
    value = array[i];
    key = get_key(value, i);
    item = items.get(key);
    if (item === void 0) {
      var child_anchor = current ? (
        /** @type {TemplateNode} */
        current.e.nodes_start
      ) : anchor;
      prev = create_item(
        child_anchor,
        state,
        prev,
        prev === null ? state.first : prev.next,
        value,
        key,
        i,
        render_fn,
        flags2,
        get_collection
      );
      items.set(key, prev);
      matched = [];
      stashed = [];
      current = prev.next;
      continue;
    }
    if (should_update) {
      update_item(item, value, i, flags2);
    }
    if ((item.e.f & INERT) !== 0) {
      resume_effect(item.e);
      if (is_animated) {
        (_b = item.a) == null ? void 0 : _b.unfix();
        (to_animate ?? (to_animate = /* @__PURE__ */ new Set())).delete(item);
      }
    }
    if (item !== current) {
      if (seen !== void 0 && seen.has(item)) {
        if (matched.length < stashed.length) {
          var start = stashed[0];
          var j;
          prev = start.prev;
          var a = matched[0];
          var b = matched[matched.length - 1];
          for (j = 0; j < matched.length; j += 1) {
            move(matched[j], start, anchor);
          }
          for (j = 0; j < stashed.length; j += 1) {
            seen.delete(stashed[j]);
          }
          link(state, a.prev, b.next);
          link(state, prev, a);
          link(state, b, start);
          current = start;
          prev = b;
          i -= 1;
          matched = [];
          stashed = [];
        } else {
          seen.delete(item);
          move(item, current, anchor);
          link(state, item.prev, item.next);
          link(state, item, prev === null ? state.first : prev.next);
          link(state, prev, item);
          prev = item;
        }
        continue;
      }
      matched = [];
      stashed = [];
      while (current !== null && current.k !== key) {
        if (is_inert || (current.e.f & INERT) === 0) {
          (seen ?? (seen = /* @__PURE__ */ new Set())).add(current);
        }
        stashed.push(current);
        current = current.next;
      }
      if (current === null) {
        continue;
      }
      item = current;
    }
    matched.push(item);
    prev = item;
    current = item.next;
  }
  if (current !== null || seen !== void 0) {
    var to_destroy = seen === void 0 ? [] : array_from(seen);
    while (current !== null) {
      if (is_inert || (current.e.f & INERT) === 0) {
        to_destroy.push(current);
      }
      current = current.next;
    }
    var destroy_length = to_destroy.length;
    if (destroy_length > 0) {
      var controlled_anchor = (flags2 & EACH_IS_CONTROLLED) !== 0 && length === 0 ? anchor : null;
      if (is_animated) {
        for (i = 0; i < destroy_length; i += 1) {
          (_c = to_destroy[i].a) == null ? void 0 : _c.measure();
        }
        for (i = 0; i < destroy_length; i += 1) {
          (_d = to_destroy[i].a) == null ? void 0 : _d.fix();
        }
      }
      pause_effects(state, to_destroy, controlled_anchor, items);
    }
  }
  if (is_animated) {
    queue_micro_task(() => {
      var _a2;
      if (to_animate === void 0) return;
      for (item of to_animate) {
        (_a2 = item.a) == null ? void 0 : _a2.apply();
      }
    });
  }
  active_effect.first = state.first && state.first.e;
  active_effect.last = prev && prev.e;
}
function update_item(item, value, index2, type) {
  if ((type & EACH_ITEM_REACTIVE) !== 0) {
    internal_set(item.v, value);
  }
  if ((type & EACH_INDEX_REACTIVE) !== 0) {
    internal_set(
      /** @type {Value<number>} */
      item.i,
      index2
    );
  } else {
    item.i = index2;
  }
}
function create_item(anchor, state, prev, next, value, key, index2, render_fn, flags2, get_collection) {
  var reactive = (flags2 & EACH_ITEM_REACTIVE) !== 0;
  var mutable = (flags2 & EACH_ITEM_IMMUTABLE) === 0;
  var v = reactive ? mutable ? /* @__PURE__ */ mutable_source(value) : source(value) : value;
  var i = (flags2 & EACH_INDEX_REACTIVE) === 0 ? index2 : source(index2);
  var item = {
    i,
    v,
    k: key,
    a: null,
    // @ts-expect-error
    e: null,
    prev,
    next
  };
  try {
    item.e = branch(() => render_fn(anchor, v, i, get_collection), hydrating);
    item.e.prev = prev && prev.e;
    item.e.next = next && next.e;
    if (prev === null) {
      state.first = item;
    } else {
      prev.next = item;
      prev.e.next = item.e;
    }
    if (next !== null) {
      next.prev = item;
      next.e.prev = item.e;
    }
    return item;
  } finally {
  }
}
function move(item, next, anchor) {
  var end = item.next ? (
    /** @type {TemplateNode} */
    item.next.e.nodes_start
  ) : anchor;
  var dest = next ? (
    /** @type {TemplateNode} */
    next.e.nodes_start
  ) : anchor;
  var node = (
    /** @type {TemplateNode} */
    item.e.nodes_start
  );
  while (node !== end) {
    var next_node = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ get_next_sibling(node)
    );
    dest.before(node);
    node = next_node;
  }
}
function link(state, prev, next) {
  if (prev === null) {
    state.first = next;
  } else {
    prev.next = next;
    prev.e.next = next && next.e;
  }
  if (next !== null) {
    next.prev = prev;
    next.e.prev = prev && prev.e;
  }
}
function html(node, get_value, svg, mathml, skip_warning) {
  var anchor = node;
  var value = "";
  var effect2;
  block(() => {
    if (value === (value = get_value() ?? "")) {
      return;
    }
    if (effect2 !== void 0) {
      destroy_effect(effect2);
      effect2 = void 0;
    }
    if (value === "") return;
    effect2 = branch(() => {
      var html2 = value + "";
      var node2 = create_fragment_from_html(html2);
      assign_nodes(
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_first_child(node2),
        /** @type {TemplateNode} */
        node2.lastChild
      );
      {
        anchor.before(node2);
      }
    });
  });
}
function set_value(element, value) {
  var attributes = element.__attributes ?? (element.__attributes = {});
  if (attributes.value === (attributes.value = // treat null and undefined the same for the initial value
  value ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  element.value === value && (value !== 0 || element.nodeName !== "PROGRESS")) {
    return;
  }
  element.value = value ?? "";
}
function set_attribute(element, attribute, value, skip_warning) {
  var attributes = element.__attributes ?? (element.__attributes = {});
  if (attributes[attribute] === (attributes[attribute] = value)) return;
  if (attribute === "style" && "__styles" in element) {
    element.__styles = {};
  }
  if (attribute === "loading") {
    element[LOADING_ATTR_SYMBOL] = value;
  }
  if (value == null) {
    element.removeAttribute(attribute);
  } else if (typeof value !== "string" && get_setters(element).includes(attribute)) {
    element[attribute] = value;
  } else {
    element.setAttribute(attribute, value);
  }
}
var setters_cache = /* @__PURE__ */ new Map();
function get_setters(element) {
  var setters = setters_cache.get(element.nodeName);
  if (setters) return setters;
  setters_cache.set(element.nodeName, setters = []);
  var descriptors;
  var proto = element;
  var element_proto = Element.prototype;
  while (element_proto !== proto) {
    descriptors = get_descriptors(proto);
    for (var key in descriptors) {
      if (descriptors[key].set) {
        setters.push(key);
      }
    }
    proto = get_prototype_of(proto);
  }
  return setters;
}
const now = () => performance.now();
const raf = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (_) => requestAnimationFrame(_)
  ),
  now: () => now(),
  tasks: /* @__PURE__ */ new Set()
};
function run_tasks() {
  const now2 = raf.now();
  raf.tasks.forEach((task) => {
    if (!task.c(now2)) {
      raf.tasks.delete(task);
      task.f();
    }
  });
  if (raf.tasks.size !== 0) {
    raf.tick(run_tasks);
  }
}
function loop(callback) {
  let task;
  if (raf.tasks.size === 0) {
    raf.tick(run_tasks);
  }
  return {
    promise: new Promise((fulfill) => {
      raf.tasks.add(task = { c: callback, f: fulfill });
    }),
    abort() {
      raf.tasks.delete(task);
    }
  };
}
function dispatch_event(element, type) {
  element.dispatchEvent(new CustomEvent(type));
}
function css_property_to_camelcase(style) {
  if (style === "float") return "cssFloat";
  if (style === "offset") return "cssOffset";
  if (style.startsWith("--")) return style;
  const parts = style.split("-");
  if (parts.length === 1) return parts[0];
  return parts[0] + parts.slice(1).map(
    /** @param {any} word */
    (word) => word[0].toUpperCase() + word.slice(1)
  ).join("");
}
function css_to_keyframe(css) {
  const keyframe = {};
  const parts = css.split(";");
  for (const part of parts) {
    const [property, value] = part.split(":");
    if (!property || value === void 0) break;
    const formatted_property = css_property_to_camelcase(property.trim());
    keyframe[formatted_property] = value.trim();
  }
  return keyframe;
}
const linear = (t) => t;
function transition(flags2, element, get_fn, get_params) {
  var is_intro = (flags2 & TRANSITION_IN) !== 0;
  var is_outro = (flags2 & TRANSITION_OUT) !== 0;
  var is_both = is_intro && is_outro;
  var is_global = (flags2 & TRANSITION_GLOBAL) !== 0;
  var direction = is_both ? "both" : is_intro ? "in" : "out";
  var current_options;
  var inert = element.inert;
  var overflow = element.style.overflow;
  var intro;
  var outro;
  function get_options() {
    var previous_reaction = active_reaction;
    var previous_effect = active_effect;
    set_active_reaction(null);
    set_active_effect(null);
    try {
      return current_options ?? (current_options = get_fn()(element, (get_params == null ? void 0 : get_params()) ?? /** @type {P} */
      {}, {
        direction
      }));
    } finally {
      set_active_reaction(previous_reaction);
      set_active_effect(previous_effect);
    }
  }
  var transition2 = {
    is_global,
    in() {
      var _a;
      element.inert = inert;
      if (!is_intro) {
        outro == null ? void 0 : outro.abort();
        (_a = outro == null ? void 0 : outro.reset) == null ? void 0 : _a.call(outro);
        return;
      }
      if (!is_outro) {
        intro == null ? void 0 : intro.abort();
      }
      dispatch_event(element, "introstart");
      intro = animate(element, get_options(), outro, 1, () => {
        dispatch_event(element, "introend");
        intro == null ? void 0 : intro.abort();
        intro = current_options = void 0;
        element.style.overflow = overflow;
      });
    },
    out(fn) {
      if (!is_outro) {
        fn == null ? void 0 : fn();
        current_options = void 0;
        return;
      }
      element.inert = true;
      dispatch_event(element, "outrostart");
      outro = animate(element, get_options(), intro, 0, () => {
        dispatch_event(element, "outroend");
        fn == null ? void 0 : fn();
      });
    },
    stop: () => {
      intro == null ? void 0 : intro.abort();
      outro == null ? void 0 : outro.abort();
    }
  };
  var e = (
    /** @type {Effect} */
    active_effect
  );
  (e.transitions ?? (e.transitions = [])).push(transition2);
  if (is_intro && should_intro) {
    var run2 = is_global;
    if (!run2) {
      var block2 = (
        /** @type {Effect | null} */
        e.parent
      );
      while (block2 && (block2.f & EFFECT_TRANSPARENT) !== 0) {
        while (block2 = block2.parent) {
          if ((block2.f & BLOCK_EFFECT) !== 0) break;
        }
      }
      run2 = !block2 || (block2.f & EFFECT_RAN) !== 0;
    }
    if (run2) {
      effect(() => {
        untrack(() => transition2.in());
      });
    }
  }
}
function animate(element, options, counterpart, t2, on_finish) {
  var is_intro = t2 === 1;
  if (is_function(options)) {
    var a;
    var aborted = false;
    queue_micro_task(() => {
      if (aborted) return;
      var o = options({ direction: is_intro ? "in" : "out" });
      a = animate(element, o, counterpart, t2, on_finish);
    });
    return {
      abort: () => {
        aborted = true;
        a == null ? void 0 : a.abort();
      },
      deactivate: () => a.deactivate(),
      reset: () => a.reset(),
      t: () => a.t()
    };
  }
  counterpart == null ? void 0 : counterpart.deactivate();
  if (!(options == null ? void 0 : options.duration)) {
    on_finish();
    return {
      abort: noop,
      deactivate: noop,
      reset: noop,
      t: () => t2
    };
  }
  const { delay = 0, css, tick, easing = linear } = options;
  var keyframes = [];
  if (is_intro && counterpart === void 0) {
    if (tick) {
      tick(0, 1);
    }
    if (css) {
      var styles = css_to_keyframe(css(0, 1));
      keyframes.push(styles, styles);
    }
  }
  var get_t = () => 1 - t2;
  var animation = element.animate(keyframes, { duration: delay });
  animation.onfinish = () => {
    var t1 = (counterpart == null ? void 0 : counterpart.t()) ?? 1 - t2;
    counterpart == null ? void 0 : counterpart.abort();
    var delta = t2 - t1;
    var duration = (
      /** @type {number} */
      options.duration * Math.abs(delta)
    );
    var keyframes2 = [];
    if (duration > 0) {
      var needs_overflow_hidden = false;
      if (css) {
        var n = Math.ceil(duration / (1e3 / 60));
        for (var i = 0; i <= n; i += 1) {
          var t = t1 + delta * easing(i / n);
          var styles2 = css_to_keyframe(css(t, 1 - t));
          keyframes2.push(styles2);
          needs_overflow_hidden || (needs_overflow_hidden = styles2.overflow === "hidden");
        }
      }
      if (needs_overflow_hidden) {
        element.style.overflow = "hidden";
      }
      get_t = () => {
        var time = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          animation.currentTime
        );
        return t1 + delta * easing(time / duration);
      };
      if (tick) {
        loop(() => {
          if (animation.playState !== "running") return false;
          var t3 = get_t();
          tick(t3, 1 - t3);
          return true;
        });
      }
    }
    animation = element.animate(keyframes2, { duration, fill: "forwards" });
    animation.onfinish = () => {
      get_t = () => t2;
      tick == null ? void 0 : tick(t2, 1 - t2);
      on_finish();
    };
  };
  return {
    abort: () => {
      if (animation) {
        animation.cancel();
        animation.effect = null;
        animation.onfinish = noop;
      }
    },
    deactivate: () => {
      on_finish = noop;
    },
    reset: () => {
      if (t2 === 0) {
        tick == null ? void 0 : tick(1, 0);
      }
    },
    t: () => get_t()
  };
}
function bind_value(input, get2, set2 = get2) {
  var runes = is_runes();
  listen_to_event_and_reset_event(input, "input", (is_reset) => {
    var value = is_reset ? input.defaultValue : input.value;
    value = is_numberlike_input(input) ? to_number(value) : value;
    set2(value);
    if (runes && value !== (value = get2())) {
      var start = input.selectionStart;
      var end = input.selectionEnd;
      input.value = value ?? "";
      if (end !== null) {
        input.selectionStart = start;
        input.selectionEnd = Math.min(end, input.value.length);
      }
    }
  });
  if (
    // If we are hydrating and the value has since changed,
    // then use the updated value from the input instead.
    // If defaultValue is set, then value == defaultValue
    // TODO Svelte 6: remove input.value check and set to empty string?
    untrack(get2) == null && input.value
  ) {
    set2(is_numberlike_input(input) ? to_number(input.value) : input.value);
  }
  render_effect(() => {
    var value = get2();
    if (is_numberlike_input(input) && value === to_number(input.value)) {
      return;
    }
    if (input.type === "date" && !value && !input.value) {
      return;
    }
    if (value !== input.value) {
      input.value = value ?? "";
    }
  });
}
function is_numberlike_input(input) {
  var type = input.type;
  return type === "number" || type === "range";
}
function to_number(value) {
  return value === "" ? null : +value;
}
function select_option(select, value, mounting) {
  if (select.multiple) {
    return select_options(select, value);
  }
  for (var option of select.options) {
    var option_value = get_option_value(option);
    if (is(option_value, value)) {
      option.selected = true;
      return;
    }
  }
  if (!mounting || value !== void 0) {
    select.selectedIndex = -1;
  }
}
function init_select(select, get_value) {
  effect(() => {
    var observer = new MutationObserver(() => {
      var value = select.__value;
      select_option(select, value);
    });
    observer.observe(select, {
      // Listen to option element changes
      childList: true,
      subtree: true,
      // because of <optgroup>
      // Listen to option element value attribute changes
      // (doesn't get notified of select value changes,
      // because that property is not reflected as an attribute)
      attributes: true,
      attributeFilter: ["value"]
    });
    return () => {
      observer.disconnect();
    };
  });
}
function bind_select_value(select, get2, set2 = get2) {
  var mounting = true;
  listen_to_event_and_reset_event(select, "change", (is_reset) => {
    var query = is_reset ? "[selected]" : ":checked";
    var value;
    if (select.multiple) {
      value = [].map.call(select.querySelectorAll(query), get_option_value);
    } else {
      var selected_option = select.querySelector(query) ?? // will fall back to first non-disabled option if no option is selected
      select.querySelector("option:not([disabled])");
      value = selected_option && get_option_value(selected_option);
    }
    set2(value);
  });
  effect(() => {
    var value = get2();
    select_option(select, value, mounting);
    if (mounting && value === void 0) {
      var selected_option = select.querySelector(":checked");
      if (selected_option !== null) {
        value = get_option_value(selected_option);
        set2(value);
      }
    }
    select.__value = value;
    mounting = false;
  });
  init_select(select);
}
function select_options(select, value) {
  for (var option of select.options) {
    option.selected = ~value.indexOf(get_option_value(option));
  }
}
function get_option_value(option) {
  if ("__value" in option) {
    return option.__value;
  } else {
    return option.value;
  }
}
function is_bound_this(bound_value, element_or_component) {
  return bound_value === element_or_component || (bound_value == null ? void 0 : bound_value[STATE_SYMBOL]) === element_or_component;
}
function bind_this(element_or_component = {}, update, get_value, get_parts) {
  effect(() => {
    var old_parts;
    var parts;
    render_effect(() => {
      old_parts = parts;
      parts = [];
      untrack(() => {
        if (element_or_component !== get_value(...parts)) {
          update(element_or_component, ...parts);
          if (old_parts && is_bound_this(get_value(...old_parts), element_or_component)) {
            update(null, ...old_parts);
          }
        }
      });
    });
    return () => {
      queue_micro_task(() => {
        if (parts && is_bound_this(get_value(...parts), element_or_component)) {
          update(null, ...parts);
        }
      });
    };
  });
  return element_or_component;
}
function bind_property(property, event_name, element, set2, get2) {
  var handler = () => {
    set2(element[property]);
  };
  element.addEventListener(event_name, handler);
  {
    render_effect(() => {
      element[property] = get2();
    });
  }
  if (element === document.body || element === window || element === document) {
    teardown(() => {
      element.removeEventListener(event_name, handler);
    });
  }
}
function init(immutable = false) {
  const context = (
    /** @type {ComponentContextLegacy} */
    component_context
  );
  const callbacks = context.l.u;
  if (!callbacks) return;
  let props = () => deep_read_state(context.s);
  if (immutable) {
    let version = 0;
    let prev = (
      /** @type {Record<string, any>} */
      {}
    );
    const d = /* @__PURE__ */ derived(() => {
      let changed = false;
      const props2 = context.s;
      for (const key in props2) {
        if (props2[key] !== prev[key]) {
          prev[key] = props2[key];
          changed = true;
        }
      }
      if (changed) version++;
      return version;
    });
    props = () => get$1(d);
  }
  if (callbacks.b.length) {
    user_pre_effect(() => {
      observe_all(context, props);
      run_all(callbacks.b);
    });
  }
  user_effect(() => {
    const fns = untrack(() => callbacks.m.map(run));
    return () => {
      for (const fn of fns) {
        if (typeof fn === "function") {
          fn();
        }
      }
    };
  });
  if (callbacks.a.length) {
    user_effect(() => {
      observe_all(context, props);
      run_all(callbacks.a);
    });
  }
}
function observe_all(context, props) {
  if (context.l.s) {
    for (const signal of context.l.s) get$1(signal);
  }
  props();
}
function onMount(fn) {
  if (component_context === null) {
    lifecycle_outside_component();
  }
  if (legacy_mode_flag && component_context.l !== null) {
    init_update_callbacks(component_context).m.push(fn);
  } else {
    user_effect(() => {
      const cleanup = untrack(fn);
      if (typeof cleanup === "function") return (
        /** @type {() => void} */
        cleanup
      );
    });
  }
}
function init_update_callbacks(context) {
  var l = (
    /** @type {ComponentContextLegacy} */
    context.l
  );
  return l.u ?? (l.u = { a: [], b: [], m: [] });
}
function subscribe_to_store(store, run2, invalidate) {
  if (store == null) {
    run2(void 0);
    return noop;
  }
  const unsub = untrack(
    () => store.subscribe(
      run2,
      // @ts-expect-error
      invalidate
    )
  );
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
const subscriber_queue = [];
function writable(value, start = noop) {
  let stop = null;
  const subscribers = /* @__PURE__ */ new Set();
  function set2(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set2(fn(
      /** @type {T} */
      value
    ));
  }
  function subscribe(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set2, update) || noop;
    }
    run2(
      /** @type {T} */
      value
    );
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0 && stop) {
        stop();
        stop = null;
      }
    };
  }
  return { set: set2, update, subscribe };
}
function get(store) {
  let value;
  subscribe_to_store(store, (_) => value = _)();
  return value;
}
let is_store_binding = false;
let IS_UNMOUNTED = Symbol();
function store_get(store, store_name, stores) {
  const entry = stores[store_name] ?? (stores[store_name] = {
    store: null,
    source: /* @__PURE__ */ mutable_source(void 0),
    unsubscribe: noop
  });
  if (entry.store !== store && !(IS_UNMOUNTED in stores)) {
    entry.unsubscribe();
    entry.store = store ?? null;
    if (store == null) {
      entry.source.v = void 0;
      entry.unsubscribe = noop;
    } else {
      var is_synchronous_callback = true;
      entry.unsubscribe = subscribe_to_store(store, (v) => {
        if (is_synchronous_callback) {
          entry.source.v = v;
        } else {
          set(entry.source, v);
        }
      });
      is_synchronous_callback = false;
    }
  }
  if (store && IS_UNMOUNTED in stores) {
    return get(store);
  }
  return get$1(entry.source);
}
function setup_stores() {
  const stores = {};
  function cleanup() {
    teardown(() => {
      for (var store_name in stores) {
        const ref = stores[store_name];
        ref.unsubscribe();
      }
      define_property(stores, IS_UNMOUNTED, {
        enumerable: false,
        value: true
      });
    });
  }
  return [stores, cleanup];
}
function capture_store_binding(fn) {
  var previous_is_store_binding = is_store_binding;
  try {
    is_store_binding = false;
    return [fn(), is_store_binding];
  } finally {
    is_store_binding = previous_is_store_binding;
  }
}
function with_parent_branch(fn) {
  var effect2 = active_effect;
  var previous_effect = active_effect;
  while (effect2 !== null && (effect2.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0) {
    effect2 = effect2.parent;
  }
  try {
    set_active_effect(effect2);
    return fn();
  } finally {
    set_active_effect(previous_effect);
  }
}
function prop(props, key, flags2, fallback) {
  var _a;
  var immutable = (flags2 & PROPS_IS_IMMUTABLE) !== 0;
  var runes = !legacy_mode_flag || (flags2 & PROPS_IS_RUNES) !== 0;
  var bindable = (flags2 & PROPS_IS_BINDABLE) !== 0;
  var lazy = (flags2 & PROPS_IS_LAZY_INITIAL) !== 0;
  var is_store_sub = false;
  var prop_value;
  if (bindable) {
    [prop_value, is_store_sub] = capture_store_binding(() => (
      /** @type {V} */
      props[key]
    ));
  } else {
    prop_value = /** @type {V} */
    props[key];
  }
  var is_entry_props = STATE_SYMBOL in props || LEGACY_PROPS in props;
  var setter = bindable && (((_a = get_descriptor(props, key)) == null ? void 0 : _a.set) ?? (is_entry_props && key in props && ((v) => props[key] = v))) || void 0;
  var fallback_value = (
    /** @type {V} */
    fallback
  );
  var fallback_dirty = true;
  var fallback_used = false;
  var get_fallback = () => {
    fallback_used = true;
    if (fallback_dirty) {
      fallback_dirty = false;
      if (lazy) {
        fallback_value = untrack(
          /** @type {() => V} */
          fallback
        );
      } else {
        fallback_value = /** @type {V} */
        fallback;
      }
    }
    return fallback_value;
  };
  if (prop_value === void 0 && fallback !== void 0) {
    if (setter && runes) {
      props_invalid_value();
    }
    prop_value = get_fallback();
    if (setter) setter(prop_value);
  }
  var getter;
  if (runes) {
    getter = () => {
      var value = (
        /** @type {V} */
        props[key]
      );
      if (value === void 0) return get_fallback();
      fallback_dirty = true;
      fallback_used = false;
      return value;
    };
  } else {
    var derived_getter = with_parent_branch(
      () => (immutable ? derived : derived_safe_equal)(() => (
        /** @type {V} */
        props[key]
      ))
    );
    derived_getter.f |= LEGACY_DERIVED_PROP;
    getter = () => {
      var value = get$1(derived_getter);
      if (value !== void 0) fallback_value = /** @type {V} */
      void 0;
      return value === void 0 ? fallback_value : value;
    };
  }
  if ((flags2 & PROPS_IS_UPDATED) === 0) {
    return getter;
  }
  if (setter) {
    var legacy_parent = props.$$legacy;
    return function(value, mutation) {
      if (arguments.length > 0) {
        if (!runes || !mutation || legacy_parent || is_store_sub) {
          setter(mutation ? getter() : value);
        }
        return value;
      } else {
        return getter();
      }
    };
  }
  var from_child = false;
  var was_from_child = false;
  var inner_current_value = /* @__PURE__ */ mutable_source(prop_value);
  var current_value = with_parent_branch(
    () => /* @__PURE__ */ derived(() => {
      var parent_value = getter();
      var child_value = get$1(inner_current_value);
      if (from_child) {
        from_child = false;
        was_from_child = true;
        return child_value;
      }
      was_from_child = false;
      return inner_current_value.v = parent_value;
    })
  );
  if (!immutable) current_value.equals = safe_equals;
  return function(value, mutation) {
    if (captured_signals !== null) {
      from_child = was_from_child;
      getter();
      get$1(inner_current_value);
    }
    if (arguments.length > 0) {
      const new_value = mutation ? get$1(current_value) : runes && bindable ? proxy(value) : value;
      if (!current_value.equals(new_value)) {
        from_child = true;
        set(inner_current_value, new_value);
        if (fallback_used && fallback_value !== void 0) {
          fallback_value = new_value;
        }
        untrack(() => get$1(current_value));
      }
      return value;
    }
    return get$1(current_value);
  };
}
function localize(key) {
  return game.i18n.localize(key);
}
function openFilePicker(document2) {
  return new Promise((resolve) => {
    new FilePicker({
      type: "image",
      current: document2.img,
      callback: (path) => {
        document2.update({ img: path }, { render: true });
        resolve(path);
      }
    }).render(true);
  });
}
var root_1$3 = /* @__PURE__ */ template(`<div class="editor"></div>`);
var root_2$3 = /* @__PURE__ */ template(`<div class="editor-readonly"></div>`);
var root$5 = /* @__PURE__ */ template(`<div class="editor-field"><!></div>`);
function Editor($$anchor, $$props) {
  push($$props, false);
  let document2 = prop($$props, "document", 24, () => ({}));
  let owner = prop($$props, "owner", 24, () => ({}));
  let editable = prop($$props, "editable", 24, () => ({}));
  let editor;
  let editorContainer = mutable_state();
  let textValue = document2().system.description;
  onMount(async () => {
    var _a, _b;
    if (!((_a = document2().system) == null ? void 0 : _a.description) && ((_b = document2().system) == null ? void 0 : _b.description) !== "") {
      Log.error(`This editor requires that the data model has a ${document2().name}.system.description field`, "Editor.svelte", { document: document2() });
      return;
    }
    if (editable()) {
      editor = await TextEditor.create({
        target: get$1(editorContainer),
        height: 300,
        save_onsubmit: false,
        buttons: true,
        owner: owner(),
        parent: ".editor-field",
        content_css: "systems/sr3e/styles/css/chummer-dark.css",
        content_style: "html { margin: 0.5rem; }",
        save_onsavecallback: async (html2) => {
          let content = html2.getContent(get$1(editorContainer));
          await document2().update({ "system.description": content }, { render: false });
        }
      });
      editor.setContent(document2().system.description);
    } else {
      mutate(editorContainer, get$1(editorContainer).innerHTML = TextEditor.enrichHTML(textValue, { async: false }));
    }
    Log.success("Editor initialized successfully", "Editor.svelte", get$1(editorContainer));
  });
  init();
  var div = root$5();
  var node = child(div);
  {
    var consequent = ($$anchor2) => {
      var div_1 = root_1$3();
      bind_this(div_1, ($$value) => set(editorContainer, $$value), () => get$1(editorContainer));
      append($$anchor2, div_1);
    };
    var alternate = ($$anchor2) => {
      var div_2 = root_2$3();
      bind_this(div_2, ($$value) => set(editorContainer, $$value), () => get$1(editorContainer));
      append($$anchor2, div_2);
    };
    if_block(node, ($$render) => {
      if (editable()) $$render(consequent);
      else $$render(alternate, false);
    });
  }
  append($$anchor, div);
  pop();
}
var root_1$2 = /* @__PURE__ */ template(`<option> </option>`);
var root_2$2 = /* @__PURE__ */ template(`<div class="stat-card"><div><h4 class="no-margin"> </h4></div> <div class="stat-label"><input type="number"></div></div>`);
var root_3$2 = /* @__PURE__ */ template(`<div class="stat-card"><div><h4 class="no-margin"> </h4></div> <div class="stat-label"><input type="number"></div></div>`);
var root_4$1 = /* @__PURE__ */ template(`<div class="stat-card"><div><h4 class="no-margin"> </h4></div> <div class="stat-label"><input type="number"></div></div>`);
var root_5$1 = /* @__PURE__ */ template(`<div class="stat-card"><div><h4 class="no-margin"> </h4></div> <div class="stat-label"><input type="number"></div></div>`);
var root_6 = /* @__PURE__ */ template(`<div class="stat-card"><div><h4 class="no-margin"> </h4></div> <div class="stat-label"><input type="number"></div></div>`);
var root_7 = /* @__PURE__ */ template(`<div class="stat-card"><div><h4 class="no-margin"> </h4></div> <div class="stat-label"><input type="number"></div></div>`);
var root_8 = /* @__PURE__ */ template(`<div class="stat-card"><div><h4 class="no-margin"> </h4></div> <div class="stat-label"><input type="number"></div></div>`);
var root_9 = /* @__PURE__ */ template(`<div class="stat-card"><div><h4 class="no-margin"> </h4></div> <div class="stat-label"><input type="text"></div></div>`);
var root$4 = /* @__PURE__ */ template(`<div class="sr3e"><div class="item-sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background"><div class="image-mask"><img data-edit="img" role="presentation"></div> <input class="large" name="name" type="text"> <div class="stat-card"><div><h4>Select Priority</h4></div> <div class="stat-label"><select name="system.priority" class="priority-select"></select></div></div></div></div></div> <div class="item-sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background"><h3 class="item"> </h3> <div class="stat-grid"></div></div></div></div> <div class="item-sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background"><h3 class="item"> </h3> <div class="stat-grid"></div></div></div></div> <div class="item-sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background"><h3 class="item"> </h3> <div class="stat-grid"></div></div></div></div> <div class="item-sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background"><h3 class="item"> </h3> <div class="grid-container"><div class="stat-grid"></div></div></div></div></div> <div class="item-sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background"><h3 class="item"> </h3> <div class="stat-grid"></div></div></div></div> <div class="item-sheet-component"><div class="inner-background-container slim"><div class="fake-shadow"></div> <div class="inner-background"><h3 class="item"> </h3> <div class="stat-grid two-column"></div></div></div></div> <div class="item-sheet-component"><div class="inner-background-container slim"><div class="fake-shadow"></div> <div class="inner-background slim"><h3 class="item"> </h3> <div class="stat-grid one-column"></div></div></div></div> <div class="item-sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background"><h3 class="item"> </h3> <div class="stat-grid one-column"></div></div></div></div> <div class="item-sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <!></div></div></div>`);
function MetahumanApp($$anchor, $$props) {
  push($$props, false);
  const metahuman = mutable_state();
  const agerange = mutable_state();
  const height = mutable_state();
  const weight = mutable_state();
  const attributeModifiers = mutable_state();
  const attributeLimits = mutable_state();
  let item = prop($$props, "item", 28, () => ({}));
  let config = prop($$props, "config", 24, () => ({}));
  let system = mutable_state(item().system);
  let attributes = config().attributes;
  let common = config().common;
  let movement = mutable_state(config().movement);
  let karma = mutable_state(config().karma);
  let vision = mutable_state(config().vision);
  let traits = config().traits;
  legacy_pre_effect(() => get$1(system), () => {
    set(metahuman, get$1(system));
  });
  legacy_pre_effect(
    () => (get$1(movement), get$1(metahuman)),
    () => {
      set(movement, [
        {
          label: localize(get$1(movement).walking),
          value: get$1(metahuman).movement.base
        },
        {
          label: localize(get$1(movement).runSpeedModifier),
          value: get$1(metahuman).movement.modifier
        }
      ]);
    }
  );
  legacy_pre_effect(
    () => (get$1(karma), get$1(metahuman)),
    () => {
      set(karma, [
        {
          label: localize(get$1(karma).advancementRatio),
          value: get$1(metahuman).karma.factor
        }
      ]);
    }
  );
  legacy_pre_effect(() => get$1(metahuman), () => {
    set(agerange, [
      {
        label: localize(common.min),
        value: get$1(metahuman).agerange.min
      },
      {
        label: localize(common.average),
        value: get$1(metahuman).agerange.average
      },
      {
        label: localize(common.max),
        value: get$1(metahuman).agerange.max
      }
    ]);
  });
  legacy_pre_effect(() => get$1(metahuman), () => {
    set(height, [
      {
        label: localize(common.min),
        value: get$1(metahuman).physical.height.min
      },
      {
        label: localize(common.average),
        value: get$1(metahuman).physical.height.average
      },
      {
        label: localize(common.max),
        value: get$1(metahuman).physical.height.max
      }
    ]);
  });
  legacy_pre_effect(() => get$1(metahuman), () => {
    set(weight, [
      {
        label: localize(common.min),
        value: get$1(metahuman).physical.weight.min
      },
      {
        label: localize(common.average),
        value: get$1(metahuman).physical.weight.average
      },
      {
        label: localize(common.max),
        value: get$1(metahuman).physical.weight.max
      }
    ]);
  });
  legacy_pre_effect(() => get$1(metahuman), () => {
    set(attributeModifiers, [
      {
        label: localize(attributes.strength),
        value: get$1(metahuman).modifiers.strength
      },
      {
        label: localize(attributes.quickness),
        value: get$1(metahuman).modifiers.quickness
      },
      {
        label: localize(attributes.body),
        value: get$1(metahuman).modifiers.body
      },
      {
        label: localize(attributes.charisma),
        value: get$1(metahuman).modifiers.charisma
      },
      {
        label: localize(attributes.intelligence),
        value: get$1(metahuman).modifiers.intelligence
      },
      {
        label: localize(attributes.willpower),
        value: get$1(metahuman).modifiers.willpower
      }
    ]);
  });
  legacy_pre_effect(() => get$1(metahuman), () => {
    set(attributeLimits, [
      {
        label: localize(attributes.strength),
        value: get$1(metahuman).attributeLimits.strength
      },
      {
        label: localize(attributes.quickness),
        value: get$1(metahuman).attributeLimits.quickness
      },
      {
        label: localize(attributes.body),
        value: get$1(metahuman).attributeLimits.body
      },
      {
        label: localize(attributes.charisma),
        value: get$1(metahuman).attributeLimits.charisma
      },
      {
        label: localize(attributes.intelligence),
        value: get$1(metahuman).attributeLimits.intelligence
      },
      {
        label: localize(attributes.willpower),
        value: get$1(metahuman).attributeLimits.willpower
      }
    ]);
  });
  legacy_pre_effect(
    () => (get$1(vision), get$1(metahuman)),
    () => {
      set(vision, [
        {
          label: localize(get$1(vision).type),
          value: get$1(metahuman).vision.type
        },
        {
          label: localize(get$1(vision).description),
          value: get$1(metahuman).vision.description
        },
        {
          label: localize(get$1(vision).rules),
          value: get$1(metahuman).vision.rules
        }
      ]);
    }
  );
  legacy_pre_effect_reset();
  init();
  var div = root$4();
  var div_1 = child(div);
  var div_2 = child(div_1);
  var div_3 = sibling(child(div_2), 2);
  var div_4 = child(div_3);
  var img = child(div_4);
  var event_handler = /* @__PURE__ */ derived(() => openFilePicker(item()));
  var input = sibling(div_4, 2);
  var div_5 = sibling(input, 2);
  var div_6 = sibling(child(div_5), 2);
  var select = child(div_6);
  template_effect(() => {
    get$1(system);
    invalidate_inner_signals(() => {
      item();
    });
  });
  each(select, 4, () => ["C", "D", "E"], index, ($$anchor2, priority) => {
    var option = root_1$2();
    var option_value = {};
    var text = child(option);
    template_effect(() => {
      if (option_value !== (option_value = priority)) {
        option.value = null == (option.__value = priority) ? "" : priority;
      }
      set_text(text, priority);
    });
    append($$anchor2, option);
  });
  var div_7 = sibling(div_1, 2);
  var div_8 = child(div_7);
  var div_9 = sibling(child(div_8), 2);
  var h3 = child(div_9);
  var text_1 = child(h3);
  var div_10 = sibling(h3, 2);
  each(div_10, 5, () => get$1(agerange), index, ($$anchor2, entry) => {
    var div_11 = root_2$2();
    var div_12 = child(div_11);
    var h4 = child(div_12);
    var text_2 = child(h4);
    var div_13 = sibling(div_12, 2);
    var input_1 = child(div_13);
    template_effect(() => {
      set_text(text_2, get$1(entry).label);
      set_value(input_1, get$1(entry).value);
    });
    append($$anchor2, div_11);
  });
  var div_14 = sibling(div_7, 2);
  var div_15 = child(div_14);
  var div_16 = sibling(child(div_15), 2);
  var h3_1 = child(div_16);
  var text_3 = child(h3_1);
  var div_17 = sibling(h3_1, 2);
  each(div_17, 5, () => get$1(height), index, ($$anchor2, entry) => {
    var div_18 = root_3$2();
    var div_19 = child(div_18);
    var h4_1 = child(div_19);
    var text_4 = child(h4_1);
    var div_20 = sibling(div_19, 2);
    var input_2 = child(div_20);
    template_effect(() => {
      set_text(text_4, get$1(entry).label);
      set_value(input_2, get$1(entry).value);
    });
    append($$anchor2, div_18);
  });
  var div_21 = sibling(div_14, 2);
  var div_22 = child(div_21);
  var div_23 = sibling(child(div_22), 2);
  var h3_2 = child(div_23);
  var text_5 = child(h3_2);
  var div_24 = sibling(h3_2, 2);
  each(div_24, 5, () => get$1(weight), index, ($$anchor2, entry) => {
    var div_25 = root_4$1();
    var div_26 = child(div_25);
    var h4_2 = child(div_26);
    var text_6 = child(h4_2);
    var div_27 = sibling(div_26, 2);
    var input_3 = child(div_27);
    template_effect(() => {
      set_text(text_6, get$1(entry).label);
      set_value(input_3, get$1(entry).value);
    });
    append($$anchor2, div_25);
  });
  var div_28 = sibling(div_21, 2);
  var div_29 = child(div_28);
  var div_30 = sibling(child(div_29), 2);
  var h3_3 = child(div_30);
  var text_7 = child(h3_3);
  var div_31 = sibling(h3_3, 2);
  var div_32 = child(div_31);
  each(div_32, 5, () => get$1(attributeModifiers), index, ($$anchor2, entry) => {
    var div_33 = root_5$1();
    var div_34 = child(div_33);
    var h4_3 = child(div_34);
    var text_8 = child(h4_3);
    var div_35 = sibling(div_34, 2);
    var input_4 = child(div_35);
    template_effect(() => {
      set_text(text_8, get$1(entry).label);
      set_value(input_4, get$1(entry).value);
    });
    append($$anchor2, div_33);
  });
  var div_36 = sibling(div_28, 2);
  var div_37 = child(div_36);
  var div_38 = sibling(child(div_37), 2);
  var h3_4 = child(div_38);
  var text_9 = child(h3_4);
  var div_39 = sibling(h3_4, 2);
  each(div_39, 5, () => get$1(attributeLimits), index, ($$anchor2, entry) => {
    var div_40 = root_6();
    var div_41 = child(div_40);
    var h4_4 = child(div_41);
    var text_10 = child(h4_4);
    var div_42 = sibling(div_41, 2);
    var input_5 = child(div_42);
    template_effect(() => {
      set_text(text_10, get$1(entry).label);
      set_value(input_5, get$1(entry).value);
    });
    append($$anchor2, div_40);
  });
  var div_43 = sibling(div_36, 2);
  var div_44 = child(div_43);
  var div_45 = sibling(child(div_44), 2);
  var h3_5 = child(div_45);
  var text_11 = child(h3_5);
  var div_46 = sibling(h3_5, 2);
  each(div_46, 5, () => get$1(movement), index, ($$anchor2, entry) => {
    var div_47 = root_7();
    var div_48 = child(div_47);
    var h4_5 = child(div_48);
    var text_12 = child(h4_5);
    var div_49 = sibling(div_48, 2);
    var input_6 = child(div_49);
    template_effect(() => {
      set_text(text_12, get$1(entry).label);
      set_value(input_6, get$1(entry).value);
    });
    append($$anchor2, div_47);
  });
  var div_50 = sibling(div_43, 2);
  var div_51 = child(div_50);
  var div_52 = sibling(child(div_51), 2);
  var h3_6 = child(div_52);
  var text_13 = child(h3_6);
  var div_53 = sibling(h3_6, 2);
  each(div_53, 5, () => get$1(karma), index, ($$anchor2, entry) => {
    var div_54 = root_8();
    var div_55 = child(div_54);
    var h4_6 = child(div_55);
    var text_14 = child(h4_6);
    var div_56 = sibling(div_55, 2);
    var input_7 = child(div_56);
    template_effect(() => {
      set_text(text_14, get$1(entry).label);
      set_value(input_7, get$1(entry).value);
    });
    append($$anchor2, div_54);
  });
  var div_57 = sibling(div_50, 2);
  var div_58 = child(div_57);
  var div_59 = sibling(child(div_58), 2);
  var h3_7 = child(div_59);
  var text_15 = child(h3_7);
  var div_60 = sibling(h3_7, 2);
  each(div_60, 5, () => get$1(vision), index, ($$anchor2, entry) => {
    var div_61 = root_9();
    var div_62 = child(div_61);
    var h4_7 = child(div_62);
    var text_16 = child(h4_7);
    var div_63 = sibling(div_62, 2);
    var input_8 = child(div_63);
    template_effect(() => {
      set_text(text_16, get$1(entry).label);
      set_value(input_8, get$1(entry).value);
    });
    append($$anchor2, div_61);
  });
  var div_64 = sibling(div_57, 2);
  var div_65 = child(div_64);
  var node = sibling(child(div_65), 2);
  Editor(node, {
    get document() {
      return item();
    },
    editable: true,
    get owner() {
      return item().isOwner;
    }
  });
  template_effect(
    ($0, $1, $2, $3, $4, $5, $6, $7) => {
      set_attribute(img, "src", item().img);
      set_attribute(img, "title", item().name);
      set_attribute(img, "alt", item().name);
      set_text(text_1, $0);
      set_text(text_3, $1);
      set_text(text_5, $2);
      set_text(text_7, $3);
      set_text(text_9, $4);
      set_text(text_11, $5);
      set_text(text_13, $6);
      set_text(text_15, $7);
    },
    [
      () => localize(traits.agerange),
      () => localize(traits.height),
      () => localize(traits.weight),
      () => localize(attributes.modifiers),
      () => localize(attributes.limits),
      () => localize(config().movement.movement),
      () => localize(config().karma.karma),
      () => localize(config().vision.vision)
    ],
    derived_safe_equal
  );
  event("click", img, function(...$$args) {
    var _a;
    (_a = get$1(event_handler)) == null ? void 0 : _a.apply(this, $$args);
  });
  bind_value(input, () => item().name, ($$value) => item(item().name = $$value, true));
  event("change", input, (e) => item().update({ name: e.target.value }));
  bind_select_value(select, () => get$1(system).priority, ($$value) => mutate(system, get$1(system).priority = $$value));
  event("change", select, (e) => item().update({ "system.priority": e.target.value }));
  append($$anchor, div);
  pop();
}
const sr3e = {};
sr3e.attributes = {
  body: "sr3e.attributes.body",
  quickness: "sr3e.attributes.quickness",
  strength: "sr3e.attributes.strength",
  charisma: "sr3e.attributes.charisma",
  intelligence: "sr3e.attributes.intelligence",
  willpower: "sr3e.attributes.willpower",
  reaction: "sr3e.attributes.reaction",
  initiative: "sr3e.attributes.initiative",
  modifiers: "sr3e.attributes.modifiers",
  limits: "sr3e.attributes.limits"
};
sr3e.common = {
  max: "sr3e.common.max",
  min: "sr3e.common.min",
  average: "sr3e.common.average",
  description: "sr3e.common.description",
  priority: "sr3e.common.priority"
};
sr3e.dicepools = {
  dicepools: "sr3e.dicepools.dicepools",
  combat: "sr3e.dicepools.combat",
  magic: "sr3e.dicepools.magic",
  hacking: "sr3e.dicepools.hacking",
  astral: "sr3e.dicepools.astral",
  control: "sr3e.dicepools.control"
};
sr3e.karma = {
  karma: "sr3e.karma.karma",
  goodKarma: "sr3e.karma.goodKarma",
  karmaPool: "sr3e.karma.karmaPool",
  advancementRatio: "sr3e.karma.advancementRatio"
};
sr3e.movement = {
  movement: "sr3e.movement.movement",
  walking: "sr3e.movement.walking",
  running: "sr3e.movement.running",
  runSpeedModifier: "sr3e.movement.runSpeedModifier"
};
sr3e.sheet = {
  details: "sr3e.sheet.details",
  viewbackground: "sr3e.sheet.viewbackground"
};
sr3e.traits = {
  age: "sr3e.traits.age",
  height: "sr3e.traits.height",
  weight: "sr3e.traits.weight",
  agerange: "sr3e.traits.agerange",
  metahuman: "sr3e.traits.metahuman"
};
sr3e.vision = {
  vision: "sr3e.vision.vision",
  type: "sr3e.vision.type",
  description: "sr3e.vision.description",
  rules: "sr3e.vision.rules"
};
const hooks = {
  renderCharacterActorSheet: "renderCharacterActorSheet",
  closeCharacterActorSheet: "closeCharacterActorSheet",
  renderMetahumanItemSheet: "renderMetahumanItemSheet",
  closeMetahumanItemSheet: "closeMetahumanItemSheet",
  preCreateActor: "preCreateActor",
  createActor: "createActor",
  init: "init",
  ready: "ready"
};
const flags = {
  sr3e: "sr3e",
  actor: {
    isDossierDetailsOpen: "isDossierDetailsOpen"
  }
};
function getResizeObserver(masonryInstance, gridElement, func = null) {
  gridElement.masonryInstance = masonryInstance;
  const resizeObserver = new ResizeObserver(() => {
    if (func) {
      func();
    }
    masonryInstance.layout();
    masonryInstance.options.transitionDuration = "0.4s";
  });
  resizeObserver.observe(gridElement);
  resizeObserver.masonryInstance = masonryInstance;
  resizeObserver.masonryInstance.layout();
  resizeObserver.masonryInstance.options.transitionDuration = "0";
  return resizeObserver;
}
function observeMasonryResize(masonryResizeConfig, isMainGrid = false) {
  const {
    jQueryObject,
    // The jQuery object representing the sheet
    parentSelector,
    childSelector,
    gridSizerSelector,
    gutterSizerSelector,
    app
  } = masonryResizeConfig;
  const $grid = jQueryObject.find(parentSelector);
  Log.info("Grid", observeMasonryResize.name, $grid);
  masonryResizeConfig.grid = $grid;
  const rawGrid = $grid[0];
  if (!rawGrid) {
    Log.warn("No matching grid found in jQuery object", observeMasonryResize.name);
    return;
  }
  if (!rawGrid.masonryInstance) {
    const masonryInstance = new Masonry(rawGrid, {
      itemSelector: childSelector,
      columnWidth: gridSizerSelector,
      gutter: gutterSizerSelector,
      fitWidth: true
    });
    rawGrid.masonryInstance = masonryInstance;
    if (isMainGrid) {
      masonryInstance.on("layoutComplete", function() {
      });
    }
    let resizeHandler = () => {
      adjustMasonryOnResize(masonryResizeConfig);
    };
    if (isMainGrid) {
      resizeHandler = () => {
        adjustMasonryOnResize(masonryResizeConfig);
        layoutStateMachine(app, $grid);
      };
    }
    masonryResizeConfig.observer = getResizeObserver(masonryInstance, rawGrid, resizeHandler);
  }
  rawGrid.masonryInstance.layout();
  Log.success("Masonry Resize Observer Initialized", observeMasonryResize.name, masonryResizeConfig.observer);
  return masonryResizeConfig.observer;
}
function adjustMasonryOnResize(masonryResizeConfig) {
  const { grid, childSelector, gridSizerSelector, gutterSizerSelector } = masonryResizeConfig;
  if (!grid || !grid.length) return;
  const $gridItems = grid.find(childSelector);
  const $gridSizer = grid.find(gridSizerSelector);
  const $gutter = grid.find(gutterSizerSelector);
  if (!$gridSizer.length || !$gridItems.length) return;
  const rawGrid = grid[0];
  const rawSizer = $gridSizer[0];
  const rawGutter = $gutter[0];
  const parentPadding = parseFloat(getComputedStyle(rawGrid.parentNode).paddingLeft) || 0;
  const gridWidthPx = rawGrid.parentNode.offsetWidth - 2 * parentPadding;
  const gutterPx = parseFloat(getComputedStyle(rawGutter).width);
  const minItemWidthPx = parseFloat(getComputedStyle($gridItems[0]).minWidth);
  let columnCount = Math.floor((gridWidthPx + gutterPx) / (minItemWidthPx + gutterPx));
  columnCount = Math.max(columnCount, 1);
  const totalGutterWidthPx = gutterPx * (columnCount - 1);
  const itemWidthPx = (gridWidthPx - totalGutterWidthPx) / columnCount;
  const adjustedItemWidthPx = Math.floor(itemWidthPx);
  $gridItems.toArray().forEach((item) => {
    item.style.width = `${adjustedItemWidthPx}px`;
  });
  rawSizer.style.width = `${adjustedItemWidthPx}px`;
  if (rawGrid.masonryInstance) {
    rawGrid.masonryInstance.layout();
  }
}
function layoutStateMachine(app, $html) {
  var _a;
  const sheetWidth = ((_a = app.position) == null ? void 0 : _a.width) || 1400;
  const maxWidth = 1400;
  const lowerLimit = 0.5 * maxWidth;
  const middleLimit = 0.66 * maxWidth;
  let layoutState = "small";
  if (sheetWidth > middleLimit) {
    layoutState = "wide";
  } else if (sheetWidth > lowerLimit) {
    layoutState = "medium";
  }
  const columnWidthPercent = { small: 100, medium: 50, wide: 25 };
  const columnWidth = columnWidthPercent[layoutState];
  const rawHtml = $html[0];
  rawHtml.style.setProperty("--column-width", `${columnWidth}%`);
  const $twoSpan = $html.find(".two-span-selectable");
  const $threeSpan = $html.find(".three-span-selectable");
  const twoSpanArray = $twoSpan.toArray();
  const threeSpanArray = $threeSpan.toArray();
  switch (layoutState) {
    case "small":
      twoSpanArray.forEach((c) => c.style.width = `var(--column-width)`);
      threeSpanArray.forEach((c) => c.style.width = `var(--column-width)`);
      break;
    case "medium":
      twoSpanArray.forEach((c) => c.style.width = `calc(2 * var(--column-width) - 10px)`);
      threeSpanArray.forEach((c) => c.style.width = `var(--column-width)`);
      break;
    case "wide":
      twoSpanArray.forEach((c) => c.style.width = `calc(2 * var(--column-width) - 10px)`);
      threeSpanArray.forEach((c) => c.style.width = `calc(3 * var(--column-width) - 20px)`);
      break;
  }
}
function initializeMasonryLayout(masonryResizeConfig) {
  const actor = masonryResizeConfig.app.actor;
  if (actor.mainLayoutResizeObserver) {
    const rawGrid = actor.mainLayoutResizeObserver.masonryInstance.element;
    if (rawGrid.masonryInstance) {
      rawGrid.masonryInstance = null;
    }
    actor.mainLayoutResizeObserver.masonryInstance.destroy();
    actor.mainLayoutResizeObserver.disconnect();
    actor.mainLayoutResizeObserver = null;
  }
  actor.mainLayoutResizeObserver = observeMasonryResize(masonryResizeConfig, true);
}
function cubic_out(t) {
  const f = t - 1;
  return f * f * f + 1;
}
function slide(node, { delay = 0, duration = 400, easing = cubic_out, axis = "y" } = {}) {
  const style = getComputedStyle(node);
  const opacity = +style.opacity;
  const primary_property = axis === "y" ? "height" : "width";
  const primary_property_value = parseFloat(style[primary_property]);
  const secondary_properties = axis === "y" ? ["top", "bottom"] : ["left", "right"];
  const capitalized_secondary_properties = secondary_properties.map(
    (e) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${e[0].toUpperCase()}${e.slice(1)}`
    )
  );
  const padding_start_value = parseFloat(style[`padding${capitalized_secondary_properties[0]}`]);
  const padding_end_value = parseFloat(style[`padding${capitalized_secondary_properties[1]}`]);
  const margin_start_value = parseFloat(style[`margin${capitalized_secondary_properties[0]}`]);
  const margin_end_value = parseFloat(style[`margin${capitalized_secondary_properties[1]}`]);
  const border_width_start_value = parseFloat(
    style[`border${capitalized_secondary_properties[0]}Width`]
  );
  const border_width_end_value = parseFloat(
    style[`border${capitalized_secondary_properties[1]}Width`]
  );
  return {
    delay,
    duration,
    easing,
    css: (t) => `overflow: hidden;opacity: ${Math.min(t * 20, 1) * opacity};${primary_property}: ${t * primary_property_value}px;padding-${secondary_properties[0]}: ${t * padding_start_value}px;padding-${secondary_properties[1]}: ${t * padding_end_value}px;margin-${secondary_properties[0]}: ${t * margin_start_value}px;margin-${secondary_properties[1]}: ${t * margin_end_value}px;border-${secondary_properties[0]}-width: ${t * border_width_start_value}px;border-${secondary_properties[1]}-width: ${t * border_width_end_value}px;min-${primary_property}: 0`
  };
}
const actorStores = /* @__PURE__ */ new Map();
function getActorStore(actorId, actorName) {
  let initialState = { name: actorName };
  if (!actorStores.has(actorId)) {
    actorStores.set(actorId, writable(initialState));
  }
  return actorStores.get(actorId);
}
var root_1$1 = /* @__PURE__ */ template(`<div class="version-one image-mask"><img alt="Metahuman Portrait"></div>`);
var root_2$1 = /* @__PURE__ */ template(`<div class="version-two image-mask"><img role="presentation" data-edit="img"></div>`);
var root_3$1 = /* @__PURE__ */ template(`<div><div><input type="text" id="actor-name" name="name"></div> <div><h3> <span> </span></h3></div> <div><h3> </h3></div> <div><h3> </h3></div> <div><h3> </h3></div> <a class="journal-entry-link"><h3> </h3></a></div>`);
var root$3 = /* @__PURE__ */ template(`<div class="dossier"><!> <details class="dossier-details"><summary class="details-foldout"><span><i class="fa-solid fa-magnifying-glass"></i></span> </summary> <!></details></div>`);
function Dossier($$anchor, $$props) {
  push($$props, false);
  const [$$stores, $$cleanup] = setup_stores();
  const $actorStore = () => store_get(actorStore, "$actorStore", $$stores);
  const isDetailsOpen = mutable_state();
  const fieldName = mutable_state();
  let actor = prop($$props, "actor", 24, () => ({}));
  let config = prop($$props, "config", 24, () => ({}));
  const actorStore = getActorStore(actor().id, actor().name);
  onMount(() => {
    set(isDetailsOpen, actor().system.profile.isDetailsOpen);
    Log.inspect("Dossier actor", "SVELTE", actor());
  });
  function toggleDetails() {
    actor().update(
      {
        "system.profile.isDetailsOpen": get$1(isDetailsOpen)
      },
      { render: false }
    );
    actor().mainLayoutResizeObserver.masonryInstance.layout();
  }
  const localize2 = (args) => game.i18n.localize(args);
  function saveActorName(event2) {
    const newName = event2.target.value;
    actor().update({ name: newName }, { render: true });
  }
  function multiply(value, factor) {
    return (value * factor).toFixed(2);
  }
  function cubicInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function updateStoreName(newName) {
    actorStore.update((store) => {
      store.name = newName;
      return store;
    });
  }
  legacy_pre_effect(() => deep_read_state(actor()), () => {
    set(isDetailsOpen, actor().system.profile.isDetailsOpen);
  });
  legacy_pre_effect(() => $actorStore(), () => {
    set(fieldName, $actorStore().name);
  });
  legacy_pre_effect_reset();
  init();
  var div = root$3();
  var node = child(div);
  {
    var consequent = ($$anchor2) => {
      var div_1 = root_1$1();
      append($$anchor2, div_1);
    };
    var alternate = ($$anchor2) => {
      var div_2 = root_2$1();
      var img = child(div_2);
      var event_handler = /* @__PURE__ */ derived(() => openFilePicker(document));
      template_effect(() => {
        set_attribute(img, "src", actor().img);
        set_attribute(img, "alt", actor().name);
        set_attribute(img, "title", actor().name);
      });
      event("click", img, function(...$$args) {
        var _a;
        (_a = get$1(event_handler)) == null ? void 0 : _a.apply(this, $$args);
      });
      append($$anchor2, div_2);
    };
    if_block(node, ($$render) => {
      if (get$1(isDetailsOpen)) $$render(consequent);
      else $$render(alternate, false);
    });
  }
  var details = sibling(node, 2);
  var summary = child(details);
  var text = sibling(child(summary));
  var node_1 = sibling(summary, 2);
  {
    var consequent_1 = ($$anchor2) => {
      var div_3 = root_3$1();
      var div_4 = child(div_3);
      var input = child(div_4);
      var div_5 = sibling(div_4, 2);
      var h3 = child(div_5);
      var text_1 = child(h3);
      var span = sibling(text_1);
      var text_2 = child(span);
      var div_6 = sibling(div_5, 2);
      var h3_1 = child(div_6);
      var text_3 = child(h3_1);
      var div_7 = sibling(div_6, 2);
      var h3_2 = child(div_7);
      var text_4 = child(h3_2);
      var div_8 = sibling(div_7, 2);
      var h3_3 = child(div_8);
      var text_5 = child(h3_3);
      var a = sibling(div_8, 2);
      var h3_4 = child(a);
      var text_6 = child(h3_4);
      template_effect(
        ($0, $1, $2, $3, $4, $5, $6) => {
          set_text(text_1, `${$0 ?? ""}: `);
          set_text(text_2, actor().system.profile.metaHumanity);
          set_text(text_3, `${$1 ?? ""}: ${actor().system.profile.age ?? ""}`);
          set_text(text_4, `${$2 ?? ""}: ${actor().system.profile.height ?? ""} cm (${$3 ?? ""} feet)`);
          set_text(text_5, `${$4 ?? ""}: ${actor().system.profile.weight ?? ""} kg (${$5 ?? ""} stones)`);
          set_text(text_6, $6);
        },
        [
          () => localize2(config().actor.character.metahuman),
          () => localize2(config().actor.character.age),
          () => localize2(config().actor.character.height),
          () => multiply(actor().system.profile.height, 0.0328084),
          () => localize2(config().actor.character.weight),
          () => multiply(actor().system.profile.weight, 0.157473),
          () => localize2(config().sheet.viewbackground)
        ],
        derived_safe_equal
      );
      bind_value(input, () => get$1(fieldName), ($$value) => set(fieldName, $$value));
      event("blur", input, saveActorName);
      event("input", input, (e) => updateStoreName(e.target.value));
      event("keypress", input, (e) => e.key === "Enter" && saveActorName(e));
      transition(1, div_3, () => slide, () => ({ duration: 400, easing: cubicInOut }));
      transition(2, div_3, () => slide, () => ({ duration: 300, easing: cubicInOut }));
      append($$anchor2, div_3);
    };
    if_block(node_1, ($$render) => {
      if (get$1(isDetailsOpen)) $$render(consequent_1);
    });
  }
  template_effect(($0) => set_text(text, ` ${$0 ?? ""}`), [() => localize2(config().sheet.details)], derived_safe_equal);
  bind_property("open", "toggle", details, ($$value) => set(isDetailsOpen, $$value), () => get$1(isDetailsOpen));
  event("toggle", details, toggleDetails);
  append($$anchor, div);
  pop();
  $$cleanup();
}
var root$2 = /* @__PURE__ */ template(`<div class="sheet-character-masonry-main"><div class="layout-grid-sizer"></div> <div class="layout-gutter-sizer"></div> <div class="sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background"><!></div></div></div> <div class="sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background">Testing Databind</div></div></div> <div class="sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background">Testing Databind</div></div></div> <div class="sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background">Testing Databind</div></div></div> <div class="sheet-component two-span-selectable"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background">Testing Databind</div></div></div> <div class="sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background">Testing Databind</div></div></div> <div class="sheet-component two-span-selectable"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background">Testing Databind</div></div></div> <div class="sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background">Testing Databind</div></div></div> <div class="sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background">Testing Databind</div></div></div> <div class="sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background">Testing Databind</div></div></div></div>`);
function CharacterSheetApp($$anchor, $$props) {
  push($$props, true);
  let actor = $$props.app.actor;
  onMount(() => {
    const args = {
      jQueryObject: $$props.jQueryObject,
      parentSelector: ".window-content",
      childSelector: ".sheet-component",
      gridSizerSelector: ".layout-grid-sizer",
      gutterSizerSelector: ".layout-gutter-sizer",
      observer: actor.mainLayoutResizeObserver,
      app: $$props.app
    };
    initializeMasonryLayout(args);
    Log.success("Masonry layout initialized", "CharacterSheetApp.svelte");
  });
  var div = root$2();
  var div_1 = sibling(child(div), 4);
  var div_2 = child(div_1);
  var div_3 = sibling(child(div_2), 2);
  var node = child(div_3);
  Dossier(node, {
    actor,
    get config() {
      return $$props.config;
    }
  });
  append($$anchor, div);
  pop();
}
var root$1 = /* @__PURE__ */ template(`<div class="neon-name"><!></div>`);
function NeonName($$anchor, $$props) {
  push($$props, false);
  const [$$stores, $$cleanup] = setup_stores();
  const $actorStore = () => store_get(actorStore, "$actorStore", $$stores);
  const name = mutable_state();
  let actor = prop($$props, "actor", 8);
  let malfunctioningIndexes = [];
  let neonHTML = mutable_state();
  const actorStore = getActorStore(actor().id, actor().name);
  const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  function getNeonHtml(name2) {
    malfunctioningIndexes = [];
    if (name2.length < 4) {
      malfunctioningIndexes.push(randomInRange(0, name2.length - 1));
    } else {
      const malfunctionInNplaces = name2.length % 4;
      for (let i = 0; i < malfunctionInNplaces; i++) {
        let index2;
        do {
          index2 = randomInRange(0, name2.length - 1);
        } while (malfunctioningIndexes.includes(index2));
        malfunctioningIndexes.push(index2);
      }
    }
    return [...name2].map((char, index2) => malfunctioningIndexes.includes(index2) ? `<div class="malfunc">${char}</div>` : `<div>${char}</div>`).join("");
  }
  legacy_pre_effect(() => $actorStore(), () => {
    set(name, $actorStore().name);
  });
  legacy_pre_effect(() => get$1(name), () => {
    set(neonHTML, getNeonHtml(get$1(name)));
  });
  legacy_pre_effect_reset();
  init();
  var div = root$1();
  var node = child(div);
  html(node, () => get$1(neonHTML));
  append($$anchor, div);
  pop();
  $$cleanup();
}
function initMainMasonryGrid(app, html2, data) {
  if (app.svelteApp) {
    unmount(app.svelteApp);
  }
  if (app.neonInjection) {
    unmount(app.neonInjection);
  }
  _initSheet(app);
  _injectNeonName(app);
}
function _initSheet(app) {
  const container = app.element[0].querySelector(".window-content");
  container.innerHTML = "";
  app.svelteApp = mount(CharacterSheetApp, {
    target: container,
    props: {
      app,
      config: CONFIG.sr3e,
      jQueryObject: app.element
    }
  });
  Log.success("Svelte App Initialized", CharacterActorSheet.name);
}
function _injectNeonName(app) {
  const header = app.element[0].querySelector("header.window-header");
  const placeholder = document.createElement("div");
  placeholder.classList.add("neon-name-position");
  header.insertAdjacentElement("afterend", placeholder);
  app.neonInjection = mount(NeonName, {
    target: placeholder,
    props: {
      actor: app.actor
    }
  });
  Log.success("Neon Name Initialized", CharacterActorSheet.name);
}
function closeMainMasonryGrid(app) {
  if (app.svelteApp) {
    app.actor.mainLayoutResizeObserver.disconnect();
    app.actor.mainLayoutResizeObserver = null;
    Log.success("Masonry observer disconnected.", CharacterActorSheet.name);
    unmount(app.svelteApp);
    console.info("Svelte App Destroyed.", CharacterActorSheet.name);
  }
}
class ItemDataService {
  static getDefaultHumanItem() {
    return {
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
    };
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
var root_1 = /* @__PURE__ */ template(`<option> </option>`);
var root_2 = /* @__PURE__ */ template(`<option> </option>`);
var root_3 = /* @__PURE__ */ template(`<option> </option>`);
var root_4 = /* @__PURE__ */ template(`<option> </option>`);
var root_5 = /* @__PURE__ */ template(`<option> </option>`);
var root = /* @__PURE__ */ template(`<div class="meta-human-grid"><div class="item-sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background"><div class="image-mask"><img data-edit="img" role="presentation"></div> <input class="large" name="name" type="text"></div></div></div> <div class="item-sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background"><div class="image-mask"><img data-edit="img" role="presentation"></div> <div><h1>Placeholder</h1></div></div></div></div> <div class="item-sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background"><h1>Sliders</h1> <h3> </h3> <input type="range" step="1"> <h3> </h3> <input type="range" step="1"> <h3> </h3> <input type="range" step="1"></div></div></div> <div class="item-sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background"><h1>Multi Selections</h1> <select id="metahuman"><option selected>Localize Select</option><!></select> <select id="magic"><option selected>Localize Select</option><!></select> <select id="attributePoints"><option selected>Localize Select</option><!></select> <select id="skillPoints"><option selected>Localize Select</option><!></select> <select id="nuyen"><option selected>Localize Select</option><!></select></div></div></div> <div class="item-sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background"><h1>Randomize</h1></div></div></div> <div class="item-sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background"><h1>Randomize</h1></div></div></div> <div class="item-sheet-component"><div class="inner-background-container"><div class="fake-shadow"></div> <div class="inner-background"><h1>Buttons</h1> <div class="stat-grid"><button class="my-button" aria-label="Random"><span><i class="fa-solid fa-shuffle"></i></span></button> <button class="my-button" aria-label="Mix"><span><i class="fa-solid fa-rotate-right"></i></span></button> <button class="my-button">Ok</button> <button class="my-button">Cancel</button></div></div></div></div></div>`);
function CharacterCreation($$anchor, $$props) {
  push($$props, false);
  const age = mutable_state();
  const ageMin = mutable_state();
  const ageMax = mutable_state();
  const height = mutable_state();
  const heightMin = mutable_state();
  const heightMax = mutable_state();
  const weight = mutable_state();
  const weightMin = mutable_state();
  const weightMax = mutable_state();
  prop($$props, "resolve", 24, () => ({}));
  let actor = prop($$props, "actor", 28, () => ({}));
  let metahumanImg = mutable_state("");
  let metahumans = mutable_state([]);
  let magics = mutable_state([]);
  let attributePointCollection = [
    { priority: "A", points: 30 },
    { priority: "B", points: 27 },
    { priority: "C", points: 24 },
    { priority: "D", points: 21 },
    { priority: "E", points: 18 }
  ];
  let skillPointCollection = [
    { priority: "A", points: 50 },
    { priority: "B", points: 40 },
    { priority: "C", points: 34 },
    { priority: "D", points: 30 },
    { priority: "E", points: 27 }
  ];
  let assets = [
    { priority: "A", points: 1e6 },
    { priority: "B", points: 4e5 },
    { priority: "C", points: 9e4 },
    { priority: "D", points: 2e4 },
    { priority: "E", points: 5e3 }
  ];
  let img = mutable_state("");
  let metahumanSelection = mutable_state("");
  let magicSelection = mutable_state("");
  let attributePoints = mutable_state(0);
  let skillPoints = mutable_state(0);
  let nuyen = mutable_state(0);
  onMount(async () => {
    var _a;
    set(metahumans, game.items.filter((item) => item.type === "metahuman"));
    if (get$1(metahumans).length === 0) {
      const humanItem = ItemDataService.getDefaultHumanItem();
      Item.create(humanItem);
      set(metahumans, game.items.filter((item) => item.type === "metahuman"));
    }
    set(magics, game.items.filter((item) => item.type === "magic"));
    if (get$1(magics).length === 0) {
      const magicItem = ItemDataService.getDefaultMagic();
      Item.create(magicItem);
      set(magics, game.items.filter((item) => item.type === "magic"));
    }
    set(metahumanImg, (_a = get$1(metahumans).find((item) => item.name.toLowerCase() === "human")) == null ? void 0 : _a.img);
    set(img, actor().img);
  });
  function currency(number) {
    return `¥${number.toLocaleString()}`;
  }
  legacy_pre_effect(() => deep_read_state(actor()), () => {
    actor(actor());
  });
  legacy_pre_effect(() => deep_read_state(actor()), () => {
    set(age, actor().system.profile.age);
  });
  legacy_pre_effect(() => {
  }, () => {
    set(ageMin, 0);
  });
  legacy_pre_effect(() => {
  }, () => {
    set(ageMax, 100);
  });
  legacy_pre_effect(() => deep_read_state(actor()), () => {
    set(height, actor().system.profile.height);
  });
  legacy_pre_effect(() => {
  }, () => {
    set(heightMin, 70);
  });
  legacy_pre_effect(() => {
  }, () => {
    set(heightMax, 220);
  });
  legacy_pre_effect(() => deep_read_state(actor()), () => {
    set(weight, actor().system.profile.weight);
  });
  legacy_pre_effect(() => {
  }, () => {
    set(weightMin, 30);
  });
  legacy_pre_effect(() => {
  }, () => {
    set(weightMax, 250);
  });
  legacy_pre_effect_reset();
  init();
  var div = root();
  var div_1 = child(div);
  var div_2 = child(div_1);
  var div_3 = sibling(child(div_2), 2);
  var div_4 = child(div_3);
  var img_1 = child(div_4);
  var input = sibling(div_4, 2);
  var div_5 = sibling(div_1, 2);
  var div_6 = child(div_5);
  var div_7 = sibling(child(div_6), 2);
  var div_8 = child(div_7);
  var img_2 = child(div_8);
  var div_9 = sibling(div_5, 2);
  var div_10 = child(div_9);
  var div_11 = sibling(child(div_10), 2);
  var h3 = sibling(child(div_11), 2);
  var text = child(h3);
  var input_1 = sibling(h3, 2);
  var h3_1 = sibling(input_1, 2);
  var text_1 = child(h3_1);
  var input_2 = sibling(h3_1, 2);
  var h3_2 = sibling(input_2, 2);
  var text_2 = child(h3_2);
  var input_3 = sibling(h3_2, 2);
  var div_12 = sibling(div_9, 2);
  var div_13 = child(div_12);
  var div_14 = sibling(child(div_13), 2);
  var select = sibling(child(div_14), 2);
  template_effect(() => {
    get$1(metahumanSelection);
    invalidate_inner_signals(() => {
      get$1(metahumanImg);
      game;
      get$1(metahumans);
    });
  });
  var option = child(select);
  option.value = null == (option.__value = "") ? "" : "";
  var node = sibling(option);
  each(node, 1, () => get$1(metahumans), index, ($$anchor2, metahuman) => {
    var option_1 = root_1();
    var option_1_value = {};
    var text_3 = child(option_1);
    template_effect(() => {
      if (option_1_value !== (option_1_value = get$1(metahuman).id)) {
        option_1.value = null == (option_1.__value = get$1(metahuman).id) ? "" : get$1(metahuman).id;
      }
      set_text(text_3, `${get$1(metahuman).name ?? ""} ${get$1(metahuman).system.priority ?? ""}`);
    });
    append($$anchor2, option_1);
  });
  var select_1 = sibling(select, 2);
  template_effect(() => {
    get$1(magicSelection);
    invalidate_inner_signals(() => {
      get$1(magics);
    });
  });
  var option_2 = child(select_1);
  option_2.value = null == (option_2.__value = "") ? "" : "";
  var node_1 = sibling(option_2);
  each(node_1, 1, () => get$1(magics), index, ($$anchor2, magic) => {
    var option_3 = root_2();
    var option_3_value = {};
    var text_4 = child(option_3);
    template_effect(() => {
      if (option_3_value !== (option_3_value = get$1(magic).id)) {
        option_3.value = null == (option_3.__value = get$1(magic).id) ? "" : get$1(magic).id;
      }
      set_text(text_4, `${get$1(magic).name ?? ""} ${get$1(magic).system.priority ?? ""}`);
    });
    append($$anchor2, option_3);
  });
  var select_2 = sibling(select_1, 2);
  template_effect(() => {
    get$1(attributePoints);
    invalidate_inner_signals(() => {
    });
  });
  var option_4 = child(select_2);
  option_4.value = null == (option_4.__value = 0) ? "" : 0;
  var node_2 = sibling(option_4);
  each(node_2, 1, () => attributePointCollection, index, ($$anchor2, attribute) => {
    var option_5 = root_3();
    var option_5_value = {};
    var text_5 = child(option_5);
    template_effect(() => {
      if (option_5_value !== (option_5_value = get$1(attribute).points)) {
        option_5.value = null == (option_5.__value = get$1(attribute).points) ? "" : get$1(attribute).points;
      }
      set_text(text_5, `${get$1(attribute).points ?? ""} ${get$1(attribute).priority ?? ""}`);
    });
    append($$anchor2, option_5);
  });
  var select_3 = sibling(select_2, 2);
  template_effect(() => {
    get$1(skillPoints);
    invalidate_inner_signals(() => {
    });
  });
  var option_6 = child(select_3);
  option_6.value = null == (option_6.__value = 0) ? "" : 0;
  var node_3 = sibling(option_6);
  each(node_3, 1, () => skillPointCollection, index, ($$anchor2, skill) => {
    var option_7 = root_4();
    var option_7_value = {};
    var text_6 = child(option_7);
    template_effect(() => {
      if (option_7_value !== (option_7_value = get$1(skill).points)) {
        option_7.value = null == (option_7.__value = get$1(skill).points) ? "" : get$1(skill).points;
      }
      set_text(text_6, `${get$1(skill).points ?? ""} ${get$1(skill).priority ?? ""}`);
    });
    append($$anchor2, option_7);
  });
  var select_4 = sibling(select_3, 2);
  template_effect(() => {
    get$1(nuyen);
    invalidate_inner_signals(() => {
    });
  });
  var option_8 = child(select_4);
  option_8.value = null == (option_8.__value = 0) ? "" : 0;
  var node_4 = sibling(option_8);
  each(node_4, 1, () => assets, index, ($$anchor2, asset) => {
    var option_9 = root_5();
    var option_9_value = {};
    var text_7 = child(option_9);
    template_effect(
      ($0) => {
        if (option_9_value !== (option_9_value = get$1(asset).points)) {
          option_9.value = null == (option_9.__value = get$1(asset).points) ? "" : get$1(asset).points;
        }
        set_text(text_7, `${$0 ?? ""} ${get$1(asset).priority ?? ""}`);
      },
      [() => currency(get$1(asset).points)],
      derived_safe_equal
    );
    append($$anchor2, option_9);
  });
  template_effect(() => {
    set_attribute(img_1, "src", get$1(img));
    set_attribute(img_1, "title", actor().name);
    set_attribute(img_1, "alt", actor().name);
    set_attribute(img_2, "src", get$1(metahumanImg));
    set_attribute(img_2, "title", actor().name);
    set_attribute(img_2, "alt", actor().name);
    set_text(text, `Age: ${get$1(age) ?? ""}`);
    set_attribute(input_1, "min", get$1(ageMin));
    set_attribute(input_1, "max", get$1(ageMax));
    set_text(text_1, `Height: ${get$1(height) ?? ""}`);
    set_attribute(input_2, "min", get$1(heightMin));
    set_attribute(input_2, "max", get$1(heightMax));
    set_text(text_2, `Weight: ${get$1(weight) ?? ""}`);
    set_attribute(input_3, "min", get$1(weightMin));
    set_attribute(input_3, "max", get$1(weightMax));
  });
  event("click", img_1, async () => {
    const path = await openFilePicker(actor());
    set(img, path);
  });
  bind_value(input, () => actor().name, ($$value) => actor(actor().name = $$value, true));
  event("change", input, (e) => actor().update({ name: e.target.value }));
  event("keydown", input, (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      actor().update({ name: e.target.value });
    }
  });
  bind_value(input_1, () => get$1(age), ($$value) => set(age, $$value));
  bind_value(input_2, () => get$1(height), ($$value) => set(height, $$value));
  bind_value(input_3, () => get$1(weight), ($$value) => set(weight, $$value));
  bind_select_value(select, () => get$1(metahumanSelection), ($$value) => set(metahumanSelection, $$value));
  event("change", select, (e) => set(metahumanImg, game.items.contents.find((item) => item.type === e.target.value).img));
  bind_select_value(select_1, () => get$1(magicSelection), ($$value) => set(magicSelection, $$value));
  bind_select_value(select_2, () => get$1(attributePoints), ($$value) => set(attributePoints, $$value));
  bind_select_value(select_3, () => get$1(skillPoints), ($$value) => set(skillPoints, $$value));
  bind_select_value(select_4, () => get$1(nuyen), ($$value) => set(nuyen, $$value));
  append($$anchor, div);
  pop();
}
class CharacterCreationDialog extends Dialog {
  constructor(actor, resolve) {
    super({
      title: "Character Creation",
      content: "<p>If this displays, there was an issue with the Svelte component in CharacterCreationDialog.js</p>",
      default: "ok",
      buttons: {
        ok: {
          label: "OK",
          callback: async (html2) => console.log("OK clicked")
        },
        cancel: {
          label: "Cancel",
          callback: () => console.log("Cancel clicked")
        }
      },
      render: (html2) => {
        this.element.addClass("sr3e");
        const container = this.element[0].querySelector(".window-content");
        container.innerHTML = "";
        this.svelteApp = mount(CharacterCreation, {
          target: container,
          props: {
            actor,
            resolve
          }
        });
      }
    });
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: "100%",
      height: "100%",
      left: 200,
      top: 200,
      resizable: false
    });
  }
  /** @override */
  close(options = {}) {
    if (this.svelteApp) {
      unmount(this.svelteApp);
    }
    return super.close(options);
  }
}
async function renderCharacterCreationDialog(actor, options, userId) {
  if (actor.type !== "character") return;
  Log.info("Character Dialog Initiated", "Create Actor Hook");
  const dialogResult = await _showCharacterCreationDialog(actor);
  if (!dialogResult) {
    console.log(`Character creation canceled for actor: ${actor.name}. Deleting actor.`);
    await actor.delete();
    return false;
  }
  actor.sheet.render(true);
  Log.success("Character Dialog Completed", "Create Actor Hook");
}
async function _showCharacterCreationDialog(actor) {
  return new Promise((resolve) => {
    new CharacterCreationDialog(actor, resolve).render(true);
  });
}
function onRenderMetahumanItemSheet(app, html2, data) {
  if (app.svelteApp) {
    unmount(app.svelteApp);
  }
  const container = app.element[0].querySelector(".window-content");
  container.innerHTML = "";
  app.svelteApp = mount(MetahumanApp, {
    target: container,
    props: {
      item: app.item,
      config: CONFIG.sr3e
    }
  });
}
function onCloseMetahumanItemSheet(app, html2, data) {
  if (app.svelteApp) {
    unmount(app.svelteApp);
  }
}
function registerHooks() {
  Hooks.on(hooks.createActor, renderCharacterCreationDialog);
  Hooks.on(hooks.renderCharacterActorSheet, initMainMasonryGrid);
  Hooks.on(hooks.closeCharacterActorSheet, closeMainMasonryGrid);
  Hooks.on(hooks.renderMetahumanItemSheet, onRenderMetahumanItemSheet);
  Hooks.on(hooks.closeMetahumanItemSheet, onCloseMetahumanItemSheet);
  Hooks.on(hooks.preCreateActor, (doc, actor, options, userId) => {
    if (actor.type === "character") {
      options.renderSheet = false;
    }
  });
  Hooks.on("renderChatMessage", (message, html2, data) => {
    var _a;
    const sender = game.users.get((_a = message.author) == null ? void 0 : _a.id);
    if (!sender) return;
    const senderColor = sender.color;
    html2[0].style.setProperty("--message-color", senderColor);
  });
  Hooks.on("renderChatMessage", (message, html2, data) => {
    const chatMessage = html2[0];
    if (!chatMessage) return;
    if (chatMessage.querySelector(".inner-background-container")) return;
    const wrapper = document.createElement("div");
    wrapper.classList.add("inner-background-container");
    const fakeShadow = document.createElement("div");
    fakeShadow.classList.add("fake-shadow");
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("message-container");
    while (chatMessage.firstChild) {
      messageContainer.appendChild(chatMessage.firstChild);
    }
    wrapper.appendChild(fakeShadow);
    wrapper.appendChild(messageContainer);
    chatMessage.appendChild(wrapper);
  });
  Hooks.on("preCreateChatMessage", async (messageDoc, data, options, userId) => {
    console.log("....................................");
    console.log("....................................");
    console.log(messageDoc);
    console.log(data);
    console.log(data.content[0]);
    console.log(options);
    console.log(userId);
    console.log("....................................");
    console.log("....................................");
  });
  Hooks.on("renderSidebarTab", (app, html2) => {
    html2.find(".directory-item.document").each((_, el) => {
      let $el = $(el);
      let img = $el.find("img.thumbnail");
      let h4 = $el.find("h4.entry-name");
      let entryId = $el.attr("data-entry-id");
      let docType = $el.hasClass("actor") ? "Actor" : $el.hasClass("item") ? "Item" : null;
      if (!docType) return;
      if (img.length && h4.length && !img.parent().hasClass("directory-post")) {
        let wrapper = $('<div class="directory-post"></div>');
        wrapper.attr("data-entry-id", entryId);
        wrapper.attr("data-document-type", docType);
        img.add(h4).wrapAll(wrapper);
        console.log(`Wrapped elements in .directory-post with entry ID: ${entryId} (Type: ${docType})`);
      }
    });
    html2.on("click", ".directory-post", (event2) => {
      event2.preventDefault();
      let $target = $(event2.currentTarget);
      let entryId = $target.data("entry-id");
      let docType = $target.data("document-type");
      let doc;
      if (docType === "Actor") {
        doc = game.actors.get(entryId);
      } else if (docType === "Item") {
        doc = game.items.get(entryId);
      } else {
        console.warn("Unsupported document type:", docType);
        return;
      }
      if (doc) {
        doc.sheet.render(true);
      } else {
        console.warn("Document not found for ID:", entryId);
      }
    });
  });
  Hooks.once(hooks.init, () => {
    configureProject();
    registerActorTypes([
      { type: "character", model: CharacterModel, sheet: CharacterActorSheet }
    ]);
    registerItemTypes([
      { type: "metahuman", model: MetahumanModel, sheet: MagicItemSheet },
      { type: "magic", model: MetahumanModel, sheet: MagicItemSheet }
    ]);
    Log.success("Initialization Completed", "sr3e.js");
  });
}
registerHooks();
function configureProject() {
  CONFIG.sr3e = sr3e;
  CONFIG.Actor.dataModels = {};
  CONFIG.Item.dataModels = {};
  CONFIG.canvasTextStyle.fontFamily = "VT323";
  CONFIG.defaultFontFamily = "VT323";
  Actors.unregisterSheet("core", ActorSheet);
  Items.unregisterSheet("core", ItemSheet);
}
function registerActorTypes(actorsTypes) {
  actorsTypes.forEach(({ type, model, sheet }) => {
    CONFIG.Actor.dataModels[type] = model;
    Actors.registerSheet(flags.sr3e, sheet, { types: [type], makeDefault: true });
  });
}
function registerItemTypes(itemTypes) {
  itemTypes.forEach(({ type, model, sheet }) => {
    CONFIG.Item.dataModels[type] = model;
    Items.registerSheet(flags.sr3e, sheet, { types: [type], makeDefault: true });
  });
}
//# sourceMappingURL=bundle.js.map
