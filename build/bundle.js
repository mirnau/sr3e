var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _app, _neon, _feed, _cart, _metahuman, _magic, _a, _magic2;
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
const PUBLIC_VERSION = "5";
if (typeof window !== "undefined")
  (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(PUBLIC_VERSION);
const EACH_ITEM_REACTIVE = 1;
const EACH_INDEX_REACTIVE = 1 << 1;
const EACH_IS_CONTROLLED = 1 << 2;
const EACH_IS_ANIMATED = 1 << 3;
const EACH_ITEM_IMMUTABLE = 1 << 4;
const PROPS_IS_IMMUTABLE = 1;
const PROPS_IS_UPDATED = 1 << 2;
const PROPS_IS_BINDABLE = 1 << 3;
const PROPS_IS_LAZY_INITIAL = 1 << 4;
const TRANSITION_IN = 1;
const TRANSITION_OUT = 1 << 1;
const TRANSITION_GLOBAL = 1 << 2;
const TEMPLATE_FRAGMENT = 1;
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
let tracing_mode_flag = false;
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
function state(v) {
  return /* @__PURE__ */ push_derived_source(source(v));
}
// @__NO_SIDE_EFFECTS__
function mutable_source(initial_value, immutable = false) {
  const s = source(initial_value);
  if (!immutable) {
    s.equals = safe_equals;
  }
  return s;
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
    if (active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0) {
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
  var length = reactions.length;
  for (var i = 0; i < length; i++) {
    var reaction = reactions[i];
    var flags2 = reaction.f;
    if ((flags2 & DIRTY) !== 0) continue;
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
        var _a2;
        if (prop2 === STATE_SYMBOL) {
          return value;
        }
        var s = sources.get(prop2);
        var exists = prop2 in target;
        if (s === void 0 && (!exists || ((_a2 = get_descriptor(target, prop2)) == null ? void 0 : _a2.writable))) {
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
        var _a2;
        if (prop2 === STATE_SYMBOL) {
          return true;
        }
        var s = sources.get(prop2);
        var has = s !== void 0 && s.v !== UNINITIALIZED || Reflect.has(target, prop2);
        if (s !== void 0 || active_effect !== null && (!has || ((_a2 = get_descriptor(target, prop2)) == null ? void 0 : _a2.writable))) {
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
        var _a2;
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
          if (!has || ((_a2 = get_descriptor(target, prop2)) == null ? void 0 : _a2.writable)) {
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
function first_child(fragment, is_text) {
  {
    var first = (
      /** @type {DocumentFragment} */
      /* @__PURE__ */ get_first_child(
        /** @type {Node} */
        fragment
      )
    );
    if (first instanceof Comment && first.data === "") return /* @__PURE__ */ get_next_sibling(first);
    return first;
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
function flush_tasks() {
  if (is_micro_task_queued$1) {
    process_micro_tasks();
  }
}
const FLUSH_MICROTASK = 0;
const FLUSH_SYNC = 1;
let is_throwing_error = false;
let scheduler_mode = FLUSH_MICROTASK;
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
let component_context = null;
function increment_write_version() {
  return ++write_version;
}
function is_runes() {
  return true;
}
function check_dirtiness(reaction) {
  var _a2;
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
          if (is_disconnected || !((_a2 = dependency == null ? void 0 : dependency.reactions) == null ? void 0 : _a2.includes(reaction))) {
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
  var _a2;
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
          ((_a2 = deps[i]).reactions ?? (_a2.reactions = [])).push(reaction);
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
  if (scheduler_mode === FLUSH_MICROTASK) {
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
function flush_sync(fn) {
  var previous_scheduler_mode = scheduler_mode;
  var previous_queued_root_effects = queued_root_effects;
  try {
    infinite_loop_guard();
    const root_effects = [];
    scheduler_mode = FLUSH_SYNC;
    queued_root_effects = root_effects;
    is_micro_task_queued = false;
    flush_queued_root_effects(previous_queued_root_effects);
    var result = fn == null ? void 0 : fn();
    flush_tasks();
    if (queued_root_effects.length > 0 || root_effects.length > 0) {
      flush_sync();
    }
    flush_count = 0;
    last_scheduled_effect = null;
    if (DEV) ;
    return result;
  } finally {
    scheduler_mode = previous_scheduler_mode;
    queued_root_effects = previous_queued_root_effects;
  }
}
async function tick() {
  await Promise.resolve();
  flush_sync();
}
function get$1(signal) {
  var _a2;
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
        if (!((_a2 = parent_effect.deriveds) == null ? void 0 : _a2.includes(target))) {
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
}
function pop(component2) {
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
let listening_to_form_reset = false;
function add_form_reset_listener() {
  if (!listening_to_form_reset) {
    listening_to_form_reset = true;
    document.addEventListener(
      "reset",
      (evt) => {
        Promise.resolve().then(() => {
          var _a2;
          if (!evt.defaultPrevented) {
            for (
              const e of
              /**@type {HTMLFormElement} */
              evt.target.elements
            ) {
              (_a2 = e.__on_r) == null ? void 0 : _a2.call(e);
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
function delegate(events) {
  for (var i = 0; i < events.length; i++) {
    all_registered_events.add(events[i]);
  }
  for (var fn of root_event_handles) {
    fn(events);
  }
}
function handle_event_propagation(event2) {
  var _a2;
  var handler_element = this;
  var owner_document = (
    /** @type {Node} */
    handler_element.ownerDocument
  );
  var event_name = event2.type;
  var path = ((_a2 = event2.composedPath) == null ? void 0 : _a2.call(event2)) || [];
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
  var is_fragment = (flags2 & TEMPLATE_FRAGMENT) !== 0;
  var use_import_node = (flags2 & TEMPLATE_USE_IMPORT_NODE) !== 0;
  var node;
  var has_start = !content.startsWith("<!>");
  return () => {
    if (node === void 0) {
      node = create_fragment_from_html(has_start ? content : "<!>" + content);
      if (!is_fragment) node = /** @type {Node} */
      /* @__PURE__ */ get_first_child(node);
    }
    var clone = (
      /** @type {TemplateNode} */
      use_import_node ? document.importNode(node, true) : node.cloneNode(true)
    );
    if (is_fragment) {
      var start = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_first_child(clone)
      );
      var end = (
        /** @type {TemplateNode} */
        clone.lastChild
      );
      assign_nodes(start, end);
    } else {
      assign_nodes(clone, clone);
    }
    return clone;
  };
}
function text(value = "") {
  {
    var t = create_text(value + "");
    assign_nodes(t, t);
    return t;
  }
}
function comment() {
  var frag = document.createDocumentFragment();
  var start = document.createComment("");
  var anchor = create_text();
  frag.append(start, anchor);
  assign_nodes(start, anchor);
  return frag;
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
function set_text(text2, value) {
  var str = value == null ? "" : typeof value === "object" ? value + "" : value;
  if (str !== (text2.__t ?? (text2.__t = text2.nodeValue))) {
    text2.__t = str;
    text2.nodeValue = str == null ? "" : str + "";
  }
}
function mount(component2, options) {
  return _mount(component2, options);
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
  var component2 = void 0;
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
      component2 = Component(anchor_node, props) || {};
      should_intro = true;
      if (context) {
        pop();
      }
    });
    return () => {
      var _a2;
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
        (_a2 = anchor_node.parentNode) == null ? void 0 : _a2.removeChild(anchor_node);
      }
    };
  });
  mounted_components.set(component2, unmount2);
  return component2;
}
let mounted_components = /* @__PURE__ */ new WeakMap();
function unmount(component2, options) {
  const fn = mounted_components.get(component2);
  if (fn) {
    mounted_components.delete(component2);
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
function pause_effects(state2, items, controlled_anchor, items_map) {
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
    link(state2, items[0].prev, items[length - 1].next);
  }
  run_out_transitions(transitions, () => {
    for (var i2 = 0; i2 < length; i2++) {
      var item2 = items[i2];
      if (!is_controlled) {
        items_map.delete(item2.k);
        link(state2, item2.prev, item2.next);
      }
      destroy_effect(item2.e, !is_controlled);
    }
  });
}
function each(node, flags2, get_collection, get_key, render_fn, fallback_fn = null) {
  var anchor = node;
  var state2 = { flags: flags2, items: /* @__PURE__ */ new Map(), first: null };
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
        state2,
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
function reconcile(array, state2, anchor, render_fn, flags2, is_inert, get_key, get_collection) {
  var _a2, _b, _c, _d;
  var is_animated = (flags2 & EACH_IS_ANIMATED) !== 0;
  var should_update = (flags2 & (EACH_ITEM_REACTIVE | EACH_INDEX_REACTIVE)) !== 0;
  var length = array.length;
  var items = state2.items;
  var first = state2.first;
  var current = first;
  var seen;
  var prev = null;
  var to_animate;
  var matched = [];
  var stashed = [];
  var value;
  var key;
  var item2;
  var i;
  if (is_animated) {
    for (i = 0; i < length; i += 1) {
      value = array[i];
      key = get_key(value, i);
      item2 = items.get(key);
      if (item2 !== void 0) {
        (_a2 = item2.a) == null ? void 0 : _a2.measure();
        (to_animate ?? (to_animate = /* @__PURE__ */ new Set())).add(item2);
      }
    }
  }
  for (i = 0; i < length; i += 1) {
    value = array[i];
    key = get_key(value, i);
    item2 = items.get(key);
    if (item2 === void 0) {
      var child_anchor = current ? (
        /** @type {TemplateNode} */
        current.e.nodes_start
      ) : anchor;
      prev = create_item(
        child_anchor,
        state2,
        prev,
        prev === null ? state2.first : prev.next,
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
      update_item(item2, value, i, flags2);
    }
    if ((item2.e.f & INERT) !== 0) {
      resume_effect(item2.e);
      if (is_animated) {
        (_b = item2.a) == null ? void 0 : _b.unfix();
        (to_animate ?? (to_animate = /* @__PURE__ */ new Set())).delete(item2);
      }
    }
    if (item2 !== current) {
      if (seen !== void 0 && seen.has(item2)) {
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
          link(state2, a.prev, b.next);
          link(state2, prev, a);
          link(state2, b, start);
          current = start;
          prev = b;
          i -= 1;
          matched = [];
          stashed = [];
        } else {
          seen.delete(item2);
          move(item2, current, anchor);
          link(state2, item2.prev, item2.next);
          link(state2, item2, prev === null ? state2.first : prev.next);
          link(state2, prev, item2);
          prev = item2;
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
      item2 = current;
    }
    matched.push(item2);
    prev = item2;
    current = item2.next;
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
      pause_effects(state2, to_destroy, controlled_anchor, items);
    }
  }
  if (is_animated) {
    queue_micro_task(() => {
      var _a3;
      if (to_animate === void 0) return;
      for (item2 of to_animate) {
        (_a3 = item2.a) == null ? void 0 : _a3.apply();
      }
    });
  }
  active_effect.first = state2.first && state2.first.e;
  active_effect.last = prev && prev.e;
}
function update_item(item2, value, index2, type) {
  if ((type & EACH_ITEM_REACTIVE) !== 0) {
    internal_set(item2.v, value);
  }
  if ((type & EACH_INDEX_REACTIVE) !== 0) {
    internal_set(
      /** @type {Value<number>} */
      item2.i,
      index2
    );
  } else {
    item2.i = index2;
  }
}
function create_item(anchor, state2, prev, next, value, key, index2, render_fn, flags2, get_collection) {
  var reactive = (flags2 & EACH_ITEM_REACTIVE) !== 0;
  var mutable = (flags2 & EACH_ITEM_IMMUTABLE) === 0;
  var v = reactive ? mutable ? /* @__PURE__ */ mutable_source(value) : source(value) : value;
  var i = (flags2 & EACH_INDEX_REACTIVE) === 0 ? index2 : source(index2);
  var item2 = {
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
    item2.e = branch(() => render_fn(anchor, v, i, get_collection), hydrating);
    item2.e.prev = prev && prev.e;
    item2.e.next = next && next.e;
    if (prev === null) {
      state2.first = item2;
    } else {
      prev.next = item2;
      prev.e.next = item2.e;
    }
    if (next !== null) {
      next.prev = item2;
      next.e.prev = item2.e;
    }
    return item2;
  } finally {
  }
}
function move(item2, next, anchor) {
  var end = item2.next ? (
    /** @type {TemplateNode} */
    item2.next.e.nodes_start
  ) : anchor;
  var dest = next ? (
    /** @type {TemplateNode} */
    next.e.nodes_start
  ) : anchor;
  var node = (
    /** @type {TemplateNode} */
    item2.e.nodes_start
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
function link(state2, prev, next) {
  if (prev === null) {
    state2.first = next;
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
function component(node, get_component, render_fn) {
  var anchor = node;
  var component2;
  var effect2;
  block(() => {
    if (component2 === (component2 = get_component())) return;
    if (effect2) {
      pause_effect(effect2);
      effect2 = null;
    }
    if (component2) {
      effect2 = branch(() => render_fn(anchor, component2));
    }
  }, EFFECT_TRANSPARENT);
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
function set_selected(element, selected) {
  if (selected) {
    if (!element.hasAttribute("selected")) {
      element.setAttribute("selected", "");
    }
  } else {
    element.removeAttribute("selected");
  }
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
function set_class(dom, value, hash) {
  var prev_class_name = dom.__className;
  var next_class_name = to_class(value);
  if (prev_class_name !== next_class_name || hydrating) {
    if (value == null && true) {
      dom.removeAttribute("class");
    } else {
      dom.className = next_class_name;
    }
    dom.__className = next_class_name;
  }
}
function to_class(value, hash) {
  return (value == null ? "" : value) + "";
}
function toggle_class(dom, class_name, value) {
  if (value) {
    if (dom.classList.contains(class_name)) return;
    dom.classList.add(class_name);
  } else {
    if (!dom.classList.contains(class_name)) return;
    dom.classList.remove(class_name);
  }
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
      var _a2;
      element.inert = inert;
      if (!is_intro) {
        outro == null ? void 0 : outro.abort();
        (_a2 = outro == null ? void 0 : outro.reset) == null ? void 0 : _a2.call(outro);
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
    var run = is_global;
    if (!run) {
      var block2 = (
        /** @type {Effect | null} */
        e.parent
      );
      while (block2 && (block2.f & EFFECT_TRANSPARENT) !== 0) {
        while (block2 = block2.parent) {
          if ((block2.f & BLOCK_EFFECT) !== 0) break;
        }
      }
      run = !block2 || (block2.f & EFFECT_RAN) !== 0;
    }
    if (run) {
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
  const { delay = 0, css, tick: tick2, easing = linear } = options;
  var keyframes = [];
  if (is_intro && counterpart === void 0) {
    if (tick2) {
      tick2(0, 1);
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
      if (tick2) {
        loop(() => {
          if (animation.playState !== "running") return false;
          var t3 = get_t();
          tick2(t3, 1 - t3);
          return true;
        });
      }
    }
    animation = element.animate(keyframes2, { duration, fill: "forwards" });
    animation.onfinish = () => {
      get_t = () => t2;
      tick2 == null ? void 0 : tick2(t2, 1 - t2);
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
        tick2 == null ? void 0 : tick2(1, 0);
      }
    },
    t: () => get_t()
  };
}
function bind_value(input, get2, set2 = get2) {
  listen_to_event_and_reset_event(input, "input", (is_reset) => {
    var value = is_reset ? input.defaultValue : input.value;
    value = is_numberlike_input(input) ? to_number(value) : value;
    set2(value);
    if (value !== (value = get2())) {
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
  let mounting = true;
  effect(() => {
    if (get_value) {
      select_option(select, untrack(get_value), mounting);
    }
    mounting = false;
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
function subscribe_to_store(store, run, invalidate) {
  if (store == null) {
    run(void 0);
    return noop;
  }
  const unsub = untrack(
    () => store.subscribe(
      run,
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
  function subscribe(run, invalidate = noop) {
    const subscriber = [run, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set2, update) || noop;
    }
    run(
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
const spread_props_handler = {
  get(target, key) {
    let i = target.props.length;
    while (i--) {
      let p = target.props[i];
      if (is_function(p)) p = p();
      if (typeof p === "object" && p !== null && key in p) return p[key];
    }
  },
  set(target, key, value) {
    let i = target.props.length;
    while (i--) {
      let p = target.props[i];
      if (is_function(p)) p = p();
      const desc = get_descriptor(p, key);
      if (desc && desc.set) {
        desc.set(value);
        return true;
      }
    }
    return false;
  },
  getOwnPropertyDescriptor(target, key) {
    let i = target.props.length;
    while (i--) {
      let p = target.props[i];
      if (is_function(p)) p = p();
      if (typeof p === "object" && p !== null && key in p) {
        const descriptor = get_descriptor(p, key);
        if (descriptor && !descriptor.configurable) {
          descriptor.configurable = true;
        }
        return descriptor;
      }
    }
  },
  has(target, key) {
    if (key === STATE_SYMBOL || key === LEGACY_PROPS) return false;
    for (let p of target.props) {
      if (is_function(p)) p = p();
      if (p != null && key in p) return true;
    }
    return false;
  },
  ownKeys(target) {
    const keys = [];
    for (let p of target.props) {
      if (is_function(p)) p = p();
      for (const key in p) {
        if (!keys.includes(key)) keys.push(key);
      }
    }
    return keys;
  }
};
function spread_props(...props) {
  return new Proxy({ props }, spread_props_handler);
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
  var _a2;
  var immutable = (flags2 & PROPS_IS_IMMUTABLE) !== 0;
  var runes = true;
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
  var setter = bindable && (((_a2 = get_descriptor(props, key)) == null ? void 0 : _a2.set) ?? (is_entry_props && key in props && ((v) => props[key] = v))) || void 0;
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
  {
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
  }
  if ((flags2 & PROPS_IS_UPDATED) === 0) {
    return getter;
  }
  if (setter) {
    var legacy_parent = props.$$legacy;
    return function(value, mutation) {
      if (arguments.length > 0) {
        if (!mutation || legacy_parent || is_store_sub) {
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
    if (arguments.length > 0) {
      const new_value = mutation ? get$1(current_value) : bindable ? proxy(value) : value;
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
const cardLayout = writable([]);
const shoppingState = writable([]);
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
function moveCardById(id, direction) {
  cardLayout.update((cards) => {
    const index2 = cards.findIndex((c) => c.id === id);
    if (index2 === -1) return cards;
    const newIndex = direction === "up" ? index2 - 1 : index2 + 1;
    if (newIndex < 0 || newIndex >= cards.length) return cards;
    const reordered = [...cards];
    [reordered[index2], reordered[newIndex]] = [reordered[newIndex], reordered[index2]];
    return reordered;
  });
}
function toggleCardSpanById(id) {
  cardLayout.update((cards) => {
    return cards.map((card) => {
      if (card.id === id) {
        let nextSpan = (card.span ?? 1) + 1;
        if (nextSpan > 3) nextSpan = 1;
        return { ...card, span: nextSpan };
      }
      return card;
    });
  });
}
function handleToggleSpan(_, $$props) {
  toggleCardSpanById($$props.id);
}
var on_click$2 = (e) => e.stopPropagation();
var on_keydown$1 = (e) => {
  if (e.key === "Escape") {
    e.currentTarget.blur();
  }
};
var on_click_1$1 = (__1, handleMove) => handleMove("up");
var on_click_2$1 = (__2, handleMove) => handleMove("down");
var root$i = /* @__PURE__ */ template(`<div class="toolbar" role="toolbar" tabindex="0"><button class="header-control icon sr3e-toolbar-button" aria-label="Move card up"><i class="fa-solid fa-arrow-up"></i></button> <button class="header-control icon sr3e-toolbar-button" aria-label="Move card down"><i class="fa-solid fa-arrow-down"></i></button> <button class="header-control icon sr3e-toolbar-button" aria-label="Toggle card span"><i class="fa-solid fa-arrows-spin"></i></button></div>`);
function CardToolbar($$anchor, $$props) {
  push($$props, true);
  function handleMove(direction) {
    console.log("handle move called");
    moveCardById($$props.id, direction);
  }
  var div = root$i();
  div.__click = [on_click$2];
  div.__keydown = [on_keydown$1];
  var button = child(div);
  button.__click = [on_click_1$1, handleMove];
  var button_1 = sibling(button, 2);
  button_1.__click = [on_click_2$1, handleMove];
  var button_2 = sibling(button_1, 2);
  button_2.__click = [handleToggleSpan, $$props];
  append($$anchor, div);
  pop();
}
delegate(["click", "keydown"]);
function toggleDetails(_, isDetailsOpen, actor, actorStore) {
  var _a2, _b, _c, _d;
  set(isDetailsOpen, !get$1(isDetailsOpen));
  (_b = (_a2 = actor()) == null ? void 0 : _a2.update) == null ? void 0 : _b.call(
    _a2,
    {
      "system.profile.isDetailsOpen": get$1(isDetailsOpen)
    },
    { render: false }
  );
  (_d = (_c = get$1(actorStore)) == null ? void 0 : _c.update) == null ? void 0 : _d.call(_c, (store) => ({
    ...store,
    isDetailsOpen: get$1(isDetailsOpen)
  }));
}
function handleFilePicker(__1, actor) {
  openFilePicker(actor());
}
var root_1$6 = /* @__PURE__ */ template(`<div class="version-one image-mask"><img alt="Metahuman Portrait"></div>`);
var root_2$4 = /* @__PURE__ */ template(`<div class="version-two image-mask"><img role="presentation" data-edit="img"></div>`);
var on_input$1 = (e, updateStoreName) => updateStoreName(e.target.value);
var root_3$3 = /* @__PURE__ */ template(`<div><div><input type="text" id="actor-name" name="name"></div> <div><h3> <span> </span></h3></div> <div><h3> </h3></div> <div><h3> </h3></div> <div><h3> </h3></div> <a class="journal-entry-link"><h3> </h3></a></div>`);
var root$h = /* @__PURE__ */ template(`<!> <div class="dossier"><!> <div class="dossier-details"><div class="details-foldout"><span><i class="fa-solid fa-magnifying-glass"></i></span> </div> <!></div></div>`, 1);
function Dossier($$anchor, $$props) {
  var _a2, _b, _c, _d;
  push($$props, true);
  let actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({})), id = prop($$props, "id", 19, () => ({}));
  prop($$props, "span", 19, () => ({}));
  let actorStore = /* @__PURE__ */ derived(() => {
    var _a3, _b2;
    return ((_a3 = actor()) == null ? void 0 : _a3.id) && ((_b2 = actor()) == null ? void 0 : _b2.name) ? getActorStore(actor().id, actor().name) : null;
  });
  let fieldName = state(proxy(((_a2 = actor()) == null ? void 0 : _a2.name) ?? ""));
  let isDetailsOpen = state(proxy(((_d = (_c = (_b = actor()) == null ? void 0 : _b.system) == null ? void 0 : _c.profile) == null ? void 0 : _d.isDetailsOpen) ?? false));
  user_effect(() => {
    if (!get$1(actorStore)) return;
    const unsubscribe = get$1(actorStore).subscribe((store) => {
      if ((store == null ? void 0 : store.name) !== void 0) set(fieldName, proxy(store.name));
      if ((store == null ? void 0 : store.isDetailsOpen) !== void 0) set(isDetailsOpen, proxy(store.isDetailsOpen));
    });
    return () => unsubscribe();
  });
  function saveActorName(event2) {
    var _a3, _b2, _c2, _d2;
    const newName = event2.target.value;
    (_b2 = (_a3 = actor()) == null ? void 0 : _a3.update) == null ? void 0 : _b2.call(_a3, { name: newName }, { render: true });
    (_d2 = (_c2 = get$1(actorStore)) == null ? void 0 : _c2.update) == null ? void 0 : _d2.call(_c2, (store) => ({ ...store, name: newName }));
  }
  function multiply(value, factor) {
    return (value * factor).toFixed(2);
  }
  function cubicInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function updateStoreName(newName) {
    var _a3, _b2;
    set(fieldName, proxy(newName));
    (_b2 = (_a3 = get$1(actorStore)) == null ? void 0 : _a3.update) == null ? void 0 : _b2.call(_a3, (store) => ({ ...store, name: newName }));
  }
  var fragment = root$h();
  var node = first_child(fragment);
  CardToolbar(node, {
    get id() {
      return id();
    }
  });
  var div = sibling(node, 2);
  var node_1 = child(div);
  {
    var consequent = ($$anchor2) => {
      var div_1 = root_1$6();
      append($$anchor2, div_1);
    };
    var alternate = ($$anchor2) => {
      var div_2 = root_2$4();
      var img = child(div_2);
      img.__click = [handleFilePicker, actor];
      template_effect(() => {
        set_attribute(img, "src", actor().img);
        set_attribute(img, "alt", actor().name + "!");
        set_attribute(img, "title", actor().name);
      });
      append($$anchor2, div_2);
    };
    if_block(node_1, ($$render) => {
      if (get$1(isDetailsOpen)) $$render(consequent);
      else $$render(alternate, false);
    });
  }
  var div_3 = sibling(node_1, 2);
  var div_4 = child(div_3);
  div_4.__click = [
    toggleDetails,
    isDetailsOpen,
    actor,
    actorStore
  ];
  var text2 = sibling(child(div_4));
  var node_2 = sibling(div_4, 2);
  {
    var consequent_1 = ($$anchor2) => {
      var div_5 = root_3$3();
      var div_6 = child(div_5);
      var input = child(div_6);
      input.__input = [on_input$1, updateStoreName];
      var div_7 = sibling(div_6, 2);
      var h3 = child(div_7);
      var text_1 = child(h3);
      var span_1 = sibling(text_1);
      var text_2 = child(span_1);
      var div_8 = sibling(div_7, 2);
      var h3_1 = child(div_8);
      var text_3 = child(h3_1);
      var div_9 = sibling(div_8, 2);
      var h3_2 = child(div_9);
      var text_4 = child(h3_2);
      var div_10 = sibling(div_9, 2);
      var h3_3 = child(div_10);
      var text_5 = child(h3_3);
      var a = sibling(div_10, 2);
      var h3_4 = child(a);
      var text_6 = child(h3_4);
      template_effect(
        ($0, $1, $2, $3, $4, $5, $6) => {
          var _a3, _b2, _c2, _d2, _e, _f, _g, _h;
          set_value(input, get$1(fieldName));
          set_text(text_1, `${$0 ?? ""}: `);
          set_text(text_2, ((_b2 = (_a3 = actor().system) == null ? void 0 : _a3.profile) == null ? void 0 : _b2.metaHumanity) ?? "");
          set_text(text_3, `${$1 ?? ""}: ${((_d2 = (_c2 = actor().system) == null ? void 0 : _c2.profile) == null ? void 0 : _d2.age) ?? ""}`);
          set_text(text_4, `${$2 ?? ""}: ${((_f = (_e = actor().system) == null ? void 0 : _e.profile) == null ? void 0 : _f.height) ?? ""} cm (${$3 ?? ""} feet)`);
          set_text(text_5, `${$4 ?? ""}: ${((_h = (_g = actor().system) == null ? void 0 : _g.profile) == null ? void 0 : _h.weight) ?? ""} kg (${$5 ?? ""} stones)`);
          set_text(text_6, $6);
        },
        [
          () => localize(config().traits.metahuman),
          () => localize(config().traits.age),
          () => localize(config().traits.height),
          () => {
            var _a3, _b2;
            return multiply(((_b2 = (_a3 = actor().system) == null ? void 0 : _a3.profile) == null ? void 0 : _b2.height) ?? 0, 0.0328084);
          },
          () => localize(config().traits.weight),
          () => {
            var _a3, _b2;
            return multiply(((_b2 = (_a3 = actor().system) == null ? void 0 : _a3.profile) == null ? void 0 : _b2.weight) ?? 0, 0.157473);
          },
          () => localize(config().sheet.viewbackground)
        ]
      );
      event("blur", input, saveActorName);
      event("keypress", input, (e) => e.key === "Enter" && saveActorName(e));
      transition(1, div_5, () => slide, () => ({ duration: 400, easing: cubicInOut }));
      transition(2, div_5, () => slide, () => ({ duration: 300, easing: cubicInOut }));
      append($$anchor2, div_5);
    };
    if_block(node_2, ($$render) => {
      if (get$1(isDetailsOpen)) $$render(consequent_1);
    });
  }
  template_effect(($0) => set_text(text2, ` ${$0 ?? ""}`), [() => localize(config().sheet.details)]);
  append($$anchor, fragment);
  pop();
}
delegate(["click", "input"]);
var root_1$5 = /* @__PURE__ */ template(`<h1 class="stat-value"> </h1>`);
var root_3$2 = /* @__PURE__ */ template(`<i class="fa-solid fa-circle-chevron-down"></i>`);
var root_4$1 = /* @__PURE__ */ template(`<i class="fa-solid fa-circle-chevron-up"></i>`);
var root_2$3 = /* @__PURE__ */ template(`<div class="stat-label"><!> <h1 class="stat-value"> </h1> <!></div>`);
var root$g = /* @__PURE__ */ template(`<h3> </h3> <!>`, 1);
function AttributeCard($$anchor, $$props) {
  push($$props, true);
  let baseTotal = /* @__PURE__ */ derived(() => $$props.stat.value + $$props.stat.mod);
  let total = /* @__PURE__ */ derived(() => get$1(baseTotal) + ($$props.stat.meta ?? 0));
  var fragment = root$g();
  var h3 = first_child(fragment);
  var text2 = child(h3);
  var node = sibling(h3, 2);
  {
    var consequent = ($$anchor2) => {
      var h1 = root_1$5();
      var text_1 = child(h1);
      template_effect(() => set_text(text_1, get$1(baseTotal)));
      append($$anchor2, h1);
    };
    var alternate = ($$anchor2) => {
      var div = root_2$3();
      var node_1 = child(div);
      {
        var consequent_1 = ($$anchor3) => {
          var i = root_3$2();
          append($$anchor3, i);
        };
        if_block(node_1, ($$render) => {
          if ($$props.isShoppingState) $$render(consequent_1);
        });
      }
      var h1_1 = sibling(node_1, 2);
      var text_2 = child(h1_1);
      var node_2 = sibling(h1_1, 2);
      {
        var consequent_2 = ($$anchor3) => {
          var i_1 = root_4$1();
          append($$anchor3, i_1);
        };
        if_block(node_2, ($$render) => {
          if ($$props.isShoppingState) $$render(consequent_2);
        });
      }
      template_effect(() => set_text(text_2, get$1(total)));
      append($$anchor2, div);
    };
    if_block(node, ($$render) => {
      if ($$props.stat.meta == null) $$render(consequent);
      else $$render(alternate, false);
    });
  }
  template_effect(($0) => set_text(text2, $0), [
    () => localize($$props.config.attributes[$$props.key] || $$props.key)
  ]);
  append($$anchor, fragment);
  pop();
}
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var masonry = { exports: {} };
var outlayer = { exports: {} };
var evEmitter$1 = { exports: {} };
var evEmitter = evEmitter$1.exports;
var hasRequiredEvEmitter;
function requireEvEmitter() {
  if (hasRequiredEvEmitter) return evEmitter$1.exports;
  hasRequiredEvEmitter = 1;
  (function(module) {
    (function(global, factory) {
      if (module.exports) {
        module.exports = factory();
      } else {
        global.EvEmitter = factory();
      }
    })(typeof window != "undefined" ? window : evEmitter, function() {
      function EvEmitter() {
      }
      var proto = EvEmitter.prototype;
      proto.on = function(eventName, listener) {
        if (!eventName || !listener) {
          return;
        }
        var events = this._events = this._events || {};
        var listeners = events[eventName] = events[eventName] || [];
        if (listeners.indexOf(listener) == -1) {
          listeners.push(listener);
        }
        return this;
      };
      proto.once = function(eventName, listener) {
        if (!eventName || !listener) {
          return;
        }
        this.on(eventName, listener);
        var onceEvents = this._onceEvents = this._onceEvents || {};
        var onceListeners = onceEvents[eventName] = onceEvents[eventName] || {};
        onceListeners[listener] = true;
        return this;
      };
      proto.off = function(eventName, listener) {
        var listeners = this._events && this._events[eventName];
        if (!listeners || !listeners.length) {
          return;
        }
        var index2 = listeners.indexOf(listener);
        if (index2 != -1) {
          listeners.splice(index2, 1);
        }
        return this;
      };
      proto.emitEvent = function(eventName, args) {
        var listeners = this._events && this._events[eventName];
        if (!listeners || !listeners.length) {
          return;
        }
        listeners = listeners.slice(0);
        args = args || [];
        var onceListeners = this._onceEvents && this._onceEvents[eventName];
        for (var i = 0; i < listeners.length; i++) {
          var listener = listeners[i];
          var isOnce = onceListeners && onceListeners[listener];
          if (isOnce) {
            this.off(eventName, listener);
            delete onceListeners[listener];
          }
          listener.apply(this, args);
        }
        return this;
      };
      proto.allOff = function() {
        delete this._events;
        delete this._onceEvents;
      };
      return EvEmitter;
    });
  })(evEmitter$1);
  return evEmitter$1.exports;
}
var getSize = { exports: {} };
/*!
 * getSize v2.0.3
 * measure size of elements
 * MIT license
 */
var hasRequiredGetSize;
function requireGetSize() {
  if (hasRequiredGetSize) return getSize.exports;
  hasRequiredGetSize = 1;
  (function(module) {
    (function(window2, factory) {
      if (module.exports) {
        module.exports = factory();
      } else {
        window2.getSize = factory();
      }
    })(window, function factory() {
      function getStyleSize(value) {
        var num = parseFloat(value);
        var isValid = value.indexOf("%") == -1 && !isNaN(num);
        return isValid && num;
      }
      function noop2() {
      }
      var logError = typeof console == "undefined" ? noop2 : function(message) {
        console.error(message);
      };
      var measurements = [
        "paddingLeft",
        "paddingRight",
        "paddingTop",
        "paddingBottom",
        "marginLeft",
        "marginRight",
        "marginTop",
        "marginBottom",
        "borderLeftWidth",
        "borderRightWidth",
        "borderTopWidth",
        "borderBottomWidth"
      ];
      var measurementsLength = measurements.length;
      function getZeroSize() {
        var size = {
          width: 0,
          height: 0,
          innerWidth: 0,
          innerHeight: 0,
          outerWidth: 0,
          outerHeight: 0
        };
        for (var i = 0; i < measurementsLength; i++) {
          var measurement = measurements[i];
          size[measurement] = 0;
        }
        return size;
      }
      function getStyle(elem) {
        var style = getComputedStyle(elem);
        if (!style) {
          logError("Style returned " + style + ". Are you running this code in a hidden iframe on Firefox? See https://bit.ly/getsizebug1");
        }
        return style;
      }
      var isSetup = false;
      var isBoxSizeOuter;
      function setup() {
        if (isSetup) {
          return;
        }
        isSetup = true;
        var div = document.createElement("div");
        div.style.width = "200px";
        div.style.padding = "1px 2px 3px 4px";
        div.style.borderStyle = "solid";
        div.style.borderWidth = "1px 2px 3px 4px";
        div.style.boxSizing = "border-box";
        var body = document.body || document.documentElement;
        body.appendChild(div);
        var style = getStyle(div);
        isBoxSizeOuter = Math.round(getStyleSize(style.width)) == 200;
        getSize2.isBoxSizeOuter = isBoxSizeOuter;
        body.removeChild(div);
      }
      function getSize2(elem) {
        setup();
        if (typeof elem == "string") {
          elem = document.querySelector(elem);
        }
        if (!elem || typeof elem != "object" || !elem.nodeType) {
          return;
        }
        var style = getStyle(elem);
        if (style.display == "none") {
          return getZeroSize();
        }
        var size = {};
        size.width = elem.offsetWidth;
        size.height = elem.offsetHeight;
        var isBorderBox = size.isBorderBox = style.boxSizing == "border-box";
        for (var i = 0; i < measurementsLength; i++) {
          var measurement = measurements[i];
          var value = style[measurement];
          var num = parseFloat(value);
          size[measurement] = !isNaN(num) ? num : 0;
        }
        var paddingWidth = size.paddingLeft + size.paddingRight;
        var paddingHeight = size.paddingTop + size.paddingBottom;
        var marginWidth = size.marginLeft + size.marginRight;
        var marginHeight = size.marginTop + size.marginBottom;
        var borderWidth = size.borderLeftWidth + size.borderRightWidth;
        var borderHeight = size.borderTopWidth + size.borderBottomWidth;
        var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;
        var styleWidth = getStyleSize(style.width);
        if (styleWidth !== false) {
          size.width = styleWidth + // add padding and border unless it's already including it
          (isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth);
        }
        var styleHeight = getStyleSize(style.height);
        if (styleHeight !== false) {
          size.height = styleHeight + // add padding and border unless it's already including it
          (isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight);
        }
        size.innerWidth = size.width - (paddingWidth + borderWidth);
        size.innerHeight = size.height - (paddingHeight + borderHeight);
        size.outerWidth = size.width + marginWidth;
        size.outerHeight = size.height + marginHeight;
        return size;
      }
      return getSize2;
    });
  })(getSize);
  return getSize.exports;
}
var utils = { exports: {} };
var matchesSelector = { exports: {} };
var hasRequiredMatchesSelector;
function requireMatchesSelector() {
  if (hasRequiredMatchesSelector) return matchesSelector.exports;
  hasRequiredMatchesSelector = 1;
  (function(module) {
    (function(window2, factory) {
      if (module.exports) {
        module.exports = factory();
      } else {
        window2.matchesSelector = factory();
      }
    })(window, function factory() {
      var matchesMethod = function() {
        var ElemProto = window.Element.prototype;
        if (ElemProto.matches) {
          return "matches";
        }
        if (ElemProto.matchesSelector) {
          return "matchesSelector";
        }
        var prefixes = ["webkit", "moz", "ms", "o"];
        for (var i = 0; i < prefixes.length; i++) {
          var prefix = prefixes[i];
          var method = prefix + "MatchesSelector";
          if (ElemProto[method]) {
            return method;
          }
        }
      }();
      return function matchesSelector2(elem, selector) {
        return elem[matchesMethod](selector);
      };
    });
  })(matchesSelector);
  return matchesSelector.exports;
}
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) return utils.exports;
  hasRequiredUtils = 1;
  (function(module) {
    (function(window2, factory) {
      if (module.exports) {
        module.exports = factory(
          window2,
          requireMatchesSelector()
        );
      } else {
        window2.fizzyUIUtils = factory(
          window2,
          window2.matchesSelector
        );
      }
    })(window, function factory(window2, matchesSelector2) {
      var utils2 = {};
      utils2.extend = function(a, b) {
        for (var prop2 in b) {
          a[prop2] = b[prop2];
        }
        return a;
      };
      utils2.modulo = function(num, div) {
        return (num % div + div) % div;
      };
      var arraySlice = Array.prototype.slice;
      utils2.makeArray = function(obj) {
        if (Array.isArray(obj)) {
          return obj;
        }
        if (obj === null || obj === void 0) {
          return [];
        }
        var isArrayLike = typeof obj == "object" && typeof obj.length == "number";
        if (isArrayLike) {
          return arraySlice.call(obj);
        }
        return [obj];
      };
      utils2.removeFrom = function(ary, obj) {
        var index2 = ary.indexOf(obj);
        if (index2 != -1) {
          ary.splice(index2, 1);
        }
      };
      utils2.getParent = function(elem, selector) {
        while (elem.parentNode && elem != document.body) {
          elem = elem.parentNode;
          if (matchesSelector2(elem, selector)) {
            return elem;
          }
        }
      };
      utils2.getQueryElement = function(elem) {
        if (typeof elem == "string") {
          return document.querySelector(elem);
        }
        return elem;
      };
      utils2.handleEvent = function(event2) {
        var method = "on" + event2.type;
        if (this[method]) {
          this[method](event2);
        }
      };
      utils2.filterFindElements = function(elems, selector) {
        elems = utils2.makeArray(elems);
        var ffElems = [];
        elems.forEach(function(elem) {
          if (!(elem instanceof HTMLElement)) {
            return;
          }
          if (!selector) {
            ffElems.push(elem);
            return;
          }
          if (matchesSelector2(elem, selector)) {
            ffElems.push(elem);
          }
          var childElems = elem.querySelectorAll(selector);
          for (var i = 0; i < childElems.length; i++) {
            ffElems.push(childElems[i]);
          }
        });
        return ffElems;
      };
      utils2.debounceMethod = function(_class, methodName, threshold) {
        threshold = threshold || 100;
        var method = _class.prototype[methodName];
        var timeoutName = methodName + "Timeout";
        _class.prototype[methodName] = function() {
          var timeout = this[timeoutName];
          clearTimeout(timeout);
          var args = arguments;
          var _this = this;
          this[timeoutName] = setTimeout(function() {
            method.apply(_this, args);
            delete _this[timeoutName];
          }, threshold);
        };
      };
      utils2.docReady = function(callback) {
        var readyState = document.readyState;
        if (readyState == "complete" || readyState == "interactive") {
          setTimeout(callback);
        } else {
          document.addEventListener("DOMContentLoaded", callback);
        }
      };
      utils2.toDashed = function(str) {
        return str.replace(/(.)([A-Z])/g, function(match, $1, $2) {
          return $1 + "-" + $2;
        }).toLowerCase();
      };
      var console2 = window2.console;
      utils2.htmlInit = function(WidgetClass, namespace) {
        utils2.docReady(function() {
          var dashedNamespace = utils2.toDashed(namespace);
          var dataAttr = "data-" + dashedNamespace;
          var dataAttrElems = document.querySelectorAll("[" + dataAttr + "]");
          var jsDashElems = document.querySelectorAll(".js-" + dashedNamespace);
          var elems = utils2.makeArray(dataAttrElems).concat(utils2.makeArray(jsDashElems));
          var dataOptionsAttr = dataAttr + "-options";
          var jQuery = window2.jQuery;
          elems.forEach(function(elem) {
            var attr = elem.getAttribute(dataAttr) || elem.getAttribute(dataOptionsAttr);
            var options;
            try {
              options = attr && JSON.parse(attr);
            } catch (error) {
              if (console2) {
                console2.error("Error parsing " + dataAttr + " on " + elem.className + ": " + error);
              }
              return;
            }
            var instance = new WidgetClass(elem, options);
            if (jQuery) {
              jQuery.data(elem, namespace, instance);
            }
          });
        });
      };
      return utils2;
    });
  })(utils);
  return utils.exports;
}
var item = { exports: {} };
var hasRequiredItem;
function requireItem() {
  if (hasRequiredItem) return item.exports;
  hasRequiredItem = 1;
  (function(module) {
    (function(window2, factory) {
      if (module.exports) {
        module.exports = factory(
          requireEvEmitter(),
          requireGetSize()
        );
      } else {
        window2.Outlayer = {};
        window2.Outlayer.Item = factory(
          window2.EvEmitter,
          window2.getSize
        );
      }
    })(window, function factory(EvEmitter, getSize2) {
      function isEmptyObj(obj) {
        for (var prop2 in obj) {
          return false;
        }
        prop2 = null;
        return true;
      }
      var docElemStyle = document.documentElement.style;
      var transitionProperty = typeof docElemStyle.transition == "string" ? "transition" : "WebkitTransition";
      var transformProperty = typeof docElemStyle.transform == "string" ? "transform" : "WebkitTransform";
      var transitionEndEvent = {
        WebkitTransition: "webkitTransitionEnd",
        transition: "transitionend"
      }[transitionProperty];
      var vendorProperties = {
        transform: transformProperty,
        transition: transitionProperty,
        transitionDuration: transitionProperty + "Duration",
        transitionProperty: transitionProperty + "Property",
        transitionDelay: transitionProperty + "Delay"
      };
      function Item2(element, layout) {
        if (!element) {
          return;
        }
        this.element = element;
        this.layout = layout;
        this.position = {
          x: 0,
          y: 0
        };
        this._create();
      }
      var proto = Item2.prototype = Object.create(EvEmitter.prototype);
      proto.constructor = Item2;
      proto._create = function() {
        this._transn = {
          ingProperties: {},
          clean: {},
          onEnd: {}
        };
        this.css({
          position: "absolute"
        });
      };
      proto.handleEvent = function(event2) {
        var method = "on" + event2.type;
        if (this[method]) {
          this[method](event2);
        }
      };
      proto.getSize = function() {
        this.size = getSize2(this.element);
      };
      proto.css = function(style) {
        var elemStyle = this.element.style;
        for (var prop2 in style) {
          var supportedProp = vendorProperties[prop2] || prop2;
          elemStyle[supportedProp] = style[prop2];
        }
      };
      proto.getPosition = function() {
        var style = getComputedStyle(this.element);
        var isOriginLeft = this.layout._getOption("originLeft");
        var isOriginTop = this.layout._getOption("originTop");
        var xValue = style[isOriginLeft ? "left" : "right"];
        var yValue = style[isOriginTop ? "top" : "bottom"];
        var x = parseFloat(xValue);
        var y = parseFloat(yValue);
        var layoutSize = this.layout.size;
        if (xValue.indexOf("%") != -1) {
          x = x / 100 * layoutSize.width;
        }
        if (yValue.indexOf("%") != -1) {
          y = y / 100 * layoutSize.height;
        }
        x = isNaN(x) ? 0 : x;
        y = isNaN(y) ? 0 : y;
        x -= isOriginLeft ? layoutSize.paddingLeft : layoutSize.paddingRight;
        y -= isOriginTop ? layoutSize.paddingTop : layoutSize.paddingBottom;
        this.position.x = x;
        this.position.y = y;
      };
      proto.layoutPosition = function() {
        var layoutSize = this.layout.size;
        var style = {};
        var isOriginLeft = this.layout._getOption("originLeft");
        var isOriginTop = this.layout._getOption("originTop");
        var xPadding = isOriginLeft ? "paddingLeft" : "paddingRight";
        var xProperty = isOriginLeft ? "left" : "right";
        var xResetProperty = isOriginLeft ? "right" : "left";
        var x = this.position.x + layoutSize[xPadding];
        style[xProperty] = this.getXValue(x);
        style[xResetProperty] = "";
        var yPadding = isOriginTop ? "paddingTop" : "paddingBottom";
        var yProperty = isOriginTop ? "top" : "bottom";
        var yResetProperty = isOriginTop ? "bottom" : "top";
        var y = this.position.y + layoutSize[yPadding];
        style[yProperty] = this.getYValue(y);
        style[yResetProperty] = "";
        this.css(style);
        this.emitEvent("layout", [this]);
      };
      proto.getXValue = function(x) {
        var isHorizontal = this.layout._getOption("horizontal");
        return this.layout.options.percentPosition && !isHorizontal ? x / this.layout.size.width * 100 + "%" : x + "px";
      };
      proto.getYValue = function(y) {
        var isHorizontal = this.layout._getOption("horizontal");
        return this.layout.options.percentPosition && isHorizontal ? y / this.layout.size.height * 100 + "%" : y + "px";
      };
      proto._transitionTo = function(x, y) {
        this.getPosition();
        var curX = this.position.x;
        var curY = this.position.y;
        var didNotMove = x == this.position.x && y == this.position.y;
        this.setPosition(x, y);
        if (didNotMove && !this.isTransitioning) {
          this.layoutPosition();
          return;
        }
        var transX = x - curX;
        var transY = y - curY;
        var transitionStyle = {};
        transitionStyle.transform = this.getTranslate(transX, transY);
        this.transition({
          to: transitionStyle,
          onTransitionEnd: {
            transform: this.layoutPosition
          },
          isCleaning: true
        });
      };
      proto.getTranslate = function(x, y) {
        var isOriginLeft = this.layout._getOption("originLeft");
        var isOriginTop = this.layout._getOption("originTop");
        x = isOriginLeft ? x : -x;
        y = isOriginTop ? y : -y;
        return "translate3d(" + x + "px, " + y + "px, 0)";
      };
      proto.goTo = function(x, y) {
        this.setPosition(x, y);
        this.layoutPosition();
      };
      proto.moveTo = proto._transitionTo;
      proto.setPosition = function(x, y) {
        this.position.x = parseFloat(x);
        this.position.y = parseFloat(y);
      };
      proto._nonTransition = function(args) {
        this.css(args.to);
        if (args.isCleaning) {
          this._removeStyles(args.to);
        }
        for (var prop2 in args.onTransitionEnd) {
          args.onTransitionEnd[prop2].call(this);
        }
      };
      proto.transition = function(args) {
        if (!parseFloat(this.layout.options.transitionDuration)) {
          this._nonTransition(args);
          return;
        }
        var _transition = this._transn;
        for (var prop2 in args.onTransitionEnd) {
          _transition.onEnd[prop2] = args.onTransitionEnd[prop2];
        }
        for (prop2 in args.to) {
          _transition.ingProperties[prop2] = true;
          if (args.isCleaning) {
            _transition.clean[prop2] = true;
          }
        }
        if (args.from) {
          this.css(args.from);
          this.element.offsetHeight;
        }
        this.enableTransition(args.to);
        this.css(args.to);
        this.isTransitioning = true;
      };
      function toDashedAll(str) {
        return str.replace(/([A-Z])/g, function($1) {
          return "-" + $1.toLowerCase();
        });
      }
      var transitionProps = "opacity," + toDashedAll(transformProperty);
      proto.enableTransition = function() {
        if (this.isTransitioning) {
          return;
        }
        var duration = this.layout.options.transitionDuration;
        duration = typeof duration == "number" ? duration + "ms" : duration;
        this.css({
          transitionProperty: transitionProps,
          transitionDuration: duration,
          transitionDelay: this.staggerDelay || 0
        });
        this.element.addEventListener(transitionEndEvent, this, false);
      };
      proto.onwebkitTransitionEnd = function(event2) {
        this.ontransitionend(event2);
      };
      proto.onotransitionend = function(event2) {
        this.ontransitionend(event2);
      };
      var dashedVendorProperties = {
        "-webkit-transform": "transform"
      };
      proto.ontransitionend = function(event2) {
        if (event2.target !== this.element) {
          return;
        }
        var _transition = this._transn;
        var propertyName = dashedVendorProperties[event2.propertyName] || event2.propertyName;
        delete _transition.ingProperties[propertyName];
        if (isEmptyObj(_transition.ingProperties)) {
          this.disableTransition();
        }
        if (propertyName in _transition.clean) {
          this.element.style[event2.propertyName] = "";
          delete _transition.clean[propertyName];
        }
        if (propertyName in _transition.onEnd) {
          var onTransitionEnd = _transition.onEnd[propertyName];
          onTransitionEnd.call(this);
          delete _transition.onEnd[propertyName];
        }
        this.emitEvent("transitionEnd", [this]);
      };
      proto.disableTransition = function() {
        this.removeTransitionStyles();
        this.element.removeEventListener(transitionEndEvent, this, false);
        this.isTransitioning = false;
      };
      proto._removeStyles = function(style) {
        var cleanStyle = {};
        for (var prop2 in style) {
          cleanStyle[prop2] = "";
        }
        this.css(cleanStyle);
      };
      var cleanTransitionStyle = {
        transitionProperty: "",
        transitionDuration: "",
        transitionDelay: ""
      };
      proto.removeTransitionStyles = function() {
        this.css(cleanTransitionStyle);
      };
      proto.stagger = function(delay) {
        delay = isNaN(delay) ? 0 : delay;
        this.staggerDelay = delay + "ms";
      };
      proto.removeElem = function() {
        this.element.parentNode.removeChild(this.element);
        this.css({ display: "" });
        this.emitEvent("remove", [this]);
      };
      proto.remove = function() {
        if (!transitionProperty || !parseFloat(this.layout.options.transitionDuration)) {
          this.removeElem();
          return;
        }
        this.once("transitionEnd", function() {
          this.removeElem();
        });
        this.hide();
      };
      proto.reveal = function() {
        delete this.isHidden;
        this.css({ display: "" });
        var options = this.layout.options;
        var onTransitionEnd = {};
        var transitionEndProperty = this.getHideRevealTransitionEndProperty("visibleStyle");
        onTransitionEnd[transitionEndProperty] = this.onRevealTransitionEnd;
        this.transition({
          from: options.hiddenStyle,
          to: options.visibleStyle,
          isCleaning: true,
          onTransitionEnd
        });
      };
      proto.onRevealTransitionEnd = function() {
        if (!this.isHidden) {
          this.emitEvent("reveal");
        }
      };
      proto.getHideRevealTransitionEndProperty = function(styleProperty) {
        var optionStyle = this.layout.options[styleProperty];
        if (optionStyle.opacity) {
          return "opacity";
        }
        for (var prop2 in optionStyle) {
          return prop2;
        }
      };
      proto.hide = function() {
        this.isHidden = true;
        this.css({ display: "" });
        var options = this.layout.options;
        var onTransitionEnd = {};
        var transitionEndProperty = this.getHideRevealTransitionEndProperty("hiddenStyle");
        onTransitionEnd[transitionEndProperty] = this.onHideTransitionEnd;
        this.transition({
          from: options.visibleStyle,
          to: options.hiddenStyle,
          // keep hidden stuff hidden
          isCleaning: true,
          onTransitionEnd
        });
      };
      proto.onHideTransitionEnd = function() {
        if (this.isHidden) {
          this.css({ display: "none" });
          this.emitEvent("hide");
        }
      };
      proto.destroy = function() {
        this.css({
          position: "",
          left: "",
          right: "",
          top: "",
          bottom: "",
          transition: "",
          transform: ""
        });
      };
      return Item2;
    });
  })(item);
  return item.exports;
}
/*!
 * Outlayer v2.1.1
 * the brains and guts of a layout library
 * MIT license
 */
var hasRequiredOutlayer;
function requireOutlayer() {
  if (hasRequiredOutlayer) return outlayer.exports;
  hasRequiredOutlayer = 1;
  (function(module) {
    (function(window2, factory) {
      if (module.exports) {
        module.exports = factory(
          window2,
          requireEvEmitter(),
          requireGetSize(),
          requireUtils(),
          requireItem()
        );
      } else {
        window2.Outlayer = factory(
          window2,
          window2.EvEmitter,
          window2.getSize,
          window2.fizzyUIUtils,
          window2.Outlayer.Item
        );
      }
    })(window, function factory(window2, EvEmitter, getSize2, utils2, Item2) {
      var console2 = window2.console;
      var jQuery = window2.jQuery;
      var noop2 = function() {
      };
      var GUID = 0;
      var instances = {};
      function Outlayer(element, options) {
        var queryElement = utils2.getQueryElement(element);
        if (!queryElement) {
          if (console2) {
            console2.error("Bad element for " + this.constructor.namespace + ": " + (queryElement || element));
          }
          return;
        }
        this.element = queryElement;
        if (jQuery) {
          this.$element = jQuery(this.element);
        }
        this.options = utils2.extend({}, this.constructor.defaults);
        this.option(options);
        var id = ++GUID;
        this.element.outlayerGUID = id;
        instances[id] = this;
        this._create();
        var isInitLayout = this._getOption("initLayout");
        if (isInitLayout) {
          this.layout();
        }
      }
      Outlayer.namespace = "outlayer";
      Outlayer.Item = Item2;
      Outlayer.defaults = {
        containerStyle: {
          position: "relative"
        },
        initLayout: true,
        originLeft: true,
        originTop: true,
        resize: true,
        resizeContainer: true,
        // item options
        transitionDuration: "0.4s",
        hiddenStyle: {
          opacity: 0,
          transform: "scale(0.001)"
        },
        visibleStyle: {
          opacity: 1,
          transform: "scale(1)"
        }
      };
      var proto = Outlayer.prototype;
      utils2.extend(proto, EvEmitter.prototype);
      proto.option = function(opts) {
        utils2.extend(this.options, opts);
      };
      proto._getOption = function(option) {
        var oldOption = this.constructor.compatOptions[option];
        return oldOption && this.options[oldOption] !== void 0 ? this.options[oldOption] : this.options[option];
      };
      Outlayer.compatOptions = {
        // currentName: oldName
        initLayout: "isInitLayout",
        horizontal: "isHorizontal",
        layoutInstant: "isLayoutInstant",
        originLeft: "isOriginLeft",
        originTop: "isOriginTop",
        resize: "isResizeBound",
        resizeContainer: "isResizingContainer"
      };
      proto._create = function() {
        this.reloadItems();
        this.stamps = [];
        this.stamp(this.options.stamp);
        utils2.extend(this.element.style, this.options.containerStyle);
        var canBindResize = this._getOption("resize");
        if (canBindResize) {
          this.bindResize();
        }
      };
      proto.reloadItems = function() {
        this.items = this._itemize(this.element.children);
      };
      proto._itemize = function(elems) {
        var itemElems = this._filterFindItemElements(elems);
        var Item3 = this.constructor.Item;
        var items = [];
        for (var i = 0; i < itemElems.length; i++) {
          var elem = itemElems[i];
          var item2 = new Item3(elem, this);
          items.push(item2);
        }
        return items;
      };
      proto._filterFindItemElements = function(elems) {
        return utils2.filterFindElements(elems, this.options.itemSelector);
      };
      proto.getItemElements = function() {
        return this.items.map(function(item2) {
          return item2.element;
        });
      };
      proto.layout = function() {
        this._resetLayout();
        this._manageStamps();
        var layoutInstant = this._getOption("layoutInstant");
        var isInstant = layoutInstant !== void 0 ? layoutInstant : !this._isLayoutInited;
        this.layoutItems(this.items, isInstant);
        this._isLayoutInited = true;
      };
      proto._init = proto.layout;
      proto._resetLayout = function() {
        this.getSize();
      };
      proto.getSize = function() {
        this.size = getSize2(this.element);
      };
      proto._getMeasurement = function(measurement, size) {
        var option = this.options[measurement];
        var elem;
        if (!option) {
          this[measurement] = 0;
        } else {
          if (typeof option == "string") {
            elem = this.element.querySelector(option);
          } else if (option instanceof HTMLElement) {
            elem = option;
          }
          this[measurement] = elem ? getSize2(elem)[size] : option;
        }
      };
      proto.layoutItems = function(items, isInstant) {
        items = this._getItemsForLayout(items);
        this._layoutItems(items, isInstant);
        this._postLayout();
      };
      proto._getItemsForLayout = function(items) {
        return items.filter(function(item2) {
          return !item2.isIgnored;
        });
      };
      proto._layoutItems = function(items, isInstant) {
        this._emitCompleteOnItems("layout", items);
        if (!items || !items.length) {
          return;
        }
        var queue = [];
        items.forEach(function(item2) {
          var position = this._getItemLayoutPosition(item2);
          position.item = item2;
          position.isInstant = isInstant || item2.isLayoutInstant;
          queue.push(position);
        }, this);
        this._processLayoutQueue(queue);
      };
      proto._getItemLayoutPosition = function() {
        return {
          x: 0,
          y: 0
        };
      };
      proto._processLayoutQueue = function(queue) {
        this.updateStagger();
        queue.forEach(function(obj, i) {
          this._positionItem(obj.item, obj.x, obj.y, obj.isInstant, i);
        }, this);
      };
      proto.updateStagger = function() {
        var stagger = this.options.stagger;
        if (stagger === null || stagger === void 0) {
          this.stagger = 0;
          return;
        }
        this.stagger = getMilliseconds(stagger);
        return this.stagger;
      };
      proto._positionItem = function(item2, x, y, isInstant, i) {
        if (isInstant) {
          item2.goTo(x, y);
        } else {
          item2.stagger(i * this.stagger);
          item2.moveTo(x, y);
        }
      };
      proto._postLayout = function() {
        this.resizeContainer();
      };
      proto.resizeContainer = function() {
        var isResizingContainer = this._getOption("resizeContainer");
        if (!isResizingContainer) {
          return;
        }
        var size = this._getContainerSize();
        if (size) {
          this._setContainerMeasure(size.width, true);
          this._setContainerMeasure(size.height, false);
        }
      };
      proto._getContainerSize = noop2;
      proto._setContainerMeasure = function(measure, isWidth) {
        if (measure === void 0) {
          return;
        }
        var elemSize = this.size;
        if (elemSize.isBorderBox) {
          measure += isWidth ? elemSize.paddingLeft + elemSize.paddingRight + elemSize.borderLeftWidth + elemSize.borderRightWidth : elemSize.paddingBottom + elemSize.paddingTop + elemSize.borderTopWidth + elemSize.borderBottomWidth;
        }
        measure = Math.max(measure, 0);
        this.element.style[isWidth ? "width" : "height"] = measure + "px";
      };
      proto._emitCompleteOnItems = function(eventName, items) {
        var _this = this;
        function onComplete() {
          _this.dispatchEvent(eventName + "Complete", null, [items]);
        }
        var count = items.length;
        if (!items || !count) {
          onComplete();
          return;
        }
        var doneCount = 0;
        function tick2() {
          doneCount++;
          if (doneCount == count) {
            onComplete();
          }
        }
        items.forEach(function(item2) {
          item2.once(eventName, tick2);
        });
      };
      proto.dispatchEvent = function(type, event2, args) {
        var emitArgs = event2 ? [event2].concat(args) : args;
        this.emitEvent(type, emitArgs);
        if (jQuery) {
          this.$element = this.$element || jQuery(this.element);
          if (event2) {
            var $event = jQuery.Event(event2);
            $event.type = type;
            this.$element.trigger($event, args);
          } else {
            this.$element.trigger(type, args);
          }
        }
      };
      proto.ignore = function(elem) {
        var item2 = this.getItem(elem);
        if (item2) {
          item2.isIgnored = true;
        }
      };
      proto.unignore = function(elem) {
        var item2 = this.getItem(elem);
        if (item2) {
          delete item2.isIgnored;
        }
      };
      proto.stamp = function(elems) {
        elems = this._find(elems);
        if (!elems) {
          return;
        }
        this.stamps = this.stamps.concat(elems);
        elems.forEach(this.ignore, this);
      };
      proto.unstamp = function(elems) {
        elems = this._find(elems);
        if (!elems) {
          return;
        }
        elems.forEach(function(elem) {
          utils2.removeFrom(this.stamps, elem);
          this.unignore(elem);
        }, this);
      };
      proto._find = function(elems) {
        if (!elems) {
          return;
        }
        if (typeof elems == "string") {
          elems = this.element.querySelectorAll(elems);
        }
        elems = utils2.makeArray(elems);
        return elems;
      };
      proto._manageStamps = function() {
        if (!this.stamps || !this.stamps.length) {
          return;
        }
        this._getBoundingRect();
        this.stamps.forEach(this._manageStamp, this);
      };
      proto._getBoundingRect = function() {
        var boundingRect = this.element.getBoundingClientRect();
        var size = this.size;
        this._boundingRect = {
          left: boundingRect.left + size.paddingLeft + size.borderLeftWidth,
          top: boundingRect.top + size.paddingTop + size.borderTopWidth,
          right: boundingRect.right - (size.paddingRight + size.borderRightWidth),
          bottom: boundingRect.bottom - (size.paddingBottom + size.borderBottomWidth)
        };
      };
      proto._manageStamp = noop2;
      proto._getElementOffset = function(elem) {
        var boundingRect = elem.getBoundingClientRect();
        var thisRect = this._boundingRect;
        var size = getSize2(elem);
        var offset = {
          left: boundingRect.left - thisRect.left - size.marginLeft,
          top: boundingRect.top - thisRect.top - size.marginTop,
          right: thisRect.right - boundingRect.right - size.marginRight,
          bottom: thisRect.bottom - boundingRect.bottom - size.marginBottom
        };
        return offset;
      };
      proto.handleEvent = utils2.handleEvent;
      proto.bindResize = function() {
        window2.addEventListener("resize", this);
        this.isResizeBound = true;
      };
      proto.unbindResize = function() {
        window2.removeEventListener("resize", this);
        this.isResizeBound = false;
      };
      proto.onresize = function() {
        this.resize();
      };
      utils2.debounceMethod(Outlayer, "onresize", 100);
      proto.resize = function() {
        if (!this.isResizeBound || !this.needsResizeLayout()) {
          return;
        }
        this.layout();
      };
      proto.needsResizeLayout = function() {
        var size = getSize2(this.element);
        var hasSizes = this.size && size;
        return hasSizes && size.innerWidth !== this.size.innerWidth;
      };
      proto.addItems = function(elems) {
        var items = this._itemize(elems);
        if (items.length) {
          this.items = this.items.concat(items);
        }
        return items;
      };
      proto.appended = function(elems) {
        var items = this.addItems(elems);
        if (!items.length) {
          return;
        }
        this.layoutItems(items, true);
        this.reveal(items);
      };
      proto.prepended = function(elems) {
        var items = this._itemize(elems);
        if (!items.length) {
          return;
        }
        var previousItems = this.items.slice(0);
        this.items = items.concat(previousItems);
        this._resetLayout();
        this._manageStamps();
        this.layoutItems(items, true);
        this.reveal(items);
        this.layoutItems(previousItems);
      };
      proto.reveal = function(items) {
        this._emitCompleteOnItems("reveal", items);
        if (!items || !items.length) {
          return;
        }
        var stagger = this.updateStagger();
        items.forEach(function(item2, i) {
          item2.stagger(i * stagger);
          item2.reveal();
        });
      };
      proto.hide = function(items) {
        this._emitCompleteOnItems("hide", items);
        if (!items || !items.length) {
          return;
        }
        var stagger = this.updateStagger();
        items.forEach(function(item2, i) {
          item2.stagger(i * stagger);
          item2.hide();
        });
      };
      proto.revealItemElements = function(elems) {
        var items = this.getItems(elems);
        this.reveal(items);
      };
      proto.hideItemElements = function(elems) {
        var items = this.getItems(elems);
        this.hide(items);
      };
      proto.getItem = function(elem) {
        for (var i = 0; i < this.items.length; i++) {
          var item2 = this.items[i];
          if (item2.element == elem) {
            return item2;
          }
        }
      };
      proto.getItems = function(elems) {
        elems = utils2.makeArray(elems);
        var items = [];
        elems.forEach(function(elem) {
          var item2 = this.getItem(elem);
          if (item2) {
            items.push(item2);
          }
        }, this);
        return items;
      };
      proto.remove = function(elems) {
        var removeItems = this.getItems(elems);
        this._emitCompleteOnItems("remove", removeItems);
        if (!removeItems || !removeItems.length) {
          return;
        }
        removeItems.forEach(function(item2) {
          item2.remove();
          utils2.removeFrom(this.items, item2);
        }, this);
      };
      proto.destroy = function() {
        var style = this.element.style;
        style.height = "";
        style.position = "";
        style.width = "";
        this.items.forEach(function(item2) {
          item2.destroy();
        });
        this.unbindResize();
        var id = this.element.outlayerGUID;
        delete instances[id];
        delete this.element.outlayerGUID;
        if (jQuery) {
          jQuery.removeData(this.element, this.constructor.namespace);
        }
      };
      Outlayer.data = function(elem) {
        elem = utils2.getQueryElement(elem);
        var id = elem && elem.outlayerGUID;
        return id && instances[id];
      };
      Outlayer.create = function(namespace, options) {
        var Layout = subclass(Outlayer);
        Layout.defaults = utils2.extend({}, Outlayer.defaults);
        utils2.extend(Layout.defaults, options);
        Layout.compatOptions = utils2.extend({}, Outlayer.compatOptions);
        Layout.namespace = namespace;
        Layout.data = Outlayer.data;
        Layout.Item = subclass(Item2);
        utils2.htmlInit(Layout, namespace);
        if (jQuery && jQuery.bridget) {
          jQuery.bridget(namespace, Layout);
        }
        return Layout;
      };
      function subclass(Parent) {
        function SubClass() {
          Parent.apply(this, arguments);
        }
        SubClass.prototype = Object.create(Parent.prototype);
        SubClass.prototype.constructor = SubClass;
        return SubClass;
      }
      var msUnits = {
        ms: 1,
        s: 1e3
      };
      function getMilliseconds(time) {
        if (typeof time == "number") {
          return time;
        }
        var matches = time.match(/(^\d*\.?\d*)(\w*)/);
        var num = matches && matches[1];
        var unit = matches && matches[2];
        if (!num.length) {
          return 0;
        }
        num = parseFloat(num);
        var mult = msUnits[unit] || 1;
        return num * mult;
      }
      Outlayer.Item = Item2;
      return Outlayer;
    });
  })(outlayer);
  return outlayer.exports;
}
/*!
 * Masonry v4.2.2
 * Cascading grid layout library
 * https://masonry.desandro.com
 * MIT License
 * by David DeSandro
 */
var hasRequiredMasonry;
function requireMasonry() {
  if (hasRequiredMasonry) return masonry.exports;
  hasRequiredMasonry = 1;
  (function(module) {
    (function(window2, factory) {
      if (module.exports) {
        module.exports = factory(
          requireOutlayer(),
          requireGetSize()
        );
      } else {
        window2.Masonry = factory(
          window2.Outlayer,
          window2.getSize
        );
      }
    })(window, function factory(Outlayer, getSize2) {
      var Masonry2 = Outlayer.create("masonry");
      Masonry2.compatOptions.fitWidth = "isFitWidth";
      var proto = Masonry2.prototype;
      proto._resetLayout = function() {
        this.getSize();
        this._getMeasurement("columnWidth", "outerWidth");
        this._getMeasurement("gutter", "outerWidth");
        this.measureColumns();
        this.colYs = [];
        for (var i = 0; i < this.cols; i++) {
          this.colYs.push(0);
        }
        this.maxY = 0;
        this.horizontalColIndex = 0;
      };
      proto.measureColumns = function() {
        this.getContainerWidth();
        if (!this.columnWidth) {
          var firstItem = this.items[0];
          var firstItemElem = firstItem && firstItem.element;
          this.columnWidth = firstItemElem && getSize2(firstItemElem).outerWidth || // if first elem has no width, default to size of container
          this.containerWidth;
        }
        var columnWidth = this.columnWidth += this.gutter;
        var containerWidth = this.containerWidth + this.gutter;
        var cols = containerWidth / columnWidth;
        var excess = columnWidth - containerWidth % columnWidth;
        var mathMethod = excess && excess < 1 ? "round" : "floor";
        cols = Math[mathMethod](cols);
        this.cols = Math.max(cols, 1);
      };
      proto.getContainerWidth = function() {
        var isFitWidth = this._getOption("fitWidth");
        var container = isFitWidth ? this.element.parentNode : this.element;
        var size = getSize2(container);
        this.containerWidth = size && size.innerWidth;
      };
      proto._getItemLayoutPosition = function(item2) {
        item2.getSize();
        var remainder = item2.size.outerWidth % this.columnWidth;
        var mathMethod = remainder && remainder < 1 ? "round" : "ceil";
        var colSpan = Math[mathMethod](item2.size.outerWidth / this.columnWidth);
        colSpan = Math.min(colSpan, this.cols);
        var colPosMethod = this.options.horizontalOrder ? "_getHorizontalColPosition" : "_getTopColPosition";
        var colPosition = this[colPosMethod](colSpan, item2);
        var position = {
          x: this.columnWidth * colPosition.col,
          y: colPosition.y
        };
        var setHeight = colPosition.y + item2.size.outerHeight;
        var setMax = colSpan + colPosition.col;
        for (var i = colPosition.col; i < setMax; i++) {
          this.colYs[i] = setHeight;
        }
        return position;
      };
      proto._getTopColPosition = function(colSpan) {
        var colGroup = this._getTopColGroup(colSpan);
        var minimumY = Math.min.apply(Math, colGroup);
        return {
          col: colGroup.indexOf(minimumY),
          y: minimumY
        };
      };
      proto._getTopColGroup = function(colSpan) {
        if (colSpan < 2) {
          return this.colYs;
        }
        var colGroup = [];
        var groupCount = this.cols + 1 - colSpan;
        for (var i = 0; i < groupCount; i++) {
          colGroup[i] = this._getColGroupY(i, colSpan);
        }
        return colGroup;
      };
      proto._getColGroupY = function(col, colSpan) {
        if (colSpan < 2) {
          return this.colYs[col];
        }
        var groupColYs = this.colYs.slice(col, col + colSpan);
        return Math.max.apply(Math, groupColYs);
      };
      proto._getHorizontalColPosition = function(colSpan, item2) {
        var col = this.horizontalColIndex % this.cols;
        var isOver = colSpan > 1 && col + colSpan > this.cols;
        col = isOver ? 0 : col;
        var hasSize = item2.size.outerWidth && item2.size.outerHeight;
        this.horizontalColIndex = hasSize ? col + colSpan : this.horizontalColIndex;
        return {
          col,
          y: this._getColGroupY(col, colSpan)
        };
      };
      proto._manageStamp = function(stamp) {
        var stampSize = getSize2(stamp);
        var offset = this._getElementOffset(stamp);
        var isOriginLeft = this._getOption("originLeft");
        var firstX = isOriginLeft ? offset.left : offset.right;
        var lastX = firstX + stampSize.outerWidth;
        var firstCol = Math.floor(firstX / this.columnWidth);
        firstCol = Math.max(0, firstCol);
        var lastCol = Math.floor(lastX / this.columnWidth);
        lastCol -= lastX % this.columnWidth ? 0 : 1;
        lastCol = Math.min(this.cols - 1, lastCol);
        var isOriginTop = this._getOption("originTop");
        var stampMaxY = (isOriginTop ? offset.top : offset.bottom) + stampSize.outerHeight;
        for (var i = firstCol; i <= lastCol; i++) {
          this.colYs[i] = Math.max(stampMaxY, this.colYs[i]);
        }
      };
      proto._getContainerSize = function() {
        this.maxY = Math.max.apply(Math, this.colYs);
        var size = {
          height: this.maxY
        };
        if (this._getOption("fitWidth")) {
          size.width = this._getContainerFitWidth();
        }
        return size;
      };
      proto._getContainerFitWidth = function() {
        var unusedCols = 0;
        var i = this.cols;
        while (--i) {
          if (this.colYs[i] !== 0) {
            break;
          }
          unusedCols++;
        }
        return (this.cols - unusedCols) * this.columnWidth - this.gutter;
      };
      proto.needsResizeLayout = function() {
        var previousWidth = this.containerWidth;
        this.getContainerWidth();
        return previousWidth != this.containerWidth;
      };
      return Masonry2;
    });
  })(masonry);
  return masonry.exports;
}
var masonryExports = requireMasonry();
const Masonry = /* @__PURE__ */ getDefaultExportFromCjs(masonryExports);
function setupMasonry({
  container,
  itemSelector,
  gridSizerSelector,
  gutterSizerSelector,
  minItemWidth = 220,
  onLayoutStateChange = () => {
  }
}) {
  if (!container) return () => {
  };
  const form = container.parentElement;
  const getLayoutState = (columnCount) => {
    if (columnCount >= 3) return "wide";
    if (columnCount === 2) return "medium";
    return "small";
  };
  const applySpanWidths = (columnCount, itemWidth, gutterPx) => {
    const twoSpan = container.querySelectorAll(".two-span-selectable");
    const threeSpan = container.querySelectorAll(".three-span-selectable");
    const twoSpanWidth = columnCount >= 2 ? itemWidth * 2 + gutterPx : itemWidth;
    const threeSpanWidth = columnCount >= 3 ? itemWidth * 3 + gutterPx * 2 : itemWidth;
    twoSpan.forEach((el) => {
      el.style.width = `${twoSpanWidth}px`;
    });
    threeSpan.forEach((el) => {
      el.style.width = `${threeSpanWidth}px`;
    });
    const state2 = getLayoutState(columnCount);
    onLayoutStateChange(state2);
  };
  const applyWidths = () => {
    const style = getComputedStyle(form);
    const parentPadding = parseFloat(style.paddingLeft) || 0;
    const parentWidth = form.offsetWidth - 2 * parentPadding;
    const gutterEl = container.querySelector(gutterSizerSelector);
    const gutterPx = gutterEl ? parseFloat(getComputedStyle(gutterEl).width) : 20;
    const firstItem = container.querySelector(itemSelector);
    const minItem = firstItem ? parseFloat(getComputedStyle(firstItem).minWidth) || minItemWidth : minItemWidth;
    const columnCount = Math.max(Math.floor((parentWidth + gutterPx) / (minItem + gutterPx)), 1);
    const totalGutter = gutterPx * (columnCount - 1);
    const itemWidth = Math.floor((parentWidth - totalGutter) / columnCount);
    container.querySelectorAll(itemSelector).forEach((item2) => {
      item2.style.width = `${itemWidth}px`;
    });
    const sizer = container.querySelector(gridSizerSelector);
    if (sizer) sizer.style.width = `${itemWidth}px`;
    applySpanWidths(columnCount, itemWidth, gutterPx);
  };
  const msnry = new Masonry(container, {
    itemSelector,
    columnWidth: gridSizerSelector,
    gutter: gutterSizerSelector,
    percentPosition: true
  });
  const resizeObserver = new ResizeObserver(() => {
    requestAnimationFrame(() => {
      applyWidths();
      msnry.reloadItems();
      msnry.layout();
    });
  });
  resizeObserver.observe(form);
  const itemObservers = [];
  container.querySelectorAll(itemSelector).forEach((item2) => {
    const obs = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        msnry.reloadItems();
        msnry.layout();
      });
    });
    obs.observe(item2);
    itemObservers.push(obs);
  });
  applyWidths();
  msnry.reloadItems();
  msnry.layout();
  return () => {
    resizeObserver.disconnect();
    itemObservers.forEach((obs) => obs.disconnect());
    msnry.destroy();
  };
}
var root_1$4 = /* @__PURE__ */ template(`<div class="stat-card"><!></div>`);
var root$f = /* @__PURE__ */ template(`<!> <h1> </h1> <div class="attribute-masonry-grid"><div class="attribute-grid-sizer"></div> <div class="attribute-gutter-sizer"></div> <!></div>`, 1);
function Attributes($$anchor, $$props) {
  push($$props, true);
  let actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({})), id = prop($$props, "id", 19, () => ({}));
  prop($$props, "span", 19, () => ({}));
  let attributes = proxy(actor().system.attributes);
  let gridContainer;
  let isShoppingState = state(false);
  user_effect(() => {
    const unsubscribe = shoppingState.subscribe((v) => set(isShoppingState, proxy(v)));
    return unsubscribe;
  });
  user_effect(() => {
    const cleanup = setupMasonry({
      container: gridContainer,
      itemSelector: ".stat-card",
      gridSizerSelector: ".attribute-grid-sizer",
      gutterSizerSelector: ".attribute-gutter-sizer",
      minItemWidth: 180
    });
    return cleanup;
  });
  var fragment = root$f();
  var node = first_child(fragment);
  CardToolbar(node, {
    get id() {
      return id();
    }
  });
  var h1 = sibling(node, 2);
  var text2 = child(h1);
  var div = sibling(h1, 2);
  var node_1 = sibling(child(div), 4);
  each(node_1, 17, () => Object.entries(attributes), index, ($$anchor2, $$item) => {
    let key = () => get$1($$item)[0];
    let stat = () => get$1($$item)[1];
    var div_1 = root_1$4();
    var node_2 = child(div_1);
    AttributeCard(node_2, {
      get stat() {
        return stat();
      },
      get config() {
        return config();
      },
      get key() {
        return key();
      },
      get isShoppingState() {
        return get$1(isShoppingState);
      }
    });
    append($$anchor2, div_1);
  });
  bind_this(div, ($$value) => gridContainer = $$value, () => gridContainer);
  template_effect(($0) => set_text(text2, $0), [
    () => localize(config().attributes.attributes)
  ]);
  append($$anchor, fragment);
  pop();
}
var root$e = /* @__PURE__ */ template(`<div>Hello Derived Attribute</div>`);
function SkillsLangauge($$anchor) {
  var div = root$e();
  append($$anchor, div);
}
var root$d = /* @__PURE__ */ template(`<div>Hello Derived Attribute</div>`);
function SkillsKnowledge($$anchor) {
  var div = root$d();
  append($$anchor, div);
}
var root$c = /* @__PURE__ */ template(`<div>Hello Component</div>`);
function SkillsActive($$anchor) {
  var div = root$c();
  append($$anchor, div);
}
var on_click$1 = (_, activeTab) => set(activeTab, "active");
var on_click_1 = (__1, activeTab) => set(activeTab, "knowledge");
var on_click_2 = (__2, activeTab) => set(activeTab, "language");
var root$b = /* @__PURE__ */ template(`<!> <div class="skills"><h1> </h1> <div class="sr3e-tabs"><button>Active Skills</button> <button>Knowledge Skills</button> <button>Language Skills</button></div> <div class="sr3e-inner-background"><!></div></div>`, 1);
function Skills($$anchor, $$props) {
  push($$props, true);
  let actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({})), id = prop($$props, "id", 19, () => ({}));
  prop($$props, "span", 19, () => ({}));
  let activeTab = state("active");
  actor().skills || [];
  var fragment = root$b();
  var node = first_child(fragment);
  CardToolbar(node, {
    get id() {
      return id();
    }
  });
  var div = sibling(node, 2);
  var h1 = child(div);
  var text2 = child(h1);
  var div_1 = sibling(h1, 2);
  var button = child(div_1);
  button.__click = [on_click$1, activeTab];
  var button_1 = sibling(button, 2);
  button_1.__click = [on_click_1, activeTab];
  var button_2 = sibling(button_1, 2);
  button_2.__click = [on_click_2, activeTab];
  var div_2 = sibling(div_1, 2);
  var node_1 = child(div_2);
  {
    var consequent = ($$anchor2) => {
      SkillsActive($$anchor2);
    };
    var alternate_1 = ($$anchor2) => {
      var fragment_2 = comment();
      var node_2 = first_child(fragment_2);
      {
        var consequent_1 = ($$anchor3) => {
          SkillsKnowledge($$anchor3);
        };
        var alternate = ($$anchor3) => {
          var fragment_4 = comment();
          var node_3 = first_child(fragment_4);
          {
            var consequent_2 = ($$anchor4) => {
              SkillsLangauge($$anchor4);
            };
            if_block(
              node_3,
              ($$render) => {
                if (get$1(activeTab) === "language") $$render(consequent_2);
              },
              true
            );
          }
          append($$anchor3, fragment_4);
        };
        if_block(
          node_2,
          ($$render) => {
            if (get$1(activeTab) === "knowledge") $$render(consequent_1);
            else $$render(alternate, false);
          },
          true
        );
      }
      append($$anchor2, fragment_2);
    };
    if_block(node_1, ($$render) => {
      if (get$1(activeTab) === "active") $$render(consequent);
      else $$render(alternate_1, false);
    });
  }
  template_effect(
    ($0) => {
      set_text(text2, $0);
      toggle_class(button, "active", get$1(activeTab) === "active");
      toggle_class(button_1, "active", get$1(activeTab) === "knowledge");
      toggle_class(button_2, "active", get$1(activeTab) === "language");
    },
    [() => localize(config().skills.skills)]
  );
  append($$anchor, fragment);
  pop();
}
delegate(["click"]);
var root$a = /* @__PURE__ */ template(`<!> <div class="health"><h1> </h1> <span> </span></div>`, 1);
function Health($$anchor, $$props) {
  push($$props, true);
  let actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({})), id = prop($$props, "id", 19, () => ({}));
  var fragment = root$a();
  var node = first_child(fragment);
  CardToolbar(node, {
    get id() {
      return id();
    }
  });
  var div = sibling(node, 2);
  var h1 = child(div);
  var text2 = child(h1);
  var span = sibling(h1, 2);
  var text_1 = child(span);
  template_effect(
    ($0) => {
      set_text(text2, $0);
      set_text(text_1, actor().system.profile.metaHumanity ?? "Fluffy Dog Lasagna");
    },
    [() => localize(config().health.health)]
  );
  append($$anchor, fragment);
  pop();
}
var root$9 = /* @__PURE__ */ template(`<!> <div class="inventory"><h1> </h1> <span> </span></div>`, 1);
function Inventory($$anchor, $$props) {
  push($$props, true);
  let actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({})), id = prop($$props, "id", 19, () => ({}));
  prop($$props, "span", 19, () => ({}));
  var fragment = root$9();
  var node = first_child(fragment);
  CardToolbar(node, {
    get id() {
      return id();
    }
  });
  var div = sibling(node, 2);
  var h1 = child(div);
  var text2 = child(h1);
  var span_1 = sibling(h1, 2);
  var text_1 = child(span_1);
  template_effect(
    ($0) => {
      set_text(text2, $0);
      set_text(text_1, actor().system.profile.metaHumanity ?? "Fluffy Dog Lasagna");
    },
    [
      () => localize(config().inventory.inventory)
    ]
  );
  append($$anchor, fragment);
  pop();
}
var root_1$3 = /* @__PURE__ */ template(`<div><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><!></div></div></div>`);
var root$8 = /* @__PURE__ */ template(`<div class="sheet-character-masonry-main"><div class="layout-grid-sizer"></div> <div class="layout-gutter-sizer"></div> <!></div>`);
function CharacterSheetApp($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $cardLayout = () => store_get(cardLayout, "$cardLayout", $$stores);
  const defaultCardArray = [
    {
      comp: Dossier,
      props: {
        actor: $$props.actor,
        config: $$props.config,
        id: 0,
        span: 1
      }
    },
    {
      comp: Attributes,
      props: {
        actor: $$props.actor,
        config: $$props.config,
        id: 1,
        span: 1
      }
    },
    {
      comp: Skills,
      props: {
        actor: $$props.actor,
        config: $$props.config,
        id: 2,
        span: 1
      }
    },
    {
      comp: Health,
      props: {
        actor: $$props.actor,
        config: $$props.config,
        id: 3,
        span: 1
      }
    },
    {
      comp: Inventory,
      props: {
        actor: $$props.actor,
        config: $$props.config,
        id: 4,
        span: 1
      }
    }
  ];
  user_effect(async () => {
    var _a2;
    console.log("Actor ID " + $$props.actor.id);
    if (!((_a2 = $$props.actor) == null ? void 0 : _a2.id)) return;
    const layout = await $$props.actor.getFlag("sr3e", "customLayout");
    const defaultLayout = defaultCardArray.map((c) => ({ id: c.props.id, span: c.props.span }));
    if (!Array.isArray(layout) || layout.length === 0) {
      cardLayout.set(defaultLayout);
      await $$props.actor.setFlag("sr3e", "customLayout", defaultLayout);
    } else {
      cardLayout.set(layout);
    }
  });
  let cards = state(proxy([]));
  user_effect(() => {
    set(cards, proxy($cardLayout().map(({ id, span }) => {
      const match = defaultCardArray.find((c) => c.props.id === id);
      if (!match) return null;
      return {
        ...match,
        props: {
          ...match.props,
          span: span ?? match.props.span
        }
      };
    }).filter(Boolean)));
  });
  let container = null;
  user_effect(async () => {
    await tick();
    container == null ? void 0 : container.dispatchEvent(new CustomEvent("masonry-reflow"));
  });
  let saveTimeout = null;
  user_effect(() => {
    const layout = $cardLayout();
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(
      () => {
        $$props.actor.setFlag("sr3e", "customLayout", layout);
      },
      200
    );
  });
  let layoutState = state("small");
  user_effect(() => {
    if (!container) return;
    const cleanup = setupMasonry({
      container,
      itemSelector: ".sheet-component",
      gridSizerSelector: ".layout-grid-sizer",
      gutterSizerSelector: ".layout-gutter-sizer",
      minItemWidth: 220,
      onLayoutStateChange: (state2) => {
        set(layoutState, proxy(state2));
      }
    });
    return cleanup;
  });
  var div = root$8();
  var node = sibling(child(div), 4);
  each(node, 17, () => get$1(cards), ({ comp: Comp, props }) => props.id, ($$anchor2, $$item) => {
    let Comp = () => get$1($$item).comp;
    let props = () => get$1($$item).props;
    var div_1 = root_1$3();
    var div_2 = child(div_1);
    var div_3 = sibling(child(div_2), 2);
    var node_1 = child(div_3);
    component(node_1, Comp, ($$anchor3, $$component) => {
      $$component($$anchor3, spread_props(props));
    });
    template_effect(() => set_class(div_1, "sheet-component span-" + (props().span ?? 1)));
    append($$anchor2, div_1);
  });
  bind_this(div, ($$value) => container = $$value, () => container);
  append($$anchor, div);
  pop();
  $$cleanup();
}
var root$7 = /* @__PURE__ */ template(`<div class="neon-name"><!></div>`);
function NeonName($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $actorStore = () => store_get(actorStore, "$actorStore", $$stores);
  let actor = prop($$props, "actor", 19, () => ({}));
  let malfunctioningIndexes = [];
  const actorStore = getActorStore(actor().id, actor().name);
  let name = /* @__PURE__ */ derived(() => $actorStore().name);
  let neonHTML = /* @__PURE__ */ derived(() => getNeonHtml(get$1(name)));
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
    return [...name2].map((char, index2) => malfunctioningIndexes.includes(index2) ? `<div class="neon-name-text malfunc">${char}</div>` : `<div class="neon-name-text">${char}</div>`).join("");
  }
  var div = root$7();
  var node = child(div);
  html(node, () => get$1(neonHTML));
  append($$anchor, div);
  pop();
  $$cleanup();
}
var root$6 = /* @__PURE__ */ template(`<div class="ticker"><div class="left-gradient"></div> <div class="marquee-outer"><div class="marquee-inner"><h1>This should scroll from right to left and disappear on the left.</h1></div></div> <div class="right-gradient"></div></div>`);
function NewsFeed($$anchor) {
  var div = root$6();
  append($$anchor, div);
}
const hooks = {
  init: "init",
  renderApplicationV2: "renderApplicationV2"
};
const flags = {
  sr3e: "sr3e",
  core: "core",
  actor: {
    isShoppingState: "isShoppingState"
  }
};
function toggleShoppingState(_, isShoppingState, actor) {
  set(isShoppingState, !get$1(isShoppingState));
  shoppingState.set(get$1(isShoppingState));
  actor().setFlag(flags.sr3e, flags.actor.isShoppingState, get$1(isShoppingState));
}
var root$5 = /* @__PURE__ */ template(`<div><button type="button"></button></div>`);
function ShoppingCart($$anchor, $$props) {
  push($$props, true);
  let actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({}));
  let isShoppingState = state(true);
  (async () => {
    const current = await actor().getFlag(flags.sr3e, flags.actor.isShoppingState);
    set(isShoppingState, proxy(current ?? true));
    if (current === null) actor().setFlag(flags.sr3e, flags.actor.isShoppingState, true);
  })();
  var div = root$5();
  var button = child(div);
  button.__click = [toggleShoppingState, isShoppingState, actor];
  template_effect(
    ($0) => {
      set_attribute(button, "aria-label", $0);
      set_class(button, `header-control icon fa-solid fa-cart-shopping ${get$1(isShoppingState) ? "pulsing-green-cart" : ""}`);
    },
    [
      () => localize(config().sheet.buyupgrades)
    ]
  );
  append($$anchor, div);
  pop();
}
delegate(["click"]);
class CharacterActorSheet extends foundry.applications.sheets.ActorSheetV2 {
  constructor() {
    super(...arguments);
    __privateAdd(this, _app);
    __privateAdd(this, _neon);
    __privateAdd(this, _feed);
    __privateAdd(this, _cart);
  }
  static get DEFAULT_OPTIONS() {
    return {
      ...super.DEFAULT_OPTIONS,
      id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
      classes: ["sr3e", "sheet", "actor", "character", "ActorSheetV2"],
      template: null,
      position: { width: 820, height: 820 },
      window: {
        resizable: true
      },
      tag: "form",
      submitOnChange: true,
      closeOnSubmit: false
    };
  }
  _renderHTML() {
    return null;
  }
  _replaceHTML(_, windowContent) {
    windowContent.innerHTML = "";
    const form = windowContent.parentNode;
    __privateSet(this, _app, mount(CharacterSheetApp, {
      target: windowContent,
      props: {
        actor: this.document,
        config: CONFIG.sr3e,
        form
      }
    }));
    const header = form.querySelector("header.window-header");
    this._injectNeonName(header);
    this._injectShoppingCart(header);
    this._injectNewsFeed(form, header);
    Log.success("Svelte mounted", this.constructor.name);
    return windowContent;
  }
  _injectNeonName(header) {
    var _a2;
    let neonSlot = header == null ? void 0 : header.previousElementSibling;
    if (!((_a2 = neonSlot == null ? void 0 : neonSlot.classList) == null ? void 0 : _a2.contains("neon-name-position"))) {
      neonSlot = document.createElement("div");
      neonSlot.classList.add("neon-name-position");
      header.parentElement.insertBefore(neonSlot, header);
      __privateSet(this, _neon, mount(NeonName, {
        target: neonSlot,
        props: { actor: this.document }
      }));
    }
  }
  _injectShoppingCart(header) {
    if (__privateGet(this, _cart)) return;
    let cartSlot = header.querySelector(".shopping-cart-slot");
    if (!cartSlot) {
      cartSlot = document.createElement("div");
      cartSlot.classList.add("shopping-cart-slot");
      header.insertBefore(cartSlot, header.firstChild);
    }
    __privateSet(this, _cart, mount(ShoppingCart, {
      target: cartSlot,
      props: {
        actor: this.document,
        config: CONFIG.sr3e
      }
    }));
  }
  _injectNewsFeed(form, header) {
    const title = form.querySelector(".window-title");
    if (title) {
      title.remove();
      const newsfeedInjection = document.createElement("div");
      header.prepend(newsfeedInjection);
      __privateSet(this, _feed, mount(NewsFeed, {
        target: header,
        anchor: header.firstChild,
        props: {
          actor: this.document
        }
      }));
    }
  }
  async _tearDown() {
    if (__privateGet(this, _neon)) await unmount(__privateGet(this, _neon));
    if (__privateGet(this, _app)) await unmount(__privateGet(this, _app));
    if (__privateGet(this, _feed)) await unmount(__privateGet(this, _feed));
    if (__privateGet(this, _cart)) await unmount(__privateGet(this, _cart));
    __privateSet(this, _app, __privateSet(this, _neon, __privateSet(this, _feed, __privateSet(this, _cart, null))));
    return super._tearDown();
  }
  _onSubmit() {
    return false;
  }
}
_app = new WeakMap();
_neon = new WeakMap();
_feed = new WeakMap();
_cart = new WeakMap();
const sr3e = {};
sr3e.attributes = {
  attributes: "sr3e.attributes.attributes",
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
sr3e.health = {
  health: "sr3e.health.health"
};
sr3e.skills = {
  skills: "sr3e.skills.skills"
};
sr3e.inventory = {
  inventory: "sr3e.inventory.inventory"
};
sr3e.common = {
  max: "sr3e.common.max",
  min: "sr3e.common.min",
  average: "sr3e.common.average",
  description: "sr3e.common.description",
  priority: "sr3e.common.priority",
  other: "sr3e.common.other",
  custom: "sr3e.common.custom"
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
  viewbackground: "sr3e.sheet.viewbackground",
  buyupgrades: "sr3e.sheet.buyupgrades",
  searchJournals: "sr3e.sheet.searchJournals"
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
  normalvision: "sr3e.vision.normalvision",
  thermographic: "sr3e.vision.thermographic",
  lowlight: "sr3e.vision.lowlight"
};
sr3e.userconfig = {
  setPlayerName: "sr3e.userconfig.setPlayerName",
  playerName: "sr3e.userconfig.playerName",
  avatar: "sr3e.userconfig.avatar",
  imageFile: "sr3e.userconfig.imageFile",
  openFilePicker: "sr3e.userconfig.openFilePicker",
  choosePlayerColor: "sr3e.userconfig.choosePlayerColor",
  playersPreferredPronoun: "sr3e.userconfig.playersPreferredPronoun",
  selectMainCharacter: "sr3e.userconfig.selectMainCharacter",
  saveSettings: "sr3e.userconfig.saveSettings",
  saveUserSettings: "sr3e.userconfig.saveUserSettings"
};
sr3e.magic = {
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
  powerPoints: "sr3e.magic.powerPoints"
};
function injectFooterIntoWindowApp(app, element, ctx, data) {
  var _a2;
  const typeSelectors = [
    { type: foundry.applications.sheets.ActorSheetV2, selector: ".actor-footer" },
    { type: foundry.applications.sheets.ItemSheetV2, selector: ".item-footer" }
    //{ type: foundry.applications.api.DocumentSheetV2, selector: ".document-footer" }
  ];
  const match = typeSelectors.find((entry) => app instanceof entry.type);
  if (!match) return;
  const el = (element == null ? void 0 : element.nodeType) === 1 ? element : element == null ? void 0 : element[0];
  if (!el) return;
  if (el.querySelector(match.selector)) return;
  const isNested = ((_a2 = el.parentElement) == null ? void 0 : _a2.closest(".application")) !== null;
  if (isNested) return;
  const footer = document.createElement("div");
  footer.classList.add(match.selector.replace(".", ""));
  const resizeHandle = el.querySelector(".window-resize-handle");
  if (resizeHandle == null ? void 0 : resizeHandle.parentNode) {
    resizeHandle.parentNode.insertBefore(footer, resizeHandle.nextSibling);
  } else {
    el.appendChild(footer);
  }
}
function injectCssSelectors(app, element, ctx, data) {
  const header = element.querySelector(".window-header");
  if (!header) return;
  const typeSelectors = [
    { type: foundry.applications.api.DialogV2, tag: "dialog" },
    { type: foundry.applications.sheets.ActorSheetV2, tag: "actor" },
    { type: foundry.applications.sheets.ItemSheetV2, tag: "item" }
  ];
  for (const { type, tag } of typeSelectors) {
    if (app instanceof type) {
      header.classList.add(`sr3e-${tag}-header`);
      return;
    }
  }
  if (app instanceof foundry.applications.api.DocumentSheetV2) {
    header.classList.add("sr3e-document-header");
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
      // journalId
      journalId: new foundry.data.fields.StringField({
        required: true,
        initial: ""
      })
    };
  }
}
function ok(_, visible, $$props, selected) {
  var _a2;
  set(visible, false);
  (_a2 = $$props.onclose) == null ? void 0 : _a2.call($$props, get$1(selected));
}
function cancel(__1, visible, $$props) {
  var _a2;
  set(visible, false);
  (_a2 = $$props.onclose) == null ? void 0 : _a2.call($$props, null);
}
var on_input = (__2, showDropdown, selected) => {
  set(showDropdown, true);
  set(selected, null);
};
var on_mousedown = (__3, selectJournal, option) => selectJournal(get$1(option));
var root_4 = /* @__PURE__ */ template(`<li class="dropdown-item"><div role="option" tabindex="0"><i class="fa-solid fa-book-open" style="margin-right: 0.5rem;"></i> </div></li>`);
var root_5 = /* @__PURE__ */ template(`<li class="dropdown-empty">No journal entries found.</li>`);
var root_2$2 = /* @__PURE__ */ template(`<ul class="dropdown-list floating"><!></ul>`);
var root_1$2 = /* @__PURE__ */ template(`<div class="popup"><div class="popup-container"><div class="input-group"><input type="text"></div> <div class="buttons"><button>OK</button> <button>Cancel</button></div></div> <!></div>`);
function JournalSearchModal($$anchor, $$props) {
  push($$props, true);
  let visible = state(true);
  let search = state("");
  let selected = state(null);
  let options = state(proxy([]));
  let showDropdown = state(false);
  let inputEl = state(null);
  let dropdownStyle = state("");
  user_effect(() => {
    const journals = game.journal.contents;
    set(options, proxy(journals.flatMap((entry) => {
      var _a2;
      const items = [
        {
          value: entry.id,
          type: "entry",
          label: entry.name
        }
      ];
      for (const page of ((_a2 = entry.pages) == null ? void 0 : _a2.contents) ?? []) {
        items.push({
          value: page.id,
          type: "page",
          label: `${entry.name} › ${page.name}`
        });
      }
      return items;
    })));
  });
  user_effect(() => {
    if (get$1(showDropdown) && get$1(inputEl)) {
      requestAnimationFrame(() => {
        const rect = get$1(inputEl).getBoundingClientRect();
        set(dropdownStyle, `
                position: fixed;
                top: ${rect.bottom + 2}px;
                left: ${rect.left}px;
                width: ${rect.width}px;
                z-index: 1001;
            `);
      });
    }
  });
  function filteredOptions() {
    const q = get$1(search).toLowerCase().trim();
    return q ? get$1(options).filter((o) => o.label.toLowerCase().includes(q)) : get$1(options);
  }
  function selectJournal(option) {
    set(selected, proxy(option));
    set(search, proxy(option.label));
    set(showDropdown, false);
  }
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent_2 = ($$anchor2) => {
      var div = root_1$2();
      var div_1 = child(div);
      var div_2 = child(div_1);
      var input = child(div_2);
      input.__input = [on_input, showDropdown, selected];
      bind_this(input, ($$value) => set(inputEl, $$value), () => get$1(inputEl));
      var div_3 = sibling(div_2, 2);
      var button = child(div_3);
      button.__click = [ok, visible, $$props, selected];
      var button_1 = sibling(button, 2);
      button_1.__click = [cancel, visible, $$props];
      var node_1 = sibling(div_1, 2);
      {
        var consequent_1 = ($$anchor3) => {
          var ul = root_2$2();
          var node_2 = child(ul);
          {
            var consequent = ($$anchor4) => {
              var fragment_1 = comment();
              var node_3 = first_child(fragment_1);
              each(node_3, 17, filteredOptions, (option) => option.value, ($$anchor5, option) => {
                var li = root_4();
                var div_4 = child(li);
                div_4.__mousedown = [on_mousedown, selectJournal, option];
                var text2 = sibling(child(div_4));
                template_effect(() => {
                  set_attribute(div_4, "aria-selected", get$1(selected) && get$1(selected).value === get$1(option).value);
                  set_text(text2, ` ${get$1(option).label ?? ""}`);
                });
                append($$anchor5, li);
              });
              append($$anchor4, fragment_1);
            };
            var alternate = ($$anchor4) => {
              var li_1 = root_5();
              append($$anchor4, li_1);
            };
            if_block(node_2, ($$render) => {
              if (filteredOptions().length > 0) $$render(consequent);
              else $$render(alternate, false);
            });
          }
          template_effect(() => set_attribute(ul, "style", get$1(dropdownStyle)));
          append($$anchor3, ul);
        };
        if_block(node_1, ($$render) => {
          if (get$1(showDropdown)) $$render(consequent_1);
        });
      }
      template_effect(
        ($0) => {
          set_attribute(input, "placeholder", $0);
          button.disabled = !get$1(selected);
        },
        [
          () => localize($$props.config.sheet.searchJournals)
        ]
      );
      event("focus", input, () => set(showDropdown, true));
      event("blur", input, () => setTimeout(() => set(showDropdown, false), 100));
      bind_value(input, () => get$1(search), ($$value) => set(search, $$value));
      append($$anchor2, div);
    };
    if_block(node, ($$render) => {
      if (get$1(visible)) $$render(consequent_2);
    });
  }
  append($$anchor, fragment);
  pop();
}
delegate(["input", "click", "mousedown"]);
function handleOpen(_, journalId) {
  var _a2;
  if (!get$1(journalId)) return;
  const entry = game.journal.get(get$1(journalId));
  (_a2 = entry == null ? void 0 : entry.sheet) == null ? void 0 : _a2.render(true);
}
function handleSearch(__1, config, journalId, $$props) {
  const modal = mount(JournalSearchModal, {
    target: document.body,
    props: {
      config: config(),
      onclose: (result) => {
        var _a2;
        unmount(modal);
        if (result) {
          console.log("User clicked OK", { result });
          set(journalId, proxy(result.value));
          (_a2 = $$props.onJournalContentSelected) == null ? void 0 : _a2.call($$props, result);
        } else {
          console.log("User clicked Cancel");
        }
      }
    }
  });
}
var on_click = (e) => e.stopPropagation();
var on_keydown = (e) => {
  if (e.key === "Escape") {
    e.currentTarget.blur();
  }
};
var root$4 = /* @__PURE__ */ template(`<div class="toolbar searchbuttons" role="toolbar" tabindex="0"><button class="header-control icon sr3e-toolbar-button" aria-label="Open journal entry"><i class="fa-solid fa-book-open"></i></button> <button class="header-control icon sr3e-toolbar-button" aria-label="Search journal entries"><i class="fa-solid fa-magnifying-glass"></i></button></div>`);
function JournalViewerToolbar($$anchor, $$props) {
  push($$props, true);
  const config = prop($$props, "config", 19, () => ({})), id = prop($$props, "id", 19, () => ({}));
  let journalId = state(proxy(id() ?? null));
  var div = root$4();
  div.__click = [on_click];
  div.__keydown = [on_keydown];
  var button = child(div);
  button.__click = [handleOpen, journalId];
  var button_1 = sibling(button, 2);
  button_1.__click = [handleSearch, config, journalId, $$props];
  append($$anchor, div);
  pop();
}
delegate(["click", "keydown"]);
var root$3 = /* @__PURE__ */ template(`<!> <div class="preview journal-content"><!></div>`, 1);
function JournalViewer($$anchor, $$props) {
  push($$props, true);
  let item2 = prop($$props, "item", 19, () => ({})), config = prop($$props, "config", 19, () => ({}));
  let toolbar;
  let journalId = state(proxy(item2().system.journalId ?? null));
  let previewContent = state("");
  user_effect(async () => {
    var _a2, _b, _c;
    if (!get$1(journalId)) {
      set(previewContent, "");
      return;
    }
    const journal = game.journal.get(get$1(journalId));
    const page = (_b = (_a2 = journal == null ? void 0 : journal.pages) == null ? void 0 : _a2.contents) == null ? void 0 : _b[0];
    const content = ((_c = page == null ? void 0 : page.text) == null ? void 0 : _c.content) || "";
    set(previewContent, proxy(await foundry.applications.ux.TextEditor.enrichHTML(content, { async: true, secrets: false, documents: true })));
  });
  async function handleJournalSelection(result) {
    if (!result) return;
    set(journalId, proxy(result.value));
    await item2().update({ "system.journalId": result.value });
  }
  var fragment = root$3();
  var node = first_child(fragment);
  bind_this(
    JournalViewerToolbar(node, {
      onJournalContentSelected: handleJournalSelection,
      get config() {
        return config();
      },
      get id() {
        return get$1(journalId);
      }
    }),
    ($$value) => toolbar = $$value,
    () => toolbar
  );
  var div = sibling(node, 2);
  var node_1 = child(div);
  html(node_1, () => get$1(previewContent));
  append($$anchor, fragment);
  pop();
}
var root_2$1 = /* @__PURE__ */ template(`<option> </option>`);
var root_1$1 = /* @__PURE__ */ template(`<div class="select-container"><select></select></div>`);
var root_3$1 = /* @__PURE__ */ template(`<input>`);
var root$2 = /* @__PURE__ */ template(`<div class="stat-card"><div><h4> </h4></div> <!></div>`);
function StatCard($$anchor, $$props) {
  push($$props, true);
  let item2 = prop($$props, "item", 7), type = prop($$props, "type", 3, "text"), options = prop($$props, "options", 19, () => []);
  function update(e) {
    let val = e.target.value;
    if (type() === "number") val = Number(val);
    item2(item2());
    item2().update({ [`${$$props.path}.${$$props.entry.key}`]: val });
  }
  var div = root$2();
  var div_1 = child(div);
  var h4 = child(div_1);
  var text2 = child(h4);
  var node = sibling(div_1, 2);
  {
    var consequent = ($$anchor2) => {
      var div_2 = root_1$1();
      var select = child(div_2);
      init_select(select, () => $$props.entry.value);
      var select_value;
      select.__change = update;
      each(select, 21, options, index, ($$anchor3, option) => {
        var option_1 = root_2$1();
        var option_1_value = {};
        var text_1 = child(option_1);
        template_effect(() => {
          if (option_1_value !== (option_1_value = get$1(option))) {
            option_1.value = null == (option_1.__value = get$1(option)) ? "" : get$1(option);
          }
          set_selected(option_1, $$props.entry.value === get$1(option));
          set_text(text_1, get$1(option));
        });
        append($$anchor3, option_1);
      });
      template_effect(() => {
        if (select_value !== (select_value = $$props.entry.value)) {
          select.value = null == (select.__value = $$props.entry.value) ? "" : $$props.entry.value, select_option(select, $$props.entry.value);
        }
      });
      append($$anchor2, div_2);
    };
    var alternate = ($$anchor2) => {
      var input = root_3$1();
      input.__change = update;
      template_effect(() => {
        set_attribute(input, "type", type());
        set_value(input, $$props.entry.value);
      });
      append($$anchor2, input);
    };
    if_block(node, ($$render) => {
      if (type() === "select") $$render(consequent);
      else $$render(alternate, false);
    });
  }
  template_effect(() => set_text(text2, $$props.entry.label));
  append($$anchor, div);
  pop();
}
delegate(["change"]);
var on_change$1 = (e, item2) => item2().update({ name: e.target.value });
var root$1 = /* @__PURE__ */ template(`<div class="meta-human-grid"><div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><div class="image-mask"><img data-edit="img" role="presentation"></div> <input class="large" name="name" type="text"> <!></div></div></div> <div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><h3 class="item"> </h3> <div class="stat-grid"></div></div></div></div> <div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><h3 class="item"> </h3> <div class="stat-grid"></div></div></div></div> <div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><h3 class="item"> </h3> <div class="stat-grid"></div></div></div></div> <div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><h3 class="item"> </h3> <div class="stat-grid"></div></div></div></div> <div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><h3 class="item"> </h3> <div class="stat-grid"></div></div></div></div> <div class="item-sheet-component"><div class="sr3e-inner-background-container slim"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><h3 class="item"> </h3> <div class="stat-grid two-column"></div></div></div></div> <div class="item-sheet-component"><div class="sr3e-inner-background-container slim"><div class="fake-shadow"></div> <div class="sr3e-inner-background slim"><h3 class="item"> </h3> <div class="stat-grid one-column"></div></div></div></div> <div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><h3 class="item"> </h3> <!></div></div> <div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><!></div></div></div></div></div>`);
function MetahumanApp($$anchor, $$props) {
  push($$props, true);
  let item2 = prop($$props, "item", 23, () => ({})), config = prop($$props, "config", 19, () => ({}));
  const system = proxy(item2().system);
  const attributes = config().attributes;
  const common = config().common;
  const movementConfig = config().movement;
  const karmaConfig = config().karma;
  const visionConfig = config().vision;
  const traits = config().traits;
  const agerange = /* @__PURE__ */ derived(() => [
    {
      key: "min",
      label: localize(common.min),
      value: system.agerange.min,
      type: "number"
    },
    {
      key: "average",
      label: localize(common.average),
      value: system.agerange.average,
      type: "number"
    },
    {
      key: "max",
      label: localize(common.max),
      value: system.agerange.max,
      type: "number"
    }
  ]);
  const height = /* @__PURE__ */ derived(() => [
    {
      key: "min",
      label: localize(common.min),
      value: system.physical.height.min,
      type: "number"
    },
    {
      key: "average",
      label: localize(common.average),
      value: system.physical.height.average,
      type: "number"
    },
    {
      key: "max",
      label: localize(common.max),
      value: system.physical.height.max,
      type: "number"
    }
  ]);
  const weight = /* @__PURE__ */ derived(() => [
    {
      key: "min",
      label: localize(common.min),
      value: system.physical.weight.min,
      type: "number"
    },
    {
      key: "average",
      label: localize(common.average),
      value: system.physical.weight.average,
      type: "number"
    },
    {
      key: "max",
      label: localize(common.max),
      value: system.physical.weight.max,
      type: "number"
    }
  ]);
  const movement = /* @__PURE__ */ derived(() => [
    {
      key: "base",
      label: localize(movementConfig.walking),
      value: system.movement.base,
      type: "number"
    },
    {
      key: "modifier",
      label: localize(movementConfig.runSpeedModifier),
      value: system.movement.modifier,
      type: "number"
    }
  ]);
  const karma = /* @__PURE__ */ derived(() => [
    {
      key: "factor",
      label: localize(karmaConfig.advancementRatio),
      value: system.karma.factor,
      type: "number"
    }
  ]);
  const attributeModifiers = /* @__PURE__ */ derived(() => [
    {
      key: "strength",
      label: localize(attributes.strength),
      value: system.modifiers.strength,
      type: "number"
    },
    {
      key: "quickness",
      label: localize(attributes.quickness),
      value: system.modifiers.quickness,
      type: "number"
    },
    {
      key: "body",
      label: localize(attributes.body),
      value: system.modifiers.body,
      type: "number"
    },
    {
      key: "charisma",
      label: localize(attributes.charisma),
      value: system.modifiers.charisma,
      type: "number"
    },
    {
      key: "intelligence",
      label: localize(attributes.intelligence),
      value: system.modifiers.intelligence,
      type: "number"
    },
    {
      key: "willpower",
      label: localize(attributes.willpower),
      value: system.modifiers.willpower,
      type: "number"
    }
  ]);
  const attributeLimits = /* @__PURE__ */ derived(() => [
    {
      key: "strength",
      label: localize(attributes.strength),
      value: system.attributeLimits.strength,
      type: "number"
    },
    {
      key: "quickness",
      label: localize(attributes.quickness),
      value: system.attributeLimits.quickness,
      type: "number"
    },
    {
      key: "body",
      label: localize(attributes.body),
      value: system.attributeLimits.body,
      type: "number"
    },
    {
      key: "charisma",
      label: localize(attributes.charisma),
      value: system.attributeLimits.charisma,
      type: "number"
    },
    {
      key: "intelligence",
      label: localize(attributes.intelligence),
      value: system.attributeLimits.intelligence,
      type: "number"
    },
    {
      key: "willpower",
      label: localize(attributes.willpower),
      value: system.attributeLimits.willpower,
      type: "number"
    }
  ]);
  const vision = /* @__PURE__ */ derived(() => [
    {
      key: "type",
      label: localize(visionConfig.type),
      value: system.vision.type,
      type: "select"
    }
  ]);
  const priorityEntry = /* @__PURE__ */ derived(() => ({
    key: "priority",
    label: "Select Priority",
    value: system.priority,
    type: "select"
  }));
  const visionOptions = [
    localize(visionConfig.normalvision),
    localize(visionConfig.lowlight),
    localize(visionConfig.thermographic)
  ];
  const priorityOptions = ["C", "D", "E"];
  var div = root$1();
  var div_1 = child(div);
  var div_2 = child(div_1);
  var div_3 = sibling(child(div_2), 2);
  var div_4 = child(div_3);
  var img = child(div_4);
  var event_handler = /* @__PURE__ */ derived(() => openFilePicker(item2()));
  img.__click = function(...$$args) {
    var _a2;
    (_a2 = get$1(event_handler)) == null ? void 0 : _a2.apply(this, $$args);
  };
  var input = sibling(div_4, 2);
  input.__change = [on_change$1, item2];
  var node = sibling(input, 2);
  StatCard(node, {
    get item() {
      return item2();
    },
    get entry() {
      return get$1(priorityEntry);
    },
    path: "system",
    get type() {
      return get$1(priorityEntry).type;
    },
    options: priorityOptions
  });
  var div_5 = sibling(div_1, 2);
  var div_6 = child(div_5);
  var div_7 = sibling(child(div_6), 2);
  var h3 = child(div_7);
  var text2 = child(h3);
  var div_8 = sibling(h3, 2);
  each(div_8, 21, () => get$1(agerange), index, ($$anchor2, entry) => {
    StatCard($$anchor2, {
      get item() {
        return item2();
      },
      get entry() {
        return get$1(entry);
      },
      path: "system.agerange",
      get type() {
        return get$1(entry).type;
      }
    });
  });
  var div_9 = sibling(div_5, 2);
  var div_10 = child(div_9);
  var div_11 = sibling(child(div_10), 2);
  var h3_1 = child(div_11);
  var text_1 = child(h3_1);
  var div_12 = sibling(h3_1, 2);
  each(div_12, 21, () => get$1(height), index, ($$anchor2, entry) => {
    StatCard($$anchor2, {
      get item() {
        return item2();
      },
      get entry() {
        return get$1(entry);
      },
      path: "system.physical.height",
      get type() {
        return get$1(entry).type;
      }
    });
  });
  var div_13 = sibling(div_9, 2);
  var div_14 = child(div_13);
  var div_15 = sibling(child(div_14), 2);
  var h3_2 = child(div_15);
  var text_2 = child(h3_2);
  var div_16 = sibling(h3_2, 2);
  each(div_16, 21, () => get$1(weight), index, ($$anchor2, entry) => {
    StatCard($$anchor2, {
      get item() {
        return item2();
      },
      get entry() {
        return get$1(entry);
      },
      path: "system.physical.weight",
      get type() {
        return get$1(entry).type;
      }
    });
  });
  var div_17 = sibling(div_13, 2);
  var div_18 = child(div_17);
  var div_19 = sibling(child(div_18), 2);
  var h3_3 = child(div_19);
  var text_3 = child(h3_3);
  var div_20 = sibling(h3_3, 2);
  each(div_20, 21, () => get$1(attributeModifiers), index, ($$anchor2, entry) => {
    StatCard($$anchor2, {
      get item() {
        return item2();
      },
      get entry() {
        return get$1(entry);
      },
      path: "system.modifiers",
      get type() {
        return get$1(entry).type;
      }
    });
  });
  var div_21 = sibling(div_17, 2);
  var div_22 = child(div_21);
  var div_23 = sibling(child(div_22), 2);
  var h3_4 = child(div_23);
  var text_4 = child(h3_4);
  var div_24 = sibling(h3_4, 2);
  each(div_24, 21, () => get$1(attributeLimits), index, ($$anchor2, entry) => {
    StatCard($$anchor2, {
      get item() {
        return item2();
      },
      get entry() {
        return get$1(entry);
      },
      path: "system.attributeLimits",
      get type() {
        return get$1(entry).type;
      }
    });
  });
  var div_25 = sibling(div_21, 2);
  var div_26 = child(div_25);
  var div_27 = sibling(child(div_26), 2);
  var h3_5 = child(div_27);
  var text_5 = child(h3_5);
  var div_28 = sibling(h3_5, 2);
  each(div_28, 21, () => get$1(movement), index, ($$anchor2, entry) => {
    StatCard($$anchor2, {
      get item() {
        return item2();
      },
      get entry() {
        return get$1(entry);
      },
      path: "system.movement",
      get type() {
        return get$1(entry).type;
      }
    });
  });
  var div_29 = sibling(div_25, 2);
  var div_30 = child(div_29);
  var div_31 = sibling(child(div_30), 2);
  var h3_6 = child(div_31);
  var text_6 = child(h3_6);
  var div_32 = sibling(h3_6, 2);
  each(div_32, 21, () => get$1(karma), index, ($$anchor2, entry) => {
    StatCard($$anchor2, {
      get item() {
        return item2();
      },
      get entry() {
        return get$1(entry);
      },
      path: "system.karma",
      get type() {
        return get$1(entry).type;
      }
    });
  });
  var div_33 = sibling(div_29, 2);
  var div_34 = child(div_33);
  var div_35 = sibling(child(div_34), 2);
  var h3_7 = child(div_35);
  var text_7 = child(h3_7);
  var node_1 = sibling(h3_7, 2);
  each(node_1, 17, () => get$1(vision), index, ($$anchor2, entry) => {
    StatCard($$anchor2, {
      get item() {
        return item2();
      },
      get entry() {
        return get$1(entry);
      },
      path: "system.vision",
      get type() {
        return get$1(entry).type;
      },
      options: visionOptions
    });
  });
  var div_36 = sibling(div_34, 2);
  var div_37 = child(div_36);
  var div_38 = sibling(child(div_37), 2);
  var node_2 = child(div_38);
  JournalViewer(node_2, {
    get item() {
      return item2();
    },
    get config() {
      return config();
    }
  });
  template_effect(
    ($0, $1, $2, $3, $4, $5, $6, $7) => {
      set_attribute(img, "src", item2().img);
      set_attribute(img, "title", item2().name);
      set_attribute(img, "alt", item2().name);
      set_text(text2, $0);
      set_text(text_1, $1);
      set_text(text_2, $2);
      set_text(text_3, $3);
      set_text(text_4, $4);
      set_text(text_5, $5);
      set_text(text_6, $6);
      set_text(text_7, $7);
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
    ]
  );
  bind_value(input, () => item2().name, ($$value) => item2().name = $$value);
  append($$anchor, div);
  pop();
}
delegate(["click", "change"]);
class MetahumanItemSheet extends foundry.applications.sheets.ItemSheetV2 {
  constructor() {
    super(...arguments);
    __privateAdd(this, _metahuman);
  }
  get title() {
    return `${game.i18n.localize(CONFIG.sr3e.traits.metahuman)}: ${this.item.name}`;
  }
  static get DEFAULT_OPTIONS() {
    return {
      ...super.DEFAULT_OPTIONS,
      id: `sr3e-item-sheet-${foundry.utils.randomID()}`,
      classes: ["sr3e", "sheet", "item", "metahuman"],
      template: null,
      position: { width: "auto", height: "auto" },
      window: {
        resizable: false
      },
      tag: "form",
      submitOnChange: true,
      closeOnSubmit: false
    };
  }
  _renderHTML() {
    return null;
  }
  _replaceHTML(_, windowContent) {
    if (__privateGet(this, _metahuman)) {
      unmount(__privateGet(this, _metahuman));
      __privateSet(this, _metahuman, null);
    }
    __privateSet(this, _metahuman, mount(MetahumanApp, {
      target: windowContent,
      props: {
        item: this.document,
        config: CONFIG.sr3e
      }
    }));
    return windowContent;
  }
  async _tearDown() {
    if (__privateGet(this, _metahuman)) await unmount(__privateGet(this, _metahuman));
    __privateSet(this, _metahuman, null);
    return super._tearDown();
  }
  /** @override prevent submission, since Svelte is managing state */
  _onSubmit(event2) {
    return;
  }
}
_metahuman = new WeakMap();
var on_change = (e, item2) => item2().update({ name: e.target.value });
var root_2 = /* @__PURE__ */ template(`<div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><!></div></div></div>`);
var root_3 = /* @__PURE__ */ template(`<div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><h3 class="item"> </h3> <!></div></div></div>`);
var root_1 = /* @__PURE__ */ template(`<div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><!></div></div></div> <!> <!>`, 1);
var root_6 = /* @__PURE__ */ template(`<div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><h3 class="item"> </h3> <!></div></div></div>`);
var root = /* @__PURE__ */ template(`<div class="meta-human-grid"><div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><div class="image-mask"><img role="presentation" data-edit="img"></div> <input class="large" name="name" type="text"> <!> <!></div></div></div> <!> <div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><!></div></div></div></div>`);
function MagicApp($$anchor, $$props) {
  push($$props, true);
  let item2 = prop($$props, "item", 23, () => ({})), config = prop($$props, "config", 19, () => ({}));
  const system = proxy(item2().system);
  const awakened = system.awakened || {};
  const magicianData = proxy(system.magicianData);
  awakened.adeptData || {};
  const labels = config().magic || {};
  const priorityOptions = ["A", "B"];
  const archetypeOptions = [
    localize(config().magic.adept),
    localize(config().magic.magician)
  ];
  const magicianTypeOptions = [
    localize(config().magic.fullmage),
    localize(config().magic.aspectedmage)
  ];
  const aspectsOptions = [
    localize(config().magic.conjurer),
    localize(config().magic.sorcerer),
    localize(config().magic.elementalist),
    localize(config().common.custom)
  ];
  const resistanceAttributeOptions = [
    localize(config().attributes.willpower),
    localize(config().attributes.charisma),
    localize(config().attributes.intelligence)
  ];
  const traditionOptions = [
    localize(config().magic.hermetic),
    localize(config().magic.shamanic),
    localize(config().common.other)
  ];
  let archetype = proxy(awakened.archetype);
  const archetypeEntry = {
    key: "archetype",
    label: localize(labels.archetype),
    value: archetype,
    type: "select",
    options: archetypeOptions
  };
  let priority = proxy(awakened.priority);
  const priorityEntry = {
    key: "priority",
    label: localize(labels.priority),
    value: priority,
    type: "select",
    options: priorityOptions
  };
  let magicianType = proxy(magicianData.magicianType);
  let aspect = proxy(magicianData.aspect);
  let tradition = proxy(magicianData.tradition);
  let drainResistanceAttribute = proxy(magicianData.drainResistanceAttribute);
  let canAstrallyProject = proxy(magicianData.canAstrallyProject);
  let totem = proxy(magicianData.totem ?? localize(config().magic.shamannote));
  const magicianFields = [
    {
      key: "tradition",
      label: localize(labels.tradition),
      value: tradition,
      type: "select",
      options: traditionOptions
    },
    {
      key: "drainResistanceAttribute",
      label: localize(labels.drainResistanceAttribute),
      value: drainResistanceAttribute,
      type: "select",
      options: resistanceAttributeOptions
    },
    {
      key: "canAstrallyProject",
      label: localize(labels.canAstrallyProject),
      value: canAstrallyProject,
      type: "checkbox"
    },
    {
      key: "totem",
      label: localize(labels.totem),
      value: totem,
      type: "text"
    }
  ];
  const adeptFields = [];
  let isAspected = /* @__PURE__ */ derived(() => magicianType === localize(config().magic.aspectedmage));
  user_effect(() => {
    console.log({ magicianType });
    console.log("isAspected:", get$1(isAspected));
  });
  var div = root();
  var div_1 = child(div);
  var div_2 = child(div_1);
  var div_3 = sibling(child(div_2), 2);
  var div_4 = child(div_3);
  var img = child(div_4);
  var event_handler = /* @__PURE__ */ derived(() => openFilePicker(item2()));
  img.__click = function(...$$args) {
    var _a2;
    (_a2 = get$1(event_handler)) == null ? void 0 : _a2.apply(this, $$args);
  };
  var input = sibling(div_4, 2);
  input.__change = [on_change, item2];
  var node = sibling(input, 2);
  StatCard(node, {
    get item() {
      return item2();
    },
    entry: archetypeEntry,
    path: "system.awakened",
    type: "select",
    options: archetypeOptions
  });
  var node_1 = sibling(node, 2);
  StatCard(node_1, {
    get item() {
      return item2();
    },
    entry: priorityEntry,
    path: "system.awakened",
    type: "select",
    options: priorityOptions
  });
  var node_2 = sibling(div_1, 2);
  {
    var consequent_1 = ($$anchor2) => {
      var fragment = root_1();
      var div_5 = first_child(fragment);
      var div_6 = child(div_5);
      var div_7 = sibling(child(div_6), 2);
      var node_3 = child(div_7);
      const expression = /* @__PURE__ */ derived(() => ({
        key: "magicianType",
        label: localize(labels.magicianType),
        value: magicianType
      }));
      StatCard(node_3, {
        get item() {
          return item2();
        },
        get entry() {
          return get$1(expression);
        },
        path: "system.magicianData",
        type: "select",
        options: magicianTypeOptions
      });
      var node_4 = sibling(div_5, 2);
      {
        var consequent = ($$anchor3) => {
          var div_8 = root_2();
          var div_9 = child(div_8);
          var div_10 = sibling(child(div_9), 2);
          var node_5 = child(div_10);
          const expression_1 = /* @__PURE__ */ derived(() => ({
            key: "aspect",
            label: localize(labels.aspect),
            value: aspect
          }));
          StatCard(node_5, {
            get item() {
              return item2();
            },
            get entry() {
              return get$1(expression_1);
            },
            path: "system.magicianData",
            type: "select",
            options: aspectsOptions
          });
          append($$anchor3, div_8);
        };
        if_block(node_4, ($$render) => {
          if (!get$1(isAspected)) $$render(consequent);
        });
      }
      var node_6 = sibling(node_4, 2);
      each(node_6, 17, () => magicianFields, index, ($$anchor3, entry) => {
        var div_11 = root_3();
        var div_12 = child(div_11);
        var div_13 = sibling(child(div_12), 2);
        var h3 = child(div_13);
        var text2 = child(h3);
        var node_7 = sibling(h3, 2);
        StatCard(node_7, {
          get item() {
            return item2();
          },
          get entry() {
            return get$1(entry);
          },
          path: `system.magicianData`,
          get type() {
            return get$1(entry).type;
          },
          get options() {
            return get$1(entry).options;
          }
        });
        template_effect(() => set_text(text2, get$1(entry).label));
        append($$anchor3, div_11);
      });
      append($$anchor2, fragment);
    };
    var alternate = ($$anchor2) => {
      var fragment_1 = comment();
      var node_8 = first_child(fragment_1);
      {
        var consequent_2 = ($$anchor3) => {
          var fragment_2 = comment();
          var node_9 = first_child(fragment_2);
          each(node_9, 17, () => adeptFields, index, ($$anchor4, entry) => {
            var div_14 = root_6();
            var div_15 = child(div_14);
            var div_16 = sibling(child(div_15), 2);
            var h3_1 = child(div_16);
            var text_1 = child(h3_1);
            var node_10 = sibling(h3_1, 2);
            StatCard(node_10, {
              get item() {
                return item2();
              },
              get entry() {
                return get$1(entry);
              },
              path: `system.awakened.adeptData`,
              get type() {
                return get$1(entry).type;
              },
              get options() {
                return get$1(entry).options;
              }
            });
            template_effect(() => set_text(text_1, get$1(entry).label));
            append($$anchor4, div_14);
          });
          append($$anchor3, fragment_2);
        };
        if_block(
          node_8,
          ($$render) => {
            if (awakened.archetype === archetypeOptions[0]) $$render(consequent_2);
          },
          true
        );
      }
      append($$anchor2, fragment_1);
    };
    if_block(node_2, ($$render) => {
      if (awakened.archetype === archetypeOptions[1]) $$render(consequent_1);
      else $$render(alternate, false);
    });
  }
  var div_17 = sibling(node_2, 2);
  var div_18 = child(div_17);
  var div_19 = sibling(child(div_18), 2);
  var node_11 = child(div_19);
  JournalViewer(node_11, {
    get item() {
      return item2();
    },
    get config() {
      return config();
    }
  });
  template_effect(() => {
    set_attribute(img, "src", item2().img);
    set_attribute(img, "title", item2().name);
    set_attribute(img, "alt", item2().name);
  });
  bind_value(input, () => item2().name, ($$value) => item2().name = $$value);
  append($$anchor, div);
  pop();
}
delegate(["click", "change"]);
let MagicItemSheet$1 = (_a = class extends foundry.applications.sheets.ItemSheetV2 {
  constructor() {
    super(...arguments);
    __privateAdd(this, _magic);
  }
  static get DEFAULT_OPTIONS() {
    return {
      ...super.DEFAULT_OPTIONS,
      id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
      classes: ["sr3e", "sheet", "item", "magic"],
      template: null,
      position: { width: "auto", height: "auto" },
      window: {
        resizable: false
      },
      tag: "form",
      submitOnChange: true,
      closeOnSubmit: false
    };
  }
  _renderHTML() {
    return null;
  }
  _replaceHTML(_, windowContent) {
    if (__privateGet(this, _magic)) {
      unmount(__privateGet(this, _magic));
      __privateSet(this, _magic, null);
    }
    __privateSet(this, _magic, mount(MagicApp, {
      target: windowContent,
      props: {
        item: this.document,
        config: CONFIG.sr3e
      }
    }));
    return windowContent;
  }
  /** @override prevent submission, since Svelte is managing state */
  _onSubmit(event2) {
    return;
  }
}, _magic = new WeakMap(), _a);
class MagicModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      // INFO: select [none, adept, magician] (selection and localization handled by svelte, this only stores result)
      awakened: new foundry.data.fields.SchemaField({
        archetype: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),
        priority: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        })
      }),
      magicianData: new foundry.data.fields.SchemaField({
        // INFO: displays only if magicCategory is "magician"
        // INFO: full or aspected (select)
        magicianType: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),
        // INFO: (free text)
        tradition: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),
        // INFO: free text, localized and validated in UI only
        drainResistanceAttribute: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),
        // INFO: select, displays only if aspected is selected
        aspect: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),
        // INFO: bool, displays only if magicianType is "full"
        canAstrallyProject: new foundry.data.fields.BooleanField({
          required: false,
          initial: false
        }),
        // INFO: shows only if shaman is selected as tradition
        totem: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),
        // INFO: hidden from player, calculated on character creation?
        spellPoints: new foundry.data.fields.NumberField({
          required: false,
          initial: 0
        })
      }),
      adeptData: new foundry.data.fields.SchemaField({
        // INFO: displays only if magicCategory is "adept"
        powerPoints: new foundry.data.fields.NumberField({
          required: false,
          initial: 0
        })
      })
    };
  }
}
function WeaponApp($$anchor) {
  var text$1 = text("Hello Weapon");
  append($$anchor, text$1);
}
class MagicItemSheet extends foundry.applications.sheets.ItemSheetV2 {
  constructor() {
    super(...arguments);
    __privateAdd(this, _magic2);
  }
  static get DEFAULT_OPTIONS() {
    return {
      ...super.DEFAULT_OPTIONS,
      id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
      classes: ["sr3e", "sheet", "item", "weapon"],
      template: null,
      position: { width: "auto", height: "auto" },
      window: {
        resizable: false
      },
      tag: "form",
      submitOnChange: true,
      closeOnSubmit: false
    };
  }
  _renderHTML() {
    return null;
  }
  _replaceHTML(_, windowContent) {
    if (__privateGet(this, _magic2)) {
      unmount(__privateGet(this, _magic2));
      __privateSet(this, _magic2, null);
    }
    __privateSet(this, _magic2, mount(WeaponApp, {
      target: windowContent,
      props: {
        item: this.document,
        config: CONFIG.sr3e
      }
    }));
    return windowContent;
  }
  /** @override prevent submission, since Svelte is managing state */
  _onSubmit(event2) {
    return;
  }
}
_magic2 = new WeakMap();
class CommodityModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      days: new foundry.data.fields.NumberField({
        required: true,
        initial: 0
      }),
      cost: new foundry.data.fields.NumberField({
        required: true,
        initial: 0
      }),
      streetIndex: new foundry.data.fields.NumberField({
        required: true,
        initial: 1
      }),
      legality: new foundry.data.fields.SchemaField({
        restrictionLevel: new foundry.data.fields.NumberField({
          required: true,
          initial: 0
        }),
        type: new foundry.data.fields.StringField({ required: false, initial: "" }),
        category: new foundry.data.fields.StringField({ required: false, initial: "" })
      }),
      isBroken: new foundry.data.fields.BooleanField({ initial: false }),
      description: new foundry.data.fields.StringField({
        required: false,
        initial: "Enter your description"
      })
    };
  }
}
class PortabilityModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      conceal: new foundry.data.fields.NumberField({
        required: true,
        initial: 0
      }),
      weight: new foundry.data.fields.NumberField({
        required: true,
        initial: 0
      })
    };
  }
}
class WeaponModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      damage: new foundry.data.fields.StringField({
        required: true,
        initial: "N/A"
      }),
      mode: new foundry.data.fields.StringField({
        required: true,
        initial: "semi-automatic"
      }),
      range: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true
      }),
      recoilComp: new foundry.data.fields.NumberField({
        required: true,
        initial: 0
      }),
      currentClipId: new foundry.data.fields.StringField({
        required: false,
        nullable: true
      }),
      ...PortabilityModel.defineSchema(),
      ...CommodityModel.defineSchema()
    };
  }
}
const { DocumentSheetConfig } = foundry.applications.apps;
function registerDocumentTypes({ args }) {
  args.forEach(({ docClass, type, model, sheet }) => {
    var _a2;
    const docName = docClass.documentName;
    (_a2 = CONFIG[docName]).dataModels || (_a2.dataModels = {});
    CONFIG[docName].dataModels[type] = model;
    DocumentSheetConfig.registerSheet(
      docClass,
      flags.sr3e,
      sheet,
      { types: [type], makeDefault: true }
    );
  });
}
function configureProject() {
  CONFIG.sr3e = sr3e;
  CONFIG.Actor.dataModels = {};
  CONFIG.Item.dataModels = {};
  CONFIG.canvasTextStyle.fontFamily = "VT323";
  CONFIG.defaultFontFamily = "VT323";
  CONFIG.fontDefinitions["Neanderthaw"] = {
    editor: true,
    fonts: [
      {
        urls: ["systems/sr3e/fonts/Neonderthaw/Neonderthaw-Regular.ttf"],
        weight: 400,
        style: "normal"
      }
    ]
  };
  CONFIG.fontDefinitions["VT323"] = {
    editor: true,
    fonts: [
      {
        urls: ["systems/sr3e/fonts/VT323/VT323-Regular.ttf"],
        weight: 400,
        style: "normal"
      }
    ]
  };
  DocumentSheetConfig.unregisterSheet(Actor, flags.core, "ActorSheetV2");
  DocumentSheetConfig.unregisterSheet(Item, flags.core, "ItemSheetV2");
}
function configureThemes() {
  game.settings.register("sr3e", "theme", {
    name: "Theme",
    hint: "Choose a UI theme.",
    scope: "world",
    config: true,
    type: String,
    choices: { chummer: "Chummer", steel: "Steel" },
    default: "chummer"
  });
  Hooks.on("ready", () => {
    const theme = game.settings.get("sr3e", "theme");
    document.body.classList.remove("theme-chummer", "theme-steel");
    document.body.classList.add(`theme-${theme}`);
  });
}
function wrapContent(root2) {
  var _a2;
  if (!root2 || ((_a2 = root2.firstElementChild) == null ? void 0 : _a2.classList.contains("sheet-component"))) return;
  const existing = Array.from(root2.children);
  const sheetComponent = document.createElement("div");
  sheetComponent.classList.add("sheet-component");
  const innerContainer = document.createElement("div");
  innerContainer.classList.add("sr3e-inner-background-container");
  const fakeShadow = document.createElement("div");
  fakeShadow.classList.add("fake-shadow");
  const innerBackground = document.createElement("div");
  innerBackground.classList.add("sr3e-inner-background");
  innerBackground.append(...existing);
  innerContainer.append(fakeShadow, innerBackground);
  sheetComponent.append(innerContainer);
  root2.appendChild(sheetComponent);
}
function registerHooks() {
  Hooks.on(hooks.renderApplicationV2, (app, element) => {
    var _a2;
    if ((_a2 = element.firstElementChild) == null ? void 0 : _a2.classList.contains("sheet-component")) return;
    const typeSelectors = [
      { type: foundry.applications.api.DialogV2 },
      { type: foundry.applications.sheets.journal.JournalEntryPageSheet },
      { type: foundry.applications.apps.CombatTrackerConfig },
      { type: foundry.applications.sidebar.apps.ControlsConfig },
      { type: foundry.applications.sidebar.apps.ModuleManagement },
      { type: foundry.applications.sidebar.apps.WorldConfig },
      { type: foundry.applications.sidebar.apps.ToursManagement },
      { type: foundry.applications.sidebar.apps.SupportDetails },
      { type: foundry.applications.sidebar.apps.InvitationLinks },
      { type: foundry.applications.sheets.FolderConfig },
      { type: foundry.applications.settings.SettingsConfig },
      { type: foundry.applications.sheets.UserConfig },
      { type: foundry.applications.api.DocumentSheetV2 },
      { type: foundry.applications.apps.FilePicker }
    ];
    const typeDeselectors = [
      { type: foundry.applications.sheets.ActorSheetV2 },
      { type: foundry.applications.sheets.ItemSheetV2 }
    ];
    if (typeDeselectors.some((entry) => app instanceof entry.type)) return;
    if (!typeSelectors.some((entry) => app instanceof entry.type)) return;
    wrapContent(element);
  });
  Hooks.on(hooks.renderApplicationV2, injectFooterIntoWindowApp);
  Hooks.on(hooks.renderApplicationV2, injectCssSelectors);
  Hooks.once(hooks.init, () => {
    configureProject();
    configureThemes();
    registerDocumentTypes({
      args: [
        { docClass: Actor, type: "character", model: CharacterModel, sheet: CharacterActorSheet },
        { docClass: Item, type: "metahuman", model: MetahumanModel, sheet: MetahumanItemSheet },
        { docClass: Item, type: "magic", model: MagicModel, sheet: MagicItemSheet$1 },
        { docClass: Item, type: "weapon", model: WeaponModel, sheet: MagicItemSheet }
      ]
    });
    Log.success("Initialization Completed", "sr3e.js");
  });
}
registerHooks();
//# sourceMappingURL=bundle.js.map
