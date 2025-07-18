var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _document, _persistentStore, _actorStores, _hookDisposers, _actorSubscriptions, _app, _ecgCanvas, _ecgPointCanvas, _ctxLine, _ctxPoint, _actor, _html, _resizeObserver, _isResizing, _ElectroCardiogramService_instances, resizeCanvas_fn, setPace_fn, _app2, _feedBuffer, _currentIndices, _maxVisible, _lastBroadcasterIndex, _frameUpdateInterval, _initialized, _nextTick, _broadcastController, _isController, _controllerHeartbeat, _lastHeartbeat, _syncRequestTimeout, _electionCandidates, _electionInProgress, _defaultMessages, _instance, _NewsService_instances, loadActiveBroadcasters_fn, startControllerHealthCheck_fn, setupSocket_fn, requestControllerElection_fn, resolveElection_fn, handleControllerElection_fn, becomeController_fn, announceController_fn, requestControllerStatus_fn, handleControllerStatusRequest_fn, handleControllerStatusResponse_fn, startControllerHeartbeat_fn, handleControllerHeartbeat_fn, checkControllerHealth_fn, scheduleNextFrame_fn, receiveFrameUpdate_fn, guessDuration_fn, handleStateSyncRequest_fn, handleStateSyncResponse_fn, receiveBroadcastSync_fn, stopBroadcaster_fn, pumpNextHeadline_fn, fillFeedBuffer_fn, updateFeedBuffer_fn, publishFeed_fn, _app3, _neon, _feed, _cart, _creation, _footer, _metatype, _magic, _weapon, _ammunition, _skill, _actor2, _onSubmit, _onCancel, _svelteApp, _wasSubmitted, _app4, _app5, _app6, _footer2;
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
      metaType: new foundry.data.fields.StringField({
        required: false,
        initial: ""
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
      // The User-system inteface (original value)
      value: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true
      }),
      // The AE-system inteface
      mod: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true
      })
    };
  }
}
let AttributesModel$1 = class AttributesModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      // Attributes using ComplexStat (with meta)
      body: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      quickness: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      strength: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      charisma: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      intelligence: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      willpower: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      // NOTE: Active Effect driven attributes
      reaction: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      magic: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      essence: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      initiative: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      isBurnedOut: new foundry.data.fields.BooleanField({
        initial: false
      })
    };
  }
};
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
      karmaPool: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      //NOTE: Used to calculate the current karma pool reset, not exposed to the player
      karmaPoolCeiling: new foundry.data.fields.NumberField({
        required: true,
        initial: 1,
        integer: true
      }),
      pendingKarmaReward: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true
      }),
      readyForCommit: new foundry.data.fields.BooleanField({
        required: true,
        initial: false
      }),
      //NOTE: Used to calculate the current karmaPoolCeiling, not exposed to the player
      lifetimeKarma: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true
      }),
      spentKarma: new foundry.data.fields.NumberField({
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
class DicePoolsModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      combat: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      astral: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      hacking: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      control: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      spell: new foundry.data.fields.SchemaField(SimpleStat.defineSchema())
    };
  }
}
class AttributesModel2 extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      walking: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      running: new foundry.data.fields.SchemaField(SimpleStat.defineSchema())
    };
  }
}
class CharacterModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      attributes: new foundry.data.fields.SchemaField(AttributesModel$1.defineSchema()),
      dicePools: new foundry.data.fields.SchemaField(DicePoolsModel.defineSchema()),
      movement: new foundry.data.fields.SchemaField(AttributesModel2.defineSchema()),
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
function derived$1(fn) {
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
  const signal = /* @__PURE__ */ derived$1(fn);
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
function template_effect(fn, thunks = [], d = derived$1) {
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
function lifecycle_outside_component(name) {
  {
    throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
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
function event$1(event_name, dom, handler, capture, passive) {
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
  var _a, _b, _c, _d;
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
        (_a = item2.a) == null ? void 0 : _a.measure();
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
      var _a2;
      if (to_animate === void 0) return;
      for (item2 of to_animate) {
        (_a2 = item2.a) == null ? void 0 : _a2.apply();
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
function snippet(node, get_snippet, ...args) {
  var anchor = node;
  var snippet2 = noop;
  var snippet_effect;
  block(() => {
    if (snippet2 === (snippet2 = get_snippet())) return;
    if (snippet_effect) {
      destroy_effect(snippet_effect);
      snippet_effect = null;
    }
    snippet_effect = branch(() => (
      /** @type {SnippetFn} */
      snippet2(anchor, ...args)
    ));
  }, EFFECT_TRANSPARENT);
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
function set_checked(element, checked) {
  var attributes = element.__attributes ?? (element.__attributes = {});
  if (attributes.checked === (attributes.checked = // treat null and undefined the same for the initial value
  checked ?? void 0)) {
    return;
  }
  element.checked = checked;
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
function bind_checked(input, get2, set2 = get2) {
  listen_to_event_and_reset_event(input, "change", (is_reset) => {
    var value = is_reset ? input.defaultChecked : input.checked;
    set2(value);
  });
  if (
    // If we are hydrating and the value has since changed,
    // then use the update value from the input instead.
    // If defaultChecked is set, then checked == defaultChecked
    untrack(get2) == null
  ) {
    set2(input.checked);
  }
  render_effect(() => {
    var value = get2();
    input.checked = Boolean(value);
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
function onMount(fn) {
  if (component_context === null) {
    lifecycle_outside_component();
  }
  {
    user_effect(() => {
      const cleanup = untrack(fn);
      if (typeof cleanup === "function") return (
        /** @type {() => void} */
        cleanup
      );
    });
  }
}
function onDestroy(fn) {
  if (component_context === null) {
    lifecycle_outside_component();
  }
  onMount(() => () => untrack(fn));
}
function create_custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
  return new CustomEvent(type, { detail, bubbles, cancelable });
}
function createEventDispatcher() {
  const active_component_context = component_context;
  if (active_component_context === null) {
    lifecycle_outside_component();
  }
  return (type, detail, options) => {
    var _a;
    const events = (
      /** @type {Record<string, Function | Function[]>} */
      (_a = active_component_context.s.$$events) == null ? void 0 : _a[
        /** @type {any} */
        type
      ]
    );
    if (events) {
      const callbacks = is_array(events) ? events.slice() : [events];
      const event2 = create_custom_event(
        /** @type {string} */
        type,
        detail,
        options
      );
      for (const fn of callbacks) {
        fn.call(active_component_context.x, event2);
      }
      return !event2.defaultPrevented;
    }
    return true;
  };
}
function subscribe_to_store(store, run, invalidate) {
  if (store == null) {
    run(void 0);
    if (invalidate) invalidate(void 0);
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
function readable(value, start) {
  return {
    subscribe: writable(value, start).subscribe
  };
}
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
function derived(stores2, fn, initial_value) {
  const single = !Array.isArray(stores2);
  const stores_array = single ? [stores2] : stores2;
  if (!stores_array.every(Boolean)) {
    throw new Error("derived() expects stores as input, got a falsy value");
  }
  const auto = fn.length < 2;
  return readable(initial_value, (set2, update) => {
    let started = false;
    const values = [];
    let pending = 0;
    let cleanup = noop;
    const sync = () => {
      if (pending) {
        return;
      }
      cleanup();
      const result = fn(single ? values[0] : values, set2, update);
      if (auto) {
        set2(result);
      } else {
        cleanup = typeof result === "function" ? result : noop;
      }
    };
    const unsubscribers = stores_array.map(
      (store, i) => subscribe_to_store(
        store,
        (value) => {
          values[i] = value;
          pending &= ~(1 << i);
          if (started) {
            sync();
          }
        },
        () => {
          pending |= 1 << i;
        }
      )
    );
    started = true;
    sync();
    return function stop() {
      run_all(unsubscribers);
      cleanup();
      started = false;
    };
  });
}
function get(store) {
  let value;
  subscribe_to_store(store, (_) => value = _)();
  return value;
}
let is_store_binding = false;
let IS_UNMOUNTED = Symbol();
function store_get(store, store_name, stores2) {
  const entry = stores2[store_name] ?? (stores2[store_name] = {
    store: null,
    source: /* @__PURE__ */ mutable_source(void 0),
    unsubscribe: noop
  });
  if (entry.store !== store && !(IS_UNMOUNTED in stores2)) {
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
  if (store && IS_UNMOUNTED in stores2) {
    return get(store);
  }
  return get$1(entry.source);
}
function store_set(store, value) {
  store.set(value);
  return value;
}
function setup_stores() {
  const stores2 = {};
  function cleanup() {
    teardown(() => {
      for (var store_name in stores2) {
        const ref = stores2[store_name];
        ref.unsubscribe();
      }
      define_property(stores2, IS_UNMOUNTED, {
        enumerable: false,
        value: true
      });
    });
  }
  return [stores2, cleanup];
}
function store_mutate(store, expression, new_value) {
  store.set(new_value);
  return expression;
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
  var _a;
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
    () => /* @__PURE__ */ derived$1(() => {
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
const cardLayout = writable([]);
function localize(key) {
  return game.i18n.localize(key);
}
async function openFilePicker(document2) {
  return new Promise((resolve) => {
    new foundry.applications.apps.FilePicker({
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
    [reordered[index2], reordered[newIndex]] = [
      reordered[newIndex],
      reordered[index2]
    ];
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
function getRandomIntinRange(x, y) {
  return Math.floor(Math.random() * (y - x + 1)) + x;
}
function getRandomBellCurveWithMode(min, max, mode) {
  if (min >= max) {
    throw new Error("The min value must be less than the max value.");
  }
  if (mode < min || mode > max) {
    throw new Error("The mode value must be within the range of min and max.");
  }
  function randomNormal() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  const mean = mode;
  const stdDev = (max - min) / 6;
  let value;
  do {
    value = randomNormal() * stdDev + mean;
  } while (value < min || value > max);
  const int = Math.floor(value);
  return int;
}
function lerpColor(hex1, hex2, t) {
  const parseHex = (hex) => parseInt(hex.slice(1), 16);
  const c1 = parseHex(hex1);
  const c2 = parseHex(hex2);
  const r1 = c1 >> 16 & 255;
  const g1 = c1 >> 8 & 255;
  const b1 = c1 & 255;
  const r2 = c2 >> 16 & 255;
  const g2 = c2 >> 8 & 255;
  const b2 = c2 & 255;
  const lerp = (a, b3, t2) => a + (b3 - a) * t2;
  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function handleToggleSpan(_, $$props) {
  toggleCardSpanById($$props.id);
}
var on_click$e = (e) => e.stopPropagation();
var on_keydown$9 = (e) => {
  if (e.key === "Escape") {
    e.currentTarget.blur();
  }
};
var on_click_1$9 = (__1, handleMove) => handleMove("up");
var on_click_2$4 = (__2, handleMove) => handleMove("down");
var root$P = /* @__PURE__ */ template(`<div class="toolbar" role="toolbar" tabindex="0"><button class="header-control icon sr3e-toolbar-button" aria-label="Move card up"><i class="fa-solid fa-arrow-up"></i></button> <button class="header-control icon sr3e-toolbar-button" aria-label="Move card down"><i class="fa-solid fa-arrow-down"></i></button> <button class="header-control icon sr3e-toolbar-button" aria-label="Toggle card span"><i class="fa-solid fa-arrows-spin"></i></button></div>`);
function CardToolbar($$anchor, $$props) {
  push($$props, true);
  function handleMove(direction) {
    console.log("handle move called");
    moveCardById($$props.id, direction);
  }
  var div = root$P();
  div.__click = [on_click$e];
  div.__keydown = [on_keydown$9];
  var button = child(div);
  button.__click = [on_click_1$9, handleMove];
  var button_1 = sibling(button, 2);
  button_1.__click = [on_click_2$4, handleMove];
  var button_2 = sibling(button_1, 2);
  button_2.__click = [handleToggleSpan, $$props];
  append($$anchor, div);
  pop();
}
delegate(["click", "keydown"]);
async function handleClick(event2, entity) {
  if (entity()) await openFilePicker(entity());
}
var root$O = /* @__PURE__ */ template(`<div class="image-mask"><img role="presentation" data-edit="img"></div>`);
function Image($$anchor, $$props) {
  push($$props, true);
  let src = prop($$props, "src", 7, ""), title = prop($$props, "title", 7, ""), alt = prop($$props, "alt", 7, ""), entity = prop($$props, "entity", 3, null);
  onMount(() => {
    if (entity()) {
      src(src() || entity().img);
      title(title() || entity().name);
      alt(alt() || entity().name);
    }
  });
  var div = root$O();
  var img = child(div);
  img.__click = [handleClick, entity];
  template_effect(() => {
    set_attribute(img, "src", src());
    set_attribute(img, "title", title());
    set_attribute(img, "alt", alt() || title());
  });
  append($$anchor, div);
  pop();
}
delegate(["click"]);
const hooks = {
  preCreateActor: "preCreateActor",
  createActor: "createActor",
  init: "init",
  renderApplicationV2: "renderApplicationV2",
  renderChatMessageHTML: "renderChatMessageHTML"
};
const flags = {
  sr3e: "sr3e",
  core: "core",
  actor: {
    isCharacterCreation: "isCharacterCreation",
    isShoppingState: "isShoppingState",
    hasAwakened: "hasAwakened",
    burntOut: "burntOut",
    attributeAssignmentLocked: "attributeAssignmentLocked",
    persistanceBlobCharacterSheetSize: "persistanceBlobCharacterSheetSize"
  }
};
const masonryMinWidthFallbackValue = {
  skillGrid: 4.5
};
const inventory = {
  arsenal: "arsenal",
  garage: "garage",
  effects: "effects"
};
const storeManagers = /* @__PURE__ */ new Map();
const stores$1 = {
  actorName: "actorName",
  activeSkillsIds: "activeSkillsIds",
  knowledgeSkillsIds: "knowledgeSkillsIds",
  languageSkillsIds: "languageSkillsIds",
  shouldDisplaySheen: "shouldDisplaySheen",
  dicepoolSelection: "dicepoolSelection"
};
const _StoreManager = class _StoreManager {
  constructor(document2) {
    __privateAdd(this, _document);
    __privateAdd(this, _persistentStore, {});
    __privateAdd(this, _actorStores, {});
    __privateAdd(this, _hookDisposers, /* @__PURE__ */ new Map());
    __privateAdd(this, _actorSubscriptions, {});
    __privateSet(this, _document, document2);
  }
  static Subscribe(document2) {
    const documentId = document2.id;
    if (storeManagers.has(documentId)) {
      const handlerData = storeManagers.get(documentId);
      handlerData.subscribers++;
      return handlerData.handler;
    }
    const handler = new _StoreManager(document2);
    storeManagers.set(documentId, { handler, subscribers: 1 });
    return handler;
  }
  static Unsubscribe(document2) {
    const handlerData = storeManagers.get(document2.id);
    if (!handlerData) return;
    if (--handlerData.subscribers <= 0) {
      const manager = handlerData.handler;
      for (const disposer of __privateGet(manager, _hookDisposers).values()) disposer();
      __privateGet(manager, _hookDisposers).clear();
      __privateSet(manager, _persistentStore, {});
      __privateSet(manager, _actorStores, {});
      storeManagers.delete(document2.id);
    }
  }
  GetRWStore(dataPath) {
    const fullPath = `system.${dataPath}`;
    const initial = foundry.utils.getProperty(__privateGet(this, _document).system, dataPath);
    if (!__privateGet(this, _persistentStore)[dataPath]) {
      const cloned = initial && typeof initial === "object" ? Array.isArray(initial) ? [...initial] : { ...initial } : initial;
      const store = writable(cloned);
      let muted = false;
      const unsub = store.subscribe((v) => {
        if (muted) return;
        foundry.utils.setProperty(__privateGet(this, _document).system, dataPath, v);
        __privateGet(this, _document).update({ [fullPath]: v }, { render: false });
      });
      const docType = __privateGet(this, _document).documentName;
      const hook = (doc) => {
        if (doc.id !== __privateGet(this, _document).id) return;
        const v = foundry.utils.getProperty(doc.system, dataPath);
        muted = true;
        store.set(v && typeof v === "object" ? Array.isArray(v) ? [...v] : { ...v } : v);
        muted = false;
      };
      Hooks.on(`update${docType}`, hook);
      __privateGet(this, _hookDisposers).set(dataPath, () => {
        Hooks.off(`update${docType}`, hook);
        unsub();
      });
      __privateGet(this, _persistentStore)[dataPath] = store;
    }
    return __privateGet(this, _persistentStore)[dataPath];
  }
  GetROStore(dataPath) {
    const key = `RO:${dataPath}`;
    const initial = foundry.utils.getProperty(__privateGet(this, _document).system, dataPath);
    if (!__privateGet(this, _persistentStore)[key]) {
      const store = writable(initial && typeof initial === "object" ? Array.isArray(initial) ? [...initial] : { ...initial } : initial);
      const docType = __privateGet(this, _document).documentName;
      const updateHook = (doc) => {
        if (doc.id !== __privateGet(this, _document).id) return;
        const v = foundry.utils.getProperty(doc.system, dataPath);
        store.set(v && typeof v === "object" ? Array.isArray(v) ? [...v] : { ...v } : v);
      };
      const recalcHook = (actor) => {
        if (actor.id !== __privateGet(this, _document).id) return;
        const v = foundry.utils.getProperty(actor.system, dataPath);
        store.set(v && typeof v === "object" ? Array.isArray(v) ? [...v] : { ...v } : v);
      };
      Hooks.on(`update${docType}`, updateHook);
      Hooks.on("actorSystemRecalculated", recalcHook);
      __privateGet(this, _hookDisposers).set(key, () => {
        Hooks.off(`update${docType}`, updateHook);
        Hooks.off("actorSystemRecalculated", recalcHook);
      });
      __privateGet(this, _persistentStore)[key] = store;
    }
    return __privateGet(this, _persistentStore)[key];
  }
  GetSumROStore(dataPath) {
    const value = this.GetRWStore(`${dataPath}.value`);
    const mod = this.GetROStore(`${dataPath}.mod`);
    const total = derived([value, mod], ([$value, $mod]) => ({ value: $value, mod: $mod, sum: $value + $mod }));
    return total;
  }
  GetShallowStore(docId, storeName, customValue = null) {
    var _a;
    (_a = __privateGet(this, _actorStores))[docId] ?? (_a[docId] = {});
    if (!__privateGet(this, _actorStores)[docId][storeName]) {
      let value = customValue;
      if (value && typeof value === "object") {
        value = Array.isArray(value) ? [...value] : { ...value };
      }
      __privateGet(this, _actorStores)[docId][storeName] = writable(value);
    }
    return __privateGet(this, _actorStores)[docId][storeName];
  }
  GetFlagStore(flag) {
    if (!__privateGet(this, _persistentStore)[flag]) {
      const currentValue = __privateGet(this, _document).getFlag(flags.sr3e, flag);
      const store = writable(currentValue);
      store.subscribe((newValue) => {
        __privateGet(this, _document).update({ [`flags.${flags.sr3e}.${flag}`]: newValue }, { render: false });
      });
      __privateGet(this, _persistentStore)[flag] = store;
    }
    return __privateGet(this, _persistentStore)[flag];
  }
};
_document = new WeakMap();
_persistentStore = new WeakMap();
_actorStores = new WeakMap();
_hookDisposers = new WeakMap();
_actorSubscriptions = new WeakMap();
let StoreManager = _StoreManager;
var root$N = /* @__PURE__ */ template(`<div class="input-component-container"><div class="input-component-container-background"></div> <div class="input-container-text" contenteditable="" role="textbox" aria-multiline="false" tabindex="0" spellcheck="false"></div> <!></div>`);
function TextInput($$anchor, $$props) {
  push($$props, true);
  let text2 = prop($$props, "text", 7, ""), onblur = prop($$props, "onblur", 3, () => {
  }), oninput = prop($$props, "oninput", 3, () => {
  }), onkeydown = prop($$props, "onkeydown", 3, () => {
  });
  let editableEl;
  user_effect(() => {
    if (editableEl && editableEl.innerText !== text2()) {
      editableEl.innerText = text2() ?? "";
    }
  });
  function handleInput(e) {
    text2(editableEl.innerText);
    oninput()(e);
  }
  var div = root$N();
  var div_1 = sibling(child(div), 2);
  div_1.__input = handleInput;
  div_1.__keydown = function(...$$args) {
    var _a;
    (_a = onkeydown()) == null ? void 0 : _a.apply(this, $$args);
  };
  bind_this(div_1, ($$value) => editableEl = $$value, () => editableEl);
  var node = sibling(div_1, 2);
  snippet(node, () => $$props.children ?? noop);
  event$1("blur", div_1, function(...$$args) {
    var _a;
    (_a = onblur()) == null ? void 0 : _a.apply(this, $$args);
  });
  append($$anchor, div);
  pop();
}
delegate(["input", "keydown"]);
var on_keydown$8 = (e, toggleDetails) => ["Enter", " "].includes(e.key) && (e.preventDefault(), toggleDetails());
var root_3$g = /* @__PURE__ */ template(`<div><div><input type="text" id="actor-name" name="name"></div></div> <div class="flavor-edit-block"><div class="editable-row"><div class="label-line-wrap"><div class="label"> </div> <div class="dotted-line"></div></div> <div class="value-unit"><div class="editable-field" contenteditable="true"> </div> <span class="unit">yrs</span></div></div> <div class="editable-row"><div class="label-line-wrap"><div class="label"> </div> <div class="dotted-line"></div></div> <div class="value-unit"><div class="editable-field" contenteditable="true"> </div> <span class="unit">kg</span></div></div> <div class="editable-row"><div class="label-line-wrap"><div class="label"> </div> <div class="dotted-line"></div></div> <div class="value-unit"><div class="editable-field" contenteditable="true"> </div> <span class="unit">kg</span></div></div></div> <div class="flavor-edit-block last-flavor-edit-block"><h4> </h4> <div class="editable-field quote" role="presentation" contenteditable="true"> </div></div>`, 1);
var root$M = /* @__PURE__ */ template(`<!> <div class="dossier"><!> <div class="dossier-details"><div class="details-foldout" role="button" tabindex="0"><span><i class="fa-solid fa-magnifying-glass"></i></span> </div> <!></div></div>`, 1);
function Dossier($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $isDetailsOpenStore = () => store_get(isDetailsOpenStore, "$isDetailsOpenStore", $$stores);
  const $actorNameStore = () => store_get(actorNameStore, "$actorNameStore", $$stores);
  let actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({})), id = prop($$props, "id", 19, () => ({}));
  prop($$props, "span", 19, () => ({}));
  let storeManager2 = StoreManager.Subscribe(actor());
  let system = proxy(actor().system);
  let actorNameStore = storeManager2.GetShallowStore(actor().id, stores$1.actorName, actor().name);
  let isDetailsOpenStore = storeManager2.GetRWStore("profile.isDetailsOpen");
  proxy($isDetailsOpenStore());
  let metatype = /* @__PURE__ */ derived$1(() => actor().items.find((i) => i.type === "metatype"));
  let imgPath = /* @__PURE__ */ derived$1(() => {
    var _a;
    return ((_a = get$1(metatype)) == null ? void 0 : _a.img) || "";
  });
  let imgName = /* @__PURE__ */ derived$1(() => {
    var _a;
    return ((_a = get$1(metatype)) == null ? void 0 : _a.name) || "";
  });
  function toggleDetails() {
    store_set(isDetailsOpenStore, !$isDetailsOpenStore());
  }
  function handleActorNameChange(event2) {
    store_set(actorNameStore, proxy(event2.target.value));
  }
  function cubicInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) * 0.5;
  }
  function updateAge(event2) {
    actor().update(
      {
        "system.profile.age": Number(event2.target.innerText.trim())
      },
      { render: false }
    );
  }
  function updateHeight(event2) {
    actor().update(
      {
        "system.profile.height": Number(event2.target.innerText.trim())
      },
      { render: false }
    );
  }
  function updateWeight(event2) {
    actor().update(
      {
        "system.profile.weight": Number(event2.target.innerText.trim())
      },
      { render: false }
    );
  }
  function updateQuote(event2) {
    actor().update(
      {
        "system.profile.quote": event2.target.innerText.trim()
      },
      { render: false }
    );
  }
  var fragment = root$M();
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
      Image($$anchor2, {
        get src() {
          return get$1(imgPath);
        },
        get title() {
          return get$1(imgName);
        }
      });
    };
    var alternate = ($$anchor2) => {
      Image($$anchor2, {
        get entity() {
          return actor();
        }
      });
    };
    if_block(node_1, ($$render) => {
      if ($isDetailsOpenStore()) $$render(consequent);
      else $$render(alternate, false);
    });
  }
  var div_1 = sibling(node_1, 2);
  var div_2 = child(div_1);
  div_2.__click = toggleDetails;
  div_2.__keydown = [on_keydown$8, toggleDetails];
  var text2 = sibling(child(div_2));
  var node_2 = sibling(div_2, 2);
  {
    var consequent_1 = ($$anchor2) => {
      var fragment_3 = root_3$g();
      var div_3 = first_child(fragment_3);
      var div_4 = child(div_3);
      var input = child(div_4);
      input.__input = handleActorNameChange;
      var div_5 = sibling(div_3, 2);
      var div_6 = child(div_5);
      var div_7 = child(div_6);
      var div_8 = child(div_7);
      var text_1 = child(div_8);
      var div_9 = sibling(div_7, 2);
      var div_10 = child(div_9);
      var text_2 = child(div_10);
      var div_11 = sibling(div_6, 2);
      var div_12 = child(div_11);
      var div_13 = child(div_12);
      var text_3 = child(div_13);
      var div_14 = sibling(div_12, 2);
      var div_15 = child(div_14);
      var text_4 = child(div_15);
      var div_16 = sibling(div_11, 2);
      var div_17 = child(div_16);
      var div_18 = child(div_17);
      var text_5 = child(div_18);
      var div_19 = sibling(div_17, 2);
      var div_20 = child(div_19);
      var text_6 = child(div_20);
      var div_21 = sibling(div_5, 2);
      var h4 = child(div_21);
      var text_7 = child(h4);
      var div_22 = sibling(h4, 2);
      var text_8 = child(div_22);
      template_effect(
        ($0, $1, $2, $3) => {
          set_value(input, $actorNameStore());
          set_text(text_1, $0);
          set_text(text_2, system.profile.age);
          set_text(text_3, $1);
          set_text(text_4, system.profile.height);
          set_text(text_5, $2);
          set_text(text_6, system.profile.weight);
          set_text(text_7, $3);
          set_text(text_8, system.profile.quote);
        },
        [
          () => localize(config().traits.age),
          () => localize(config().traits.height),
          () => localize(config().traits.weight),
          () => localize(config().sheet.quote)
        ]
      );
      event$1("blur", input, handleActorNameChange);
      event$1("keypress", input, (e) => e.key === "Enter" && handleActorNameChange(e));
      transition(1, div_3, () => slide, () => ({ duration: 100, easing: cubicInOut }));
      transition(2, div_3, () => slide, () => ({ duration: 50, easing: cubicInOut }));
      event$1("blur", div_10, updateAge);
      event$1("blur", div_15, updateHeight);
      event$1("blur", div_20, updateWeight);
      event$1("blur", div_22, updateQuote);
      event$1("keypress", div_22, (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      });
      append($$anchor2, fragment_3);
    };
    if_block(node_2, ($$render) => {
      if ($isDetailsOpenStore()) $$render(consequent_1);
    });
  }
  template_effect(($0) => set_text(text2, ` ${$0 ?? ""}`), [() => localize(config().sheet.details)]);
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
delegate(["click", "keydown", "input"]);
function handleKeydown(e, increment2, decrement2) {
  if (e.key === "ArrowRight" || e.key === "+") {
    e.preventDefault();
    increment2();
  } else if (e.key === "ArrowLeft" || e.key === "-") {
    e.preventDefault();
    decrement2();
  }
}
var on_click$d = (_, decrement2, $$props) => {
  var _a;
  decrement2();
  (_a = $$props.onDecrement) == null ? void 0 : _a.call($$props);
};
var on_click_1$8 = (__1, increment2, $$props) => {
  var _a;
  increment2();
  (_a = $$props.onIncrement) == null ? void 0 : _a.call($$props);
};
var root$L = /* @__PURE__ */ template(`<div class="counter-component" role="spinbutton" tabindex="0" aria-label="Adjust value"><button class="counter-button" aria-label="Decrement Value" tabindex="-1"><i class="fa-solid fa-minus"></i></button> <div class="counter-value" contenteditable="true" role="textbox" aria-label="Value" tabindex="-1"> </div> <button class="counter-button" aria-label="Increment Value" tabindex="-1"><i class="fa-solid fa-plus"></i></button></div>`);
function Counter($$anchor, $$props) {
  push($$props, true);
  let value = prop($$props, "value", 15), min = prop($$props, "min", 19, () => -Infinity), max = prop($$props, "max", 3, Infinity);
  let editableDiv;
  function increment2() {
    value(clampToLimits(value() + 1));
  }
  function decrement2() {
    value(clampToLimits(value() - 1));
  }
  function clampToLimits(val) {
    if (isNaN(val)) return min();
    return Math.min(Math.max(val, min()), max());
  }
  function handleDivInput(e) {
    const raw = e.target.textContent.trim();
    const num = Number(raw);
    const valid = !isNaN(num);
    const clamped = clampToLimits(num);
    if (valid) {
      value(clamped);
      e.target.textContent = String(clamped);
    } else {
      e.target.textContent = String(value());
    }
  }
  onMount(() => {
    editableDiv.focus();
    updateDisplay();
  });
  function updateDisplay() {
    editableDiv.textContent = String(value());
  }
  user_effect(() => {
    updateDisplay();
  });
  var div = root$L();
  div.__keydown = [handleKeydown, increment2, decrement2];
  var button = child(div);
  button.__click = [on_click$d, decrement2, $$props];
  var div_1 = sibling(button, 2);
  div_1.__input = handleDivInput;
  var text2 = child(div_1);
  bind_this(div_1, ($$value) => editableDiv = $$value, () => editableDiv);
  var button_1 = sibling(div_1, 2);
  button_1.__click = [on_click_1$8, increment2, $$props];
  template_effect(() => {
    set_attribute(div, "aria-valuemin", min());
    set_attribute(div, "aria-valuemax", max());
    set_attribute(div, "aria-valuenow", value());
    button.disabled = value() <= min();
    set_text(text2, value());
    button_1.disabled = value() >= max();
  });
  append($$anchor, div);
  pop();
}
delegate(["keydown", "click", "input"]);
class ItemDataService {
  static getAllItemsOfType(name) {
    return game.items.filter((item2) => item2.type === name);
  }
  static getAllMetatypes(metatypes) {
    return metatypes.filter((m) => {
      var _a;
      return m && typeof m.name === "string" && typeof m.id === "string" && ((_a = m.system) == null ? void 0 : _a.priority);
    }).map((metatype) => ({
      name: metatype.name,
      foundryitemid: metatype.id,
      priority: metatype.system.priority
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
          foundryitemid: magic.id
        };
      })
    ];
  }
  static getPriorities() {
    return {
      attributes: { A: 30, B: 27, C: 24, D: 21, E: 18 },
      skills: { A: 50, B: 40, C: 34, D: 30, E: 27 },
      resources: { A: 1e6, B: 4e5, C: 9e4, D: 2e4, E: 5e3 }
    };
  }
  static getDefaultHumanItem() {
    return {
      name: localize(CONFIG.sr3e.placeholders.human) ?? "Localization Error in metatype",
      type: "metatype",
      img: "systems/sr3e/textures/ai-generated/humans.webp",
      system: {
        agerange: { min: 0, average: 30, max: 100 },
        physical: {
          height: { min: 150, average: 170, max: 220 },
          weight: { min: 50, average: 70, max: 250 }
        },
        attributeLimits: {
          strength: 6,
          quickness: 6,
          body: 6,
          charisma: 6,
          intelligence: 6,
          willpower: 6
        },
        karma: {
          factor: 0.1
        },
        priority: "E",
        journalId: ""
        // Set to a real JournalEntry ID if needed
      }
    };
  }
  static getDefaultMagic() {
    return {
      name: localize(CONFIG.sr3e.placeholders.fullshaman) ?? "Localization Error in Magic",
      type: "magic",
      system: {
        awakened: {
          archetype: "magician",
          priority: "A"
        },
        magicianData: {
          magicianType: "Full",
          tradition: "Bear",
          drainResistanceAttribute: "Charisma",
          aspect: "",
          canAstrallyProject: true,
          totem: "Bear",
          spellPoints: 25
        },
        adeptData: {
          powerPoints: 0
        }
      }
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
      "nearlyimpossible"
    ];
    return Object.fromEntries(difficulty.map((key) => [key, localize(config.difficulty[key])]));
  }
}
function swallowDirectional(e) {
  if (e.key === "Shift" || e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.stopPropagation();
  }
}
var on_click$c = (__1, modifiersArray) => {
  set(modifiersArray, proxy([
    ...get$1(modifiersArray),
    { name: "Modifier", value: 0 }
  ]));
};
var root_2$k = /* @__PURE__ */ template(`<div class="roll-composer-card array"><h4 contenteditable="true"> </h4> <!> <button class="regular" aria-label="Remove a modifier"><i class="fa-solid fa-minus"></i></button></div>`);
var root_3$f = /* @__PURE__ */ template(`<div class="roll-composer-card"><h1> </h1> <h4> </h4> <!></div>`);
var root_4$f = /* @__PURE__ */ template(`<div class="roll-composer-card"><h1>Karma</h1> <h4> </h4> <!></div>`);
var root_1$t = /* @__PURE__ */ template(`<div class="roll-composer-container" role="group" tabindex="-1"><div class="roll-composer-card"><h1> </h1> <h1>Roll Type</h1> <select><option>Regular roll</option><option>Defaulting</option></select></div> <div class="roll-composer-card"><h1>Target Number</h1> <h4> </h4> <!></div> <div class="roll-composer-card"><h1>T.N. Modifiers</h1> <button aria-label="Add a modifier" class="regular"><i class="fa-solid fa-plus"></i></button> <h4> </h4> <!></div> <!> <!> <button class="regular" type="submit">Roll!</button> <button class="regular" type="reset">Clear</button></div>`);
function RollComposerComponent($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $karmaPoolStore = () => store_get(karmaPoolStore, "$karmaPoolStore", $$stores);
  const $penalty = () => store_get(penalty, "$penalty", $$stores);
  const $associatedDicePoolStore = () => store_get(associatedDicePoolStore, "$associatedDicePoolStore", $$stores);
  const $linkedAttributeStore = () => store_get(linkedAttributeStore, "$linkedAttributeStore", $$stores);
  const $currentDicePoolSelectionStore = () => store_get(currentDicePoolSelectionStore, "$currentDicePoolSelectionStore", $$stores);
  const $displayCurrentDicePoolStore = () => store_get(displayCurrentDicePoolStore, "$displayCurrentDicePoolStore", $$stores);
  let actorStoreManager = StoreManager.Subscribe($$props.actor);
  onDestroy(() => {
    store_set(shouldDisplaySheen, false);
    StoreManager.Unsubscribe($$props.actor);
  });
  let karmaPoolStore = actorStoreManager.GetRWStore("karma.karmaPool");
  let penalty = actorStoreManager.GetRWStore("health.penalty");
  $karmaPoolStore();
  let currentDicePoolSelectionStore = actorStoreManager.GetShallowStore($$props.actor.id, stores$1.dicepoolSelection);
  let currentDicePoolName = state("");
  let currentDicePoolAddition = state(0);
  let displayCurrentDicePoolStore = null;
  let targetNumber = state(5);
  let modifiersArray = state(proxy([]));
  let karmaCost = state(0);
  let diceBought = state(0);
  let modifiersTotal = state(0);
  let difficulty = state("");
  let canSubmit = state(true);
  let isDefaultingAsString = state("false");
  let isDefaulting = state(false);
  let title = state("");
  let associatedDicePoolString = state("");
  let associatedDicePoolStore;
  let containerEl;
  let selectEl;
  let rollBtn;
  let clearBtn;
  let linkedAttributeString;
  let linkedAttributeStore;
  let focusables = [];
  let difficulties = ItemDataService.getDifficultyGradings($$props.config);
  let shouldDisplaySheen = actorStoreManager.GetShallowStore($$props.actor.id, stores$1.shouldDisplaySheen, false);
  user_effect(() => {
    console.log("caller type", $$props.caller.type);
    if ($$props.caller.type === "active" || $$props.caller.type === "attribute") {
      store_set(shouldDisplaySheen, true);
    } else {
      store_set(shouldDisplaySheen, false);
    }
  });
  onMount(() => {
    updateFocusables();
    selectEl == null ? void 0 : selectEl.focus();
    if ($penalty() > 0) {
      set(modifiersArray, proxy([
        {
          name: localize($$props.config.health.penalty),
          value: -$penalty()
        }
      ]));
    }
    if ($$props.caller.type === "attribute") {
      set(title, proxy(localize($$props.config.attributes[$$props.caller.key])));
    }
    if ($$props.caller.skillId) {
      let skill = $$props.actor.items.get($$props.caller.skillId);
      set(title, proxy($$props.caller.key));
      console.log("Resolved skill:", skill);
      if (skill.system.skillType === "active") {
        linkedAttributeString = skill.system.activeSkill.linkedAttribute;
        console.log("linkedAttributeString", linkedAttributeString);
        set(associatedDicePoolString, proxy(skill.system.activeSkill.associatedDicePool));
        associatedDicePoolStore = actorStoreManager.GetRWStore(`dicePools.${get$1(associatedDicePoolString)}`);
        console.log("associatedDicePoolStore", $associatedDicePoolStore());
      } else if (skill.system.skillType === "knowledge") {
        linkedAttributeString = skill.system.knowledgeSkill.linkedAttribute;
      } else if (skill.system.skillType === "language") {
        linkedAttributeString = skill.system.languageSkill.linkedAttribute;
        skill.system.languageSkill.readwrite;
      }
      if (linkedAttributeString !== "") {
        linkedAttributeStore = actorStoreManager.GetRWStore(`attributes.${linkedAttributeString}`);
        console.log("linkedAttributeStore", $linkedAttributeStore());
      }
    }
  });
  function updateFocusables() {
    const selector = get$1(isDefaulting) ? "select, .counter-component[tabindex='0']:not(.karma-counter), button[type]" : "select, .counter-component[tabindex='0'], button[type]";
    focusables = Array.from(containerEl.querySelectorAll(selector));
  }
  function KarmaCostCalculator() {
    set(karmaCost, 0.5 * get$1(diceBought) * (get$1(diceBought) + 1));
  }
  function AddDiceFromPool() {
  }
  function RemoveDiceFromPool() {
  }
  user_effect(() => {
    set(isDefaulting, get$1(isDefaultingAsString) === "true");
    updateFocusables();
  });
  user_effect(() => {
    set(currentDicePoolName, proxy($currentDicePoolSelectionStore()));
    if (!get$1(currentDicePoolName)) return;
    set(currentDicePoolAddition, 0);
    displayCurrentDicePoolStore = actorStoreManager.GetSumROStore(`dicePools.${get$1(currentDicePoolName)}`);
  });
  user_effect(() => {
    const baseModifiers = $penalty() > 0 ? [
      {
        name: localize($$props.config.health.penalty),
        value: -$penalty()
      }
    ] : [];
    if (get$1(isDefaulting)) {
      switch ($$props.caller.type) {
        case "attribute":
          set(modifiersArray, proxy([
            ...baseModifiers,
            { name: "Skill to attribute", value: 4 }
          ]));
          break;
        case "activeSkill":
        case "knowledgeSkill":
        case "languageSkill":
          set(modifiersArray, proxy([
            ...baseModifiers,
            { name: "Skill to skill", value: 2 }
          ]));
          break;
        case "specialization":
          set(modifiersArray, proxy([
            ...baseModifiers,
            { name: "Specialization to skill", value: 3 }
          ]));
          break;
        default:
          console.warn(`Unknown caller type for defaulting: ${$$props.caller.type}`);
          set(canSubmit, false);
          break;
      }
    } else {
      set(modifiersArray, proxy(baseModifiers));
    }
  });
  user_effect(() => {
    const tn = Number(get$1(targetNumber));
    if (!difficulties) return;
    if (tn === 2) set(difficulty, proxy(difficulties.simple));
    else if (tn === 3) set(difficulty, proxy(difficulties.routine));
    else if (tn === 4) set(difficulty, proxy(difficulties.average));
    else if (tn === 5) set(difficulty, proxy(difficulties.challenging));
    else if (tn === 6 || tn === 7) set(difficulty, proxy(difficulties.hard));
    else if (tn === 8) set(difficulty, proxy(difficulties.strenuous));
    else if (tn === 9) set(difficulty, proxy(difficulties.extreme));
    else if (tn >= 10) set(difficulty, proxy(difficulties.nearlyimpossible));
  });
  function Reset() {
    set(targetNumber, 5);
    set(modifiersArray, proxy($penalty() > 0 ? [
      {
        name: localize($$props.config.health.penalty),
        value: -$penalty()
      }
    ] : []));
    set(diceBought, 0);
    set(currentDicePoolAddition, 0);
    set(karmaCost, 0);
    set(isDefaultingAsString, "false");
    selectEl == null ? void 0 : selectEl.focus();
  }
  user_effect(() => {
    set(modifiersTotal, proxy(get$1(modifiersArray).reduce((acc, val) => acc + val.value, 0)));
  });
  user_effect(() => {
    set(canSubmit, get$1(targetNumber) + get$1(modifiersTotal) < 2);
  });
  async function Submit() {
    const isInCombat = game.combat !== null && game.combat !== void 0;
    if (isInCombat) {
      game.combat;
    }
    if (get$1(karmaCost) > 0) {
      const karmaEffect = {
        name: `Karma Drain (${get$1(karmaCost)})`,
        label: `Used ${get$1(karmaCost)} Karma Pool`,
        icon: "icons/magic/light/explosion-star-glow-blue.webp",
        changes: [
          {
            key: "system.karma.karmaPool",
            // Not a simple stat, has no mod!
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            value: `-${get$1(karmaCost)}`,
            priority: 20
          }
        ],
        origin: $$props.actor.uuid,
        ...isInCombat ? {
          duration: {
            rounds: 1,
            startRound: combat.round,
            startTurn: combat.turn
          }
        } : {},
        flags: {
          sr3e: {
            temporaryKarmaPoolDrain: true,
            expiresOutsideCombat: !isInCombat
          }
        }
      };
      await $$props.actor.createEmbeddedDocuments("ActiveEffect", [karmaEffect], { render: false });
    }
    if (get$1(currentDicePoolAddition) > 0 && get$1(currentDicePoolName)) {
      const effect2 = {
        name: `Dice Pool Drain (${get$1(currentDicePoolName)})`,
        label: `Used ${get$1(currentDicePoolAddition)} from ${get$1(currentDicePoolName)}`,
        icon: "systems/sr3e/textures/ai/icons/dicepool.webp",
        changes: [
          {
            key: `system.dicePools.${get$1(currentDicePoolName)}.mod`,
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            value: `-${get$1(currentDicePoolAddition)}`,
            priority: 1
          }
        ],
        origin: $$props.actor.uuid,
        transfer: false,
        //NOTE: Not applied through an item, but directly on the actor itself
        ...isInCombat ? {
          duration: {
            unit: "rounds",
            value: 1,
            startRound: combat.round,
            startTurn: combat.turn
          }
        } : {},
        flags: {
          sr3e: {
            temporaryDicePoolDrain: true,
            expiresOutsideCombat: !isInCombat
            // storyteller UI can target these
          }
        }
      };
      await $$props.actor.createEmbeddedDocuments("ActiveEffect", [effect2], { render: false });
      $$props.actor.applyActiveEffects();
    }
    $$props.onclose({
      dice: $$props.caller.dice + get$1(diceBought),
      attributeName: $$props.caller.key,
      options: {
        targetNumber: get$1(targetNumber),
        modifiers: get$1(modifiersArray),
        explodes: !get$1(isDefaulting)
      }
    });
  }
  function getRoot(el) {
    while (el && !focusables.includes(el)) el = el.parentElement;
    return el;
  }
  function focusNext() {
    var _a;
    const idx = focusables.indexOf(getRoot(document.activeElement));
    if (idx !== -1) (_a = focusables[(idx + 1) % focusables.length]) == null ? void 0 : _a.focus();
  }
  function handleKey(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      const root2 = getRoot(document.activeElement);
      if (root2 === rollBtn) {
        Submit();
        return;
      }
      if (root2 === clearBtn) {
        Reset();
        return;
      }
      focusNext();
    } else if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      const root2 = getRoot(document.activeElement);
      if (root2 === rollBtn) {
        Reset();
        return;
      }
      focusNext();
    }
  }
  function handleSelectKeydown(e) {
    if (["ArrowUp", "w", "W"].includes(e.key)) {
      e.preventDefault();
      selectEl.selectedIndex = 0;
      set(isDefaultingAsString, proxy(selectEl.value));
    }
    if (["ArrowDown", "s", "S"].includes(e.key)) {
      e.preventDefault();
      selectEl.selectedIndex = 1;
      set(isDefaultingAsString, proxy(selectEl.value));
    }
  }
  var div = root_1$t();
  div.__keydown = [swallowDirectional];
  var div_1 = child(div);
  var h1 = child(div_1);
  var text2 = child(h1);
  var select = sibling(h1, 4);
  select.__keydown = handleSelectKeydown;
  var option = child(select);
  option.value = null == (option.__value = "false") ? "" : "false";
  var option_1 = sibling(option);
  option_1.value = null == (option_1.__value = "true") ? "" : "true";
  bind_this(select, ($$value) => selectEl = $$value, () => selectEl);
  var div_2 = sibling(div_1, 2);
  var h4 = sibling(child(div_2), 2);
  var text_1 = child(h4);
  var node = sibling(h4, 2);
  Counter(node, {
    min: "2",
    get value() {
      return get$1(targetNumber);
    },
    set value($$value) {
      set(targetNumber, proxy($$value));
    }
  });
  var div_3 = sibling(div_2, 2);
  var button = sibling(child(div_3), 2);
  button.__click = [on_click$c, modifiersArray];
  var h4_1 = sibling(button, 2);
  var text_2 = child(h4_1);
  var node_1 = sibling(h4_1, 2);
  each(node_1, 17, () => get$1(modifiersArray), index, ($$anchor2, modifier, i) => {
    var div_4 = root_2$k();
    var h4_2 = child(div_4);
    var text_3 = child(h4_2);
    var node_2 = sibling(h4_2, 2);
    Counter(node_2, {
      get value() {
        return get$1(modifier).value;
      },
      set value($$value) {
        get$1(modifier).value = $$value;
      }
    });
    var button_1 = sibling(node_2, 2);
    button_1.__click = () => {
      set(modifiersArray, proxy(get$1(modifiersArray).filter((_, j) => j !== i)));
    };
    template_effect(() => set_text(text_3, get$1(modifier).name));
    append($$anchor2, div_4);
  });
  var node_3 = sibling(div_3, 2);
  {
    var consequent = ($$anchor2) => {
      var div_5 = root_3$f();
      var h1_1 = child(div_5);
      var text_4 = child(h1_1);
      var h4_3 = sibling(h1_1, 2);
      var text_5 = child(h4_3);
      var node_4 = sibling(h4_3, 2);
      Counter(node_4, {
        class: "karma-counter",
        min: "0",
        get max() {
          return $displayCurrentDicePoolStore().sum;
        },
        onIncrement: AddDiceFromPool,
        onDecrement: RemoveDiceFromPool,
        get value() {
          return get$1(currentDicePoolAddition);
        },
        set value($$value) {
          set(currentDicePoolAddition, proxy($$value));
        }
      });
      template_effect(
        ($0) => {
          set_text(text_4, $0);
          set_text(text_5, `Dice Added: ${get$1(currentDicePoolAddition) ?? ""}`);
        },
        [
          () => localize($$props.config.dicepools[get$1(currentDicePoolName)])
        ]
      );
      append($$anchor2, div_5);
    };
    if_block(node_3, ($$render) => {
      if (!($$props.caller.type === "attribute" && get$1(isDefaulting)) && get$1(currentDicePoolName)) $$render(consequent);
    });
  }
  var node_5 = sibling(node_3, 2);
  {
    var consequent_1 = ($$anchor2) => {
      var div_6 = root_4$f();
      var h4_4 = sibling(child(div_6), 2);
      var text_6 = child(h4_4);
      var node_6 = sibling(h4_4, 2);
      Counter(node_6, {
        class: "karma-counter",
        min: "0",
        get max() {
          return $$props.actor.system.karma.karmaPool;
        },
        onIncrement: KarmaCostCalculator,
        onDecrement: KarmaCostCalculator,
        get value() {
          return get$1(diceBought);
        },
        set value($$value) {
          set(diceBought, proxy($$value));
        }
      });
      template_effect(() => set_text(text_6, `Extra Dice Cost: ${get$1(karmaCost) ?? ""}`));
      append($$anchor2, div_6);
    };
    if_block(node_5, ($$render) => {
      if (!get$1(isDefaulting)) $$render(consequent_1);
    });
  }
  var button_2 = sibling(node_5, 2);
  button_2.__click = Submit;
  bind_this(button_2, ($$value) => rollBtn = $$value, () => rollBtn);
  var button_3 = sibling(button_2, 2);
  button_3.__click = Reset;
  bind_this(button_3, ($$value) => clearBtn = $$value, () => clearBtn);
  bind_this(div, ($$value) => containerEl = $$value, () => containerEl);
  template_effect(() => {
    set_text(text2, get$1(title));
    set_text(text_1, get$1(difficulty));
    set_text(text_2, `Modifiers Total: ${get$1(modifiersTotal) ?? ""}`);
    button_2.disabled = get$1(canSubmit);
  });
  event$1("keydown", div, handleKey, true);
  bind_select_value(select, () => get$1(isDefaultingAsString), ($$value) => set(isDefaultingAsString, $$value));
  append($$anchor, div);
  pop();
  $$cleanup();
}
delegate(["keydown", "click"]);
var on_keydown$7 = (e, decrement2) => (e.key === "ArrowDown" || e.key === "s") && decrement2();
var root_2$j = /* @__PURE__ */ template(`<i role="button" tabindex="0"></i>`);
var on_keydown_1$4 = (e, increment2) => (e.key === "ArrowUp" || e.key === "w") && increment2();
var root_3$e = /* @__PURE__ */ template(`<i role="button" tabindex="0"></i>`);
var root_1$s = /* @__PURE__ */ template(`<div class="stat-card" role="button" tabindex="0"><h4 class="no-margin uppercase"> </h4> <div class="stat-card-background"></div> <div class="stat-label"><!> <h1 class="stat-value"> </h1> <!></div></div>`);
var on_keydown_2$3 = (e, Roll2) => {
  if (e.key === "Enter" || e.key === " ") Roll2(e);
};
var root_4$e = /* @__PURE__ */ template(`<div class="stat-card button" role="button" tabindex="0"><h4 class="no-margin uppercase"> </h4> <div class="stat-card-background"></div> <div class="stat-label"><h1 class="stat-value"> </h1></div></div>`);
function AttributeCard($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $isShoppingState = () => store_get(isShoppingState, "$isShoppingState", $$stores);
  const $attributeAssignmentLockedStore = () => store_get(attributeAssignmentLockedStore, "$attributeAssignmentLockedStore", $$stores);
  const $valueROStore = () => store_get(valueROStore, "$valueROStore", $$stores);
  const $attributePointStore = () => store_get(attributePointStore, "$attributePointStore", $$stores);
  const $valueRWStore = () => store_get(get$1(valueRWStore), "$valueRWStore", $$stores);
  const storeManager2 = StoreManager.Subscribe($$props.actor);
  let valueROStore = storeManager2.GetSumROStore(`attributes.${$$props.key}`);
  let baseValueStore = storeManager2.GetRWStore(`attributes.${$$props.key}.value`);
  let attributePointStore = storeManager2.GetRWStore("creation.attributePoints");
  let isShoppingState = storeManager2.GetFlagStore(flags.actor.isShoppingState);
  let attributeAssignmentLockedStore = storeManager2.GetFlagStore(flags.actor.attributeAssignmentLocked);
  let metatype = /* @__PURE__ */ derived$1(() => $$props.actor.items.find((i) => i.type === "metatype") || []);
  let attributeLimit = /* @__PURE__ */ derived$1(() => $$props.key === "magic" ? null : get$1(metatype).system.attributeLimits[$$props.key] ?? 0);
  let committedValue = null;
  user_effect(() => {
    if ($isShoppingState() && $attributeAssignmentLockedStore() && committedValue === null) {
      committedValue = $valueROStore().value;
    }
  });
  let isMinLimit = state(false);
  user_effect(() => {
    if ($isShoppingState() && $attributeAssignmentLockedStore() && committedValue !== null) {
      set(isMinLimit, $valueROStore().value <= committedValue);
    } else {
      set(isMinLimit, $valueROStore().value <= 1);
    }
  });
  storeManager2.GetShallowStore($$props.actor.id, stores$1.dicepoolSelection);
  let valueRWStore = /* @__PURE__ */ derived$1(() => $isShoppingState() && !$attributeAssignmentLockedStore() ? baseValueStore : null);
  user_effect(() => {
    if (!$attributeAssignmentLockedStore() && $isShoppingState() && $valueROStore().value + $valueROStore().mod < 1 && $valueROStore().mod < 0 && get$1(valueRWStore)) {
      let deficit = 1 - ($valueROStore().value + $valueROStore().mod);
      while (deficit > 0 && $attributePointStore() > 0) {
        store_set(attributePointStore, $attributePointStore() - 1);
        store_set(get$1(valueRWStore), $valueRWStore() + 1);
        deficit -= 1;
      }
    }
  });
  let activeModal = null;
  let isModalOpen = state(false);
  function add(change) {
    if (!$attributeAssignmentLockedStore() && $isShoppingState() && get$1(valueRWStore)) {
      const newPoints = $attributePointStore() - change;
      const newValue = $valueRWStore() + change;
      if (newPoints >= 0 && (get$1(attributeLimit) === null || newValue <= get$1(attributeLimit))) {
        store_set(attributePointStore, newPoints);
        store_set(get$1(valueRWStore), newValue);
      }
    }
  }
  const increment2 = () => add(1);
  const decrement2 = () => {
    if (!get$1(isMinLimit)) add(-1);
  };
  function handleEscape(e) {
    if (e.key === "Escape" && activeModal) {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      unmount(activeModal);
      set(isModalOpen, false);
      activeModal = null;
    }
  }
  onDestroy(() => {
    StoreManager.Unsubscribe($$props.actor);
    if (activeModal) {
      unmount(activeModal);
      set(isModalOpen, false);
      activeModal = null;
    }
  });
  async function Roll2(e) {
    if (e.shiftKey) {
      if (get$1(isModalOpen)) return;
      set(isModalOpen, true);
      const options = await new Promise((resolve) => {
        activeModal = mount(RollComposerComponent, {
          target: document.querySelector(".composer-position"),
          props: {
            actor: $$props.actor,
            config: CONFIG.sr3e,
            caller: {
              key: $$props.key,
              value: $valueROStore().value,
              type: "attribute",
              dice: $valueROStore().sum
            },
            onclose: (result) => {
              unmount(activeModal);
              set(isModalOpen, false);
              activeModal = null;
              resolve(result);
            }
          }
        });
      });
      if (options) {
        await $$props.actor.AttributeRoll(options.dice, options.attributeName, options.options);
      }
    } else {
      await $$props.actor.AttributeRoll($valueROStore().sum, $$props.key);
    }
    e.preventDefault();
  }
  var fragment = comment();
  event$1("keydown", $window, handleEscape, true);
  var node = first_child(fragment);
  {
    var consequent_2 = ($$anchor2) => {
      var div = root_1$s();
      var h4 = child(div);
      var text2 = child(h4);
      var div_1 = sibling(h4, 4);
      var node_1 = child(div_1);
      {
        var consequent = ($$anchor3) => {
          var i_1 = root_2$j();
          i_1.__click = decrement2;
          i_1.__keydown = [on_keydown$7, decrement2];
          template_effect(() => set_class(i_1, `fa-solid fa-circle-chevron-down decrement-attribute ${(get$1(isMinLimit) ? "disabled" : "") ?? ""}`));
          append($$anchor3, i_1);
        };
        if_block(node_1, ($$render) => {
          if ($$props.key !== "reaction") $$render(consequent);
        });
      }
      var h1 = sibling(node_1, 2);
      var text_1 = child(h1);
      var node_2 = sibling(h1, 2);
      {
        var consequent_1 = ($$anchor3) => {
          var i_2 = root_3$e();
          i_2.__click = increment2;
          i_2.__keydown = [on_keydown_1$4, increment2];
          template_effect(() => set_class(i_2, `fa-solid fa-circle-chevron-up increment-attribute ${($attributePointStore() === 0 ? "disabled" : "") ?? ""}`));
          append($$anchor3, i_2);
        };
        if_block(node_2, ($$render) => {
          if ($$props.key !== "reaction") $$render(consequent_1);
        });
      }
      template_effect(
        ($0) => {
          set_text(text2, $0);
          set_text(text_1, $valueROStore().sum);
        },
        [
          () => localize($$props.localization[$$props.key])
        ]
      );
      append($$anchor2, div);
    };
    var alternate = ($$anchor2) => {
      var div_2 = root_4$e();
      div_2.__click = Roll2;
      div_2.__keydown = [on_keydown_2$3, Roll2];
      var h4_1 = child(div_2);
      var text_2 = child(h4_1);
      var div_3 = sibling(h4_1, 4);
      var h1_1 = child(div_3);
      var text_3 = child(h1_1);
      template_effect(
        ($0) => {
          set_text(text_2, $0);
          set_text(text_3, $valueROStore().sum);
        },
        [
          () => localize($$props.localization[$$props.key])
        ]
      );
      append($$anchor2, div_2);
    };
    if_block(node, ($$render) => {
      if ($isShoppingState()) $$render(consequent_2);
      else $$render(alternate, false);
    });
  }
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
delegate(["click", "keydown"]);
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
  const applyWidths = () => {
    const style = getComputedStyle(form);
    const parentPadding = parseFloat(style.paddingLeft) || 0;
    const parentWidth = form.offsetWidth - 2 * parentPadding;
    const gutterEl = container.querySelector(gutterSizerSelector);
    const gutterPx = gutterEl ? parseFloat(getComputedStyle(gutterEl).width) : 20;
    const firstItem = container.querySelector(itemSelector);
    const minItem = firstItem ? parseFloat(getComputedStyle(firstItem).minWidth) || minItemWidth : minItemWidth;
    const columnCount = Math.max(Math.floor((parentWidth + gutterPx) / (minItem + gutterPx)), 1);
    const oneColPX = Math.floor((parentWidth - gutterPx * (columnCount - 1)) / columnCount);
    const sizer = container.querySelector(gridSizerSelector);
    const containerPX = oneColPX * columnCount + gutterPx * (columnCount - 1);
    if (sizer) {
      const sizerPct = oneColPX / containerPX * 100;
      sizer.style.width = `${sizerPct}%`;
    }
    container.querySelectorAll(itemSelector).forEach((el) => {
      const m = el.className.match(/span-(\d)/);
      const span = m ? +m[1] : 1;
      const spanPX = oneColPX * span + gutterPx * (span - 1);
      const spanPct = spanPX / containerPX * 100;
      el.style.width = `min(${spanPct}%, 100%)`;
    });
    const state2 = columnCount >= 3 ? "wide" : columnCount === 2 ? "medium" : "small";
    onLayoutStateChange(state2);
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
  const mutationObserver = new MutationObserver((mutationsList) => {
    let shouldRelayout = false;
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && node.matches(itemSelector)) {
            const obs = new ResizeObserver(() => {
              requestAnimationFrame(() => {
                msnry.reloadItems();
                msnry.layout();
              });
            });
            obs.observe(node);
            itemObservers.push(obs);
            shouldRelayout = true;
          }
        });
      }
    }
    if (shouldRelayout) {
      requestAnimationFrame(() => {
        applyWidths();
        msnry.reloadItems();
        msnry.layout();
      });
    }
  });
  mutationObserver.observe(container, {
    childList: true,
    subtree: false
    // Adjust to true if item containers are nested
  });
  setTimeout(() => {
    applyWidths();
    msnry.reloadItems();
    msnry.layout();
  }, 100);
  const cleanup = () => {
    resizeObserver.disconnect();
    itemObservers.forEach((obs) => obs.disconnect());
    mutationObserver.disconnect();
    msnry.destroy();
  };
  return { masonryInstance: msnry, cleanup };
}
const handleKeyDown$1 = (e, provideSelectedDicepool) => {
  if (e.key === "Enter" || e.key === " ") provideSelectedDicepool(e);
};
var root_2$i = /* @__PURE__ */ template(`<h4 class="no-margin uppercase"> </h4>`);
var root_4$d = /* @__PURE__ */ template(`<h1 class="stat-value"> </h1>`);
var root_1$r = /* @__PURE__ */ template(`<div class="stat-card button" role="button" tabindex="0"><div class="stat-card-background"></div> <!> <!></div>`);
var root_6$5 = /* @__PURE__ */ template(`<h4 class="no-margin uppercase"> </h4>`);
var root_8$2 = /* @__PURE__ */ template(`<h1 class="stat-value"> </h1>`);
var root_5$9 = /* @__PURE__ */ template(`<div class="stat-card"><div class="stat-card-background"></div> <!> <!></div>`);
function StatCard$1($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $shouldDisplaySheen = () => store_get(shouldDisplaySheen, "$shouldDisplaySheen", $$stores);
  let isButton = prop($$props, "isButton", 3, false), key = prop($$props, "key", 3, "");
  let currentDicePoolSelectionStore;
  let shouldDisplaySheen;
  if ($$props.document) {
    const storeManager2 = StoreManager.Subscribe($$props.document);
    currentDicePoolSelectionStore = storeManager2.GetShallowStore($$props.document.id, stores$1.dicepoolSelection);
    shouldDisplaySheen = storeManager2.GetShallowStore($$props.document.id, stores$1.shouldDisplaySheen, false);
    onDestroy(() => {
      StoreManager.Unsubscribe($$props.document);
    });
  }
  function provideSelectedDicepool(_) {
    if (currentDicePoolSelectionStore) store_set(currentDicePoolSelectionStore, key());
  }
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent_2 = ($$anchor2) => {
      var div = root_1$r();
      div.__click = provideSelectedDicepool;
      div.__keydown = [handleKeyDown$1, provideSelectedDicepool];
      var node_1 = sibling(child(div), 2);
      {
        var consequent = ($$anchor3) => {
          var h4 = root_2$i();
          var text2 = child(h4);
          template_effect(($0) => set_text(text2, $0), [() => localize($$props.label)]);
          append($$anchor3, h4);
        };
        if_block(node_1, ($$render) => {
          var _a;
          if (((_a = $$props.label) == null ? void 0 : _a.length) > 0) $$render(consequent);
        });
      }
      var node_2 = sibling(node_1, 2);
      {
        var consequent_1 = ($$anchor3) => {
          var fragment_1 = comment();
          var node_3 = first_child(fragment_1);
          snippet(node_3, () => $$props.children ?? noop);
          append($$anchor3, fragment_1);
        };
        var alternate = ($$anchor3) => {
          var h1 = root_4$d();
          var text_1 = child(h1);
          template_effect(() => set_text(text_1, $$props.value));
          append($$anchor3, h1);
        };
        if_block(node_2, ($$render) => {
          if ($$props.children) $$render(consequent_1);
          else $$render(alternate, false);
        });
      }
      template_effect(() => toggle_class(div, "alert-animation", $shouldDisplaySheen()));
      append($$anchor2, div);
    };
    var alternate_2 = ($$anchor2) => {
      var div_1 = root_5$9();
      var node_4 = sibling(child(div_1), 2);
      {
        var consequent_3 = ($$anchor3) => {
          var h4_1 = root_6$5();
          var text_2 = child(h4_1);
          template_effect(($0) => set_text(text_2, $0), [() => localize($$props.label)]);
          append($$anchor3, h4_1);
        };
        if_block(node_4, ($$render) => {
          var _a;
          if (((_a = $$props.label) == null ? void 0 : _a.length) > 0) $$render(consequent_3);
        });
      }
      var node_5 = sibling(node_4, 2);
      {
        var consequent_4 = ($$anchor3) => {
          var fragment_2 = comment();
          var node_6 = first_child(fragment_2);
          snippet(node_6, () => $$props.children ?? noop);
          append($$anchor3, fragment_2);
        };
        var alternate_1 = ($$anchor3) => {
          var h1_1 = root_8$2();
          var text_3 = child(h1_1);
          template_effect(() => set_text(text_3, $$props.value));
          append($$anchor3, h1_1);
        };
        if_block(node_5, ($$render) => {
          if ($$props.children) $$render(consequent_4);
          else $$render(alternate_1, false);
        });
      }
      append($$anchor2, div_1);
    };
    if_block(node, ($$render) => {
      if (isButton() && $shouldDisplaySheen()) $$render(consequent_2);
      else $$render(alternate_2, false);
    });
  }
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
delegate(["click", "keydown"]);
var root$K = /* @__PURE__ */ template(`<div><div></div> <div></div> <!></div>`);
function MasonryGrid($$anchor, $$props) {
  push($$props, true);
  let itemSelector = prop($$props, "itemSelector", 3, ""), gridPrefix = prop($$props, "gridPrefix", 3, "");
  let gridContainer;
  let masonryInstance;
  user_effect(() => {
    if (!masonryInstance) {
      parseFloat(getComputedStyle(document.documentElement).fontSize);
      const result = setupMasonry({
        container: gridContainer,
        itemSelector: `.${itemSelector()}`,
        gridSizerSelector: `.${gridPrefix()}-grid-sizer`,
        gutterSizerSelector: `.${gridPrefix()}-gutter-sizer`
        //minItemWidth: masonryMinWidthFallbackValue.attributeGrid * rem,
      });
      masonryInstance = result.masonryInstance;
      return result.cleanup;
    }
  });
  user_effect(async () => {
    gridContainer == null ? void 0 : gridContainer.dispatchEvent(new CustomEvent("masonry-reflow", { bubbles: true }));
  });
  var div = root$K();
  var div_1 = child(div);
  var div_2 = sibling(div_1, 2);
  var node = sibling(div_2, 2);
  snippet(node, () => $$props.children ?? noop);
  bind_this(div, ($$value) => gridContainer = $$value, () => gridContainer);
  template_effect(() => {
    set_class(div, `${gridPrefix()}-masonry-grid`);
    set_class(div_1, `${gridPrefix()}-grid-sizer`);
    set_class(div_2, `${gridPrefix()}-gutter-sizer`);
  });
  event$1("masonry-reflow", div, () => {
    masonryInstance.layout();
  });
  append($$anchor, div);
  pop();
}
var root_1$q = /* @__PURE__ */ template(`<!> <!>`, 1);
var root$J = /* @__PURE__ */ template(`<!> <h1> </h1> <!>`, 1);
function Attributes($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $intelligence = () => store_get(intelligence, "$intelligence", $$stores);
  const $quickness = () => store_get(quickness, "$quickness", $$stores);
  let actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({})), id = prop($$props, "id", 19, () => ({}));
  prop($$props, "span", 19, () => ({}));
  let attributes = proxy(actor().system.attributes);
  proxy(actor().items);
  let isAwakened = state(false);
  let localization = config().attributes;
  let storeManager2 = StoreManager.Subscribe(actor());
  storeManager2.GetFlagStore(flags.attributeAssignmentLocked);
  let intelligence = storeManager2.GetSumROStore("attributes.intelligence");
  let quickness = storeManager2.GetSumROStore("attributes.quickness");
  storeManager2.GetSumROStore("attributes.magic");
  storeManager2.GetSumROStore("attributes.essence");
  storeManager2.GetSumROStore("attributes.reaction");
  let reactionValue = storeManager2.GetRWStore("attributes.reaction.value");
  user_effect(() => {
    store_set(reactionValue, proxy(Math.floor(($intelligence().sum + $quickness().sum) * 0.5)));
  });
  user_effect(() => {
    set(isAwakened, proxy(actor().items.some((item2) => item2.type === "magic") && !actor().system.attributes.magic.isBurnedOut));
  });
  onDestroy(() => {
    StoreManager.Unsubscribe(actor());
  });
  var fragment = root$J();
  var node = first_child(fragment);
  CardToolbar(node, {
    get id() {
      return id();
    }
  });
  var h1 = sibling(node, 2);
  var text2 = child(h1);
  var node_1 = sibling(h1, 2);
  MasonryGrid(node_1, {
    itemSelector: "stat-card",
    gridPrefix: "attribute",
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = root_1$q();
      var node_2 = first_child(fragment_1);
      each(node_2, 17, () => Object.keys(attributes).slice(0, 7), index, ($$anchor3, key) => {
        AttributeCard($$anchor3, {
          get actor() {
            return actor();
          },
          localization,
          get key() {
            return get$1(key);
          }
        });
      });
      var node_3 = sibling(node_2, 2);
      {
        var consequent = ($$anchor3) => {
          AttributeCard($$anchor3, {
            get actor() {
              return actor();
            },
            localization,
            key: "magic"
          });
        };
        if_block(node_3, ($$render) => {
          if (get$1(isAwakened)) $$render(consequent);
        });
      }
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  });
  template_effect(($0) => set_text(text2, $0), [() => localize(localization.attributes)]);
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
var root_2$h = /* @__PURE__ */ template(`<!> <!>`, 1);
var root_1$p = /* @__PURE__ */ template(`<!> <!> <!> <!>`, 1);
var root$I = /* @__PURE__ */ template(`<!> <h1> </h1> <!>`, 1);
function DicePools($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $reaction = () => store_get(reaction, "$reaction", $$stores);
  const $intelligence = () => store_get(intelligence, "$intelligence", $$stores);
  const $quickness = () => store_get(quickness, "$quickness", $$stores);
  const $willpower = () => store_get(willpower, "$willpower", $$stores);
  const $charisma = () => store_get(charisma, "$charisma", $$stores);
  const $magic = () => store_get(magic, "$magic", $$stores);
  const $combat = () => store_get(combat2, "$combat", $$stores);
  const $control = () => store_get(control, "$control", $$stores);
  const $hacking = () => store_get(hacking, "$hacking", $$stores);
  const $astral = () => store_get(astral, "$astral", $$stores);
  const $spell = () => store_get(spell, "$spell", $$stores);
  let actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({})), id = prop($$props, "id", 19, () => ({}));
  prop($$props, "span", 19, () => ({}));
  let isAwakened = state(false);
  user_effect(() => {
    set(isAwakened, proxy(actor().items.some((item2) => item2.type === "magic") && !actor().system.attributes.magic.isBurnedOut));
  });
  const storeManager2 = StoreManager.Subscribe(actor());
  let intelligence = storeManager2.GetSumROStore("attributes.intelligence");
  let willpower = storeManager2.GetSumROStore("attributes.willpower");
  let charisma = storeManager2.GetSumROStore("attributes.charisma");
  let quickness = storeManager2.GetSumROStore("attributes.quickness");
  let reaction = storeManager2.GetSumROStore("attributes.reaction");
  let magic = storeManager2.GetSumROStore("attributes.magic");
  let combat2 = storeManager2.GetSumROStore("dicePools.combat");
  let combatValueStore = storeManager2.GetRWStore("dicePools.combat.value");
  let control = storeManager2.GetSumROStore("dicePools.control");
  let controlValueStore = storeManager2.GetRWStore("dicePools.control.value");
  let hacking = storeManager2.GetSumROStore("dicePools.hacking");
  let astral = storeManager2.GetSumROStore("dicePools.astral");
  let astralValueStore = storeManager2.GetRWStore("dicePools.astral.value");
  let spell = storeManager2.GetSumROStore("dicePools.spell");
  let spellValueStore = storeManager2.GetRWStore("dicePools.spell.value");
  user_effect(() => {
    store_set(controlValueStore, proxy($reaction().sum));
    store_set(combatValueStore, proxy(Math.floor(($intelligence().sum + $quickness().sum + $willpower().sum) * 0.5)));
    store_set(astralValueStore, proxy(Math.floor(($intelligence().sum + $charisma().sum + $willpower().sum) * 0.5)));
    store_set(spellValueStore, proxy(Math.floor(($intelligence().sum + $magic().sum + $willpower().sum) * 0.5)));
  });
  onDestroy(() => {
    StoreManager.Unsubscribe(actor());
  });
  var fragment = root$I();
  var node = first_child(fragment);
  CardToolbar(node, {
    get id() {
      return id();
    }
  });
  var h1 = sibling(node, 2);
  var text2 = child(h1);
  var node_1 = sibling(h1, 2);
  MasonryGrid(node_1, {
    itemSelector: "stat-card",
    gridPrefix: "attribute",
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = root_1$p();
      var node_2 = first_child(fragment_1);
      StatCard$1(node_2, {
        get document() {
          return actor();
        },
        get label() {
          return config().dicepools.combat;
        },
        get value() {
          return $combat().sum;
        },
        key: "combat",
        isButton: true
      });
      var node_3 = sibling(node_2, 2);
      StatCard$1(node_3, {
        get document() {
          return actor();
        },
        get label() {
          return config().dicepools.control;
        },
        get value() {
          return $control().sum;
        },
        key: "control",
        isButton: true
      });
      var node_4 = sibling(node_3, 2);
      StatCard$1(node_4, {
        get document() {
          return actor();
        },
        get label() {
          return config().dicepools.hacking;
        },
        get value() {
          return $hacking().sum;
        },
        key: "hacking",
        isButton: true
      });
      var node_5 = sibling(node_4, 2);
      {
        var consequent = ($$anchor3) => {
          var fragment_2 = root_2$h();
          var node_6 = first_child(fragment_2);
          StatCard$1(node_6, {
            get document() {
              return actor();
            },
            get label() {
              return config().dicepools.astral;
            },
            get value() {
              return $astral().sum;
            },
            key: "astral",
            isButton: true
          });
          var node_7 = sibling(node_6, 2);
          StatCard$1(node_7, {
            get document() {
              return actor();
            },
            get label() {
              return config().dicepools.spell;
            },
            get value() {
              return $spell().sum;
            },
            key: "spell",
            isButton: true
          });
          append($$anchor3, fragment_2);
        };
        if_block(node_5, ($$render) => {
          if (get$1(isAwakened)) $$render(consequent);
        });
      }
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  });
  template_effect(($0) => set_text(text2, $0), [
    () => localize(config().dicepools.dicepools)
  ]);
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
var root_1$o = /* @__PURE__ */ template(`<!> <!>`, 1);
var root$H = /* @__PURE__ */ template(`<!> <h1> </h1> <!>`, 1);
function Movement($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $quickness = () => store_get(quickness, "$quickness", $$stores);
  const $walking = () => store_get(walking, "$walking", $$stores);
  const $running = () => store_get(running, "$running", $$stores);
  let actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({})), id = prop($$props, "id", 19, () => ({}));
  prop($$props, "span", 19, () => ({}));
  const storeManager2 = StoreManager.Subscribe(actor());
  onDestroy(() => StoreManager.Unsubscribe(actor()));
  let quickness = storeManager2.GetSumROStore("attributes.quickness");
  let walking = storeManager2.GetSumROStore("movement.walking");
  let walkingValueStore = storeManager2.GetRWStore("movement.walking.value");
  let running = storeManager2.GetSumROStore("movement.running");
  let runningValueStore = storeManager2.GetRWStore("movement.running.value");
  user_effect(() => {
    store_set(walkingValueStore, proxy($quickness().sum));
    store_set(runningValueStore, proxy($quickness().sum));
  });
  var fragment = root$H();
  var node = first_child(fragment);
  CardToolbar(node, {
    get id() {
      return id();
    }
  });
  var h1 = sibling(node, 2);
  var text2 = child(h1);
  var node_1 = sibling(h1, 2);
  MasonryGrid(node_1, {
    itemSelector: "stat-card",
    gridPrefix: "attribute",
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = root_1$o();
      var node_2 = first_child(fragment_1);
      StatCard$1(node_2, {
        get actor() {
          return actor();
        },
        get label() {
          return config().movement.walking;
        },
        get value() {
          return $walking().sum;
        }
      });
      var node_3 = sibling(node_2, 2);
      StatCard$1(node_3, {
        get actor() {
          return actor();
        },
        get label() {
          return config().movement.running;
        },
        get value() {
          return $running().sum;
        }
      });
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  });
  template_effect(($0) => set_text(text2, $0), [
    () => localize(config().movement.movement)
  ]);
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
function increment$1() {
  console.log("increment Entered");
}
function decrement$3() {
  console.log("decrement Entered");
}
function deleteThis$3(_, $isCharacterCreationStore, isCharacterCreationStore, specialization, $baseValue, baseValue, dispatch) {
  if ($isCharacterCreationStore()) {
    if (specialization().value === $baseValue() + 2) {
      specialization(specialization().value = 0, true);
      store_set(baseValue, $baseValue() + 1);
      dispatch("arrayChanged");
    }
  }
  dispatch("delete", { specialization: specialization() });
}
var root_1$n = /* @__PURE__ */ template(`<h1 class="embedded-value no-margin"> </h1>`);
var root$G = /* @__PURE__ */ template(`<!> <div class="buttons-vertical-distribution"><button class="header-control icon sr3e-toolbar-button" aria-label="Increment"><i class="fa-solid fa-plus"></i></button> <button class="header-control icon sr3e-toolbar-button" aria-label="Decrement"><i class="fa-solid fa-minus"></i></button> <button class="header-control icon sr3e-toolbar-button" aria-label="Delete"><i class="fa-solid fa-trash-can"></i></button></div>`, 1);
function SpecializationCard($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $isCharacterCreationStore = () => store_get(isCharacterCreationStore, "$isCharacterCreationStore", $$stores);
  const $baseValue = () => store_get(baseValue, "$baseValue", $$stores);
  let specialization = prop($$props, "specialization", 15), actor = prop($$props, "actor", 19, () => ({}));
  prop($$props, "skill", 19, () => ({}));
  let storeManager2 = StoreManager.Subscribe(actor());
  const dispatch = createEventDispatcher();
  onDestroy(() => {
    StoreManager.Unsubscribe(actor());
  });
  let isCharacterCreationStore = storeManager2.GetFlagStore(flags.actor.isCharacterCreation);
  let baseValue = storeManager2.GetRWStore("activeSkill.value");
  let liveText = specialization().name;
  user_effect(() => {
    if (liveText !== specialization().name) {
      liveText = specialization().name;
    }
  });
  function handleInput(e) {
    liveText = e.target.innerText;
    specialization(specialization().name = liveText, true);
    dispatch("arrayChanged");
  }
  function handleKeyDown2(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    }
  }
  var fragment = root$G();
  var node = first_child(fragment);
  TextInput(node, {
    text: liveText,
    oninput: handleInput,
    onkeydown: handleKeyDown2,
    children: ($$anchor2, $$slotProps) => {
      var h1 = root_1$n();
      var text2 = child(h1);
      template_effect(() => set_text(text2, specialization().value));
      append($$anchor2, h1);
    },
    $$slots: { default: true }
  });
  var div = sibling(node, 2);
  var button = child(div);
  button.__click = [increment$1];
  var button_1 = sibling(button, 2);
  button_1.__click = [decrement$3];
  var button_2 = sibling(button_1, 2);
  button_2.__click = [
    deleteThis$3,
    $isCharacterCreationStore,
    isCharacterCreationStore,
    specialization,
    $baseValue,
    baseValue,
    dispatch
  ];
  template_effect(() => {
    button.disabled = $isCharacterCreationStore();
    button_1.disabled = $isCharacterCreationStore();
  });
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
delegate(["click"]);
class KarmaShoppingService {
  constructor(skill) {
    __publicField(this, "currentFloor", -1);
    __publicField(this, "specFloor", /* @__PURE__ */ new Map());
    // Map<string, number>
    __publicField(this, "baseSkillType", null);
    __publicField(this, "baseAttribute", null);
    const system = skill.system;
    this.baseSkillType = system.skillType;
    const fieldName = `${this.baseSkillType}Skill`;
    const skillData = system[fieldName];
    this.currentFloor = (skillData == null ? void 0 : skillData.value) ?? 0;
    this.baseAttribute = (skillData == null ? void 0 : skillData.linkedAttribute) ?? null;
    for (const spec of (skillData == null ? void 0 : skillData.specializations) ?? []) {
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
    if (skillRating > 0 && skillRating > currentFloor)
      return this.getSkillPrice(attributeRating, skillRating - 1, isActive);
    return 0;
  }
  returnKarmaForSpec(attributeRating, specRating, isActive) {
    if (specRating > 0)
      return this.getSpecializationPrice(attributeRating, specRating - 1, isActive);
    return 0;
  }
}
var root_2$g = /* @__PURE__ */ template(`<div class="stat-card"><div class="stat-card-background"></div> <h4 class="no-margin"> </h4> <i class="fa-solid fa-heart-circle-bolt"></i></div>`);
var root_1$m = /* @__PURE__ */ template(`<!> <!> <!> <!>`, 1);
var root$F = /* @__PURE__ */ template(`<!> <h1> </h1> <!>`, 1);
function Karma($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $goodKarmaStore = () => store_get(goodKarmaStore, "$goodKarmaStore", $$stores);
  const $karmaPoolStore = () => store_get(karmaPoolStore, "$karmaPoolStore", $$stores);
  const $essenceStore = () => store_get(essenceStore, "$essenceStore", $$stores);
  const $miraculousSurvivalStore = () => store_get(miraculousSurvivalStore, "$miraculousSurvivalStore", $$stores);
  let actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({})), id = prop($$props, "id", 19, () => ({}));
  prop($$props, "span", 19, () => ({}));
  let storeManager2 = StoreManager.Subscribe(actor());
  let karmaPoolStore = storeManager2.GetSumROStore("karma.karmaPool");
  let goodKarmaStore = storeManager2.GetRWStore("karma.goodKarma");
  let essenceStore = storeManager2.GetSumROStore("attributes.essence");
  let miraculousSurvivalStore = storeManager2.GetRWStore("karma.miraculousSurvival");
  var fragment = root$F();
  var node = first_child(fragment);
  CardToolbar(node, {
    get id() {
      return id();
    }
  });
  var h1 = sibling(node, 2);
  var text2 = child(h1);
  var node_1 = sibling(h1, 2);
  MasonryGrid(node_1, {
    itemSelector: "stat-card",
    gridPrefix: "attribute",
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = root_1$m();
      var node_2 = first_child(fragment_1);
      const expression = /* @__PURE__ */ derived$1(() => localize(config().karma.goodkarma));
      StatCard$1(node_2, {
        get actor() {
          return actor();
        },
        get label() {
          return get$1(expression);
        },
        get value() {
          return $goodKarmaStore();
        }
      });
      var node_3 = sibling(node_2, 2);
      const expression_1 = /* @__PURE__ */ derived$1(() => localize(config().karma.karmapool));
      StatCard$1(node_3, {
        get actor() {
          return actor();
        },
        get label() {
          return get$1(expression_1);
        },
        get value() {
          return $karmaPoolStore().sum;
        }
      });
      var node_4 = sibling(node_3, 2);
      const expression_2 = /* @__PURE__ */ derived$1(() => localize(config().attributes.essence));
      StatCard$1(node_4, {
        get actor() {
          return actor();
        },
        get label() {
          return get$1(expression_2);
        },
        get value() {
          return $essenceStore().sum;
        }
      });
      var node_5 = sibling(node_4, 2);
      {
        var consequent = ($$anchor3) => {
          var div = root_2$g();
          var h4 = sibling(child(div), 2);
          var text_1 = child(h4);
          template_effect(($0) => set_text(text_1, $0), [
            () => localize(config().karma.miraculoussurvival)
          ]);
          append($$anchor3, div);
        };
        var alternate = ($$anchor3) => {
        };
        if_block(node_5, ($$render) => {
          if (!$miraculousSurvivalStore()) $$render(consequent);
          else $$render(alternate, false);
        });
      }
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  });
  template_effect(($0) => set_text(text2, $0), [() => localize(config().karma.karma)]);
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
async function decrement$2(_, $attributeAssignmentLockedStore, attributeAssignmentLockedStore, $isCharacterCreationStore, isCharacterCreationStore, $valueStore, valueStore, linkedAttributeRating, $activeSkillPointsStore, activeSkillPointsStore, $$props) {
  if ($attributeAssignmentLockedStore()) {
    if ($isCharacterCreationStore()) {
      if ($valueStore() > 0) {
        let refundForCurrentLevel;
        if ($valueStore() > linkedAttributeRating) {
          refundForCurrentLevel = 2;
        } else {
          refundForCurrentLevel = 1;
        }
        store_set(valueStore, $valueStore() - 1);
        store_set(activeSkillPointsStore, $activeSkillPointsStore() + refundForCurrentLevel);
      }
    } else {
      console.log("TODO: implement karma based shopping");
    }
  } else {
    ui.notifications.warn(localize($$props.config.notifications.assignattributesfirst));
  }
}
async function deleteThis$2(__1, $$props, $isCharacterCreationStore, isCharacterCreationStore, $specializationsStore, specializationsStore, $valueStore, valueStore, linkedAttributeRating, $activeSkillPointsStore, activeSkillPointsStore) {
  const confirmed = await foundry.applications.api.DialogV2.confirm({
    window: {
      title: localize($$props.config.modal.deleteskilltitle)
    },
    content: localize($$props.config.modal.deleteskill),
    yes: {
      label: localize($$props.config.modal.confirm),
      default: true
    },
    no: {
      label: localize($$props.config.modal.decline)
    },
    modal: true,
    rejectClose: true
  });
  if (confirmed) {
    if ($isCharacterCreationStore()) {
      if ($specializationsStore().length > 0) {
        store_set(specializationsStore, proxy([]));
        await tick();
        store_set(valueStore, $valueStore() + 1);
      }
      let refund = 0;
      for (let i = 1; i <= $valueStore(); i++) {
        refund += i <= linkedAttributeRating ? 1 : 2;
      }
      store_set(activeSkillPointsStore, $activeSkillPointsStore() + refund);
      store_set(valueStore, 0);
      ui.notifications.info(localize($$props.config.notifications.skillpointsrefund));
    }
    await tick();
    if ($$props.skill) {
      const id = $$props.skill.id;
      await $$props.actor.deleteEmbeddedDocuments("Item", [id], { render: false });
      const store = storeManager.getActorStore($$props.actor.id, stores.activeSkillsIds);
      const current = get(store);
      store.set(current.filter((sid) => sid !== id));
    }
    $$props.app.close();
  }
}
var on_click$b = async (__2, $$props) => openFilePicker($$props.actor);
var root$E = /* @__PURE__ */ template(`<div class="sr3e-waterfall-wrapper"><div><div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><div class="image-mask"><img role="presentation" data-edit="img"></div> <div class="stat-grid single-column"><div class="stat-card"><div class="stat-card-background"></div> <h1> </h1></div> <div class="stat-card"><div class="stat-card-background"></div> <h1> </h1></div> <div class="stat-card"><div class="stat-card-background"></div> <div class="buttons-vertical-distribution"><button class="header-control icon sr3e-toolbar-button" aria-label="Toggle card span"><i class="fa-solid fa-plus"></i></button> <button class="header-control icon sr3e-toolbar-button" aria-label="Toggle card span"><i class="fa-solid fa-minus"></i></button> <button class="header-control icon sr3e-toolbar-button" aria-label="Toggle card span"><i class="fa-solid fa-trash-can"></i></button> <button class="header-control icon sr3e-toolbar-button" aria-label="Toggle card span"> </button></div></div></div></div></div></div> <div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><h1 class="uppercase"> </h1> <div class="stat-grid single-column"></div></div></div></div></div></div>`);
function ActiveSkillEditorApp($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $isCharacterCreationStore = () => store_get(isCharacterCreationStore, "$isCharacterCreationStore", $$stores);
  const $specializationsStore = () => store_get(specializationsStore, "$specializationsStore", $$stores);
  const $valueStore = () => store_get(valueStore, "$valueStore", $$stores);
  const $attributeAssignmentLockedStore = () => store_get(attributeAssignmentLockedStore, "$attributeAssignmentLockedStore", $$stores);
  const $activeSkillPointsStore = () => store_get(activeSkillPointsStore, "$activeSkillPointsStore", $$stores);
  let actorStoreManager = StoreManager.Subscribe($$props.actor);
  let itemStoreManager = StoreManager.Subscribe($$props.skill);
  let specializationsStore = itemStoreManager.GetRWStore("activeSkill.specializations");
  let activeSkillPointsStore = actorStoreManager.GetRWStore("creation.activePoints");
  let valueStore = itemStoreManager.GetRWStore("activeSkill.value");
  let karmaShoppingService = null;
  onMount(() => {
    karmaShoppingService ?? (karmaShoppingService = new KarmaShoppingService($$props.skill));
  });
  onDestroy(() => {
    karmaShoppingService = null;
  });
  let isCharacterCreationStore = actorStoreManager.GetFlagStore(flags.actor.isCharacterCreation);
  let disableValueControls = /* @__PURE__ */ derived$1(() => $isCharacterCreationStore() && $specializationsStore().length > 0);
  let layoutMode = "single";
  let linkedAttribute = $$props.skill.system.activeSkill.linkedAttribute;
  let linkedAttributeRating = Number(foundry.utils.getProperty($$props.actor, `system.attributes.${linkedAttribute}.value`)) + Number(foundry.utils.getProperty($$props.actor, `system.attributes.${linkedAttribute}.mod`));
  let attributeAssignmentLockedStore = actorStoreManager.GetFlagStore(flags.actor.attributeAssignmentLocked);
  async function addNewSpecialization2() {
    let newSkillSpecialization;
    if ($$props.actor.getFlag(flags.sr3e, flags.actor.isCharacterCreation)) {
      if ($specializationsStore().length > 0) {
        ui.notifications.info(localize($$props.config.skill.onlyonespecializationatcreation));
        return;
      }
      newSkillSpecialization = {
        name: localize($$props.config.skill.newspecialization),
        value: $valueStore() + 1
      };
      store_set(valueStore, $valueStore() - 1);
    } else {
      console.log("TODO: create a addSpecialization procedure for Karma");
    }
    if (newSkillSpecialization) {
      $specializationsStore().push(newSkillSpecialization);
      store_set(specializationsStore, proxy([...$specializationsStore()]));
    }
  }
  async function increment2() {
    if ($attributeAssignmentLockedStore()) {
      if ($isCharacterCreationStore()) {
        if ($valueStore() < 6) {
          let costForNextLevel;
          if ($valueStore() < linkedAttributeRating) {
            costForNextLevel = 1;
          } else {
            costForNextLevel = 2;
          }
          if ($activeSkillPointsStore() >= costForNextLevel) {
            store_set(valueStore, $valueStore() + 1);
            store_set(activeSkillPointsStore, $activeSkillPointsStore() - costForNextLevel);
            if ($valueStore() === linkedAttributeRating) {
              ui.notifications.info($$props.config.notifications.skillpricecrossedthreshold);
            }
          }
        }
      } else {
        karmaShoppingService = new KarmaShoppingService($$props.skill);
        console.log("TODO: implement karma based shopping");
      }
    } else {
      ui.notifications.warn(localize($$props.config.notifications.assignattributesfirst));
    }
  }
  function deleteSpecialization(event2) {
    const toDelete = event2.detail.specialization;
    store_set(specializationsStore, proxy($specializationsStore().filter((s) => s !== toDelete)));
    store_set(valueStore, $valueStore() + 1);
  }
  var div = root$E();
  var div_1 = child(div);
  var div_2 = child(div_1);
  var div_3 = child(div_2);
  var div_4 = sibling(child(div_3), 2);
  var div_5 = child(div_4);
  var img = child(div_5);
  img.__click = [on_click$b, $$props];
  var div_6 = sibling(div_5, 2);
  var div_7 = child(div_6);
  var h1 = sibling(child(div_7), 2);
  var text2 = child(h1);
  var div_8 = sibling(div_7, 2);
  var h1_1 = sibling(child(div_8), 2);
  var text_1 = child(h1_1);
  var div_9 = sibling(div_8, 2);
  var div_10 = sibling(child(div_9), 2);
  var button = child(div_10);
  button.__click = increment2;
  var button_1 = sibling(button, 2);
  button_1.__click = [
    decrement$2,
    $attributeAssignmentLockedStore,
    attributeAssignmentLockedStore,
    $isCharacterCreationStore,
    isCharacterCreationStore,
    $valueStore,
    valueStore,
    linkedAttributeRating,
    $activeSkillPointsStore,
    activeSkillPointsStore,
    $$props
  ];
  var button_2 = sibling(button_1, 2);
  button_2.__click = [
    deleteThis$2,
    $$props,
    $isCharacterCreationStore,
    isCharacterCreationStore,
    $specializationsStore,
    specializationsStore,
    $valueStore,
    valueStore,
    linkedAttributeRating,
    $activeSkillPointsStore,
    activeSkillPointsStore
  ];
  var button_3 = sibling(button_2, 2);
  button_3.__click = addNewSpecialization2;
  var text_2 = child(button_3);
  var div_11 = sibling(div_2, 2);
  var div_12 = child(div_11);
  var div_13 = sibling(child(div_12), 2);
  var h1_2 = child(div_13);
  var text_3 = child(h1_2);
  var div_14 = sibling(h1_2, 2);
  each(div_14, 5, $specializationsStore, index, ($$anchor2, specialization, i) => {
    SpecializationCard($$anchor2, {
      get actor() {
        return $$props.actor;
      },
      get skill() {
        return $$props.skill;
      },
      get specialization() {
        return $specializationsStore()[i];
      },
      set specialization($$value) {
        store_mutate(specializationsStore, untrack($specializationsStore)[i] = $$value, untrack($specializationsStore));
      },
      $$events: {
        arrayChanged: () => {
          store_set(specializationsStore, proxy([...$specializationsStore()]));
          console.log("array was reassigned");
        },
        delete: deleteSpecialization
      }
    });
  });
  template_effect(
    ($0, $1) => {
      set_class(div_1, `sr3e-waterfall sr3e-waterfall--${layoutMode}`);
      set_attribute(img, "src", $$props.skill.img);
      set_attribute(img, "title", $$props.skill.name);
      set_attribute(img, "alt", $$props.skill.name);
      set_text(text2, $$props.skill.name);
      set_text(text_1, $valueStore());
      button.disabled = get$1(disableValueControls);
      button_1.disabled = get$1(disableValueControls);
      button_3.disabled = $valueStore() <= 1;
      set_text(text_2, $0);
      set_text(text_3, $1);
    },
    [
      () => localize($$props.config.skill.addspecialization),
      () => localize($$props.config.skill.specializations)
    ]
  );
  append($$anchor, div);
  pop();
  $$cleanup();
}
delegate(["click"]);
async function decrement$1(_, $attributeAssignmentLockedStore, attributeAssignmentLockedStore, $isCharacterCreationStore, isCharacterCreationStore, $valueStore, valueStore, linkedAttributeRating, $knowledgeSkillPointsStore, knowledgeSkillPointsStore, $$props) {
  if ($attributeAssignmentLockedStore()) {
    if ($isCharacterCreationStore()) {
      if ($valueStore() > 0) {
        let refundForCurrentLevel;
        if ($valueStore() > linkedAttributeRating) {
          refundForCurrentLevel = 2;
        } else {
          refundForCurrentLevel = 1;
        }
        store_set(valueStore, $valueStore() - 1);
        store_set(knowledgeSkillPointsStore, $knowledgeSkillPointsStore() + refundForCurrentLevel);
      }
    } else {
      console.log("TODO: implement karma based shopping");
    }
  } else {
    ui.notifications.warn(localize($$props.config.notifications.assignattributesfirst));
  }
}
async function deleteThis$1(__1, $$props, $isCharacterCreationStore, isCharacterCreationStore, $specializations, specializations, $valueStore, valueStore, linkedAttributeRating, $knowledgeSkillPointsStore, knowledgeSkillPointsStore) {
  const confirmed = await foundry.applications.api.DialogV2.confirm({
    window: {
      title: localize($$props.config.modal.deleteskilltitle)
    },
    content: localize($$props.config.modal.deleteskill),
    yes: {
      label: localize($$props.config.modal.confirm),
      default: true
    },
    no: {
      label: localize($$props.config.modal.decline)
    },
    modal: true,
    rejectClose: true
  });
  if (confirmed) {
    if ($isCharacterCreationStore()) {
      if ($specializations().length > 0) {
        store_set(specializations, proxy([]));
        await tick();
        store_set(valueStore, $valueStore() + 1);
      }
      let refund = 0;
      for (let i = 1; i <= $valueStore(); i++) {
        refund += i <= linkedAttributeRating ? 1 : 2;
      }
      store_set(knowledgeSkillPointsStore, $knowledgeSkillPointsStore() + refund);
      store_set(valueStore, 0);
      ui.notifications.info(localize($$props.config.notifications.skillpointsrefund));
    }
    await tick();
    if ($$props.skill) {
      const id = $$props.skill.id;
      await $$props.actor.deleteEmbeddedDocuments("Item", [id], { render: false });
      const store = storeManager.getActorStore($$props.actor.id, stores$1.knowledgeSkillsIds);
      const current = get(store);
      store.set(current.filter((sid) => sid !== id));
    }
    $$props.app.close();
  }
}
var on_click$a = async (__2, $$props) => openFilePicker($$props.actor);
var root$D = /* @__PURE__ */ template(`<div class="sr3e-waterfall-wrapper"><div><div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><div class="image-mask"><img role="presentation" data-edit="img"></div> <div class="stat-grid single-column"><div class="stat-card"><div class="stat-card-background"></div> <h1> </h1></div> <div class="stat-card"><div class="stat-card-background"></div> <h1> </h1></div> <div class="stat-card"><div class="stat-card-background"></div> <div class="buttons-vertical-distribution"><button class="header-control icon sr3e-toolbar-button" aria-label="Toggle card span"><i class="fa-solid fa-plus"></i></button> <button class="header-control icon sr3e-toolbar-button" aria-label="Toggle card span"><i class="fa-solid fa-minus"></i></button> <button class="header-control icon sr3e-toolbar-button" aria-label="Toggle card span"><i class="fa-solid fa-trash-can"></i></button> <button class="header-control icon sr3e-toolbar-button" aria-label="Toggle card span"> </button></div></div></div></div></div></div> <div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><h1 class="uppercase"> </h1> <div class="stat-grid single-column"></div></div></div></div></div></div>`);
function KnowledgeSkillEditorApp($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $isCharacterCreationStore = () => store_get(isCharacterCreationStore, "$isCharacterCreationStore", $$stores);
  const $specializations = () => store_get(specializations, "$specializations", $$stores);
  const $valueStore = () => store_get(valueStore, "$valueStore", $$stores);
  const $attributeAssignmentLockedStore = () => store_get(attributeAssignmentLockedStore, "$attributeAssignmentLockedStore", $$stores);
  const $knowledgeSkillPointsStore = () => store_get(knowledgeSkillPointsStore, "$knowledgeSkillPointsStore", $$stores);
  let actorStoreManager = StoreManager.Subscribe($$props.actor);
  let itemStoreManager = StoreManager.Subscribe($$props.skill);
  let specializations = itemStoreManager.GetRWStore("knowledgeSkill.specializations");
  let knowledgeSkillPointsStore = actorStoreManager.GetRWStore("creation.knowledgePoints");
  let valueStore = itemStoreManager.GetRWStore("knowledgeSkill.value");
  let karmaShoppingService = null;
  onMount(() => {
    karmaShoppingService ?? (karmaShoppingService = new KarmaShoppingService($$props.skill));
  });
  onDestroy(() => {
    karmaShoppingService = null;
  });
  let isCharacterCreationStore = actorStoreManager.GetFlagStore(flags.actor.isCharacterCreation);
  let disableValueControls = /* @__PURE__ */ derived$1(() => $isCharacterCreationStore() && $specializations().length > 0);
  let layoutMode = "single";
  let linkedAttribute = $$props.skill.system.knowledgeSkill.linkedAttribute;
  let linkedAttributeRating = Number(foundry.utils.getProperty($$props.actor, `system.attributes.${linkedAttribute}.value`)) + Number(foundry.utils.getProperty($$props.actor, `system.attributes.${linkedAttribute}.mod`));
  let attributeAssignmentLockedStore = actorStoreManager.GetFlagStore(flags.actor.attributeAssignmentLocked);
  async function addNewSpecialization2() {
    let newSkillSpecialization;
    if ($$props.actor.getFlag(flags.sr3e, flags.actor.isCharacterCreation)) {
      if ($specializations().length > 0) {
        ui.notifications.info(localize($$props.config.skill.onlyonespecializationatcreation));
        return;
      }
      newSkillSpecialization = {
        name: localize($$props.config.skill.newspecialization),
        value: $valueStore() + 1
      };
      store_set(valueStore, $valueStore() - 1);
    } else {
      console.log("TODO: create a addSpecialization procedure for Karma");
    }
    if (newSkillSpecialization) {
      $specializations().push(newSkillSpecialization);
      store_set(specializations, proxy([...$specializations()]));
    }
  }
  async function increment2() {
    if ($attributeAssignmentLockedStore()) {
      if ($isCharacterCreationStore()) {
        if ($valueStore() < 6) {
          let costForNextLevel;
          if ($valueStore() < linkedAttributeRating) {
            costForNextLevel = 1;
          } else {
            costForNextLevel = 2;
          }
          if ($knowledgeSkillPointsStore() >= costForNextLevel) {
            store_set(valueStore, $valueStore() + 1);
            store_set(knowledgeSkillPointsStore, $knowledgeSkillPointsStore() - costForNextLevel);
            if ($valueStore() === linkedAttributeRating) {
              ui.notifications.info($$props.config.notifications.skillpricecrossedthreshold);
            }
          }
        }
      } else {
        karmaShoppingService = new KarmaShoppingService($$props.skill);
        console.log("TODO: implement karma based shopping");
      }
    } else {
      ui.notifications.warn(localize($$props.config.notifications.assignattributesfirst));
    }
  }
  function deleteSpecialization(event2) {
    const toDelete = event2.detail.specialization;
    store_set(specializations, proxy($specializations().filter((s) => s !== toDelete)));
    store_set(valueStore, $valueStore() + 1);
  }
  var div = root$D();
  var div_1 = child(div);
  var div_2 = child(div_1);
  var div_3 = child(div_2);
  var div_4 = sibling(child(div_3), 2);
  var div_5 = child(div_4);
  var img = child(div_5);
  img.__click = [on_click$a, $$props];
  var div_6 = sibling(div_5, 2);
  var div_7 = child(div_6);
  var h1 = sibling(child(div_7), 2);
  var text2 = child(h1);
  var div_8 = sibling(div_7, 2);
  var h1_1 = sibling(child(div_8), 2);
  var text_1 = child(h1_1);
  var div_9 = sibling(div_8, 2);
  var div_10 = sibling(child(div_9), 2);
  var button = child(div_10);
  button.__click = increment2;
  var button_1 = sibling(button, 2);
  button_1.__click = [
    decrement$1,
    $attributeAssignmentLockedStore,
    attributeAssignmentLockedStore,
    $isCharacterCreationStore,
    isCharacterCreationStore,
    $valueStore,
    valueStore,
    linkedAttributeRating,
    $knowledgeSkillPointsStore,
    knowledgeSkillPointsStore,
    $$props
  ];
  var button_2 = sibling(button_1, 2);
  button_2.__click = [
    deleteThis$1,
    $$props,
    $isCharacterCreationStore,
    isCharacterCreationStore,
    $specializations,
    specializations,
    $valueStore,
    valueStore,
    linkedAttributeRating,
    $knowledgeSkillPointsStore,
    knowledgeSkillPointsStore
  ];
  var button_3 = sibling(button_2, 2);
  button_3.__click = addNewSpecialization2;
  var text_2 = child(button_3);
  var div_11 = sibling(div_2, 2);
  var div_12 = child(div_11);
  var div_13 = sibling(child(div_12), 2);
  var h1_2 = child(div_13);
  var text_3 = child(h1_2);
  var div_14 = sibling(h1_2, 2);
  each(div_14, 5, $specializations, index, ($$anchor2, specialization, i) => {
    SpecializationCard($$anchor2, {
      get actor() {
        return $$props.actor;
      },
      get skill() {
        return $$props.skill;
      },
      get specialization() {
        return $specializations()[i];
      },
      set specialization($$value) {
        store_mutate(specializations, untrack($specializations)[i] = $$value, untrack($specializations));
      },
      $$events: {
        arrayChanged: () => {
          store_set(specializations, proxy([...$specializations()]));
          console.log("array was reassigned");
        },
        delete: deleteSpecialization
      }
    });
  });
  template_effect(
    ($0, $1) => {
      set_class(div_1, `sr3e-waterfall sr3e-waterfall--${layoutMode}`);
      set_attribute(img, "src", $$props.skill.img);
      set_attribute(img, "title", $$props.skill.name);
      set_attribute(img, "alt", $$props.skill.name);
      set_text(text2, $$props.skill.name);
      set_text(text_1, $valueStore());
      button.disabled = get$1(disableValueControls);
      button_1.disabled = get$1(disableValueControls);
      button_3.disabled = $valueStore() <= 1;
      set_text(text_2, $0);
      set_text(text_3, $1);
    },
    [
      () => localize($$props.config.skill.addspecialization),
      () => localize($$props.config.skill.specializations)
    ]
  );
  append($$anchor, div);
  pop();
  $$cleanup();
}
delegate(["click"]);
async function addNewSpecialization(_, $specializationsStore, specializationsStore, $$props, $valueStore, valueStore) {
  if (!$specializationsStore()) throw new Error("Cannot add lingo: specialization store is null");
  if ($$props.actor.getFlag(flags.sr3e, flags.actor.isCharacterCreation)) {
    if ($specializationsStore().length > 0) {
      ui.notifications.info(localize($$props.config.skill.onlyonespecializationatcreation));
      return;
    }
    $specializationsStore().push({
      name: localize($$props.config.skill.newspecialization),
      value: $valueStore() + 1
    });
    store_set(valueStore, $valueStore() - 1);
  } else {
    $specializationsStore().push({
      name: localize($$props.config.skill.newspecialization),
      value: 0
    });
  }
  store_set(specializationsStore, proxy([...$specializationsStore()]));
  await $$props.skill.update(
    {
      "system.languageSkill.specializations": $specializationsStore()
    },
    { render: false }
  );
}
async function increment(__1, $attributeAssignmentLockedStore, attributeAssignmentLockedStore, $isCharacterCreationStore, isCharacterCreationStore, $valueStore, valueStore, linkedAttributeRating, $languageSkillPointsStore, languageSkillPointsStore, $$props, silentUpdate) {
  if ($attributeAssignmentLockedStore()) {
    if ($isCharacterCreationStore()) {
      if ($valueStore() < 6) {
        let costForNextLevel;
        if ($valueStore() < linkedAttributeRating) {
          costForNextLevel = 1;
        } else {
          costForNextLevel = 2;
        }
        if ($languageSkillPointsStore() >= costForNextLevel) {
          store_set(valueStore, $valueStore() + 1);
          store_set(languageSkillPointsStore, $languageSkillPointsStore() - costForNextLevel);
          if ($valueStore() === linkedAttributeRating) {
            ui.notifications.info($$props.config.notifications.skillpricecrossedthreshold);
          }
        }
      }
    } else {
      console.log("TODO: implement karma based shopping");
    }
  } else {
    ui.notifications.warn(localize($$props.config.notifications.assignattributesfirst));
  }
  silentUpdate();
}
async function decrement(__2, $attributeAssignmentLockedStore, attributeAssignmentLockedStore, $isCharacterCreationStore, isCharacterCreationStore, $valueStore, valueStore, linkedAttributeRating, $languageSkillPointsStore, languageSkillPointsStore, $$props, silentUpdate) {
  if ($attributeAssignmentLockedStore()) {
    if ($isCharacterCreationStore()) {
      if ($valueStore() > 0) {
        let refundForCurrentLevel;
        if ($valueStore() > linkedAttributeRating) {
          refundForCurrentLevel = 2;
        } else {
          refundForCurrentLevel = 1;
        }
        store_set(valueStore, $valueStore() - 1);
        store_set(languageSkillPointsStore, $languageSkillPointsStore() + refundForCurrentLevel);
      }
    } else {
      console.log("TODO: implement karma based shopping");
    }
  } else {
    ui.notifications.warn(localize($$props.config.notifications.assignattributesfirst));
  }
  await silentUpdate();
}
async function deleteThis(__3, $$props, $isCharacterCreationStore, isCharacterCreationStore, $specializationsStore, specializationsStore, $valueStore, valueStore, linkedAttributeRating, $languageSkillPointsStore, languageSkillPointsStore) {
  const confirmed = await foundry.applications.api.DialogV2.confirm({
    window: {
      title: localize($$props.config.modal.deleteskilltitle)
    },
    content: localize($$props.config.modal.deleteskill),
    yes: {
      label: localize($$props.config.modal.confirm),
      default: true
    },
    no: {
      label: localize($$props.config.modal.decline)
    },
    modal: true,
    rejectClose: true
  });
  if (confirmed) {
    if ($isCharacterCreationStore()) {
      if ($specializationsStore().length > 0) {
        store_set(specializationsStore, proxy([]));
        await tick();
        store_set(valueStore, $valueStore() + 1);
      }
      let refund = 0;
      for (let i = 1; i <= $valueStore(); i++) {
        refund += i <= linkedAttributeRating ? 1 : 2;
      }
      store_set(languageSkillPointsStore, $languageSkillPointsStore() + refund);
      store_set(valueStore, 0);
      ui.notifications.info(localize($$props.config.skill.skillpointsrefund));
    }
    await tick();
    const id = $$props.skill.id;
    await $$props.actor.deleteEmbeddedDocuments("Item", [id], { render: false });
    const store = storeManager.getActorStore($$props.actor.id, stores$1.languageSkillsIds);
    store.set(get(store).filter((sid) => sid !== id));
    $$props.app.close();
  }
}
var on_click$9 = async (__4, $$props) => openFilePicker($$props.actor);
var root$C = /* @__PURE__ */ template(`<div class="sr3e-waterfall-wrapper"><div><div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><div class="image-mask"><img role="presentation" data-edit="img"></div> <div class="stat-grid single-column"><div class="stat-card"><div class="stat-card-background"></div> <h1> </h1></div> <div class="stat-card"><div class="stat-card-background"></div> <h1> </h1></div> <div class="stat-card"><div class="stat-card-background"></div> <div class="skill-specialization-card"><div class="specialization-background"></div> <h6> </h6> <h1 class="embedded-value"> </h1></div></div> <div class="stat-card"><div class="stat-card-background"></div> <div class="buttons-vertical-distribution"><button class="header-control icon sr3e-toolbar-button" aria-label="Increase"><i class="fa-solid fa-plus"></i></button> <button class="header-control icon sr3e-toolbar-button" aria-label="Decrease"><i class="fa-solid fa-minus"></i></button> <button class="header-control icon sr3e-toolbar-button" aria-label="Delete"><i class="fa-solid fa-trash-can"></i></button> <button class="header-control icon sr3e-toolbar-button" aria-label="Add Spec"> </button></div></div></div></div></div></div> <div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><h1 class="uppercase"> </h1> <div class="stat-grid single-column"></div></div></div></div></div></div>`);
function LanguageSkillEditorApp($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $valueStore = () => store_get(valueStore, "$valueStore", $$stores);
  const $isCharacterCreationStore = () => store_get(isCharacterCreationStore, "$isCharacterCreationStore", $$stores);
  const $specializationsStore = () => store_get(specializationsStore, "$specializationsStore", $$stores);
  const $attributeAssignmentLockedStore = () => store_get(attributeAssignmentLockedStore, "$attributeAssignmentLockedStore", $$stores);
  const $languageSkillPointsStore = () => store_get(languageSkillPointsStore, "$languageSkillPointsStore", $$stores);
  let actorStoreManager = StoreManager.Subscribe($$props.actor);
  let itemStoreManager = StoreManager.Subscribe($$props.skill);
  let specializationsStore = itemStoreManager.GetRWStore("languageSkill.specializations");
  let valueStore = itemStoreManager.GetRWStore("languageSkill.value");
  let languageSkillPointsStore = actorStoreManager.GetRWStore("creation.languagePoints");
  let isCharacterCreationStore = actorStoreManager.GetFlagStore(flags.actor.isCharacterCreation);
  actorStoreManager.GetShallowStore($$props.actor.id, stores$1.languageSkillsIds, $$props.actor.items.filter((item2) => item2.type === "skill" && item2.system.skillType === "language").map((item2) => item2.id));
  let layoutMode = "single";
  let linkedAttribute = $$props.skill.system.languageSkill.linkedAttribute;
  let linkedAttributeRating = Number(foundry.utils.getProperty($$props.actor, `system.attributes.${linkedAttribute}.value`)) + Number(foundry.utils.getProperty($$props.actor, `system.attributes.${linkedAttribute}.mod`));
  let attributeAssignmentLockedStore = actorStoreManager.GetFlagStore(flags.actor.attributeAssignmentLocked);
  let readWrite = /* @__PURE__ */ derived$1(() => $valueStore() <= 1 ? 0 : Math.floor($valueStore() / 2));
  let disableValueControls = /* @__PURE__ */ derived$1(() => $isCharacterCreationStore() && $specializationsStore().length > 0);
  user_effect(() => {
    $$props.skill.update(
      {
        "system.languageSkill.specializations": $specializationsStore()
      },
      { render: false }
    );
    $$props.skill.update(
      {
        "system.languageSkill.readwrite.value": get$1(readWrite)
      },
      { render: false }
    );
  });
  async function silentUpdate() {
    await $$props.skill.update(
      {
        "system.languageSkill.value": $valueStore(),
        "system.languageSkill.readwrite.value": get$1(readWrite)
      },
      { render: false }
    );
    await $$props.actor.update(
      {
        "system.creation.languagePoints": $languageSkillPointsStore()
      },
      { render: false }
    );
  }
  function deleteSpecialization(event2) {
    const toDelete = event2.detail.specialization;
    store_set(specializationsStore, proxy($specializationsStore().filter((s) => s !== toDelete)));
    store_set(valueStore, $valueStore() + 1);
  }
  var div = root$C();
  var div_1 = child(div);
  var div_2 = child(div_1);
  var div_3 = child(div_2);
  var div_4 = sibling(child(div_3), 2);
  var div_5 = child(div_4);
  var img = child(div_5);
  img.__click = [on_click$9, $$props];
  var div_6 = sibling(div_5, 2);
  var div_7 = child(div_6);
  var h1 = sibling(child(div_7), 2);
  var text2 = child(h1);
  var div_8 = sibling(div_7, 2);
  var h1_1 = sibling(child(div_8), 2);
  var text_1 = child(h1_1);
  var div_9 = sibling(div_8, 2);
  var div_10 = sibling(child(div_9), 2);
  var h6 = sibling(child(div_10), 2);
  var text_2 = child(h6);
  var h1_2 = sibling(h6, 2);
  var text_3 = child(h1_2);
  var div_11 = sibling(div_9, 2);
  var div_12 = sibling(child(div_11), 2);
  var button = child(div_12);
  button.__click = [
    increment,
    $attributeAssignmentLockedStore,
    attributeAssignmentLockedStore,
    $isCharacterCreationStore,
    isCharacterCreationStore,
    $valueStore,
    valueStore,
    linkedAttributeRating,
    $languageSkillPointsStore,
    languageSkillPointsStore,
    $$props,
    silentUpdate
  ];
  var button_1 = sibling(button, 2);
  button_1.__click = [
    decrement,
    $attributeAssignmentLockedStore,
    attributeAssignmentLockedStore,
    $isCharacterCreationStore,
    isCharacterCreationStore,
    $valueStore,
    valueStore,
    linkedAttributeRating,
    $languageSkillPointsStore,
    languageSkillPointsStore,
    $$props,
    silentUpdate
  ];
  var button_2 = sibling(button_1, 2);
  button_2.__click = [
    deleteThis,
    $$props,
    $isCharacterCreationStore,
    isCharacterCreationStore,
    $specializationsStore,
    specializationsStore,
    $valueStore,
    valueStore,
    linkedAttributeRating,
    $languageSkillPointsStore,
    languageSkillPointsStore
  ];
  var button_3 = sibling(button_2, 2);
  button_3.__click = [
    addNewSpecialization,
    $specializationsStore,
    specializationsStore,
    $$props,
    $valueStore,
    valueStore
  ];
  var text_4 = child(button_3);
  var div_13 = sibling(div_2, 2);
  var div_14 = child(div_13);
  var div_15 = sibling(child(div_14), 2);
  var h1_3 = child(div_15);
  var text_5 = child(h1_3);
  var div_16 = sibling(h1_3, 2);
  each(div_16, 5, $specializationsStore, index, ($$anchor2, specialization, i) => {
    SpecializationCard($$anchor2, {
      get actor() {
        return $$props.actor;
      },
      get skill() {
        return $$props.skill;
      },
      get specialization() {
        return $specializationsStore()[i];
      },
      set specialization($$value) {
        store_mutate(specializationsStore, untrack($specializationsStore)[i] = $$value, untrack($specializationsStore));
      },
      $$events: {
        arrayChanged: () => {
          store_set(specializationsStore, proxy([...$specializationsStore()]));
        },
        delete: deleteSpecialization
      }
    });
  });
  template_effect(
    ($0, $1, $2) => {
      set_class(div_1, `sr3e-waterfall sr3e-waterfall--${layoutMode}`);
      set_attribute(img, "src", $$props.skill.img);
      set_attribute(img, "title", $$props.skill.name);
      set_attribute(img, "alt", $$props.skill.name);
      set_text(text2, $$props.skill.name);
      set_text(text_1, $valueStore());
      set_text(text_2, `${$0 ?? ""}:`);
      set_text(text_3, get$1(readWrite));
      button.disabled = get$1(disableValueControls);
      button_1.disabled = get$1(disableValueControls);
      button_3.disabled = $valueStore() <= 1;
      set_text(text_4, $1);
      set_text(text_5, $2);
    },
    [
      () => localize($$props.config.skill.readwrite),
      () => localize($$props.config.skill.addlingo),
      () => localize($$props.config.skill.lingos)
    ]
  );
  append($$anchor, div);
  pop();
  $$cleanup();
}
delegate(["click"]);
const _ActiveSkillEditorSheet = class _ActiveSkillEditorSheet extends foundry.applications.api.ApplicationV2 {
  constructor(actor, skill, config) {
    const appId = _ActiveSkillEditorSheet.getAppIdFor(actor.id, skill._id);
    super({ id: appId });
    __privateAdd(this, _app);
    this.actor = actor;
    this.skill = skill;
    this.config = config;
  }
  static getAppIdFor(actorId, skillId) {
    return `sr3e-active-skill-editor-${actorId}-${skillId}`;
  }
  static getExisting(actorId, skillId) {
    const appId = this.getAppIdFor(actorId, skillId);
    return Object.values(ui.windows).find((app) => app.id === appId);
  }
  static launch(actor, skill, config) {
    const existing = this.getExisting(actor.id, skill._id);
    if (existing) {
      existing.bringToTop();
      return existing;
    }
    const sheet = new this(actor, skill, config);
    sheet.render(true);
    return sheet;
  }
  // REQUIRED for ApplicationV2
  _renderHTML() {
    return null;
  }
  _replaceHTML(_, windowContent) {
    if (__privateGet(this, _app)) {
      unmount(__privateGet(this, _app));
    }
    if (this.skill.system.skillType === "active") {
      __privateSet(this, _app, mount(ActiveSkillEditorApp, {
        target: windowContent,
        props: {
          actor: this.actor,
          skill: this.skill,
          config: this.config,
          app: this
        }
      }));
    } else if (this.skill.system.skillType === "knowledge") {
      __privateSet(this, _app, mount(KnowledgeSkillEditorApp, {
        target: windowContent,
        props: {
          actor: this.actor,
          skill: this.skill,
          config: this.config,
          app: this
        }
      }));
    } else if (this.skill.system.skillType === "language") {
      __privateSet(this, _app, mount(LanguageSkillEditorApp, {
        target: windowContent,
        props: {
          actor: this.actor,
          skill: this.skill,
          config: this.config,
          app: this
        }
      }));
    }
    return windowContent;
  }
  async _tearDown() {
    if (__privateGet(this, _app)) await unmount(__privateGet(this, _app));
    __privateSet(this, _app, null);
    return super._tearDown();
  }
};
_app = new WeakMap();
__publicField(_ActiveSkillEditorSheet, "DEFAULT_OPTIONS", {
  classes: ["sr3e", "sheet", "item", "active-skill-editor"],
  window: {
    title: "Edit Skill",
    resizable: false
  },
  position: {
    width: "auto",
    height: "auto"
  }
});
let ActiveSkillEditorSheet = _ActiveSkillEditorSheet;
var on_keydown$6 = (e, openSkill) => e.key === "Enter" && openSkill();
var root_3$d = /* @__PURE__ */ template(`<div class="skill-specialization-card"><div class="specialization-background"></div> <div class="specialization-name"> </div> <h1 class="embedded-value"> </h1></div>`);
var root_2$f = /* @__PURE__ */ template(`<div class="specialization-container"></div>`);
var root_1$l = /* @__PURE__ */ template(`<i tabindex="0" role="button"></i> <div class="skill-card"><div class="skill-background-layer"></div> <h6 class="no-margin skill-name"> </h6> <div class="skill-main-container"><h1 class="skill-value"> </h1></div> <!></div>`, 1);
var on_click$8 = (e, Roll2, skill) => Roll2(e, skill().id);
var on_keydown_1$3 = (e, Roll2, skill) => {
  if (e.key === "Enter" || e.key === " ") Roll2(e, skill().id);
};
var on_click_1$7 = (e, Roll2, skill, specialization) => Roll2(e, skill().id, get$1(specialization).name);
var on_keydown_2$2 = (e, Roll2, skill, specialization) => {
  if (e.key === "Enter" || e.key === " ") Roll2(e, skill().id, get$1(specialization).name);
};
var root_6$4 = /* @__PURE__ */ template(`<div class="skill-specialization-card" role="button" tabindex="0"><div class="specialization-background"></div> <div class="specialization-name"> </div> <h1 class="embedded-value"> </h1></div>`);
var root_5$8 = /* @__PURE__ */ template(`<div class="specialization-container"></div>`);
var root_4$c = /* @__PURE__ */ template(`<div class="skill-card"><div class="skill-background-layer"></div> <h6 class="no-margin skill-name"> </h6> <div class="skill-main-container button" role="button" tabindex="0"><h1 class="skill-value"> </h1></div> <!></div>`);
var root$B = /* @__PURE__ */ template(`<div class="skill-card-container"><!></div>`);
function ActiveSkillCard($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $specializationsStore = () => store_get(specializationsStore, "$specializationsStore", $$stores);
  const $valueStore = () => store_get(valueStore, "$valueStore", $$stores);
  const $isShoppingState = () => store_get(isShoppingState, "$isShoppingState", $$stores);
  let skill = prop($$props, "skill", 19, () => ({})), actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({}));
  let skillStoreManager = StoreManager.Subscribe(skill());
  let actorStoreManager = StoreManager.Subscribe(actor());
  let valueStore = skillStoreManager.GetRWStore("activeSkill.value");
  let specializationsStore = skillStoreManager.GetRWStore("activeSkill.specializations");
  let isShoppingState = actorStoreManager.GetFlagStore(flags.actor.isShoppingState);
  let isModalOpen = state(false);
  let activeModal = null;
  function openSkill() {
    ActiveSkillEditorSheet.launch(actor(), skill(), config());
  }
  async function Roll2(e, skillId, specializationName = null) {
    var _a, _b;
    if (e.shiftKey) {
      if (get$1(isModalOpen)) return;
      set(isModalOpen, true);
      const rollName = specializationName || skill().name;
      const dice = specializationName ? (_a = $specializationsStore().find((s) => s.name === specializationName)) == null ? void 0 : _a.value : $valueStore();
      const options = await new Promise((resolve) => {
        activeModal = mount(RollComposerComponent, {
          target: document.querySelector(".composer-position"),
          props: {
            actor: actor(),
            config: config(),
            caller: {
              key: rollName,
              type: "active",
              dice,
              skillId
            },
            onclose: (result) => {
              unmount(activeModal);
              set(isModalOpen, false);
              activeModal = null;
              resolve(result);
            }
          }
        });
      });
      if (options) {
        if (specializationName) {
          await actor().SpecializationRoll(options.dice, specializationName.name, options.options);
        } else {
          await actor().SkillRoll(options.dice, skill().name, options.options);
        }
      }
    } else {
      if (specializationName) {
        const specValue = (_b = $specializationsStore().find((s) => s.name === specializationName)) == null ? void 0 : _b.value;
        await actor().SpecializationRoll(specValue, skill().name);
      } else {
        await actor().SkillRoll($valueStore(), skill().name);
      }
    }
    e.preventDefault();
  }
  onDestroy(() => {
    StoreManager.Unsubscribe(skill());
  });
  function handleEscape(e) {
    if (e.key === "Escape" && activeModal) {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      unmount(activeModal);
      set(isModalOpen, false);
      activeModal = null;
    }
  }
  var div = root$B();
  event$1("keydown", $window, handleEscape, true);
  var node = child(div);
  {
    var consequent_1 = ($$anchor2) => {
      var fragment = root_1$l();
      var i = first_child(fragment);
      set_class(i, `header-control icon fa-solid fa-pen-to-square pulsing-green-cart`);
      i.__click = openSkill;
      i.__keydown = [on_keydown$6, openSkill];
      var div_1 = sibling(i, 2);
      var h6 = sibling(child(div_1), 2);
      var text2 = child(h6);
      var div_2 = sibling(h6, 2);
      var h1 = child(div_2);
      var text_1 = child(h1);
      var node_1 = sibling(div_2, 2);
      {
        var consequent = ($$anchor3) => {
          var div_3 = root_2$f();
          each(div_3, 5, $specializationsStore, index, ($$anchor4, specialization) => {
            var div_4 = root_3$d();
            var div_5 = sibling(child(div_4), 2);
            var text_2 = child(div_5);
            var h1_1 = sibling(div_5, 2);
            var text_3 = child(h1_1);
            template_effect(() => {
              set_text(text_2, get$1(specialization).name);
              set_text(text_3, get$1(specialization).value);
            });
            append($$anchor4, div_4);
          });
          append($$anchor3, div_3);
        };
        if_block(node_1, ($$render) => {
          if ($specializationsStore().length > 0) $$render(consequent);
        });
      }
      template_effect(
        ($0) => {
          set_attribute(i, "aria-label", $0);
          set_text(text2, skill().name);
          set_text(text_1, $valueStore());
        },
        [
          () => localize(config().sheet.buyupgrades)
        ]
      );
      append($$anchor2, fragment);
    };
    var alternate = ($$anchor2) => {
      var div_6 = root_4$c();
      var h6_1 = sibling(child(div_6), 2);
      var text_4 = child(h6_1);
      var div_7 = sibling(h6_1, 2);
      div_7.__click = [on_click$8, Roll2, skill];
      div_7.__keydown = [on_keydown_1$3, Roll2, skill];
      var h1_2 = child(div_7);
      var text_5 = child(h1_2);
      var node_2 = sibling(div_7, 2);
      {
        var consequent_2 = ($$anchor3) => {
          var div_8 = root_5$8();
          each(div_8, 5, $specializationsStore, index, ($$anchor4, specialization) => {
            var div_9 = root_6$4();
            div_9.__click = [on_click_1$7, Roll2, skill, specialization];
            div_9.__keydown = [on_keydown_2$2, Roll2, skill, specialization];
            var div_10 = sibling(child(div_9), 2);
            var text_6 = child(div_10);
            var h1_3 = sibling(div_10, 2);
            var text_7 = child(h1_3);
            template_effect(() => {
              toggle_class(div_9, "button", !$isShoppingState());
              set_text(text_6, get$1(specialization).name);
              set_text(text_7, get$1(specialization).value);
            });
            append($$anchor4, div_9);
          });
          append($$anchor3, div_8);
        };
        if_block(node_2, ($$render) => {
          if ($specializationsStore().length > 0) $$render(consequent_2);
        });
      }
      template_effect(() => {
        set_text(text_4, skill().name);
        set_text(text_5, $valueStore());
      });
      append($$anchor2, div_6);
    };
    if_block(node, ($$render) => {
      if ($isShoppingState()) $$render(consequent_1);
      else $$render(alternate, false);
    });
  }
  append($$anchor, div);
  pop();
  $$cleanup();
}
delegate(["click", "keydown"]);
var on_keydown$5 = (e, openSkill) => e.key === "Enter" && openSkill();
var root_3$c = /* @__PURE__ */ template(`<div class="skill-specialization-card"><div class="specialization-background"></div> <div class="specialization-name"> </div> <h1 class="embedded-value"> </h1></div>`);
var root_2$e = /* @__PURE__ */ template(`<div class="specialization-container"></div>`);
var root_1$k = /* @__PURE__ */ template(`<i tabindex="0" role="button"></i> <div class="skill-card"><div class="skill-background-layer"></div> <h6 class="no-margin skill-name"> </h6> <div class="skill-main-container"><h1 class="skill-value"> </h1></div> <!></div>`, 1);
var on_click$7 = (e, Roll2, skill) => Roll2(e, skill().id);
var on_keydown_1$2 = (e, Roll2, skill) => {
  if (e.key === "Enter" || e.key === " ") Roll2(e, skill().id);
};
var on_click_1$6 = (e, Roll2, skill, specialization) => Roll2(e, skill().id, get$1(specialization).name);
var on_keydown_2$1 = (e, Roll2, skill, specialization) => {
  if (e.key === "Enter" || e.key === " ") Roll2(e, skill().id, get$1(specialization).name);
};
var root_6$3 = /* @__PURE__ */ template(`<div class="skill-specialization-card" role="button" tabindex="0"><div class="specialization-background"></div> <div class="specialization-name"> </div> <h1 class="embedded-value"> </h1></div>`);
var root_5$7 = /* @__PURE__ */ template(`<div class="specialization-container"></div>`);
var root_4$b = /* @__PURE__ */ template(`<div class="skill-card"><div class="skill-background-layer"></div> <h6 class="no-margin skill-name"> </h6> <div class="skill-main-container button" role="button" tabindex="0"><h1 class="skill-value"> </h1></div> <!></div>`);
var root$A = /* @__PURE__ */ template(`<div class="skill-card-container"><!></div>`);
function KnowledgeSkillCard($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $specializations = () => store_get(specializations, "$specializations", $$stores);
  const $value = () => store_get(value, "$value", $$stores);
  const $isShoppingState = () => store_get(isShoppingState, "$isShoppingState", $$stores);
  let skill = prop($$props, "skill", 19, () => ({})), actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({}));
  let skillStoreManager = StoreManager.Subscribe(skill());
  let actorStoreManager = StoreManager.Subscribe(actor());
  let value = skillStoreManager.GetRWStore("knowledgeSkill.value");
  let specializations = skillStoreManager.GetRWStore("knowledgeSkill.specializations");
  let isShoppingState = actorStoreManager.GetFlagStore(flags.actor.isShoppingState);
  let isModalOpen = state(false);
  let activeModal = null;
  function openSkill() {
    ActiveSkillEditorSheet.launch(actor(), skill(), config());
  }
  async function Roll2(e, skillId, specializationName = null) {
    var _a, _b;
    if (e.shiftKey) {
      if (get$1(isModalOpen)) return;
      set(isModalOpen, true);
      const rollName = specializationName || skill().name;
      const dice = specializationName ? (_a = $specializations().find((s) => s.name === specializationName)) == null ? void 0 : _a.value : $value();
      const options = await new Promise((resolve) => {
        activeModal = mount(RollComposerComponent, {
          target: document.querySelector(".composer-position"),
          props: {
            actor: actor(),
            config: config(),
            caller: {
              key: rollName,
              type: "knowledge",
              dice,
              skillId
            },
            onclose: (result) => {
              unmount(activeModal);
              set(isModalOpen, false);
              activeModal = null;
              resolve(result);
            }
          }
        });
      });
      if (options) {
        if (specializationName) {
          await actor().SpecializationRoll(options.dice, specializationName.name, options.options);
        } else {
          await actor().SkillRoll(options.dice, skill().name, options.options);
        }
      }
    } else {
      if (specializationName) {
        const specValue = (_b = $specializations().find((s) => s.name === specializationName)) == null ? void 0 : _b.value;
        await actor().SpecializationRoll(specValue, skill().name);
      } else {
        await actor().SkillRoll($value(), skill().name);
      }
    }
    e.preventDefault();
  }
  onDestroy(() => {
    StoreManager.Unsubscribe(skill());
  });
  function handleEscape(e) {
    if (e.key === "Escape" && activeModal) {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      unmount(activeModal);
      set(isModalOpen, false);
      activeModal = null;
    }
  }
  var div = root$A();
  event$1("keydown", $window, handleEscape, true);
  var node = child(div);
  {
    var consequent_1 = ($$anchor2) => {
      var fragment = root_1$k();
      var i = first_child(fragment);
      set_class(i, `header-control icon fa-solid fa-pen-to-square pulsing-green-cart`);
      i.__click = openSkill;
      i.__keydown = [on_keydown$5, openSkill];
      var div_1 = sibling(i, 2);
      var h6 = sibling(child(div_1), 2);
      var text2 = child(h6);
      var div_2 = sibling(h6, 2);
      var h1 = child(div_2);
      var text_1 = child(h1);
      var node_1 = sibling(div_2, 2);
      {
        var consequent = ($$anchor3) => {
          var div_3 = root_2$e();
          each(div_3, 5, $specializations, index, ($$anchor4, specialization) => {
            var div_4 = root_3$c();
            var div_5 = sibling(child(div_4), 2);
            var text_2 = child(div_5);
            var h1_1 = sibling(div_5, 2);
            var text_3 = child(h1_1);
            template_effect(() => {
              set_text(text_2, get$1(specialization).name);
              set_text(text_3, get$1(specialization).value);
            });
            append($$anchor4, div_4);
          });
          append($$anchor3, div_3);
        };
        if_block(node_1, ($$render) => {
          if ($specializations().length > 0) $$render(consequent);
        });
      }
      template_effect(
        ($0) => {
          set_attribute(i, "aria-label", $0);
          set_text(text2, skill().name);
          set_text(text_1, $value());
        },
        [
          () => localize(config().sheet.buyupgrades)
        ]
      );
      append($$anchor2, fragment);
    };
    var alternate = ($$anchor2) => {
      var div_6 = root_4$b();
      var h6_1 = sibling(child(div_6), 2);
      var text_4 = child(h6_1);
      var div_7 = sibling(h6_1, 2);
      div_7.__click = [on_click$7, Roll2, skill];
      div_7.__keydown = [on_keydown_1$2, Roll2, skill];
      var h1_2 = child(div_7);
      var text_5 = child(h1_2);
      var node_2 = sibling(div_7, 2);
      {
        var consequent_2 = ($$anchor3) => {
          var div_8 = root_5$7();
          each(div_8, 5, $specializations, index, ($$anchor4, specialization) => {
            var div_9 = root_6$3();
            div_9.__click = [on_click_1$6, Roll2, skill, specialization];
            div_9.__keydown = [on_keydown_2$1, Roll2, skill, specialization];
            var div_10 = sibling(child(div_9), 2);
            var text_6 = child(div_10);
            var h1_3 = sibling(div_10, 2);
            var text_7 = child(h1_3);
            template_effect(() => {
              toggle_class(div_9, "button", !$isShoppingState());
              set_text(text_6, get$1(specialization).name);
              set_text(text_7, get$1(specialization).value);
            });
            append($$anchor4, div_9);
          });
          append($$anchor3, div_8);
        };
        if_block(node_2, ($$render) => {
          if ($specializations().length > 0) $$render(consequent_2);
        });
      }
      template_effect(() => {
        set_text(text_4, skill().name);
        set_text(text_5, $value());
      });
      append($$anchor2, div_6);
    };
    if_block(node, ($$render) => {
      if ($isShoppingState()) $$render(consequent_1);
      else $$render(alternate, false);
    });
  }
  append($$anchor, div);
  pop();
  $$cleanup();
}
delegate(["click", "keydown"]);
var on_keydown$4 = (e, openSkill) => e.key === "Enter" && openSkill();
var root_1$j = /* @__PURE__ */ template(`<i tabindex="0" role="button"></i>`);
var on_click$6 = (e, Roll2, skill, $valueStore, valueStore) => Roll2(e, skill().id, "language", skill().name, $valueStore());
var on_keydown_1$1 = (e, Roll2, skill, $valueStore, valueStore) => (e.key === "Enter" || e.key === " ") && Roll2(e, skill().id, "language", skill().name, $valueStore());
var on_click_1$5 = (e, Roll2, skill, $readWriteStore, readWriteStore) => Roll2(e, skill().id, "language", "Read/Write", $readWriteStore());
var on_keydown_2 = (e, Roll2, skill, $readWriteStore, readWriteStore) => (e.key === "Enter" || e.key === " ") && Roll2(e, skill().id, "language", "Read/Write", $readWriteStore());
var root_2$d = /* @__PURE__ */ template(`<div class="specialization-container"><div class="skill-specialization-card button" role="button" tabindex="0"><div class="specialization-background"></div> <div class="specialization-name">Read/Write</div> <h1 class="embedded-value"> </h1></div></div>`);
var on_click_2$3 = (e, Roll2, skill, specialization) => Roll2(e, skill().id, "specialization", get$1(specialization).name, get$1(specialization).value);
var on_keydown_3 = (e, Roll2, skill, specialization) => (e.key === "Enter" || e.key === " ") && Roll2(e, skill().id, "specialization", get$1(specialization).name, get$1(specialization).value);
var root_4$a = /* @__PURE__ */ template(`<div class="skill-specialization-card button" role="button" tabindex="0"><div class="specialization-background"></div> <div class="specialization-name"> </div> <h1 class="embedded-value"> </h1></div>`);
var root_3$b = /* @__PURE__ */ template(`<div class="specialization-container"></div>`);
var root$z = /* @__PURE__ */ template(`<div class="skill-card-container"><!> <div class="skill-card"><div class="skill-background-layer"></div> <h6 class="no-margin skill-name"> </h6> <div class="skill-main-container button" role="button" tabindex="0"><h1 class="skill-value"> </h1></div> <!> <!></div></div>`);
function LanguageSkillCard($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $isShoppingState = () => store_get(isShoppingState, "$isShoppingState", $$stores);
  const $valueStore = () => store_get(valueStore, "$valueStore", $$stores);
  const $readWriteStore = () => store_get(readWriteStore, "$readWriteStore", $$stores);
  const $specializationsStore = () => store_get(specializationsStore, "$specializationsStore", $$stores);
  let skill = prop($$props, "skill", 19, () => ({})), actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({}));
  let skillStoreManager = StoreManager.Subscribe(skill());
  let actorStoreManager = StoreManager.Subscribe(actor());
  let valueStore = skillStoreManager.GetRWStore("languageSkill.value");
  let readWriteStore = skillStoreManager.GetRWStore("languageSkill.readwrite.value");
  let specializationsStore = skillStoreManager.GetRWStore("languageSkill.specializations");
  let isShoppingState = actorStoreManager.GetFlagStore(flags.actor.isShoppingState);
  let isModalOpen = state(false);
  let activeModal = null;
  function openSkill() {
    ActiveSkillEditorSheet.launch(actor(), skill(), config());
  }
  async function Roll2(e, skillId, rollType, rollName, diceValue) {
    if (e.shiftKey) {
      if (get$1(isModalOpen)) return;
      set(isModalOpen, true);
      const options = await new Promise((resolve) => {
        activeModal = mount(RollComposerComponent, {
          target: document.querySelector(".composer-position"),
          props: {
            actor: actor(),
            config: config(),
            caller: {
              key: rollName,
              type: rollType,
              dice: diceValue,
              skillId
            },
            onclose: (result) => {
              unmount(activeModal);
              set(isModalOpen, false);
              activeModal = null;
              resolve(result);
            }
          }
        });
      });
      if (options) {
        if (rollType === "specialization") {
          await actor().SpecializationRoll(options.dice, rollName, options.options);
        } else {
          await actor().SkillRoll(options.dice, rollName, options.options);
        }
      }
    } else {
      if (rollType === "specialization") {
        await actor().SpecializationRoll(diceValue, rollName);
      } else {
        await actor().SkillRoll(diceValue, rollName);
      }
    }
    e.preventDefault();
  }
  onDestroy(() => {
    StoreManager.Unsubscribe(skill());
  });
  function handleEscape(e) {
    if (e.key === "Escape" && activeModal) {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      unmount(activeModal);
      set(isModalOpen, false);
      activeModal = null;
    }
  }
  var div = root$z();
  event$1("keydown", $window, handleEscape, true);
  var node = child(div);
  {
    var consequent = ($$anchor2) => {
      var i = root_1$j();
      set_class(i, `header-control icon fa-solid fa-pen-to-square pulsing-green-cart`);
      i.__click = openSkill;
      i.__keydown = [on_keydown$4, openSkill];
      template_effect(($0) => set_attribute(i, "aria-label", $0), [
        () => localize(config().sheet.buyupgrades)
      ]);
      append($$anchor2, i);
    };
    if_block(node, ($$render) => {
      if ($isShoppingState()) $$render(consequent);
    });
  }
  var div_1 = sibling(node, 2);
  var h6 = sibling(child(div_1), 2);
  var text2 = child(h6);
  var div_2 = sibling(h6, 2);
  div_2.__click = [
    on_click$6,
    Roll2,
    skill,
    $valueStore,
    valueStore
  ];
  div_2.__keydown = [
    on_keydown_1$1,
    Roll2,
    skill,
    $valueStore,
    valueStore
  ];
  var h1 = child(div_2);
  var text_1 = child(h1);
  var node_1 = sibling(div_2, 2);
  {
    var consequent_1 = ($$anchor2) => {
      var div_3 = root_2$d();
      var div_4 = child(div_3);
      div_4.__click = [
        on_click_1$5,
        Roll2,
        skill,
        $readWriteStore,
        readWriteStore
      ];
      div_4.__keydown = [
        on_keydown_2,
        Roll2,
        skill,
        $readWriteStore,
        readWriteStore
      ];
      var h1_1 = sibling(child(div_4), 4);
      var text_2 = child(h1_1);
      template_effect(() => set_text(text_2, $readWriteStore()));
      append($$anchor2, div_3);
    };
    if_block(node_1, ($$render) => {
      if ($readWriteStore() > 0) $$render(consequent_1);
    });
  }
  var node_2 = sibling(node_1, 2);
  {
    var consequent_2 = ($$anchor2) => {
      var div_5 = root_3$b();
      each(div_5, 5, $specializationsStore, index, ($$anchor3, specialization) => {
        var div_6 = root_4$a();
        div_6.__click = [on_click_2$3, Roll2, skill, specialization];
        div_6.__keydown = [on_keydown_3, Roll2, skill, specialization];
        var div_7 = sibling(child(div_6), 2);
        var text_3 = child(div_7);
        var h1_2 = sibling(div_7, 2);
        var text_4 = child(h1_2);
        template_effect(() => {
          set_text(text_3, get$1(specialization).name);
          set_text(text_4, get$1(specialization).value);
        });
        append($$anchor3, div_6);
      });
      append($$anchor2, div_5);
    };
    if_block(node_2, ($$render) => {
      if ($specializationsStore().length > 0) $$render(consequent_2);
    });
  }
  template_effect(() => {
    set_text(text2, skill().name);
    set_text(text_1, $valueStore());
  });
  append($$anchor, div);
  pop();
  $$cleanup();
}
delegate(["click", "keydown"]);
var root_7$1 = /* @__PURE__ */ template(`<div class="debug-unknown"> </div>`);
var root_1$i = /* @__PURE__ */ template(`<!> <!>`, 1);
var root$y = /* @__PURE__ */ template(`<div class="skill-category-container static-full-width"><div class="skill-masonry-background-layer"></div> <div class="skill-container-header"><h1> </h1></div> <div class="skill-masonry-grid"><div class="skill-grid-sizer"></div> <div class="skill-gutter-sizer"></div> <!></div></div>`);
function SkillCategory($$anchor, $$props) {
  push($$props, true);
  let categoryOfSkills = prop($$props, "skills", 19, () => []), actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({}));
  let gridContainer;
  user_effect(() => {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const result = setupMasonry({
      container: gridContainer,
      itemSelector: ".skill-card-container",
      gridSizerSelector: ".skill-grid-sizer",
      gutterSizerSelector: ".skill-gutter-sizer",
      minItemWidth: masonryMinWidthFallbackValue.skillGrid * rem
    });
    return result.cleanup;
  });
  var div = root$y();
  var div_1 = sibling(child(div), 2);
  var h1 = child(div_1);
  var text2 = child(h1);
  var div_2 = sibling(div_1, 2);
  var node = sibling(child(div_2), 4);
  each(node, 17, categoryOfSkills, (skill) => skill._id, ($$anchor2, skill) => {
    var fragment = root_1$i();
    var node_1 = first_child(fragment);
    html(node_1, () => `<script>console.log(${JSON.stringify(get$1(skill))})<\/script>`);
    var node_2 = sibling(node_1, 2);
    {
      var consequent = ($$anchor3) => {
        ActiveSkillCard($$anchor3, {
          get skill() {
            return get$1(skill);
          },
          get actor() {
            return actor();
          },
          get config() {
            return config();
          }
        });
      };
      var alternate_2 = ($$anchor3) => {
        var fragment_2 = comment();
        var node_3 = first_child(fragment_2);
        {
          var consequent_1 = ($$anchor4) => {
            KnowledgeSkillCard($$anchor4, {
              get skill() {
                return get$1(skill);
              },
              get actor() {
                return actor();
              },
              get config() {
                return config();
              }
            });
          };
          var alternate_1 = ($$anchor4) => {
            var fragment_4 = comment();
            var node_4 = first_child(fragment_4);
            {
              var consequent_2 = ($$anchor5) => {
                LanguageSkillCard($$anchor5, {
                  get skill() {
                    return get$1(skill);
                  },
                  get actor() {
                    return actor();
                  },
                  get config() {
                    return config();
                  }
                });
              };
              var alternate = ($$anchor5) => {
                var div_3 = root_7$1();
                var text_1 = child(div_3);
                template_effect(() => set_text(text_1, `Unknown skill type: ${get$1(skill).name ?? ""}`));
                append($$anchor5, div_3);
              };
              if_block(
                node_4,
                ($$render) => {
                  if (get$1(skill).system.skillType === "language") $$render(consequent_2);
                  else $$render(alternate, false);
                },
                true
              );
            }
            append($$anchor4, fragment_4);
          };
          if_block(
            node_3,
            ($$render) => {
              if (get$1(skill).system.skillType === "knowledge") $$render(consequent_1);
              else $$render(alternate_1, false);
            },
            true
          );
        }
        append($$anchor3, fragment_2);
      };
      if_block(node_2, ($$render) => {
        if (get$1(skill).system.skillType === "active") $$render(consequent);
        else $$render(alternate_2, false);
      });
    }
    append($$anchor2, fragment);
  });
  bind_this(div_2, ($$value) => gridContainer = $$value, () => gridContainer);
  template_effect(($0) => set_text(text2, $0), [
    () => localize(config().attributes[$$props.attribute])
  ]);
  append($$anchor, div);
  pop();
}
var root$x = /* @__PURE__ */ template(`<div class="skill-container-masonry-grid"><!></div>`);
function SkillsLanguage($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $languageSkillsIdArrayStore = () => store_get(languageSkillsIdArrayStore, "$languageSkillsIdArrayStore", $$stores);
  let actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({}));
  let gridContainer;
  let storeManager2 = StoreManager.Subscribe(actor());
  const languageSkillsIdArrayStore = storeManager2.GetShallowStore(actor().id, stores$1.languageSkillsIds, actor().items.filter((item2) => item2.type === "skill" && item2.system.skillType === "language").map((item2) => item2.id));
  let languageSkills = /* @__PURE__ */ derived$1(() => actor().items.filter((item2) => $languageSkillsIdArrayStore().includes(item2.id)));
  onDestroy(() => {
    StoreManager.Unsubscribe(actor());
  });
  var div = root$x();
  var node = child(div);
  SkillCategory(node, {
    attribute: "intelligence",
    get skills() {
      return get$1(languageSkills);
    },
    get actor() {
      return actor();
    },
    get config() {
      return config();
    }
  });
  bind_this(div, ($$value) => gridContainer = $$value, () => gridContainer);
  append($$anchor, div);
  pop();
  $$cleanup();
}
var root$w = /* @__PURE__ */ template(`<div class="skill-container-masonry-grid"><!></div>`);
function SkillsKnowledge($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $knowledgeSkillsIdArrayStore = () => store_get(knowledgeSkillsIdArrayStore, "$knowledgeSkillsIdArrayStore", $$stores);
  let actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({}));
  let gridContainer;
  let storeManager2 = StoreManager.Subscribe(actor());
  const knowledgeSkillsIdArrayStore = storeManager2.GetShallowStore(actor().id, stores$1.knowledgeSkillsIds, actor().items.filter((item2) => item2.type === "skill" && item2.system.skillType === "knowledge").map((item2) => item2.id));
  let knowledgeSkills = /* @__PURE__ */ derived$1(() => actor().items.filter((item2) => $knowledgeSkillsIdArrayStore().includes(item2.id)));
  onDestroy(() => {
    StoreManager.Unsubscribe(actor());
  });
  var div = root$w();
  var node = child(div);
  SkillCategory(node, {
    attribute: "intelligence",
    get skills() {
      return get$1(knowledgeSkills);
    },
    get actor() {
      return actor();
    },
    get config() {
      return config();
    }
  });
  bind_this(div, ($$value) => gridContainer = $$value, () => gridContainer);
  append($$anchor, div);
  pop();
  $$cleanup();
}
function SkillsActive($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $activeSkillsIdArrayStore = () => store_get(activeSkillsIdArrayStore, "$activeSkillsIdArrayStore", $$stores);
  let actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({}));
  let storeManager2 = StoreManager.Subscribe(actor());
  const activeSkillsIdArrayStore = storeManager2.GetShallowStore(actor().id, stores$1.activeSkillsIds, actor().items.filter((item2) => item2.type === "skill" && item2.system.skillType === "active").map((item2) => item2.id));
  let attributeSortedSkills = /* @__PURE__ */ derived$1(() => [
    "body",
    "quickness",
    "strength",
    "charisma",
    "intelligence",
    "willpower",
    "reaction"
  ].map((attribute) => ({
    attribute,
    skills: actor().items.filter((item2) => $activeSkillsIdArrayStore().includes(item2.id) && item2.system.activeSkill.linkedAttribute === attribute)
  })));
  MasonryGrid($$anchor, {
    itemSelector: "skill-category-container",
    gridPrefix: "skill-container",
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      each(node, 17, () => get$1(attributeSortedSkills), index, ($$anchor3, category) => {
        var fragment_2 = comment();
        var node_1 = first_child(fragment_2);
        {
          var consequent = ($$anchor4) => {
            SkillCategory($$anchor4, spread_props(() => get$1(category), {
              get actor() {
                return actor();
              },
              get config() {
                return config();
              }
            }));
          };
          if_block(node_1, ($$render) => {
            if (get$1(category).skills.length > 0) $$render(consequent);
          });
        }
        append($$anchor3, fragment_2);
      });
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  });
  pop();
  $$cleanup();
}
var on_click$5 = (_, activeTab) => set(activeTab, "active");
var on_click_1$4 = (__1, activeTab) => set(activeTab, "knowledge");
var on_click_2$2 = (__2, activeTab) => set(activeTab, "language");
var root$v = /* @__PURE__ */ template(`<!> <div class="skill"><h1> </h1> <div class="sr3e-tabs"><button>Active Skills</button> <button>Knowledge Skills</button> <button>Language Skills</button></div> <div class="sr3e-inner-background"><!></div></div>`, 1);
function Skills($$anchor, $$props) {
  push($$props, true);
  let actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({})), id = prop($$props, "id", 19, () => ({}));
  prop($$props, "span", 19, () => ({}));
  let activeTab = state("active");
  var fragment = root$v();
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
  button.__click = [on_click$5, activeTab];
  var button_1 = sibling(button, 2);
  button_1.__click = [on_click_1$4, activeTab];
  var button_2 = sibling(button_1, 2);
  button_2.__click = [on_click_2$2, activeTab];
  var div_2 = sibling(div_1, 2);
  var node_1 = child(div_2);
  {
    var consequent = ($$anchor2) => {
      SkillsActive($$anchor2, {
        get actor() {
          return actor();
        },
        get config() {
          return config();
        }
      });
    };
    var alternate_1 = ($$anchor2) => {
      var fragment_2 = comment();
      var node_2 = first_child(fragment_2);
      {
        var consequent_1 = ($$anchor3) => {
          SkillsKnowledge($$anchor3, {
            get actor() {
              return actor();
            },
            get config() {
              return config();
            }
          });
        };
        var alternate = ($$anchor3) => {
          var fragment_4 = comment();
          var node_3 = first_child(fragment_4);
          {
            var consequent_2 = ($$anchor4) => {
              SkillsLanguage($$anchor4, {
                get actor() {
                  return actor();
                },
                get config() {
                  return config();
                }
              });
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
    [() => localize(config().skill.skill)]
  );
  append($$anchor, fragment);
  pop();
}
delegate(["click"]);
class EcgAnimator {
  constructor(lineCanvas, pointCanvas, { freq = 1.5, amp = 20, lineWidth = 2, bottomColor = "#00FFFF", topColor = "#0000FF" } = {}) {
    __publicField(this, "_animate", () => {
      if (!this._isAnimating) return;
      this._drawEcg();
      this._animFrame = requestAnimationFrame(this._animate);
    });
    this.lineCanvas = lineCanvas;
    this.lineCtx = lineCanvas.getContext("2d", { willReadFrequently: true });
    this.pointCanvas = pointCanvas;
    this.pointCtx = pointCanvas.getContext("2d", { willReadFrequently: true });
    this.width = lineCanvas.width;
    this.height = lineCanvas.height;
    this.phase = 0;
    this.freq = freq;
    this.amp = amp;
    this.lineWidth = lineWidth;
    this._isAnimating = false;
    this._animFrame = null;
    this.bottomColor = bottomColor;
    this.topColor = topColor;
  }
  start() {
    if (this._isAnimating) return;
    this._isAnimating = true;
    this._animate();
  }
  stop() {
    this._isAnimating = false;
    if (this._animFrame) cancelAnimationFrame(this._animFrame);
  }
  setFrequency(freq) {
    this.freq = freq;
  }
  setAmplitude(amp) {
    this.amp = amp;
  }
  setTopColor(color) {
    this.topColor = color;
  }
  setBottomColor(color) {
    this.bottomColor = color;
  }
  updateDimensions(width, height) {
    this.width = Math.floor(width);
    this.height = Math.floor(height);
  }
  _drawEcg() {
    if (this.width <= 0 || this.height <= 0) return;
    const offsetX = 10;
    const offsetY = 10;
    const radius = 4;
    const x = this.width - offsetX - radius;
    const imageData = this.lineCtx.getImageData(1, 0, this.width - 1, this.height);
    this.lineCtx.clearRect(0, 0, this.width, this.height);
    this.lineCtx.putImageData(imageData, 0, 0);
    const heartY = this._getHeartY(this.phase);
    const centerY = this.height / 2 + offsetY;
    const y = centerY - heartY;
    if (this.prevY === void 0) {
      this.prevY = y;
      this.prevHeartY = heartY;
      this.prevPhase = this.phase;
    }
    const prevHeartY = this.prevHeartY;
    const t1 = Math.min(1, Math.abs(prevHeartY) / this.amp);
    const t2 = Math.min(1, Math.abs(heartY) / this.amp);
    const gradient = this.lineCtx.createLinearGradient(x - 1, this.prevY, x, y);
    gradient.addColorStop(0, lerpColor(this.bottomColor, this.topColor, t1));
    gradient.addColorStop(1, lerpColor(this.bottomColor, this.topColor, t2));
    this.lineCtx.beginPath();
    this.lineCtx.moveTo(x - 1, this.prevY);
    this.lineCtx.lineTo(x, y);
    this.lineCtx.strokeStyle = gradient;
    this.lineCtx.lineWidth = this.lineWidth;
    this.lineCtx.stroke();
    this.lineCtx.fillStyle = lerpColor(this.bottomColor, this.topColor, t2);
    this.lineCtx.fillRect(x, y, 1, 1);
    this.pointCtx.clearRect(0, 0, this.width, this.height);
    this.pointCtx.beginPath();
    this.pointCtx.arc(x, y, radius, 0, 2 * Math.PI);
    this.pointCtx.fillStyle = this.topColor;
    this.pointCtx.shadowBlur = 5;
    this.pointCtx.shadowColor = this.topColor;
    this.pointCtx.fill();
    this.pointCtx.shadowBlur = 0;
    this.prevY = y;
    this.prevHeartY = heartY;
    this.prevPhase = this.phase;
    this.phase += 0.04 * this.freq;
  }
  _getHeartY(phase) {
    const t = phase;
    const cycle = t % (2 * Math.PI) / (2 * Math.PI);
    let y = 0;
    if (cycle < 0.1) {
      const alpha = cycle / 0.1;
      y = 0.1 * Math.sin(alpha * Math.PI) * this.amp;
    } else if (cycle < 0.15) {
      const alpha = (cycle - 0.1) / 0.05;
      y = -0.2 * Math.sin(alpha * Math.PI) * this.amp;
    } else if (cycle < 0.2) {
      const alpha = (cycle - 0.15) / 0.05;
      y = 0.8 * Math.sin(alpha * Math.PI) * this.amp;
    } else if (cycle < 0.25) {
      const alpha = (cycle - 0.2) / 0.05;
      y = -0.2 * Math.sin(alpha * Math.PI) * this.amp;
    } else if (cycle < 0.55) {
      const alpha = (cycle - 0.4) / 0.15;
      y = 0.3 * Math.sin(alpha * Math.PI) * this.amp;
    }
    return y;
  }
}
class ElectroCardiogramService {
  constructor(actor, { find, html: html2 }) {
    __privateAdd(this, _ElectroCardiogramService_instances);
    __privateAdd(this, _ecgCanvas);
    __privateAdd(this, _ecgPointCanvas);
    __privateAdd(this, _ctxLine);
    __privateAdd(this, _ctxPoint);
    __privateAdd(this, _actor);
    __privateAdd(this, _html);
    __privateAdd(this, _resizeObserver);
    __publicField(this, "ecgAnimator");
    __privateAdd(this, _isResizing, false);
    __privateSet(this, _actor, actor);
    __privateSet(this, _html, { find });
    __privateSet(this, _ecgCanvas, __privateGet(this, _html).find("#ecg-canvas")[0]);
    __privateSet(this, _ecgPointCanvas, __privateGet(this, _html).find("#ecg-point-canvas")[0]);
    __privateSet(this, _ctxLine, __privateGet(this, _ecgCanvas).getContext("2d", {
      willReadFrequently: true
    }));
    __privateSet(this, _ctxPoint, __privateGet(this, _ecgPointCanvas).getContext("2d", {
      willReadFrequently: true
    }));
    __privateSet(this, _resizeObserver, new ResizeObserver((entries) => {
      if (__privateGet(this, _isResizing)) return;
      __privateSet(this, _isResizing, true);
      requestAnimationFrame(() => {
        __privateMethod(this, _ElectroCardiogramService_instances, resizeCanvas_fn).call(this);
        __privateSet(this, _isResizing, false);
      });
    }));
    console.log(html2);
    __privateGet(this, _resizeObserver).observe(html2);
    __privateMethod(this, _ElectroCardiogramService_instances, resizeCanvas_fn).call(this);
    const highlightColorPrimary = getComputedStyle(document.documentElement).getPropertyValue("--highlight-color-primary").trim();
    const highlightColorTertiary = getComputedStyle(document.documentElement).getPropertyValue("--highlight-color-tertiary").trim();
    this.ecgAnimator = new EcgAnimator(__privateGet(this, _ecgCanvas), __privateGet(this, _ecgPointCanvas), {
      freq: 2,
      amp: 30,
      lineWidth: 2,
      bottomColor: highlightColorPrimary,
      topColor: highlightColorTertiary
    });
    this.ecgAnimator.start();
  }
  async onHealthBoxChange(event2) {
    const clicked = event2.currentTarget;
    const clickedIndex = parseInt(clicked.id.replace("healthBox", ""), 10);
    const isStun = clickedIndex <= 10;
    const localIndex = isStun ? clickedIndex - 1 : clickedIndex - 11;
    const stunArray = [...__privateGet(this, _actor).system.health.stun];
    const physicalArray = [...__privateGet(this, _actor).system.health.physical];
    const currentArray = isStun ? stunArray : physicalArray;
    const wasChecked = currentArray[localIndex];
    const willBeChecked = clicked.checked;
    const checkedCount = currentArray.filter(Boolean).length;
    if (wasChecked && !willBeChecked && checkedCount === 1) {
      currentArray[localIndex] = false;
      clicked.checked = false;
      const siblingH4 = $(clicked).closest(".damage-input").find("h4");
      siblingH4.removeClass("lit").addClass("unlit");
    } else {
      for (let i = 0; i < 10; i++) {
        const shouldCheck = i <= localIndex;
        currentArray[i] = shouldCheck;
        const globalId = isStun ? i + 1 : i + 11;
        const box = __privateGet(this, _html).find(`#healthBox${globalId}`);
        box.prop("checked", shouldCheck);
        const siblingH4 = box.closest(".damage-input").find("h4");
        if (siblingH4.length) {
          siblingH4.toggleClass("lit", shouldCheck);
          siblingH4.toggleClass("unlit", !shouldCheck);
        }
      }
    }
    if (isStun) {
      __privateGet(this, _actor).system.health.stun = stunArray;
    } else {
      __privateGet(this, _actor).system.health.physical = physicalArray;
    }
    const penalty = this.calculatePenalty(stunArray, physicalArray);
    __privateGet(this, _html).find(".health-penalty").text(penalty);
    await __privateGet(this, _actor).update(
      {
        ["system.health.stun"]: stunArray,
        ["system.health.physical"]: physicalArray,
        ["system.health.penalty"]: penalty
      },
      { render: false }
    );
  }
  updateHealthOnStart() {
    const stunArray = [...__privateGet(this, _actor).system.health.stun];
    const physicalArray = [...__privateGet(this, _actor).system.health.physical];
    const penalty = this.calculatePenalty(stunArray, physicalArray);
    __privateGet(this, _html).find(".health-penalty").text(penalty);
  }
  calculatePenalty(stunArray, physicalArray) {
    const degreeStun = stunArray.filter(Boolean).length;
    const degreePhysical = physicalArray.filter(Boolean).length;
    const maxDegree = Math.max(degreeStun, degreePhysical);
    return this._calculateSeverity(maxDegree);
  }
  _calculateSeverity(degree = 0) {
    if (degree === 0) return __privateMethod(this, _ElectroCardiogramService_instances, setPace_fn).call(this, 1.5, 20), 0;
    if (degree < 3) return __privateMethod(this, _ElectroCardiogramService_instances, setPace_fn).call(this, 2, 20), 1;
    if (degree < 6) return __privateMethod(this, _ElectroCardiogramService_instances, setPace_fn).call(this, 4, 25), 2;
    if (degree < 9) return __privateMethod(this, _ElectroCardiogramService_instances, setPace_fn).call(this, 8, 35), 3;
    if (degree === 9) return __privateMethod(this, _ElectroCardiogramService_instances, setPace_fn).call(this, 10, 40), 4;
    return __privateMethod(this, _ElectroCardiogramService_instances, setPace_fn).call(this, 1, 8), 4;
  }
}
_ecgCanvas = new WeakMap();
_ecgPointCanvas = new WeakMap();
_ctxLine = new WeakMap();
_ctxPoint = new WeakMap();
_actor = new WeakMap();
_html = new WeakMap();
_resizeObserver = new WeakMap();
_isResizing = new WeakMap();
_ElectroCardiogramService_instances = new WeakSet();
resizeCanvas_fn = function() {
  var _a;
  const wRatio = window.devicePixelRatio;
  const wasAnimating = (_a = this.ecgAnimator) == null ? void 0 : _a._isAnimating;
  if (this.ecgAnimator && wasAnimating) {
    this.ecgAnimator.stop();
  }
  const resize = (canvas, ctx) => {
    const displayWidth = canvas.offsetWidth;
    const displayHeight = canvas.offsetHeight;
    const width = displayWidth * wRatio;
    const height = displayHeight * wRatio;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(wRatio, wRatio);
  };
  resize(__privateGet(this, _ecgCanvas), __privateGet(this, _ctxLine));
  resize(__privateGet(this, _ecgPointCanvas), __privateGet(this, _ctxPoint));
  if (this.ecgAnimator) {
    this.ecgAnimator.updateDimensions(
      __privateGet(this, _ecgCanvas).offsetWidth,
      __privateGet(this, _ecgCanvas).offsetHeight
    );
    if (wasAnimating) {
      setTimeout(() => {
        this.ecgAnimator.start();
      }, 10);
    }
  }
};
setPace_fn = function(freq, amp) {
  if (this.ecgAnimator) {
    this.ecgAnimator.setFrequency(freq);
    this.ecgAnimator.setAmplitude(amp);
  }
};
var root_2$c = /* @__PURE__ */ template(`<div class="damage-description stun"><h4> </h4></div>`);
var root_1$h = /* @__PURE__ */ template(`<div class="damage-input"><input class="checkbox" type="checkbox"> <!></div>`);
var root_4$9 = /* @__PURE__ */ template(`<div class="damage-description physical"><h4> </h4></div>`);
var root_3$a = /* @__PURE__ */ template(`<div class="damage-input"><input class="checkbox" type="checkbox"> <!></div>`);
var on_keydown$3 = (e, incrementOverflow) => handleButtonKeypress(e, incrementOverflow);
var on_keydown_1 = (e, decrementOverflow) => handleButtonKeypress(e, decrementOverflow);
var root$u = /* @__PURE__ */ template(`<!> <div class="ecg-container"><canvas id="ecg-canvas" class="ecg-animation"></canvas> <canvas id="ecg-point-canvas"></canvas> <div class="left-gradient"></div> <div class="right-gradient"></div></div> <div class="condition-monitor"><div class="condition-meter"><div class="stun-damage"><h3 class="no-margin checkbox-label">Stun</h3> <!></div> <div class="physical-damage"><h3 class="no-margin checkbox-label">Physical</h3> <!> <a class="overflow-button plus" role="button" tabindex="0" aria-label="Increase overflow"><i class="fa-solid fa-plus"></i></a> <a class="overflow-button minus" role="button" tabindex="0" aria-label="Decrease overflow"><i class="fa-solid fa-minus"></i></a></div></div> <div class="health-card-container"><div class="stat-grid single-column"><!> <!></div></div></div>`, 1);
function Health($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $stunArray = () => store_get(stunArray, "$stunArray", $$stores);
  const $physicalArray = () => store_get(physicalArray, "$physicalArray", $$stores);
  const $penalty = () => store_get(penalty, "$penalty", $$stores);
  const $overflow = () => store_get(overflow, "$overflow", $$stores);
  let actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({})), id = prop($$props, "id", 19, () => ({}));
  let storeManager2 = StoreManager.Subscribe(actor());
  let stunArray = storeManager2.GetRWStore("health.stun");
  let physicalArray = storeManager2.GetRWStore("health.physical");
  let penalty = storeManager2.GetRWStore("health.penalty");
  let overflow = storeManager2.GetRWStore("health.overflow");
  let maxDegree = state(0);
  let ecgCanvas = state(void 0);
  let ecgPointCanvas = state(void 0);
  let ecgService = state(void 0);
  function toggle(localIndex, isStun, willBeChecked) {
    const currentArray = isStun ? $stunArray().slice() : $physicalArray().slice();
    if (willBeChecked) {
      for (let i = 0; i <= localIndex; i++) currentArray[i] = true;
      for (let i = localIndex + 1; i < 10; i++) currentArray[i] = false;
    } else {
      for (let i = localIndex; i < 10; i++) currentArray[i] = false;
    }
    if (isStun) {
      store_set(stunArray, proxy(currentArray));
    } else {
      store_set(physicalArray, proxy(currentArray));
    }
    set(maxDegree, proxy(Math.max($stunArray().filter(Boolean).length, $physicalArray().filter(Boolean).length)));
  }
  user_effect(() => {
    var _a;
    store_set(penalty, proxy((_a = get$1(ecgService)) == null ? void 0 : _a.calculatePenalty($stunArray(), $physicalArray())));
  });
  let ecg;
  onMount(() => {
    set(ecgService, proxy(new ElectroCardiogramService(actor(), {
      find: (selector) => {
        if (selector === "#ecg-canvas") return [get$1(ecgCanvas)];
        if (selector === "#ecg-point-canvas") return [get$1(ecgPointCanvas)];
        return [];
      },
      html: ecg.parentElement
    })));
  });
  function incrementOverflow() {
    store_set(overflow, proxy(Math.min($overflow() + 1, 10)));
  }
  function decrementOverflow() {
    store_set(overflow, proxy(Math.max($overflow() - 1, 0)));
  }
  var fragment = root$u();
  var node = first_child(fragment);
  CardToolbar(node, {
    get id() {
      return id();
    }
  });
  var div = sibling(node, 2);
  var canvas = child(div);
  bind_this(canvas, ($$value) => set(ecgCanvas, $$value), () => get$1(ecgCanvas));
  var canvas_1 = sibling(canvas, 2);
  bind_this(canvas_1, ($$value) => set(ecgPointCanvas, $$value), () => get$1(ecgPointCanvas));
  bind_this(div, ($$value) => ecg = $$value, () => ecg);
  var div_1 = sibling(div, 2);
  var div_2 = child(div_1);
  var div_3 = child(div_2);
  var node_1 = sibling(child(div_3), 2);
  each(node_1, 16, () => Array(10), index, ($$anchor2, _, i) => {
    var div_4 = root_1$h();
    var input = child(div_4);
    set_attribute(input, "id", `healthBox${i + 1}`);
    input.__change = (e) => toggle(i, true, e.target.checked);
    var node_2 = sibling(input, 2);
    {
      var consequent = ($$anchor3) => {
        var div_5 = root_2$c();
        var h4 = child(div_5);
        var text2 = child(h4);
        template_effect(() => {
          set_class(h4, `no-margin ${($stunArray()[i] ? "lit" : "unlit") ?? ""}`);
          set_text(text2, [
            "Light",
            "",
            "Moderate",
            "",
            "",
            "Serious",
            "",
            "",
            "",
            "Deadly"
          ][i]);
        });
        append($$anchor3, div_5);
      };
      if_block(node_2, ($$render) => {
        if (i === 0 || i === 2 || i === 5 || i === 9) $$render(consequent);
      });
    }
    template_effect(() => set_checked(input, $stunArray()[i]));
    append($$anchor2, div_4);
  });
  var div_6 = sibling(div_3, 2);
  var node_3 = sibling(child(div_6), 2);
  each(node_3, 16, () => Array(10), index, ($$anchor2, _, i) => {
    var div_7 = root_3$a();
    var input_1 = child(div_7);
    set_attribute(input_1, "id", `healthBox${i + 11}`);
    input_1.__change = (e) => toggle(i, false, e.target.checked);
    var node_4 = sibling(input_1, 2);
    {
      var consequent_1 = ($$anchor3) => {
        var div_8 = root_4$9();
        var h4_1 = child(div_8);
        var text_1 = child(h4_1);
        template_effect(() => {
          set_class(h4_1, `no-margin ${($physicalArray()[i] ? "lit" : "unlit") ?? ""}`);
          set_text(text_1, [
            "Light",
            "",
            "Moderate",
            "",
            "",
            "Serious",
            "",
            "",
            "",
            "Deadly"
          ][i]);
        });
        append($$anchor3, div_8);
      };
      if_block(node_4, ($$render) => {
        if (i === 0 || i === 2 || i === 5 || i === 9) $$render(consequent_1);
      });
    }
    template_effect(() => set_checked(input_1, $physicalArray()[i]));
    append($$anchor2, div_7);
  });
  var a = sibling(node_3, 2);
  a.__click = incrementOverflow;
  a.__keydown = [on_keydown$3, incrementOverflow];
  var a_1 = sibling(a, 2);
  a_1.__click = decrementOverflow;
  a_1.__keydown = [on_keydown_1, decrementOverflow];
  var div_9 = sibling(div_2, 2);
  var div_10 = child(div_9);
  var node_5 = child(div_10);
  const expression = /* @__PURE__ */ derived$1(() => localize(config().health.penalty));
  StatCard$1(node_5, {
    get actor() {
      return actor();
    },
    get value() {
      return $penalty();
    },
    get label() {
      return get$1(expression);
    }
  });
  var node_6 = sibling(node_5, 2);
  const expression_1 = /* @__PURE__ */ derived$1(() => localize(config().health.overflow));
  StatCard$1(node_6, {
    get actor() {
      return actor();
    },
    get value() {
      return $overflow();
    },
    get label() {
      return get$1(expression_1);
    }
  });
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
delegate(["change", "click", "keydown"]);
function Garage($$anchor) {
  var text$1 = text("Hello garage!");
  append($$anchor, text$1);
}
var root_1$g = /* @__PURE__ */ template(`<div><div> </div></div>`);
var root$t = /* @__PURE__ */ template(`<div></div>`);
function Arsenal($$anchor, $$props) {
  let arsenal = prop($$props, "arsenal", 19, () => []);
  var div = root$t();
  each(div, 21, arsenal, index, ($$anchor2, item2) => {
    var div_1 = root_1$g();
    var div_2 = child(div_1);
    var text2 = child(div_2);
    template_effect(() => {
      set_value(div_1, get$1(item2).id);
      set_text(text2, get$1(item2).name);
    });
    append($$anchor2, div_1);
  });
  append($$anchor, div);
}
var root$s = /* @__PURE__ */ template(`<div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><!></div></div></div>`);
function ItemSheetComponent($$anchor, $$props) {
  var div = root$s();
  var div_1 = child(div);
  var div_2 = sibling(child(div_1), 2);
  var node = child(div_2);
  snippet(node, () => $$props.children ?? noop);
  append($$anchor, div);
}
function handleInputClick(_, isOpen, openDropdown) {
  if (!get$1(isOpen)) openDropdown();
}
function handleInputInput(e, isOpen, openDropdown, searchTerm) {
  if (!get$1(isOpen)) openDropdown();
  set(searchTerm, proxy(e.target.value));
}
function handleInputKeydown(e, disabled, isOpen, openDropdown, highlightedIndex, filteredOptions, scrollToHighlighted, selectOption, closeDropdown) {
  if (disabled()) return;
  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      if (!get$1(isOpen)) openDropdown();
      set(highlightedIndex, proxy(Math.min(get$1(highlightedIndex) + 1, get$1(filteredOptions).length - 1)));
      scrollToHighlighted();
      break;
    case "ArrowUp":
      e.preventDefault();
      set(highlightedIndex, proxy(Math.max(get$1(highlightedIndex) - 1, 0)));
      scrollToHighlighted();
      break;
    case "Enter":
      e.preventDefault();
      if (get$1(isOpen) && get$1(highlightedIndex) >= 0) selectOption(get$1(filteredOptions)[get$1(highlightedIndex)]);
      break;
    case "Escape":
      e.preventDefault();
      e.stopPropagation();
      if (get$1(isOpen)) closeDropdown();
      break;
    case "Tab":
      closeDropdown();
      break;
  }
}
var root$r = /* @__PURE__ */ template(`<div><div><input role="combobox" aria-haspopup="listbox" aria-controls="combobox-dropdown-list"> <i class="fa-solid fa-magnifying-glass combobox-icon"></i></div></div>`);
function ComboSearch($$anchor, $$props) {
  push($$props, true);
  const dispatch = createEventDispatcher();
  let options = prop($$props, "options", 19, () => []), value = prop($$props, "value", 15, ""), placeholder = prop($$props, "placeholder", 3, "Search..."), nomatchplaceholder = prop($$props, "nomatchplaceholder", 3, "No matches found..."), disabled = prop($$props, "disabled", 3, false), maxHeight = prop($$props, "maxHeight", 3, "200px"), css = prop($$props, "css", 3, "");
  let isOpen = state(false);
  let searchTerm = state("");
  let filteredOptions = state(proxy([]));
  let highlightedIndex = state(-1);
  let inputElement = state(void 0);
  let wrapperElement = state(void 0);
  let dropdownElement;
  user_effect(() => {
    if (!get$1(isOpen)) {
      const selected = options().find((o) => o.value === value());
      set(searchTerm, proxy((selected == null ? void 0 : selected.label) ?? ""));
    }
  });
  user_effect(() => {
    const filtered = get$1(searchTerm).trim() === "" ? options() : options().filter((o) => o.label.toLowerCase().includes(get$1(searchTerm).toLowerCase()));
    if (get$1(isOpen)) {
      set(filteredOptions, proxy(filtered));
      set(highlightedIndex, -1);
      updateDropdown();
    } else {
      set(filteredOptions, proxy(filtered));
    }
  });
  function openDropdown() {
    if (disabled() || get$1(isOpen)) return;
    set(isOpen, true);
    set(searchTerm, "");
    updateDropdown();
  }
  function closeDropdown() {
    set(isOpen, false);
    updateDropdown();
  }
  function handleInputFocus() {
    openDropdown();
  }
  function selectOption(opt) {
    value(opt.value);
    closeDropdown();
    dispatch("select", { value: opt.value });
  }
  async function scrollToHighlighted() {
    var _a, _b;
    await tick();
    const el = (_b = (_a = dropdownElement == null ? void 0 : dropdownElement.children[0]) == null ? void 0 : _a.children) == null ? void 0 : _b[get$1(highlightedIndex)];
    el == null ? void 0 : el.scrollIntoView({ block: "nearest" });
  }
  onMount(() => {
    dropdownElement = document.createElement("div");
    dropdownElement.classList.add("combobox-dropdown");
    dropdownElement.id = "combobox-dropdown-list";
    dropdownElement.style.position = "absolute";
    dropdownElement.style.zIndex = "9999";
    const anchor = get$1(wrapperElement).closest(".item-sheet-component") ?? document.body;
    if (getComputedStyle(anchor).position === "static") anchor.style.position = "relative";
    anchor.appendChild(dropdownElement);
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("focusin", handleDocumentFocusIn);
  });
  onDestroy(() => {
    dropdownElement == null ? void 0 : dropdownElement.remove();
    document.removeEventListener("click", handleDocumentClick);
    document.removeEventListener("focusin", handleDocumentFocusIn);
  });
  function updateDropdown() {
    if (!get$1(wrapperElement) || !dropdownElement) return;
    dropdownElement.style.display = get$1(isOpen) ? "block" : "none";
    if (!get$1(isOpen)) return;
    tick().then(() => {
      const anchor = get$1(wrapperElement).closest(".item-sheet-component");
      if (!anchor) return;
      const aRect = anchor.getBoundingClientRect();
      const wRect = get$1(wrapperElement).getBoundingClientRect();
      dropdownElement.style.top = `${wRect.bottom - aRect.top}px`;
      dropdownElement.style.left = `${wRect.left - aRect.left}px`;
      dropdownElement.style.width = `${wRect.width}px`;
      dropdownElement.innerHTML = "";
      const list = document.createElement("div");
      list.style.position = "relative";
      list.style.maxHeight = maxHeight();
      list.setAttribute("role", "listbox");
      if (get$1(filteredOptions).length) {
        get$1(filteredOptions).forEach((opt, i) => {
          const el = document.createElement("div");
          el.className = "combobox-option" + (i === get$1(highlightedIndex) ? " highlighted" : "") + (opt.value === value() ? " selected" : "");
          el.setAttribute("role", "option");
          el.setAttribute("aria-selected", opt.value === value());
          el.textContent = opt.label;
          el.onmousedown = () => selectOption(opt);
          list.appendChild(el);
        });
      } else if (get$1(searchTerm).trim() !== "") {
        const el = document.createElement("div");
        el.className = "combobox-option no-results";
        el.textContent = nomatchplaceholder();
        list.appendChild(el);
      }
      dropdownElement.appendChild(list);
    });
  }
  function handleDocumentClick(e) {
    if (!get$1(isOpen)) return;
    const inside = get$1(wrapperElement).contains(e.target) || dropdownElement.contains(e.target);
    if (!inside) closeDropdown();
  }
  function handleDocumentFocusIn(e) {
    if (!get$1(isOpen)) return;
    const inside = get$1(wrapperElement).contains(e.target) || dropdownElement.contains(e.target);
    if (!inside) closeDropdown();
  }
  var div = root$r();
  set_class(div, `combobox-container`);
  var div_1 = child(div);
  var input = child(div_1);
  input.__click = [handleInputClick, isOpen, openDropdown];
  input.__input = [
    handleInputInput,
    isOpen,
    openDropdown,
    searchTerm
  ];
  input.__keydown = [
    handleInputKeydown,
    disabled,
    isOpen,
    openDropdown,
    highlightedIndex,
    filteredOptions,
    scrollToHighlighted,
    selectOption,
    closeDropdown
  ];
  bind_this(input, ($$value) => set(inputElement, $$value), () => get$1(inputElement));
  var i_1 = sibling(input, 2);
  bind_this(div_1, ($$value) => set(wrapperElement, $$value), () => get$1(wrapperElement));
  template_effect(() => {
    set_class(div_1, `combobox-wrapper ${css()}`);
    toggle_class(div_1, "disabled", disabled());
    set_attribute(input, "placeholder", placeholder());
    input.disabled = disabled();
    set_class(input, `combobox-input ${css()}`);
    set_attribute(input, "aria-expanded", get$1(isOpen));
    toggle_class(input, "open", get$1(isOpen));
    toggle_class(i_1, "rotated", get$1(isOpen));
  });
  event$1("focus", input, handleInputFocus);
  bind_value(input, () => get$1(searchTerm), ($$value) => set(searchTerm, $$value));
  append($$anchor, div);
  pop();
}
delegate(["click", "input", "keydown"]);
function addChange(_, changes, commitChanges) {
  set(changes, proxy([
    ...get$1(changes),
    { key: "", mode: 1, value: "", priority: 0 }
  ]));
  commitChanges();
}
var on_change$7 = (e, setDurationField) => setDurationField("type", e.target.value);
var on_input$1 = (e, setDurationField) => setDurationField("value", e.target.value);
var root_2$b = /* @__PURE__ */ template(`<div class="stat-card"><div class="stat-card-background"></div> <h4> </h4> <input type="number"></div>`);
var root_1$f = /* @__PURE__ */ template(`<h3> </h3> <div class="stat-grid single-column"><!> <div class="stat-card"><div class="stat-card-background"></div> <h4> </h4> <input type="text"></div> <div class="stat-card"><div class="stat-card-background"></div> <h4> </h4> <select><option>self</option><option disabled>item</option><option>character</option><option disabled>vehicle</option></select></div> <div class="stat-card"><div class="stat-card-background"></div> <h4> </h4> <input type="checkbox"></div> <div class="stat-card"><div class="stat-card-background"></div> <h4> </h4> <select><option> </option><option> </option><option> </option><option> </option><option> </option><option> </option><option> </option></select></div> <!></div>`, 1);
var root_5$6 = /* @__PURE__ */ template(`<option> </option>`);
var root_4$8 = /* @__PURE__ */ template(`<tr><td><div class="stat-card"><div class="stat-card-background"></div> <!></div></td><td><div class="stat-card"><div class="stat-card-background"></div> <select></select></div></td><td><div class="stat-card"><div class="stat-card-background"></div> <input type="text"></div></td><td><div class="stat-card"><div class="stat-card-background"></div> <input type="number"></div></td><td><button>🗑</button></td></tr>`);
var root_3$9 = /* @__PURE__ */ template(`<h1> </h1> <button> </button> <div class="table-wrapper"><table><thead><tr><th> </th><th> </th><th> </th><th> </th><th> </th></tr></thead><tbody></tbody></table></div>`, 1);
var root$q = /* @__PURE__ */ template(`<div class="effects-editor"><!> <!></div>`);
function ActiveEffectsEditorApp($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $nameStore = () => store_get(nameStore, "$nameStore", $$stores);
  const $durationStore = () => store_get(durationStore, "$durationStore", $$stores);
  const $disabledStore = () => store_get(disabledStore, "$disabledStore", $$stores);
  let disabled = state(proxy($$props.activeEffect.disabled));
  let duration = state(proxy({ ...$$props.activeEffect.duration, value: 0 }));
  let changes = state(proxy([...$$props.activeEffect.changes]));
  let propertyOptions = state(proxy([]));
  let name = state(proxy($$props.activeEffect.name));
  let originIsItem = state(false);
  let origin = state(proxy({}));
  let target = state("self");
  let isTransferable = state(false);
  let storeManager2 = StoreManager.Subscribe($$props.document);
  let nameStore = storeManager2.GetShallowStore($$props.document.id, `${$$props.activeEffect.id}:name`, $$props.activeEffect.name);
  let durationStore = storeManager2.GetShallowStore($$props.document.id, `${$$props.activeEffect.id}:duration`, $$props.activeEffect.duration);
  let disabledStore = storeManager2.GetShallowStore($$props.document.id, `${$$props.activeEffect.id}:disabled`, $$props.activeEffect.disabled);
  let targetStore = storeManager2.GetShallowStore($$props.document.id, `${$$props.activeEffect.id}:target`, get$1(target));
  onMount(async () => {
    set(origin, proxy(await foundry.utils.fromUuid($$props.activeEffect.origin)));
    set(originIsItem, get$1(origin) instanceof Item);
    const storedName = $nameStore();
    const storedDuration = $durationStore();
    const storedDisabled = $disabledStore();
    const flagTarget = getProperty($$props.activeEffect, `flags.${flags.sr3e}.target`);
    if (flagTarget) {
      set(target, proxy(flagTarget));
      store_set(targetStore, proxy(get$1(target)));
    }
    const baseDuration = JSON.stringify(storedDuration) !== JSON.stringify($$props.activeEffect.duration) ? storedDuration : $$props.activeEffect.duration;
    set(duration, proxy({
      ...baseDuration,
      value: baseDuration[baseDuration.type] ?? 0
    }));
    if (storedName !== $$props.activeEffect.name) set(name, proxy(storedName));
    if (storedDisabled !== $$props.activeEffect.disabled) set(disabled, proxy(storedDisabled));
    store_set(nameStore, proxy(get$1(name)));
    store_set(disabledStore, proxy(get$1(disabled)));
    store_set(durationStore, proxy(get$1(duration)));
  });
  onDestroy(() => {
    commitChanges();
    StoreManager.Unsubscribe($$props.document);
  });
  function setDurationField(field, val) {
    set(duration, proxy({
      ...get$1(duration),
      [field]: field === "value" ? +val : val
    }));
    store_set(durationStore, proxy(get$1(duration)));
  }
  user_effect(() => {
    store_set(disabledStore, proxy(get$1(disabled)));
  });
  user_effect(() => {
    store_set(nameStore, proxy(get$1(name)));
  });
  user_effect(() => {
    store_set(targetStore, proxy(get$1(target)));
  });
  let allowedPatterns = [];
  user_effect(async () => {
    var _a;
    if (!((_a = get$1(origin)) == null ? void 0 : _a.toObject)) return;
    let rawPaths = [];
    switch (get$1(target)) {
      case "self": {
        allowedPatterns = ["system"];
        set(isTransferable, false);
        rawPaths = Object.keys(foundry.utils.flattenObject({
          system: get$1(origin).toObject().system
        }));
        break;
      }
      case "character": {
        allowedPatterns = [
          "system.attributes",
          "system.dicePools",
          "system.movement",
          "system.karma"
        ];
        set(isTransferable, true);
        const model = new CharacterModel({}, { parent: null });
        const raw = model.toObject();
        rawPaths = Object.keys(foundry.utils.flattenObject({ system: raw }));
        break;
      }
      case "vehicle": {
        throw new Error("Target 'vehicle' not yet supported in ActiveEffectsEditorApp.");
      }
      default: {
        console.warn(`Unhandled target type: ${get$1(target)}`);
      }
    }
    const newOptions = rawPaths.filter((path) => allowedPatterns.some((p) => path.startsWith(p)) && path.endsWith(".mod")).map((path) => ({
      value: path,
      label: getLocalizedPath(path)
    })).sort((a, b) => a.label.localeCompare(b.label));
    if (JSON.stringify(newOptions) !== JSON.stringify(get$1(propertyOptions))) {
      set(propertyOptions, proxy(newOptions));
    }
  });
  function getLocalizedPath(path) {
    if (!path.startsWith("system.") || !path.endsWith(".mod")) return path;
    const configPath = path.replace(/^system\./, "").replace(/\.mod$/, "");
    const segments = configPath.split(".");
    const localizedSegments = segments.map((segment) => {
      const configValue = getProperty($$props.config, `${segments[0]}.${segment}`);
      return configValue ? localize(configValue) : segment.charAt(0).toUpperCase() + segment.slice(1);
    });
    return localizedSegments.join(" > ");
  }
  function extractValue(value) {
    return value && typeof value === "object" && "value" in value ? value.value : value;
  }
  async function commitChanges() {
    var _a;
    const key = get$1(duration).type;
    const expandedDuration = {
      type: key,
      rounds: key === "rounds" ? get$1(duration).value : void 0,
      seconds: key === "seconds" ? get$1(duration).value : void 0,
      turns: key === "turns" ? get$1(duration).value : void 0,
      startTime: get$1(duration).startTime,
      startRound: get$1(duration).startRound,
      startTurn: get$1(duration).startTurn,
      combat: get$1(duration).combat
    };
    await $$props.activeEffect.update(
      {
        name: extractValue(get$1(name)),
        transfer: get$1(isTransferable),
        disabled: get$1(disabled),
        duration: expandedDuration,
        changes: [...get$1(changes)],
        flags: {
          ...$$props.activeEffect.flags ?? {},
          [flags.sr3e]: {
            ...((_a = $$props.activeEffect.flags) == null ? void 0 : _a[flags.sr3e]) ?? {},
            target: get$1(target)
          }
        }
      },
      { render: false }
    );
  }
  function updateChange(index2, field, value) {
    const extractedValue = extractValue(value);
    set(changes, proxy(get$1(changes).map((c, i) => i === index2 ? { ...c, [field]: extractedValue } : c)));
    commitChanges();
  }
  function deleteChange(index2) {
    get$1(changes).splice(index2, 1);
    set(changes, proxy([...get$1(changes)]));
    commitChanges();
  }
  var div = root$q();
  var node = child(div);
  ItemSheetComponent(node, {
    children: ($$anchor2, $$slotProps) => {
      var fragment = root_1$f();
      var h3 = first_child(fragment);
      var text2 = child(h3);
      var div_1 = sibling(h3, 2);
      var node_1 = child(div_1);
      const expression = /* @__PURE__ */ derived$1(() => extractValue(get$1(name)));
      Image(node_1, {
        get src() {
          return $$props.activeEffect.img;
        },
        get title() {
          return get$1(expression);
        },
        get entity() {
          return $$props.activeEffect;
        }
      });
      var div_2 = sibling(node_1, 2);
      var h4 = sibling(child(div_2), 2);
      var text_1 = child(h4);
      var input = sibling(h4, 2);
      var div_3 = sibling(div_2, 2);
      var h4_1 = sibling(child(div_3), 2);
      var text_2 = child(h4_1);
      var select = sibling(h4_1, 2);
      select.__change = commitChanges;
      var option = child(select);
      option.value = null == (option.__value = "self") ? "" : "self";
      var option_1 = sibling(option);
      option_1.value = null == (option_1.__value = "item") ? "" : "item";
      var option_2 = sibling(option_1);
      option_2.value = null == (option_2.__value = "character") ? "" : "character";
      var option_3 = sibling(option_2);
      option_3.value = null == (option_3.__value = "vehicle") ? "" : "vehicle";
      var div_4 = sibling(div_3, 2);
      var h4_2 = sibling(child(div_4), 2);
      var text_3 = child(h4_2);
      var input_1 = sibling(h4_2, 2);
      input_1.__change = commitChanges;
      var div_5 = sibling(div_4, 2);
      var h4_3 = sibling(child(div_5), 2);
      var text_4 = child(h4_3);
      var select_1 = sibling(h4_3, 2);
      select_1.__change = [on_change$7, setDurationField];
      var option_4 = child(select_1);
      option_4.value = null == (option_4.__value = "none") ? "" : "none";
      var text_5 = child(option_4);
      var option_5 = sibling(option_4);
      option_5.value = null == (option_5.__value = "turns") ? "" : "turns";
      var text_6 = child(option_5);
      var option_6 = sibling(option_5);
      option_6.value = null == (option_6.__value = "rounds") ? "" : "rounds";
      var text_7 = child(option_6);
      var option_7 = sibling(option_6);
      option_7.value = null == (option_7.__value = "seconds") ? "" : "seconds";
      var text_8 = child(option_7);
      var option_8 = sibling(option_7);
      option_8.value = null == (option_8.__value = "minutes") ? "" : "minutes";
      var text_9 = child(option_8);
      var option_9 = sibling(option_8);
      option_9.value = null == (option_9.__value = "hours") ? "" : "hours";
      var text_10 = child(option_9);
      var option_10 = sibling(option_9);
      option_10.value = null == (option_10.__value = "days") ? "" : "days";
      var text_11 = child(option_10);
      var node_2 = sibling(div_5, 2);
      {
        var consequent = ($$anchor3) => {
          var div_6 = root_2$b();
          var h4_4 = sibling(child(div_6), 2);
          var text_12 = child(h4_4);
          var input_2 = sibling(h4_4, 2);
          input_2.__input = [on_input$1, setDurationField];
          template_effect(($0) => set_text(text_12, `${$0 ?? ""}:`), [
            () => localize($$props.config.effects.durationValue)
          ]);
          event$1("blur", input_2, commitChanges);
          bind_value(input_2, () => get$1(duration).value, ($$value) => get$1(duration).value = $$value);
          append($$anchor3, div_6);
        };
        if_block(node_2, ($$render) => {
          if (get$1(duration).type !== "none") $$render(consequent);
        });
      }
      template_effect(
        ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) => {
          set_text(text2, $0);
          set_text(text_1, `${$1 ?? ""}:`);
          set_text(text_2, `${$2 ?? ""}:`);
          set_text(text_3, `${$3 ?? ""}:`);
          set_text(text_4, `${$4 ?? ""}:`);
          set_text(text_5, $5);
          set_text(text_6, $6);
          set_text(text_7, $7);
          set_text(text_8, $8);
          set_text(text_9, $9);
          set_text(text_10, $10);
          set_text(text_11, $11);
        },
        [
          () => localize($$props.config.effects.effectscomposer),
          () => localize($$props.config.effects.name),
          () => localize($$props.config.effects.target),
          () => localize($$props.config.effects.disabled),
          () => localize($$props.config.effects.durationType),
          () => localize($$props.config.effects.permanent),
          () => localize($$props.config.time.turns),
          () => localize($$props.config.time.rounds),
          () => localize($$props.config.time.seconds),
          () => localize($$props.config.time.minutes),
          () => localize($$props.config.time.hours),
          () => localize($$props.config.time.days)
        ]
      );
      event$1("blur", input, commitChanges);
      bind_value(input, () => get$1(name), ($$value) => set(name, $$value));
      bind_select_value(select, () => get$1(target), ($$value) => set(target, $$value));
      bind_checked(input_1, () => get$1(disabled), ($$value) => set(disabled, $$value));
      bind_select_value(select_1, () => get$1(duration).type, ($$value) => get$1(duration).type = $$value);
      append($$anchor2, fragment);
    }
  });
  var node_3 = sibling(node, 2);
  ItemSheetComponent(node_3, {
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = root_3$9();
      var h1 = first_child(fragment_1);
      var text_13 = child(h1);
      var button = sibling(h1, 2);
      button.__click = [addChange, changes, commitChanges];
      var text_14 = child(button);
      var div_7 = sibling(button, 2);
      var table = child(div_7);
      var thead = child(table);
      var tr = child(thead);
      var th = child(tr);
      var text_15 = child(th);
      var th_1 = sibling(th);
      var text_16 = child(th_1);
      var th_2 = sibling(th_1);
      var text_17 = child(th_2);
      var th_3 = sibling(th_2);
      var text_18 = child(th_3);
      var th_4 = sibling(th_3);
      var text_19 = child(th_4);
      var tbody = sibling(thead);
      each(tbody, 21, () => get$1(changes), index, ($$anchor3, change, i) => {
        var tr_1 = root_4$8();
        var td = child(tr_1);
        var div_8 = child(td);
        var node_4 = sibling(child(div_8), 2);
        const expression_1 = /* @__PURE__ */ derived$1(() => localize($$props.config.effects.selectProperty));
        const expression_2 = /* @__PURE__ */ derived$1(() => localize($$props.config.effects.noMatch));
        ComboSearch(node_4, {
          get options() {
            return get$1(propertyOptions);
          },
          get placeholder() {
            return get$1(expression_1);
          },
          get nomatchplaceholder() {
            return get$1(expression_2);
          },
          onselect: (e) => updateChange(i, "key", e.detail.value),
          css: "table",
          get value() {
            return get$1(changes)[i].key;
          },
          set value($$value) {
            get$1(changes)[i].key = $$value;
          }
        });
        var td_1 = sibling(td);
        var div_9 = child(td_1);
        var select_2 = sibling(child(div_9), 2);
        select_2.__change = (e) => updateChange(i, "mode", parseInt(e.target.value));
        each(select_2, 20, () => Object.entries(CONST.ACTIVE_EFFECT_MODES), index, ($$anchor4, $$item) => {
          let label = () => $$item[0];
          let val = () => $$item[1];
          var option_11 = root_5$6();
          var option_11_value = {};
          var text_20 = child(option_11);
          template_effect(() => {
            if (option_11_value !== (option_11_value = val())) {
              option_11.value = null == (option_11.__value = val()) ? "" : val();
            }
            set_text(text_20, label());
          });
          append($$anchor4, option_11);
        });
        var td_2 = sibling(td_1);
        var div_10 = child(td_2);
        var input_3 = sibling(child(div_10), 2);
        input_3.__input = (e) => updateChange(i, "value", e.target.value);
        var td_3 = sibling(td_2);
        var div_11 = child(td_3);
        var input_4 = sibling(child(div_11), 2);
        input_4.__input = (e) => updateChange(i, "priority", +e.target.value);
        var td_4 = sibling(td_3);
        var button_1 = child(td_4);
        button_1.__click = () => deleteChange(i);
        template_effect(() => {
          set_value(input_3, get$1(change).value);
          set_value(input_4, get$1(change).priority);
        });
        bind_select_value(select_2, () => get$1(change).mode, ($$value) => get$1(change).mode = $$value);
        append($$anchor3, tr_1);
      });
      template_effect(
        ($0, $1, $2, $3, $4, $5, $6) => {
          set_text(text_13, $0);
          set_text(text_14, $1);
          set_text(text_15, $2);
          set_text(text_16, $3);
          set_text(text_17, $4);
          set_text(text_18, $5);
          set_text(text_19, $6);
        },
        [
          () => localize($$props.config.effects.changesHeader),
          () => localize($$props.config.effects.addChange),
          () => localize($$props.config.effects.attributeKey),
          () => localize($$props.config.effects.changeMode),
          () => localize($$props.config.effects.value),
          () => localize($$props.config.effects.priority),
          () => localize($$props.config.effects.actions)
        ]
      );
      append($$anchor2, fragment_1);
    }
  });
  append($$anchor, div);
  pop();
  $$cleanup();
}
delegate(["change", "input", "click"]);
const _ActiveEffectsEditor = class _ActiveEffectsEditor extends foundry.applications.api.ApplicationV2 {
  constructor(document2, activeEffect, config, updateEffectsState) {
    const appId = _ActiveEffectsEditor.getAppIdFor(activeEffect.id);
    super({ id: appId });
    __privateAdd(this, _app2);
    this.doc = document2;
    this.activeEffect = activeEffect;
    this.config = config;
    this.updateEffectsState = updateEffectsState;
  }
  static getAppIdFor(docId) {
    return `sr3e-active-effect-editor-${docId}`;
  }
  static getExisting(docId) {
    const appId = this.getAppIdFor(docId);
    return Object.values(ui.windows).find((app) => app.id === appId);
  }
  static launch(document2, config) {
    const existing = this.getExisting(document2.id);
    if (existing) {
      existing.bringToTop();
      return existing;
    }
    const sheet = new this(document2, config);
    sheet.render(true);
    return sheet;
  }
  _renderHTML() {
    return null;
  }
  _replaceHTML(_, windowContent) {
    if (__privateGet(this, _app2)) {
      unmount(__privateGet(this, _app2));
    }
    __privateSet(this, _app2, mount(ActiveEffectsEditorApp, {
      target: windowContent,
      props: {
        document: this.doc,
        activeEffect: this.activeEffect,
        config: CONFIG.sr3e,
        updateEffectsState: this.updateEffectsState
      }
    }));
    return windowContent;
  }
  async _tearDown() {
    if (__privateGet(this, _app2)) await unmount(__privateGet(this, _app2));
    __privateSet(this, _app2, null);
    return super._tearDown();
  }
};
_app2 = new WeakMap();
__publicField(_ActiveEffectsEditor, "DEFAULT_OPTIONS", {
  classes: ["sr3e", "active-effects-editor"],
  window: {
    title: "Edit Active Effects",
    resizable: true
  },
  position: {
    width: "auto",
    height: "auto"
  }
});
let ActiveEffectsEditor = _ActiveEffectsEditor;
var on_click$4 = (_, openEditor, $$props) => openEditor($$props.activeEffect);
var on_click_1$3 = (__1, deleteEffect, $$props) => deleteEffect($$props.activeEffect.id);
var root$p = /* @__PURE__ */ template(`<tr><td><div class="cell-content"><img></div></td><td><div class="cell-content"> </div></td><td><div class="cell-content"> </div></td><td><div class="cell-content"> </div></td><td><div class="cell-content"><div class="buttons-vertical-distribution square"><button type="button" class="fas fa-edit"></button> <button type="button" class="fas fa-trash-can"></button></div></div></td></tr>`);
function ActiveEffectsRow($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $durationStore = () => store_get(durationStore, "$durationStore", $$stores);
  const $nameStore = () => store_get(nameStore, "$nameStore", $$stores);
  const $disabledStore = () => store_get(disabledStore, "$disabledStore", $$stores);
  let isViewerInstanceOfActor = prop($$props, "isViewerInstanceOfActor", 3, false);
  let storeManager2 = StoreManager.Subscribe($$props.document);
  onDestroy(() => {
    StoreManager.Unsubscribe($$props.document);
  });
  let nameStore = storeManager2.GetShallowStore($$props.document.id, `${$$props.activeEffect.id}:name`, $$props.activeEffect.name);
  let durationStore = storeManager2.GetShallowStore($$props.document.id, `${$$props.activeEffect.id}:duration`, $$props.activeEffect.duration);
  let disabledStore = storeManager2.GetShallowStore($$props.document.id, `${$$props.activeEffect.id}:disabled`, $$props.activeEffect.disabled);
  let canDelete = !isViewerInstanceOfActor();
  let duration = state("");
  user_effect(() => {
    set(duration, proxy(formatDuration($durationStore())));
  });
  function formatDuration(duration2) {
    if (!duration2 || duration2.type === "none") return "Permanent";
    const value = duration2[duration2.type] ?? 0;
    if (duration2.type === "seconds") {
      const minutes = Math.floor(value / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      if (days) return `${days}d ${hours % 24}h ${minutes % 60}m`;
      if (hours) return `${hours}h ${minutes % 60}m`;
      if (minutes) return `${minutes}m ${value % 60}s`;
      return `${value}s`;
    }
    if (duration2.type === "rounds") return `${value} rounds`;
    if (duration2.type === "turns") return `${value} turns`;
    if (duration2.type === "minutes") return `${value} min`;
    if (duration2.type === "hours") return `${value} h`;
    if (duration2.type === "days") return `${value} d`;
    return "Unknown";
  }
  function openEditor(activeEffect) {
    ActiveEffectsEditor.launch($$props.document, activeEffect, $$props.config, $$props.onHandleEffectTriggerUI);
  }
  async function deleteEffect(effectId) {
    await $$props.document.deleteEmbeddedDocuments("ActiveEffect", [effectId], { render: false });
    await $$props.onHandleEffectTriggerUI();
  }
  var tr = root$p();
  var td = child(tr);
  var div = child(td);
  var img = child(div);
  var td_1 = sibling(td);
  var div_1 = child(td_1);
  var text2 = child(div_1);
  var td_2 = sibling(td_1);
  var div_2 = child(td_2);
  var text_1 = child(div_2);
  var td_3 = sibling(td_2);
  var div_3 = child(td_3);
  var text_2 = child(div_3);
  var td_4 = sibling(td_3);
  var div_4 = child(td_4);
  var div_5 = child(div_4);
  var button = child(div_5);
  button.__click = [on_click$4, openEditor, $$props];
  var button_1 = sibling(button, 2);
  button_1.__click = [on_click_1$3, deleteEffect, $$props];
  template_effect(
    ($0) => {
      var _a;
      set_attribute(img, "src", $$props.activeEffect.img);
      set_attribute(img, "alt", $nameStore());
      set_text(text2, $nameStore());
      set_text(text_1, get$1(duration));
      set_text(text_2, $disabledStore() ? "Yes" : "No");
      set_attribute(button, "aria-label", $0);
      set_attribute(button_1, "aria-label", $0);
      button_1.disabled = !canDelete || ((_a = $$props.activeEffect.duration) == null ? void 0 : _a.type) === "permanent" && $$props.activeEffect.changes.length > 1;
    },
    [
      () => localize($$props.config.sheet.delete)
    ]
  );
  append($$anchor, tr);
  pop();
  $$cleanup();
}
delegate(["click"]);
async function addEffect(e, $$props, onHandleEffectTriggerUI) {
  event == null ? void 0 : event.stopPropagation();
  event == null ? void 0 : event.preventDefault();
  await $$props.document.createEmbeddedDocuments(
    "ActiveEffect",
    [
      {
        name: "New Effect",
        icon: "systems/sr3e/textures/ai/icons/activeeffects.png",
        origin: $$props.document.uuid,
        disabled: false,
        transfer: true,
        duration: {
          startTime: game.time.worldTime,
          // use worldTime, not seconds, to align with system
          type: "none",
          // default for permanent
          value: 0
        },
        changes: [],
        flags: {
          sr3e: {
            source: "manual"
            // Any other default flags useful for tracking
          }
        }
      }
    ],
    { render: false }
  );
  await onHandleEffectTriggerUI();
}
var root$o = /* @__PURE__ */ template(`<div class="effects-viewer"><div class="effects-header"><button class="fas fa-plus" type="button"></button></div> <table><thead><tr><th><div class="cell-content"></div></th><th><div class="cell-content"> </div></th><th><div class="cell-content"> </div></th><th><div class="cell-content"> </div></th><th><div class="cell-content"> </div></th></tr></thead><tbody><!><!></tbody></table></div>`);
function ActiveEffectsViewer($$anchor, $$props) {
  push($$props, true);
  let isSlim = prop($$props, "isSlim", 3, false);
  let actorAttachedEffects = state(proxy($$props.document.effects.contents));
  let transferredEffects = state(proxy([]));
  let isViewerInstanceOfActor = $$props.document instanceof Actor;
  onMount(() => {
    onDestroy(() => {
    });
  });
  user_effect(() => {
    set(actorAttachedEffects, proxy([...$$props.document.effects.contents]));
    set(transferredEffects, proxy($$props.document instanceof Actor ? $$props.document.items.contents.flatMap((item2) => item2.effects.contents.map((activeEffect) => ({ activeEffect, item: item2 }))) : []));
  });
  async function onHandleEffectTriggerUI() {
    set(actorAttachedEffects, proxy([...$$props.document.effects.contents]));
    set(transferredEffects, proxy([...get$1(transferredEffects)]));
  }
  var div = root$o();
  var div_1 = child(div);
  var button = child(div_1);
  button.__click = [addEffect, $$props, onHandleEffectTriggerUI];
  var table = sibling(div_1, 2);
  var thead = child(table);
  var tr = child(thead);
  var th = sibling(child(tr));
  var div_2 = child(th);
  var text2 = child(div_2);
  var th_1 = sibling(th);
  var div_3 = child(th_1);
  var text_1 = child(div_3);
  var th_2 = sibling(th_1);
  var div_4 = child(th_2);
  var text_2 = child(div_4);
  var th_3 = sibling(th_2);
  var div_5 = child(th_3);
  var text_3 = child(div_5);
  var tbody = sibling(thead);
  var node = child(tbody);
  each(node, 17, () => get$1(actorAttachedEffects), (activeEffect) => activeEffect.id, ($$anchor2, activeEffect) => {
    ActiveEffectsRow($$anchor2, {
      get document() {
        return $$props.document;
      },
      get activeEffect() {
        return get$1(activeEffect);
      },
      get config() {
        return $$props.config;
      },
      onHandleEffectTriggerUI
    });
  });
  var node_1 = sibling(node);
  {
    var consequent = ($$anchor2) => {
      var fragment_1 = comment();
      var node_2 = first_child(fragment_1);
      each(node_2, 17, () => get$1(transferredEffects), ({ activeEffect, item: item2 }) => activeEffect.id, ($$anchor3, $$item) => {
        let activeEffect = () => get$1($$item).activeEffect;
        let item2 = () => get$1($$item).item;
        ActiveEffectsRow($$anchor3, {
          get document() {
            return item2();
          },
          get activeEffect() {
            return activeEffect();
          },
          get config() {
            return $$props.config;
          },
          isViewerInstanceOfActor,
          onHandleEffectTriggerUI
        });
      });
      append($$anchor2, fragment_1);
    };
    if_block(node_1, ($$render) => {
      if ($$props.document instanceof Actor) $$render(consequent);
    });
  }
  template_effect(
    ($0, $1, $2, $3) => {
      toggle_class(table, "slim", isSlim());
      set_text(text2, $0);
      set_text(text_1, $1);
      set_text(text_2, $2);
      set_text(text_3, $3);
    },
    [
      () => localize($$props.config.effects.name),
      () => localize($$props.config.effects.durationType),
      () => localize($$props.config.effects.disabled),
      () => localize($$props.config.effects.actions)
    ]
  );
  append($$anchor, div);
  pop();
}
delegate(["click"]);
function Effects($$anchor, $$props) {
  ActiveEffectsViewer($$anchor, {
    get document() {
      return $$props.actor;
    },
    get config() {
      return $$props.config;
    }
  });
}
class ActorDataService {
  static prepareSkills(items) {
    return {
      active: this._categorizeAndSortSkills(
        items.filter(
          (item2) => item2.type === "skill" && item2.system.skillType === "activeSkill"
        ),
        (item2) => item2.system.activeSkill.linkedAttribute
      ),
      knowledge: this._categorizeAndSortSkills(
        items.filter(
          (item2) => item2.type === "skill" && item2.system.skillType === "knowledgeSkill"
        ),
        (item2) => item2.system.knowledgeSkill.linkedAttribute
      ),
      language: this._sortSkillsByName(
        items.filter(
          (item2) => item2.type === "skill" && item2.system.skillType === "languageSkill"
        )
      )
    };
  }
  static prepareLanguages(items) {
    return items.filter(
      (item2) => item2.type === "skill" && item2.system.skillType === "languageSkill"
    ).map((item2) => {
      var _a, _b, _c;
      const languageData = {
        id: item2.id,
        name: item2.name,
        skills: [
          {
            type: localize(CONFIG.sr3e.skill.speak),
            value: (_a = item2.system.languageSkill.speak) == null ? void 0 : _a.value,
            specializations: item2.system.languageSkill.speak.specializations
          },
          {
            type: localize(CONFIG.sr3e.skill.read),
            value: (_b = item2.system.languageSkill.read) == null ? void 0 : _b.value,
            specializations: item2.system.languageSkill.read.specializations
          },
          {
            type: localize(CONFIG.sr3e.skill.write),
            value: (_c = item2.system.languageSkill.write) == null ? void 0 : _c.value,
            specializations: item2.system.languageSkill.write.specializations
          }
        ]
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
    Object.keys(categories).forEach(
      (key) => categories[key].sort((a, b) => a.name.localeCompare(b.name))
    );
    return categories;
  }
  static _sortSkillsByName(skills) {
    return skills.sort((a, b) => a.name.localeCompare(b.name));
  }
  static getLocalizedLinkingAttributes() {
    return {
      body: localize(CONFIG.sr3e.attributes.body),
      quickness: localize(CONFIG.sr3e.attributes.quickness),
      strength: localize(CONFIG.sr3e.attributes.strength),
      charisma: localize(CONFIG.sr3e.attributes.charisma),
      intelligence: localize(CONFIG.sr3e.attributes.intelligence),
      willpower: localize(CONFIG.sr3e.attributes.willpower),
      reaction: localize(CONFIG.sr3e.attributes.reaction),
      magic: localize(CONFIG.sr3e.attributes.magic)
    };
  }
  static getCharacterCreationStats() {
    return {
      attributes: [
        { priority: "A", points: 30 },
        { priority: "B", points: 27 },
        { priority: "C", points: 24 },
        { priority: "D", points: 21 },
        { priority: "E", points: 18 }
      ],
      skills: [
        { priority: "A", points: 50 },
        { priority: "B", points: 40 },
        { priority: "C", points: 34 },
        { priority: "D", points: 30 },
        { priority: "E", points: 27 }
      ],
      resources: [
        { priority: "A", points: 1e6 },
        { priority: "B", points: 4e5 },
        { priority: "C", points: 9e4 },
        { priority: "D", points: 2e4 },
        { priority: "E", points: 5e3 }
      ]
    };
  }
  static getPhaseTemplate() {
    return [
      { text: localize(CONFIG.sr3e.traits.child), from: 0, to: 0.15 },
      { text: localize(CONFIG.sr3e.traits.adolecent), from: 0.15, to: 0.2 },
      { text: localize(CONFIG.sr3e.traits.youngadult), from: 0.2, to: 0.4 },
      { text: localize(CONFIG.sr3e.traits.adult), from: 0.4, to: 0.5 },
      { text: localize(CONFIG.sr3e.traits.middleage), from: 0.5, to: 0.65 },
      { text: localize(CONFIG.sr3e.traits.goldenyears), from: 0.65, to: 0.8 },
      { text: localize(CONFIG.sr3e.traits.ancient), from: 0.8, to: 1 }
    ];
  }
  static getInventoryCategory(actor, types) {
    if (!(types == null ? void 0 : types.length)) return [];
    let all = [];
    types.forEach((type) => {
      const matches = actor.items.filter((item2) => item2.type === type).map((item2) => ({
        id: item2.id,
        // or item._id, both work in Foundry
        name: item2.name,
        type: item2.type,
        isSelected: false
      }));
      all.push(...matches);
    });
    return all;
  }
}
var on_click$3 = (_, activeTab) => set(activeTab, proxy(inventory.arsenal));
var on_click_1$2 = (__1, activeTab) => set(activeTab, proxy(inventory.garage));
var on_click_2$1 = (__2, activeTab) => set(activeTab, proxy(inventory.effects));
var root$n = /* @__PURE__ */ template(`<!> <h1> </h1> <div class="sr3e-tabs"><button>Arsenal</button> <button>Garage</button> <button>Active Effects</button></div> <div class="sr3e-inner-background"><!></div>`, 1);
function Inventory($$anchor, $$props) {
  push($$props, true);
  let actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({})), id = prop($$props, "id", 19, () => ({}));
  prop($$props, "span", 19, () => ({}));
  let activeTab = state(proxy(inventory.arsenal));
  let arsenal = ActorDataService.getInventoryCategory(actor(), ["weapon", "ammunition"]);
  var fragment = root$n();
  var node = first_child(fragment);
  CardToolbar(node, {
    get id() {
      return id();
    }
  });
  var h1 = sibling(node, 2);
  var text2 = child(h1);
  var div = sibling(h1, 2);
  var button = child(div);
  button.__click = [on_click$3, activeTab];
  var button_1 = sibling(button, 2);
  button_1.__click = [on_click_1$2, activeTab];
  var button_2 = sibling(button_1, 2);
  button_2.__click = [on_click_2$1, activeTab];
  var div_1 = sibling(div, 2);
  var node_1 = child(div_1);
  {
    var consequent = ($$anchor2) => {
      Arsenal($$anchor2, {
        arsenal,
        get actor() {
          return actor();
        },
        get config() {
          return config();
        }
      });
    };
    var alternate_1 = ($$anchor2) => {
      var fragment_2 = comment();
      var node_2 = first_child(fragment_2);
      {
        var consequent_1 = ($$anchor3) => {
          Garage($$anchor3);
        };
        var alternate = ($$anchor3) => {
          var fragment_4 = comment();
          var node_3 = first_child(fragment_4);
          {
            var consequent_2 = ($$anchor4) => {
              Effects($$anchor4, {
                get actor() {
                  return actor();
                },
                get config() {
                  return config();
                }
              });
            };
            if_block(
              node_3,
              ($$render) => {
                if (get$1(activeTab) === inventory.effects) $$render(consequent_2);
              },
              true
            );
          }
          append($$anchor3, fragment_4);
        };
        if_block(
          node_2,
          ($$render) => {
            if (get$1(activeTab) === inventory.garage) $$render(consequent_1);
            else $$render(alternate, false);
          },
          true
        );
      }
      append($$anchor2, fragment_2);
    };
    if_block(node_1, ($$render) => {
      if (get$1(activeTab) === inventory.arsenal) $$render(consequent);
      else $$render(alternate_1, false);
    });
  }
  template_effect(
    ($0) => {
      set_text(text2, $0);
      toggle_class(button, "active", get$1(activeTab) === inventory.arsenal);
      toggle_class(button_1, "active", get$1(activeTab) === inventory.garage);
      toggle_class(button_2, "active", get$1(activeTab) === inventory.effects);
    },
    [
      () => localize(config().inventory.inventory)
    ]
  );
  append($$anchor, fragment);
  pop();
}
delegate(["click"]);
var root_2$a = /* @__PURE__ */ template(`<div><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><!></div></div></div>`);
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
      comp: DicePools,
      props: {
        actor: $$props.actor,
        config: $$props.config,
        id: 2,
        span: 1
      }
    },
    {
      comp: Movement,
      props: {
        actor: $$props.actor,
        config: $$props.config,
        id: 3,
        span: 1
      }
    },
    {
      comp: Karma,
      props: {
        actor: $$props.actor,
        config: $$props.config,
        id: 4,
        span: 1
      }
    },
    {
      comp: Skills,
      props: {
        actor: $$props.actor,
        config: $$props.config,
        id: 5,
        span: 2
      }
    },
    {
      comp: Health,
      props: {
        actor: $$props.actor,
        config: $$props.config,
        id: 6,
        span: 2
      }
    },
    {
      comp: Inventory,
      props: {
        actor: $$props.actor,
        config: $$props.config,
        id: 7,
        span: 2
      }
    }
  ];
  user_effect(async () => {
    var _a;
    if (!((_a = $$props.actor) == null ? void 0 : _a.id)) return;
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
  MasonryGrid($$anchor, {
    itemSelector: "sheet-component",
    gridPrefix: "sheet",
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      each(node, 17, () => get$1(cards), ({ comp: Comp, props }) => props.id, ($$anchor3, $$item) => {
        let Comp = () => get$1($$item).comp;
        let props = () => get$1($$item).props;
        var div = root_2$a();
        var div_1 = child(div);
        var div_2 = sibling(child(div_1), 2);
        var node_1 = child(div_2);
        component(node_1, Comp, ($$anchor4, $$component) => {
          $$component($$anchor4, spread_props(props));
        });
        template_effect(() => set_class(div, "sheet-component span-" + (props().span ?? 1)));
        append($$anchor3, div);
      });
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  });
  pop();
  $$cleanup();
}
var root$m = /* @__PURE__ */ template(`<div class="neon-name"><!></div>`);
function NeonName($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $actorName = () => store_get(actorName, "$actorName", $$stores);
  let actor = prop($$props, "actor", 19, () => ({}));
  let storeManager2 = StoreManager.Subscribe(actor());
  onDestroy(() => {
    StoreManager.Unsubscribe(actor());
  });
  let malfunctioningIndexes = [];
  const actorName = storeManager2.GetShallowStore(actor().id, stores$1.actorName, actor().name);
  let name = /* @__PURE__ */ derived$1($actorName);
  let neonHTML = /* @__PURE__ */ derived$1(() => getNeonHtml(get$1(name)));
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
  var div = root$m();
  var node = child(div);
  html(node, () => get$1(neonHTML));
  append($$anchor, div);
  pop();
  $$cleanup();
}
console.log("%cNewsService module evaluated →", "color:#ff66aa;font-weight:bold;", import.meta.url, performance.now().toFixed(1));
const _NewsService = class _NewsService {
  constructor() {
    __privateAdd(this, _NewsService_instances);
    __publicField(this, "activeBroadcasters", writable(/* @__PURE__ */ new Map()));
    __publicField(this, "allFeeds", writable({}));
    __publicField(this, "currentDisplayFrame", writable({ buffer: [], timestamp: 0 }));
    __privateAdd(this, _feedBuffer, []);
    __privateAdd(this, _currentIndices, /* @__PURE__ */ new Map());
    __privateAdd(this, _maxVisible, 5);
    __privateAdd(this, _lastBroadcasterIndex, -1);
    __privateAdd(this, _frameUpdateInterval, null);
    __privateAdd(this, _initialized, false);
    __privateAdd(this, _nextTick, null);
    __privateAdd(this, _broadcastController, null);
    __privateAdd(this, _isController, false);
    __privateAdd(this, _controllerHeartbeat, null);
    __privateAdd(this, _lastHeartbeat, 0);
    __privateAdd(this, _syncRequestTimeout, null);
    __privateAdd(this, _electionCandidates, /* @__PURE__ */ new Set());
    __privateAdd(this, _electionInProgress, false);
    __publicField(this, "AVG_CHAR_PX", 12);
    __publicField(this, "SCROLL_SPEED", 100);
    __publicField(this, "DEFAULT_MS", 1e4);
    __publicField(this, "CONTROLLER_TIMEOUT", 15e3);
    __publicField(this, "HEARTBEAT_INTERVAL", 5e3);
    __publicField(this, "ELECTION_DELAY", 1e3);
    __privateAdd(this, _defaultMessages, [
      {
        sender: "System",
        headline: "Please stand by."
      },
      {
        sender: "System",
        headline: "Waiting for broadcast..."
      },
      {
        sender: "System",
        headline: "No active news sources."
      }
    ]);
  }
  static Instance() {
    if (!__privateGet(this, _instance)) {
      __privateSet(this, _instance, new _NewsService());
    }
    return __privateGet(this, _instance);
  }
  initialize() {
    if (__privateGet(this, _initialized)) return;
    __privateSet(this, _initialized, true);
    __privateMethod(this, _NewsService_instances, setupSocket_fn).call(this);
    __privateMethod(this, _NewsService_instances, loadActiveBroadcasters_fn).call(this);
    __privateMethod(this, _NewsService_instances, requestControllerElection_fn).call(this);
    __privateMethod(this, _NewsService_instances, startControllerHealthCheck_fn).call(this);
    CONFIG.sr3e = CONFIG.sr3e || {};
    CONFIG.sr3e.newsService = this;
  }
  requestFullResync() {
    var _a;
    __privateMethod(this, _NewsService_instances, requestControllerStatus_fn).call(this);
    game.socket.emit("module.sr3e", {
      type: "requestStateSync",
      userId: (_a = game.user) == null ? void 0 : _a.id
    });
  }
  destroy() {
    var _a;
    game.socket.off("module.sr3e");
    __privateSet(this, _initialized, false);
    clearTimeout(__privateGet(this, _nextTick));
    clearInterval(__privateGet(this, _controllerHeartbeat));
    clearTimeout(__privateGet(this, _syncRequestTimeout));
    __privateSet(this, _isController, false);
    if (((_a = CONFIG.sr3e) == null ? void 0 : _a.newsService) === this) CONFIG.sr3e.newsService = null;
  }
};
_feedBuffer = new WeakMap();
_currentIndices = new WeakMap();
_maxVisible = new WeakMap();
_lastBroadcasterIndex = new WeakMap();
_frameUpdateInterval = new WeakMap();
_initialized = new WeakMap();
_nextTick = new WeakMap();
_broadcastController = new WeakMap();
_isController = new WeakMap();
_controllerHeartbeat = new WeakMap();
_lastHeartbeat = new WeakMap();
_syncRequestTimeout = new WeakMap();
_electionCandidates = new WeakMap();
_electionInProgress = new WeakMap();
_defaultMessages = new WeakMap();
_instance = new WeakMap();
_NewsService_instances = new WeakSet();
loadActiveBroadcasters_fn = function() {
  const allBroadcasters = game.actors.filter((actor) => actor.type === "broadcaster" && actor.system.isBroadcasting);
  allBroadcasters.forEach((broadcaster) => {
    const headlines = broadcaster.system.rollingNews || [];
    __privateMethod(this, _NewsService_instances, receiveBroadcastSync_fn).call(this, broadcaster.name, headlines);
  });
};
startControllerHealthCheck_fn = function() {
  setInterval(() => __privateMethod(this, _NewsService_instances, checkControllerHealth_fn).call(this), this.HEARTBEAT_INTERVAL);
};
setupSocket_fn = function() {
  game.socket.on("module.sr3e", (data) => {
    const {
      type,
      actorName,
      headlines,
      buffer,
      timestamp,
      userId,
      broadcasters,
      duration,
      controllerId,
      targetId
    } = data;
    switch (type) {
      case "syncBroadcast":
        __privateMethod(this, _NewsService_instances, receiveBroadcastSync_fn).call(this, actorName, headlines);
        break;
      case "stopBroadcast":
        __privateMethod(this, _NewsService_instances, stopBroadcaster_fn).call(this, actorName);
        break;
      case "frameUpdate":
        __privateMethod(this, _NewsService_instances, receiveFrameUpdate_fn).call(this, buffer, timestamp, duration);
        break;
      case "controllerElection":
        __privateMethod(this, _NewsService_instances, handleControllerElection_fn).call(this, userId);
        break;
      case "controllerHeartbeat":
        __privateMethod(this, _NewsService_instances, handleControllerHeartbeat_fn).call(this, userId);
        break;
      case "requestStateSync":
        __privateMethod(this, _NewsService_instances, handleStateSyncRequest_fn).call(this, userId);
        break;
      case "stateSyncResponse":
        __privateMethod(this, _NewsService_instances, handleStateSyncResponse_fn).call(this, broadcasters);
        break;
      case "controllerAnnouncement":
        __privateMethod(this, _NewsService_instances, handleControllerHeartbeat_fn).call(this, userId);
        break;
      case "controllerStatusRequest":
        __privateMethod(this, _NewsService_instances, handleControllerStatusRequest_fn).call(this, userId);
        break;
      case "controllerStatusResponse":
        __privateMethod(this, _NewsService_instances, handleControllerStatusResponse_fn).call(this, controllerId, targetId);
        break;
      case "forceResync":
        Hooks.callAll("sr3e.forceResync");
        break;
    }
  });
};
requestControllerElection_fn = function() {
  var _a, _b;
  if (__privateGet(this, _electionInProgress)) return;
  __privateSet(this, _electionInProgress, true);
  __privateGet(this, _electionCandidates).clear();
  __privateGet(this, _electionCandidates).add((_a = game.user) == null ? void 0 : _a.id);
  game.socket.emit("module.sr3e", {
    type: "controllerElection",
    userId: (_b = game.user) == null ? void 0 : _b.id
  });
  clearTimeout(__privateGet(this, _syncRequestTimeout));
  __privateSet(this, _syncRequestTimeout, setTimeout(
    () => {
      __privateMethod(this, _NewsService_instances, resolveElection_fn).call(this);
    },
    this.ELECTION_DELAY
  ));
};
resolveElection_fn = function() {
  var _a;
  const sorted = Array.from(__privateGet(this, _electionCandidates)).sort();
  const winner = sorted[0];
  __privateSet(this, _electionInProgress, false);
  if (winner === ((_a = game.user) == null ? void 0 : _a.id)) {
    __privateMethod(this, _NewsService_instances, becomeController_fn).call(this);
  } else {
    __privateSet(this, _broadcastController, winner);
  }
};
handleControllerElection_fn = function(userId) {
  __privateGet(this, _electionCandidates).add(userId);
  if (!__privateGet(this, _electionInProgress)) {
    __privateMethod(this, _NewsService_instances, requestControllerElection_fn).call(this);
  }
};
becomeController_fn = function() {
  var _a;
  if (__privateGet(this, _isController)) return;
  __privateMethod(this, _NewsService_instances, announceController_fn).call(this);
  __privateSet(this, _isController, true);
  __privateSet(this, _broadcastController, (_a = game.user) == null ? void 0 : _a.id);
  __privateMethod(this, _NewsService_instances, startControllerHeartbeat_fn).call(this);
  __privateMethod(this, _NewsService_instances, loadActiveBroadcasters_fn).call(this);
  __privateMethod(this, _NewsService_instances, scheduleNextFrame_fn).call(this);
};
announceController_fn = function() {
  var _a;
  game.socket.emit("module.sr3e", {
    type: "controllerAnnouncement",
    userId: (_a = game.user) == null ? void 0 : _a.id
  });
};
requestControllerStatus_fn = function() {
  var _a;
  game.socket.emit("module.sr3e", {
    type: "controllerStatusRequest",
    userId: (_a = game.user) == null ? void 0 : _a.id
  });
  clearTimeout(__privateGet(this, _syncRequestTimeout));
  __privateSet(this, _syncRequestTimeout, setTimeout(
    () => {
      __privateMethod(this, _NewsService_instances, requestControllerElection_fn).call(this);
    },
    2e3
  ));
};
handleControllerStatusRequest_fn = function(requesterId) {
  var _a;
  if (!__privateGet(this, _isController)) return;
  game.socket.emit("module.sr3e", {
    type: "controllerStatusResponse",
    controllerId: (_a = game.user) == null ? void 0 : _a.id,
    targetId: requesterId
  });
};
handleControllerStatusResponse_fn = function(controllerId, targetId) {
  var _a;
  if (targetId !== ((_a = game.user) == null ? void 0 : _a.id)) return;
  __privateSet(this, _broadcastController, controllerId);
  __privateSet(this, _lastHeartbeat, Date.now());
};
startControllerHeartbeat_fn = function() {
  clearInterval(__privateGet(this, _controllerHeartbeat));
  __privateSet(this, _controllerHeartbeat, setInterval(
    () => {
      var _a;
      if (__privateGet(this, _isController)) {
        game.socket.emit("module.sr3e", {
          type: "controllerHeartbeat",
          userId: (_a = game.user) == null ? void 0 : _a.id
        });
      }
    },
    this.HEARTBEAT_INTERVAL
  ));
};
handleControllerHeartbeat_fn = function(userId) {
  var _a;
  __privateSet(this, _broadcastController, userId);
  __privateSet(this, _lastHeartbeat, Date.now());
  if (userId === ((_a = game.user) == null ? void 0 : _a.id)) return;
  if (__privateGet(this, _isController)) {
    __privateSet(this, _isController, false);
    clearInterval(__privateGet(this, _controllerHeartbeat));
    clearTimeout(__privateGet(this, _nextTick));
  }
};
checkControllerHealth_fn = function() {
  if (__privateGet(this, _isController)) return;
  const now2 = Date.now();
  const elapsed = now2 - __privateGet(this, _lastHeartbeat);
  if (elapsed > this.CONTROLLER_TIMEOUT + 200) {
    __privateMethod(this, _NewsService_instances, requestControllerElection_fn).call(this);
  }
};
scheduleNextFrame_fn = function() {
  if (!__privateGet(this, _isController)) return;
  __privateMethod(this, _NewsService_instances, loadActiveBroadcasters_fn).call(this);
  __privateMethod(this, _NewsService_instances, fillFeedBuffer_fn).call(this, 10);
  if (__privateGet(this, _feedBuffer).length === 0) {
    clearTimeout(__privateGet(this, _nextTick));
    __privateSet(this, _nextTick, setTimeout(
      () => {
        __privateMethod(this, _NewsService_instances, scheduleNextFrame_fn).call(this);
      },
      1e3
    ));
    return;
  }
  const buffer = [...__privateGet(this, _feedBuffer)];
  const duration = __privateMethod(this, _NewsService_instances, guessDuration_fn).call(this, buffer);
  const startTime = Date.now() + 200;
  const frame = { buffer, timestamp: startTime, duration };
  this.currentDisplayFrame.set(frame);
  game.socket.emit("module.sr3e", {
    type: "frameUpdate",
    buffer,
    timestamp: startTime,
    duration
  });
  clearTimeout(__privateGet(this, _nextTick));
  __privateSet(this, _nextTick, setTimeout(
    () => {
      __privateMethod(this, _NewsService_instances, scheduleNextFrame_fn).call(this);
    },
    duration
  ));
};
receiveFrameUpdate_fn = function(buffer, timestamp, duration) {
  const current = get(this.currentDisplayFrame);
  if (!Array.isArray(buffer)) return;
  if (!timestamp) return;
  if (timestamp <= current.timestamp) return;
  this.currentDisplayFrame.set({ buffer, timestamp, duration });
};
guessDuration_fn = function(buffer) {
  if (!Array.isArray(buffer) || buffer.length === 0) return this.DEFAULT_MS;
  const FONT_SIZE_PX = 24;
  const calculateTextWidth = (text2 = "") => {
    let totalWidth = 0;
    for (const char of text2) {
      const code = char.codePointAt(0);
      if (code >= 19968 && code <= 40959 || // CJK Unified Ideographs
      code >= 13312 && code <= 19903 || // CJK Extension A
      code >= 12352 && code <= 12447 || // Hiragana
      code >= 12448 && code <= 12543 || // Katakana
      code >= 44032 && code <= 55215) {
        totalWidth += FONT_SIZE_PX * 1;
      } else if (code >= 1024 && code <= 1279) {
        totalWidth += FONT_SIZE_PX * 0.75;
      } else if (code >= 1424 && code <= 1535 || // Hebrew
      code >= 1536 && code <= 1791) {
        totalWidth += FONT_SIZE_PX * 0.65;
      } else if (code >= 3584 && code <= 3711) {
        totalWidth += FONT_SIZE_PX * 0.6;
      } else if (code >= 2304 && code <= 2431) {
        totalWidth += FONT_SIZE_PX * 0.7;
      } else if ("iltfj".includes(char)) {
        totalWidth += FONT_SIZE_PX * 0.4;
      } else if ("wmMW".includes(char)) {
        totalWidth += FONT_SIZE_PX * 1.2;
      } else if (code < 128) {
        totalWidth += FONT_SIZE_PX * 0.75;
      } else {
        totalWidth += FONT_SIZE_PX * 0.8;
      }
    }
    return totalWidth;
  };
  const marqueeWidth = buffer.reduce(
    (sum, msg) => {
      const senderWidth = calculateTextWidth(msg.sender);
      const headlineWidth = calculateTextWidth(msg.headline);
      const itemPadding = 64;
      return sum + senderWidth + headlineWidth + itemPadding;
    },
    0
  );
  const estimatedTickerWidth = this.ESTIMATED_TICKER_WIDTH || 400;
  const totalDistance = estimatedTickerWidth + marqueeWidth;
  const duration = totalDistance / this.SCROLL_SPEED * 1e3;
  return Math.max(Math.ceil(duration), this.DEFAULT_MS);
};
handleStateSyncRequest_fn = function(requestingUserId) {
  var _a;
  if (requestingUserId === ((_a = game.user) == null ? void 0 : _a.id)) return;
  const broadcasters = get(this.activeBroadcasters);
  if (broadcasters.size === 0) return;
  const broadcastersData = {};
  broadcasters.forEach((headlines, actorName) => {
    broadcastersData[actorName] = headlines;
  });
  game.socket.emit("module.sr3e", {
    type: "stateSyncResponse",
    broadcasters: broadcastersData
  });
};
handleStateSyncResponse_fn = function(broadcastersData) {
  Object.entries(broadcastersData).forEach(([actorName, headlines]) => {
    __privateMethod(this, _NewsService_instances, receiveBroadcastSync_fn).call(this, actorName, headlines);
  });
};
receiveBroadcastSync_fn = function(actorName, headlines) {
  const broadcasters = get(this.activeBroadcasters);
  if (!headlines || headlines.length === 0) {
    broadcasters.delete(actorName);
    __privateGet(this, _currentIndices).delete(actorName);
  } else {
    broadcasters.set(actorName, headlines);
    const currentIndex = __privateGet(this, _currentIndices).get(actorName) || 0;
    __privateGet(this, _currentIndices).set(actorName, currentIndex % headlines.length);
  }
  this.activeBroadcasters.set(new Map(broadcasters));
  __privateMethod(this, _NewsService_instances, updateFeedBuffer_fn).call(this);
};
stopBroadcaster_fn = function(actorName) {
  const broadcasters = get(this.activeBroadcasters);
  broadcasters.delete(actorName);
  __privateGet(this, _currentIndices).delete(actorName);
  this.activeBroadcasters.set(new Map(broadcasters));
  __privateMethod(this, _NewsService_instances, updateFeedBuffer_fn).call(this);
};
pumpNextHeadline_fn = function() {
  const broadcasters = get(this.activeBroadcasters);
  if (broadcasters.size === 0) return null;
  const broadcasterNames = Array.from(broadcasters.keys());
  for (let offset = 0; offset < broadcasterNames.length; offset++) {
    const index2 = (__privateGet(this, _lastBroadcasterIndex) + offset + 1) % broadcasterNames.length;
    const broadcasterName = broadcasterNames[index2];
    const headlines = broadcasters.get(broadcasterName);
    if (!headlines || headlines.length === 0) continue;
    const currentIndex = __privateGet(this, _currentIndices).get(broadcasterName) || 0;
    const headline = headlines[currentIndex];
    __privateGet(this, _currentIndices).set(broadcasterName, (currentIndex + 1) % headlines.length);
    __privateSet(this, _lastBroadcasterIndex, index2);
    return { sender: broadcasterName, headline };
  }
  return null;
};
fillFeedBuffer_fn = function(minLength = 10) {
  const buffer = [...__privateGet(this, _feedBuffer)];
  const broadcasters = get(this.activeBroadcasters);
  while (buffer.length < minLength) {
    const nextHeadline = __privateMethod(this, _NewsService_instances, pumpNextHeadline_fn).call(this);
    if (!nextHeadline) break;
    buffer.push(nextHeadline);
  }
  if (buffer.length === 0 && broadcasters.size === 0) {
    for (let i = 0; i < minLength; i++) {
      const msg = __privateGet(this, _defaultMessages)[i % __privateGet(this, _defaultMessages).length];
      buffer.push(msg);
    }
  }
  __privateSet(this, _feedBuffer, buffer.slice(-__privateGet(this, _maxVisible)));
  __privateMethod(this, _NewsService_instances, publishFeed_fn).call(this);
};
updateFeedBuffer_fn = function() {
  const broadcasters = get(this.activeBroadcasters);
  if (broadcasters.size === 0) {
    __privateSet(this, _feedBuffer, []);
    __privateMethod(this, _NewsService_instances, publishFeed_fn).call(this);
    return;
  }
  __privateSet(this, _feedBuffer, __privateGet(this, _feedBuffer).filter((message) => broadcasters.has(message.sender) && broadcasters.get(message.sender).includes(message.headline)));
  __privateMethod(this, _NewsService_instances, fillFeedBuffer_fn).call(this, __privateGet(this, _maxVisible));
};
publishFeed_fn = function() {
  const feeds = {};
  __privateGet(this, _feedBuffer).forEach((message) => {
    feeds[message.sender] = feeds[message.sender] || [];
    feeds[message.sender].push(message);
  });
  this.allFeeds.set(feeds);
};
__privateAdd(_NewsService, _instance, null);
let NewsService = _NewsService;
let newsServiceInstance = null;
const getNewsService = () => {
  if (!newsServiceInstance) {
    newsServiceInstance = NewsService.Instance();
    newsServiceInstance.initialize();
  }
  return newsServiceInstance;
};
const broadcastNews = (actorName, headlines) => {
  game.socket.emit("module.sr3e", { type: "syncBroadcast", actorName, headlines });
};
const stopBroadcast = (actorName) => {
  game.socket.emit("module.sr3e", { type: "stopBroadcast", actorName });
};
derived(() => {
  var _a, _b;
  return (_b = (_a = CONFIG.sr3e) == null ? void 0 : _a.newsService) == null ? void 0 : _b.currentDisplayFrame;
}, ($store, set2) => {
  if (!($store == null ? void 0 : $store.subscribe)) {
    set2({ buffer: [], timestamp: 0 });
    return;
  }
  return $store.subscribe(set2);
});
var root_2$9 = /* @__PURE__ */ template(`<span class="marquee-item"> </span>`);
var root_3$8 = /* @__PURE__ */ template(`<span></span>`);
var root$l = /* @__PURE__ */ template(`<div class="ticker"><div class="marquee-outer"><div class="marquee-inner" role="status" aria-live="polite" aria-label="News Feed"><!></div></div></div>`);
function NewsFeed($$anchor, $$props) {
  push($$props, true);
  const SCROLL_SPEED = 100;
  const NewsService2 = getNewsService();
  let isOn = state(true);
  let ticker;
  let outer;
  let inner;
  let buffer = state(proxy([]));
  let lastFrameTimestamp = 0;
  let frameDuration = 0;
  let animationStart = 0;
  function restartAnimation() {
    if (!inner || !outer) return;
    inner.style.animation = "none";
    inner.offsetHeight;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const fullWidth = inner.scrollWidth;
        frameDuration = Math.max(fullWidth / SCROLL_SPEED * 1e3, 5e3);
        const elapsed = Date.now() - animationStart;
        document.documentElement.style.setProperty("--marquee-width", `${fullWidth}px`);
        document.documentElement.style.setProperty("--marquee-duration", `${frameDuration / 1e3}s`);
        document.documentElement.style.setProperty("--marquee-delay", `-${elapsed}ms`);
        inner.style.animation = "";
      });
    });
  }
  function applyFrame(frame) {
    if (!frame || !Array.isArray(frame.buffer)) return;
    if (frame.buffer.length === 0) return;
    if (frame.timestamp <= lastFrameTimestamp) return;
    lastFrameTimestamp = frame.timestamp;
    animationStart = frame.timestamp;
    set(buffer, proxy(frame.buffer.map((m) => (m == null ? void 0 : m.sender) && (m == null ? void 0 : m.headline) ? `${m.sender}: "${m.headline}"` : String(m))));
    if (NewsService2.isController) {
      game.socket.emit("module.sr3e", { type: "forceResync" });
    }
    const tickerWidth = ticker.clientWidth;
    document.documentElement.style.setProperty("--ticker-width", `${tickerWidth}px`);
    restartAnimation();
  }
  function handleKeydown2(event2) {
    if (event2.key === "F2") {
      event2.preventDefault();
      set(isOn, !get$1(isOn));
    }
  }
  onMount(() => {
    console.log("NewsFeed: Mounted");
    const unsub = NewsService2.currentDisplayFrame.subscribe(applyFrame);
    const handleResync = () => {
      console.log("NewsFeed: Force resync triggered");
      restartAnimation();
    };
    window.addEventListener("keydown", handleKeydown2);
    Hooks.on("sr3e.forceResync", handleResync);
    return () => {
      unsub();
      window.removeEventListener("keydown", handleKeydown2);
      Hooks.off("sr3e.forceResync", handleResync);
    };
  });
  var div = root$l();
  var div_1 = child(div);
  var div_2 = child(div_1);
  var node = child(div_2);
  {
    var consequent = ($$anchor2) => {
      var fragment = comment();
      var node_1 = first_child(fragment);
      each(node_1, 17, () => get$1(buffer), index, ($$anchor3, line) => {
        var span = root_2$9();
        var text2 = child(span);
        template_effect(() => set_text(text2, get$1(line)));
        append($$anchor3, span);
      });
      append($$anchor2, fragment);
    };
    var alternate = ($$anchor2) => {
      var span_1 = root_3$8();
      append($$anchor2, span_1);
    };
    if_block(node, ($$render) => {
      if (get$1(isOn)) $$render(consequent);
      else $$render(alternate, false);
    });
  }
  bind_this(div_2, ($$value) => inner = $$value, () => inner);
  bind_this(div_1, ($$value) => outer = $$value, () => outer);
  bind_this(div, ($$value) => ticker = $$value, () => ticker);
  append($$anchor, div);
  pop();
}
var root_1$e = /* @__PURE__ */ template(`<div class="point-container"><h1> </h1> <div> </div></div>`);
var root$k = /* @__PURE__ */ template(`<div></div>`);
function CreationPointList($$anchor, $$props) {
  let points = prop($$props, "points", 19, () => []), containerCSS = prop($$props, "containerCSS", 3, "");
  var div = root$k();
  each(div, 21, points, index, ($$anchor2, point, i) => {
    var div_1 = root_1$e();
    set_attribute(div_1, "style", `top: ${i * 8}rem`);
    var h1 = child(div_1);
    var text2 = child(h1);
    var div_2 = sibling(h1, 2);
    var text_1 = child(div_2);
    template_effect(() => {
      set_text(text2, get$1(point).value);
      set_text(text_1, get$1(point).text);
    });
    append($$anchor2, div_1);
  });
  template_effect(() => set_class(div, containerCSS()));
  append($$anchor, div);
}
function AttributePointsState($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $attributePointsStore = () => store_get(attributePointsStore, "$attributePointsStore", $$stores);
  const $activeSkillPointsStore = () => store_get(activeSkillPointsStore, "$activeSkillPointsStore", $$stores);
  const $knowledgePointsStore = () => store_get(knowledgePointsStore, "$knowledgePointsStore", $$stores);
  const $languagePointsStore = () => store_get(languagePointsStore, "$languagePointsStore", $$stores);
  const $intelligence = () => store_get(intelligence, "$intelligence", $$stores);
  const $attributeAssignmentLocked = () => store_get(attributeAssignmentLocked, "$attributeAssignmentLocked", $$stores);
  let attributePointsText = localize($$props.config.attributes.attributes);
  let activePointsText = localize($$props.config.skill.active);
  let knowledgePointsText = localize($$props.config.skill.knowledge);
  let languagePointsText = localize($$props.config.skill.language);
  let storeManager2 = StoreManager.Subscribe($$props.actor);
  let attributeAssignmentLocked = storeManager2.GetFlagStore(flags.actor.attributeAssignmentLocked);
  let intelligence = storeManager2.GetSumROStore("attributes.intelligence");
  let attributePointsStore = storeManager2.GetRWStore("creation.attributePoints");
  let activeSkillPointsStore = storeManager2.GetRWStore("creation.activePoints");
  let knowledgePointsStore = storeManager2.GetRWStore("creation.knowledgePoints");
  let languagePointsStore = storeManager2.GetRWStore("creation.languagePoints");
  console.log("NEW ACTOR", $$props.actor);
  let pointList = /* @__PURE__ */ derived$1(() => [
    {
      value: $attributePointsStore(),
      text: attributePointsText
    },
    {
      value: $activeSkillPointsStore(),
      text: activePointsText
    },
    {
      value: $knowledgePointsStore(),
      text: knowledgePointsText
    },
    {
      value: $languagePointsStore(),
      text: languagePointsText
    }
  ]);
  user_effect(() => {
    knowledgePointsStore.set($intelligence().sum * 5);
    languagePointsStore.set(Math.floor($intelligence().sum * 1.5));
  });
  user_effect(() => {
    if ($attributePointsStore() === 0 && $attributeAssignmentLocked() === false) {
      (async () => {
        const confirmed = await foundry.applications.api.DialogV2.confirm({
          window: {
            title: localize($$props.config.modal.exitattributesassignment)
          },
          content: localize($$props.config.modal.exitattributesassignment),
          yes: {
            label: localize($$props.config.modal.confirm),
            default: true
          },
          no: {
            label: localize($$props.config.modal.decline)
          },
          modal: true,
          rejectClose: true
        });
        if (confirmed) {
          $$props.actor.setFlag(flags.sr3e, flags.actor.attributeAssignmentLocked, true);
          store_set(attributeAssignmentLocked, true);
        }
      })();
    }
  });
  onDestroy(() => {
    StoreManager.Unsubscribe($$props.actor);
  });
  CreationPointList($$anchor, {
    get points() {
      return get$1(pointList);
    },
    containerCSS: "attribute-point-assignment"
  });
  pop();
  $$cleanup();
}
function SkillPointsState($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $activeSkillPointsStore = () => store_get(activeSkillPointsStore, "$activeSkillPointsStore", $$stores);
  const $knowledgePointsStore = () => store_get(knowledgePointsStore, "$knowledgePointsStore", $$stores);
  const $languagePointsStore = () => store_get(languagePointsStore, "$languagePointsStore", $$stores);
  let actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({}));
  let attributePointsText = localize(config().attributes.attributes);
  let activePointsText = localize(config().skill.active);
  let knowledgePointsText = localize(config().skill.knowledge);
  let languagePointsText = localize(config().skill.language);
  let storeManager2 = StoreManager.Subscribe(actor());
  let activeSkillPointsStore = storeManager2.GetRWStore("creation.activePoints");
  let knowledgePointsStore = storeManager2.GetRWStore("creation.knowledgePoints");
  let languagePointsStore = storeManager2.GetRWStore("creation.languagePoints");
  let isCharacterCreationStore = storeManager2.GetFlagStore(flags.actor.isCharacterCreation);
  let pointList = /* @__PURE__ */ derived$1(() => [
    { value: 0, text: attributePointsText },
    {
      value: $activeSkillPointsStore(),
      text: activePointsText
    },
    {
      value: $knowledgePointsStore(),
      text: knowledgePointsText
    },
    {
      value: $languagePointsStore(),
      text: languagePointsText
    }
  ]);
  user_effect(() => {
    if ($activeSkillPointsStore() === 0 && $knowledgePointsStore() === 0 && $languagePointsStore() === 0) {
      (async () => {
        const confirmed = await foundry.applications.api.DialogV2.confirm({
          window: {
            title: localize(config().modal.exitcreationmodetitle)
          },
          content: localize(config().modal.exitcreationmode),
          yes: {
            label: localize(config().modal.confirm),
            default: true
          },
          no: {
            label: localize(config().modal.decline)
          },
          modal: true,
          rejectClose: true
        });
        if (confirmed) {
          actor().setFlag(flags.sr3e, flags.actor.isCharacterCreation, false);
          store_set(isCharacterCreationStore, false);
        }
      })();
    }
  });
  onDestroy(() => {
    StoreManager.Unsubscribe(actor());
  });
  CreationPointList($$anchor, {
    get points() {
      return get$1(pointList);
    },
    containerCSS: "skill-point-assignment"
  });
  pop();
  $$cleanup();
}
var root_1$d = /* @__PURE__ */ template(`<div><!></div>`);
function CharacterCreationManager($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $isCharacterCreationStore = () => store_get(isCharacterCreationStore, "$isCharacterCreationStore", $$stores);
  const $attributeAssignementLockedStore = () => store_get(attributeAssignementLockedStore, "$attributeAssignementLockedStore", $$stores);
  let actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({}));
  let storeManager2 = StoreManager.Subscribe(actor());
  onDestroy(() => {
    StoreManager.Unsubscribe(actor());
  });
  let attributeAssignementLockedStore = storeManager2.GetFlagStore(flags.actor.attributeAssignmentLocked);
  let isCharacterCreationStore = storeManager2.GetFlagStore(flags.actor.isCharacterCreation);
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent_1 = ($$anchor2) => {
      var div = root_1$d();
      var node_1 = child(div);
      {
        var consequent = ($$anchor3) => {
          SkillPointsState($$anchor3, {
            get actor() {
              return actor();
            },
            get config() {
              return config();
            }
          });
        };
        var alternate = ($$anchor3) => {
          AttributePointsState($$anchor3, {
            get actor() {
              return actor();
            },
            get config() {
              return config();
            }
          });
        };
        if_block(node_1, ($$render) => {
          if ($attributeAssignementLockedStore()) $$render(consequent);
          else $$render(alternate, false);
        });
      }
      append($$anchor2, div);
    };
    if_block(node, ($$render) => {
      if ($isCharacterCreationStore()) $$render(consequent_1);
    });
  }
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
var root$j = /* @__PURE__ */ template(`<div><button type="button"></button></div>`);
function ShoppingCart($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $isShoppingState = () => store_get(isShoppingState, "$isShoppingState", $$stores);
  let actor = prop($$props, "actor", 19, () => ({})), config = prop($$props, "config", 19, () => ({}));
  let storeManager2 = StoreManager.Subscribe(actor());
  let isShoppingState = storeManager2.GetFlagStore(flags.actor.isShoppingState);
  onDestroy(() => {
    StoreManager.Unsubscribe(actor());
  });
  var div = root$j();
  var button = child(div);
  button.__click = () => isShoppingState.update((v) => !v);
  template_effect(
    ($0) => {
      set_attribute(button, "aria-label", $0);
      set_class(button, `header-control icon fa-solid fa-cart-shopping ${$isShoppingState() ? "pulsing-green-cart" : ""}`);
    },
    [
      () => localize(config().sheet.buyupgrades)
    ]
  );
  append($$anchor, div);
  pop();
  $$cleanup();
}
delegate(["click"]);
class CharacterActorSheet extends foundry.applications.sheets.ActorSheetV2 {
  constructor() {
    super(...arguments);
    __privateAdd(this, _app3);
    __privateAdd(this, _neon);
    __privateAdd(this, _feed);
    __privateAdd(this, _cart);
    __privateAdd(this, _creation);
    __privateAdd(this, _footer);
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
    if (__privateGet(this, _app3)) {
      unmount(__privateGet(this, _app3));
      __privateSet(this, _app3, null);
    }
    if (__privateGet(this, _neon)) {
      unmount(__privateGet(this, _neon));
      __privateSet(this, _neon, null);
    }
    if (__privateGet(this, _feed)) {
      unmount(__privateGet(this, _feed));
      __privateSet(this, _feed, null);
    }
    if (__privateGet(this, _cart)) {
      unmount(__privateGet(this, _cart));
      __privateSet(this, _cart, null);
    }
    if (__privateGet(this, _creation)) {
      unmount(__privateGet(this, _creation));
      __privateSet(this, _creation, null);
    }
    if (__privateGet(this, _footer)) {
      unmount(__privateGet(this, _footer));
      __privateSet(this, _creation, null);
    }
    windowContent.innerHTML = "";
    const form = windowContent.parentNode;
    __privateSet(this, _app3, mount(CharacterSheetApp, {
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
    this._injectFooter(form);
    this._injectRollComposer(header);
    let isCharacterCreation = this.document.getFlag(flags.sr3e, flags.actor.isCharacterCreation);
    if (isCharacterCreation) {
      this._injectCharacterCreationPointsApp(header);
    }
    Log.success("Svelte mounted", this.constructor.name);
    return windowContent;
  }
  // Injects from the svelte component later
  _injectRollComposer(header) {
    var _a;
    let anchor = header == null ? void 0 : header.previousElementSibling;
    if (!((_a = anchor == null ? void 0 : anchor.classList) == null ? void 0 : _a.contains("composer-position"))) {
      anchor = document.createElement("div");
      anchor.classList.add("composer-position");
      header.parentElement.insertBefore(anchor, header);
    }
  }
  _injectFooter(form) {
    if (form.querySelector(".actor-footer")) return;
    const footer = document.createElement("div");
    footer.classList.add("actor-footer");
    const resizeHandle = form.querySelector(".window-resize-handle");
    if (resizeHandle == null ? void 0 : resizeHandle.parentNode) {
      resizeHandle.parentNode.insertBefore(footer, resizeHandle.nextSibling);
    } else {
      form.appendChild(footer);
    }
  }
  _injectCharacterCreationPointsApp(header) {
    var _a;
    let anchor = header == null ? void 0 : header.previousElementSibling;
    if (!((_a = anchor == null ? void 0 : anchor.classList) == null ? void 0 : _a.contains("points-position"))) {
      anchor = document.createElement("div");
      anchor.classList.add("points-position");
      header.parentElement.insertBefore(anchor, header);
      __privateSet(this, _creation, mount(CharacterCreationManager, {
        target: anchor,
        props: {
          actor: this.document,
          config: CONFIG.sr3e
        }
      }));
    }
  }
  _injectNeonName(header) {
    let neonSlot = header == null ? void 0 : header.previousElementSibling;
    if (!neonSlot || !neonSlot.classList.contains("neon-name-position")) {
      neonSlot = document.createElement("div");
      neonSlot.classList.add("neon-name-position");
      header.parentElement.insertBefore(neonSlot, header);
    }
    if (neonSlot.childNodes.length === 0) {
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
    }
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
  async _tearDown() {
    if (__privateGet(this, _neon)) await unmount(__privateGet(this, _neon));
    if (__privateGet(this, _app3)) await unmount(__privateGet(this, _app3));
    if (__privateGet(this, _feed)) await unmount(__privateGet(this, _feed));
    if (__privateGet(this, _cart)) await unmount(__privateGet(this, _cart));
    if (__privateGet(this, _creation)) await unmount(__privateGet(this, _creation));
    __privateSet(this, _app3, __privateSet(this, _neon, __privateSet(this, _feed, __privateSet(this, _cart, __privateSet(this, _creation, __privateSet(this, _footer, null))))));
    return super._tearDown();
  }
  _onSubmit() {
    return false;
  }
  async _onDrop(event2) {
    event2.preventDefault();
    const data = await foundry.applications.ux.TextEditor.getDragEventData(event2);
    if (data.type !== "Item") return super._onDrop(event2);
    const droppedItem = await Item.implementation.fromDropData(data);
    if (droppedItem.type === "skill") {
      this.handleSkill(droppedItem);
      return;
    }
    if (droppedItem.type === "metatype") {
      this.handlemetatype(droppedItem);
      return super._onDrop(event2);
    }
    return super._onDrop(event2);
  }
  async handleSkill(droppedItem) {
    var _a;
    let storeManager2 = StoreManager.Subscribe(this.document);
    const skillType = droppedItem.system.skillType;
    const itemData = droppedItem.toObject();
    if (skillType === "active" && !((_a = droppedItem.system.activeSkill) == null ? void 0 : _a.linkedAttribute)) {
      ui.notifications.warn("Cannot drop an active skill without a linked attribute.");
      return;
    }
    const storeKeyByType = {
      active: stores$1.activeSkillsIds,
      knowledge: stores$1.knowledgeSkillsIds,
      language: stores$1.languageSkillsIds
    };
    const storeKey = storeKeyByType[skillType];
    if (!storeKey) {
      console.warn("Unsupported skillType dropped:", skillType);
      return;
    }
    const created = await this.document.createEmbeddedDocuments("Item", [itemData], {
      render: false
    });
    const createdItem = created == null ? void 0 : created[0];
    if (!createdItem) {
      console.warn("Skill creation failed or returned no result.");
      return;
    }
    const tarGetRWStore = storeManager2.GetShallowStore(this.document.id, storeKey, []);
    tarGetRWStore.update((current) => [...current, createdItem.id]);
    StoreManager.Unsubscribe(this.document);
  }
  async handlemetatype(droppedItem) {
    const result = await this.actor.canAcceptmetatype(droppedItem);
    if (result === "accept") {
      await this.actor.replacemetatype(droppedItem);
    } else if (result === "goblinize") {
      const confirmed = await foundry.applications.api.DialogV2.confirm({
        title: "Goblinization",
        content: `<h1>Goblinize this character?<br>This action is <strong>irreversible</strong>!</h1>`,
        yes: () => true,
        no: () => false,
        defaultYes: false
      });
      if (confirmed) {
        await this.actor.replacemetatype(droppedItem);
      }
    } else {
      ui.notifications.info("Only one metatype type allowed.");
    }
  }
}
_app3 = new WeakMap();
_neon = new WeakMap();
_feed = new WeakMap();
_cart = new WeakMap();
_creation = new WeakMap();
_footer = new WeakMap();
const sr3e = {};
sr3e.ammunition = {
  ammunition: "sr3e.ammunition.ammunition",
  type: "sr3e.ammunition.type",
  rounds: "sr3e.ammunition.rounds"
};
sr3e.attributes = {
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
  reaction: "sr3e.attributes.reaction"
};
sr3e.broadcaster = {
  broadcaster: "sr3e.broadcaster.broadcaster"
};
sr3e.difficulty = {
  simple: "sr3e.difficulty.simple",
  routine: "sr3e.difficulty.routine",
  average: "sr3e.difficulty.average",
  challenging: "sr3e.difficulty.challenging",
  hard: "sr3e.difficulty.hard",
  strenuous: "sr3e.difficulty.strenuous",
  extreme: "sr3e.difficulty.extreme",
  nearlyimpossible: "sr3e.difficulty.nearlyimpossible"
};
sr3e.effects = {
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
  target: "sr3e.effects.target"
};
sr3e.health = {
  health: "sr3e.health.health",
  overflow: "sr3e.health.overflow",
  penalty: "sr3e.health.penalty"
};
sr3e.modal = {
  confirm: "sr3e.modal.confirm",
  decline: "sr3e.modal.decline",
  deleteskill: "sr3e.modal.deleteskill",
  deleteskilltitle: "sr3e.modal.deleteskilltitle",
  exitattributesassignment: "sr3e.modal.exitattributesassignment",
  exitcreationmode: "sr3e.modal.exitcreationmode",
  exitattributesassignmenttitle: "sr3e.modal.exitattributesassignmenttitle",
  exitcreationmodetitle: "sr3e.modal.exitcreationmodetitle"
};
sr3e.skill = {
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
  specializations: "sr3e.skill.specializations"
};
sr3e.initiative = {
  augmentedReaction: "sr3e.initiative.augmentedReaction",
  initiative: "sr3e.initiative.initiative",
  initiativeDice: "sr3e.initiative.initiativeDice",
  natuaralReaction: "sr3e.initiative.naturalReaction",
  reaction: "sr3e.initiative.reaction",
  reactionPenalty: "sr3e.initiative.reactionPenalty"
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
  custom: "sr3e.common.custom",
  details: "sr3e.common.details"
};
sr3e.dicepools = {
  dicepools: "sr3e.dicepools.dicepools",
  astral: "sr3e.dicepools.astral",
  combat: "sr3e.dicepools.combat",
  control: "sr3e.dicepools.control",
  hacking: "sr3e.dicepools.hacking",
  spell: "sr3e.dicepools.spell",
  associateselect: "sr3e.dicepools.associateselect"
};
sr3e.karma = {
  karma: "sr3e.karma.karma",
  goodkarma: "sr3e.karma.goodkarma",
  karmapool: "sr3e.karma.karmapool",
  advancementratio: "sr3e.karma.advancementratio",
  miraculoussurvival: "sr3e.karma.miraculoussurvival",
  lifetimekarma: "sr3e.karma.lifetimekarma",
  commitselected: "sr3e.karma.commitselected",
  selectall: "sr3e.karma.selectall",
  deselectall: "sr3e.karma.deselectall",
  commit: "sr3e.karma.commit"
};
sr3e.movement = {
  movement: "sr3e.movement.movement",
  walking: "sr3e.movement.walking",
  running: "sr3e.movement.running",
  runSpeedModifier: "sr3e.movement.runSpeedModifier"
};
sr3e.placeholders = {
  human: "sr3e.placeholders.human",
  fullshaman: "sr3e.placeholders.fullshaman"
};
sr3e.karmamanager = {
  character: "sr3e.karmamanager.character",
  npc: "sr3e.karmamanager.npc"
};
sr3e.sheet = {
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
  edit: "sr3e.sheet.edit"
};
sr3e.traits = {
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
  ancient: "sr3e.traits.ancient"
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
sr3e.storytellerscreen = {
  storytellerscreen: "sr3e.storytellerscreen.storytellerscreen",
  refreshcombatpool: "sr3e.storytellerscreen.refreshcombatpool",
  refreshastralpool: "sr3e.storytellerscreen.refreshastralpool",
  refreshhackingpool: "sr3e.storytellerscreen.refreshhackingpool",
  refreshcontrolpool: "sr3e.storytellerscreen.refreshcontrolpool",
  refreshspellpool: "sr3e.storytellerscreen.refreshspellpool",
  refreshkarma: "sr3e.storytellerscreen.refreshkarmapool",
  refresh: "sr3e.storytellerscreen.refresh"
};
sr3e.magic = {
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
  powerPoints: "sr3e.magic.powerPoints"
};
sr3e.notifications = {
  assignattributesfirst: "sr3e.notifications.assignattributesfirst",
  skillpointsrefund: "sr3e.notifications.skillpointsrefund",
  skillpricecrossedthreshold: "sr3e.notifications.skillpricecrossedthreshold"
};
sr3e.time = {
  days: "sr3e.time.days",
  hours: "sr3e.time.hours",
  minutes: "sr3e.time.minutes",
  seconds: "sr3e.time.seconds",
  rounds: "sr3e.time.rounds",
  turns: "sr3e.time.turns",
  months: "sr3e.time.months",
  years: "sr3e.time.years"
};
sr3e.combosearch = {
  noresult: "sr3e.combosearch.noresult",
  search: "sr3e.combosearch.search"
};
sr3e.transaction = {
  transaction: "sr3e.transaction.transaction",
  creditstick: "sr3e.transaction.creditstick",
  recurrent: "sr3e.transaction.recurrent",
  asset: "sr3e.transaction.asset",
  income: "sr3e.transaction.income",
  debt: "sr3e.transaction.debt",
  expense: "sr3e.transaction.expense",
  select: "sr3e.transaction.select"
};
sr3e.weapon = {
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
  energy: "sr3e.weapon.energy"
};
sr3e.commodity = {
  commodity: "sr3e.commodity.commodity",
  days: "sr3e.commodity.days",
  cost: "sr3e.commodity.cost",
  streetIndex: "sr3e.commodity.streetIndex",
  restrictionLevel: "sr3e.commodity.restrictionLevel",
  legalityType: "sr3e.commodity.legalityType",
  legalityCategory: "sr3e.commodity.legalityCategory",
  isBroken: "sr3e.commodity.isBroken"
};
sr3e.portability = {
  portability: "sr3e.portability.portability",
  concealability: "sr3e.portability.portability",
  weight: "sr3e.portability.weight"
};
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
class MetatypeModel extends foundry.abstract.TypeDataModel {
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
      // Karma advancement fraction
      karma: new foundry.data.fields.SchemaField({
        factor: new foundry.data.fields.NumberField({
          required: true,
          initial: 0
        })
      }),
      //Movementfactor
      movement: new foundry.data.fields.SchemaField({
        factor: new foundry.data.fields.NumberField({
          required: true,
          initial: 0
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
  var _a;
  set(visible, false);
  (_a = $$props.onclose) == null ? void 0 : _a.call($$props, get$1(selected));
}
function cancel(__1, visible, $$props) {
  var _a;
  set(visible, false);
  (_a = $$props.onclose) == null ? void 0 : _a.call($$props, null);
}
var on_input = (__2, showDropdown, selected) => {
  set(showDropdown, true);
  set(selected, null);
};
var on_mousedown = (__3, selectJournal, option) => selectJournal(get$1(option));
var root_4$7 = /* @__PURE__ */ template(`<li class="dropdown-item"><div role="option" tabindex="0"><i class="fa-solid fa-book-open" style="margin-right: 0.5rem;"></i> </div></li>`);
var root_5$5 = /* @__PURE__ */ template(`<li class="dropdown-empty">No journal entries found.</li>`);
var root_2$8 = /* @__PURE__ */ template(`<ul class="dropdown-list floating"><!></ul>`);
var root_1$c = /* @__PURE__ */ template(`<div class="popup"><div class="popup-container"><div class="input-group"><input type="text"></div> <div class="buttons"><button>OK</button> <button>Cancel</button></div></div> <!></div>`);
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
      var _a;
      const items = [
        {
          value: entry.id,
          type: "entry",
          label: entry.name
        }
      ];
      for (const page of ((_a = entry.pages) == null ? void 0 : _a.contents) ?? []) {
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
      var div = root_1$c();
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
          var ul = root_2$8();
          var node_2 = child(ul);
          {
            var consequent = ($$anchor4) => {
              var fragment_1 = comment();
              var node_3 = first_child(fragment_1);
              each(node_3, 17, filteredOptions, (option) => option.value, ($$anchor5, option) => {
                var li = root_4$7();
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
              var li_1 = root_5$5();
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
      event$1("focus", input, () => set(showDropdown, true));
      event$1("blur", input, () => setTimeout(() => set(showDropdown, false), 100));
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
  var _a;
  if (!get$1(journalId)) return;
  const entry = game.journal.get(get$1(journalId));
  (_a = entry == null ? void 0 : entry.sheet) == null ? void 0 : _a.render(true);
}
function handleSearch(__1, config, journalId, $$props) {
  const modal = mount(JournalSearchModal, {
    target: document.body,
    props: {
      config: config(),
      onclose: (result) => {
        var _a;
        unmount(modal);
        if (result) {
          console.log("User clicked OK", { result });
          set(journalId, proxy(result.value));
          (_a = $$props.onJournalContentSelected) == null ? void 0 : _a.call($$props, result);
        } else {
          console.log("User clicked Cancel");
        }
      }
    }
  });
}
var on_click$2 = (e) => e.stopPropagation();
var on_keydown$2 = (e) => {
  if (e.key === "Escape") {
    e.currentTarget.blur();
  }
};
var root$i = /* @__PURE__ */ template(`<div class="toolbar searchbuttons" role="toolbar" tabindex="0"><button class="header-control icon sr3e-toolbar-button" aria-label="Open journal entry"><i class="fa-solid fa-book-open"></i></button> <button class="header-control icon sr3e-toolbar-button" aria-label="Search journal entries"><i class="fa-solid fa-magnifying-glass"></i></button></div>`);
function JournalViewerToolbar($$anchor, $$props) {
  push($$props, true);
  const config = prop($$props, "config", 19, () => ({})), id = prop($$props, "id", 19, () => ({}));
  let journalId = state(proxy(id() ?? null));
  var div = root$i();
  div.__click = [on_click$2];
  div.__keydown = [on_keydown$2];
  var button = child(div);
  button.__click = [handleOpen, journalId];
  var button_1 = sibling(button, 2);
  button_1.__click = [handleSearch, config, journalId, $$props];
  append($$anchor, div);
  pop();
}
delegate(["click", "keydown"]);
var root$h = /* @__PURE__ */ template(`<div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><!> <div class="preview journal-content"><!></div></div></div></div>`);
function JournalViewer($$anchor, $$props) {
  push($$props, true);
  let document2 = prop($$props, "document", 19, () => ({})), config = prop($$props, "config", 19, () => ({}));
  console.log("DOCUMENT", document2());
  let toolbar;
  let journalId = state(proxy(document2().system.journalId ?? null));
  let previewContent = state("");
  user_effect(async () => {
    var _a, _b, _c;
    if (!get$1(journalId)) {
      set(previewContent, "");
      return;
    }
    const journal = game.journal.get(get$1(journalId));
    const page = (_b = (_a = journal == null ? void 0 : journal.pages) == null ? void 0 : _a.contents) == null ? void 0 : _b[0];
    const content = ((_c = page == null ? void 0 : page.text) == null ? void 0 : _c.content) || "";
    set(previewContent, proxy(await foundry.applications.ux.TextEditor.enrichHTML(content, {
      async: true,
      secrets: false,
      documents: false
    })));
  });
  async function handleJournalSelection(result) {
    if (!result) return;
    set(journalId, proxy(result.value));
    await document2().update({ "system.journalId": result.value });
  }
  var div = root$h();
  var div_1 = child(div);
  var div_2 = sibling(child(div_1), 2);
  var node = child(div_2);
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
  var div_3 = sibling(node, 2);
  var node_1 = child(div_3);
  html(node_1, () => get$1(previewContent));
  append($$anchor, div);
  pop();
}
var root_1$b = /* @__PURE__ */ template(`<input type="checkbox">`);
var root_4$6 = /* @__PURE__ */ template(`<option> </option>`);
var root_3$7 = /* @__PURE__ */ template(`<select></select>`);
var root_5$4 = /* @__PURE__ */ template(`<input>`);
var root$g = /* @__PURE__ */ template(`<div class="stat-card"><div class="stat-card-background"></div> <div class="title-container"><h4 class="no-margin uppercase"> </h4></div> <!></div>`);
function StatCard($$anchor, $$props) {
  push($$props, true);
  let type = prop($$props, "type", 3, "text"), options = prop($$props, "options", 19, () => []);
  function update(e) {
    let val;
    if (type() === "checkbox") {
      val = e.target.checked;
    } else {
      val = e.target.value;
      if (type() === "number") val = Number(val);
    }
    $$props.item.update({ [`${$$props.path}.${$$props.key}`]: val });
    console.log(`Updated ${$$props.path}.${$$props.key} to`, val);
  }
  var div = root$g();
  var div_1 = sibling(child(div), 2);
  var h4 = child(div_1);
  var text2 = child(h4);
  var node = sibling(div_1, 2);
  {
    var consequent = ($$anchor2) => {
      var input = root_1$b();
      input.__change = update;
      template_effect(() => set_checked(input, $$props.value));
      append($$anchor2, input);
    };
    var alternate_1 = ($$anchor2) => {
      var fragment = comment();
      var node_1 = first_child(fragment);
      {
        var consequent_1 = ($$anchor3) => {
          var select = root_3$7();
          init_select(select, () => $$props.value);
          var select_value;
          select.__change = update;
          each(select, 21, options, index, ($$anchor4, option) => {
            var option_1 = root_4$6();
            var option_1_value = {};
            var text_1 = child(option_1);
            template_effect(() => {
              if (option_1_value !== (option_1_value = get$1(option))) {
                option_1.value = null == (option_1.__value = get$1(option)) ? "" : get$1(option);
              }
              set_selected(option_1, $$props.value === get$1(option));
              set_text(text_1, get$1(option));
            });
            append($$anchor4, option_1);
          });
          template_effect(() => {
            if (select_value !== (select_value = $$props.value)) {
              select.value = null == (select.__value = $$props.value) ? "" : $$props.value, select_option(select, $$props.value);
            }
          });
          append($$anchor3, select);
        };
        var alternate = ($$anchor3) => {
          var input_1 = root_5$4();
          input_1.__change = update;
          template_effect(() => {
            set_attribute(input_1, "type", type());
            set_attribute(input_1, "step", type() === "number" ? "any" : void 0);
            set_value(input_1, $$props.value);
          });
          append($$anchor3, input_1);
        };
        if_block(
          node_1,
          ($$render) => {
            if (type() === "select") $$render(consequent_1);
            else $$render(alternate, false);
          },
          true
        );
      }
      append($$anchor2, fragment);
    };
    if_block(node, ($$render) => {
      if (type() === "checkbox") $$render(consequent);
      else $$render(alternate_1, false);
    });
  }
  template_effect(() => set_text(text2, $$props.label));
  append($$anchor, div);
  pop();
}
delegate(["change"]);
var on_change$6 = (e, item2) => item2().update({ name: e.target.value });
var root_1$a = /* @__PURE__ */ template(`<!> <input class="large" name="name" type="text"> <!>`, 1);
var root_3$6 = /* @__PURE__ */ template(`<h3 class="item"> </h3> <div class="stat-grid"></div>`, 1);
var root_6$2 = /* @__PURE__ */ template(`<h3 class="item"> </h3> <div class="stat-grid"></div>`, 1);
var root_9$1 = /* @__PURE__ */ template(`<h3 class="item"> </h3> <div class="stat-grid"></div>`, 1);
var root_11 = /* @__PURE__ */ template(`<h3 class="item"> </h3> <div class="stat-grid"></div>`, 1);
var root_13 = /* @__PURE__ */ template(`<h3 class="item"> </h3> <div class="stat-grid single-column"></div>`, 1);
var root$f = /* @__PURE__ */ template(`<div class="sr3e-waterfall-wrapper"><div><!> <!> <!> <!> <!> <!> <!> <!></div></div>`);
function MetatypeApp($$anchor, $$props) {
  push($$props, true);
  let item2 = prop($$props, "item", 23, () => ({})), config = prop($$props, "config", 19, () => ({}));
  const system = proxy(item2().system);
  const attributes = config().attributes;
  const common = config().common;
  const karmaConfig = config().karma;
  const traits = config().traits;
  let layoutMode = "double";
  const agerange = /* @__PURE__ */ derived$1(() => [
    {
      item: item2(),
      key: "min",
      label: localize(common.min),
      value: system.agerange.min,
      path: "system.agerange",
      type: "number",
      options: []
    },
    {
      item: item2(),
      key: "average",
      label: localize(common.average),
      value: system.agerange.average,
      path: "system.agerange",
      type: "number",
      options: []
    },
    {
      item: item2(),
      key: "max",
      label: localize(common.max),
      value: system.agerange.max,
      path: "system.agerange",
      type: "number",
      options: []
    }
  ]);
  const height = /* @__PURE__ */ derived$1(() => [
    {
      item: item2(),
      key: "min",
      label: localize(common.min),
      value: system.physical.height.min,
      path: "system.physical.height",
      type: "number",
      options: []
    },
    {
      item: item2(),
      key: "average",
      label: localize(common.average),
      value: system.physical.height.average,
      path: "system.physical.height",
      type: "number",
      options: []
    },
    {
      item: item2(),
      key: "max",
      label: localize(common.max),
      value: system.physical.height.max,
      path: "system.physical.height",
      type: "number",
      options: []
    }
  ]);
  const weight = /* @__PURE__ */ derived$1(() => [
    {
      item: item2(),
      key: "min",
      label: localize(common.min),
      value: system.physical.weight.min,
      path: "system.physical.weight",
      type: "number",
      options: []
    },
    {
      item: item2(),
      key: "average",
      label: localize(common.average),
      value: system.physical.weight.average,
      path: "system.physical.weight",
      type: "number",
      options: []
    },
    {
      item: item2(),
      key: "max",
      label: localize(common.max),
      value: system.physical.weight.max,
      path: "system.physical.weight",
      type: "number",
      options: []
    }
  ]);
  const karma = /* @__PURE__ */ derived$1(() => [
    {
      item: item2(),
      key: "factor",
      label: localize(karmaConfig.advancementratio),
      value: system.karma.factor,
      path: "system.karma",
      type: "number",
      options: []
    }
  ]);
  const attributeLimits = /* @__PURE__ */ derived$1(() => [
    {
      item: item2(),
      key: "strength",
      label: localize(attributes.strength),
      value: system.attributeLimits.strength,
      path: "system.attributeLimits",
      type: "number",
      options: []
    },
    {
      item: item2(),
      key: "quickness",
      label: localize(attributes.quickness),
      value: system.attributeLimits.quickness,
      path: "system.attributeLimits",
      type: "number",
      options: []
    },
    {
      item: item2(),
      key: "body",
      label: localize(attributes.body),
      value: system.attributeLimits.body,
      path: "system.attributeLimits",
      type: "number",
      options: []
    },
    {
      item: item2(),
      key: "charisma",
      label: localize(attributes.charisma),
      value: system.attributeLimits.charisma,
      path: "system.attributeLimits",
      type: "number",
      options: []
    },
    {
      item: item2(),
      key: "intelligence",
      label: localize(attributes.intelligence),
      value: system.attributeLimits.intelligence,
      path: "system.attributeLimits",
      type: "number",
      options: []
    },
    {
      item: item2(),
      key: "willpower",
      label: localize(attributes.willpower),
      value: system.attributeLimits.willpower,
      path: "system.attributeLimits",
      type: "number",
      options: []
    }
  ]);
  const priorityEntry = /* @__PURE__ */ derived$1(() => ({
    item: item2(),
    key: "priority",
    label: "Select Priority",
    value: system.priority,
    path: "system",
    type: "select",
    options: ["C", "D", "E"]
  }));
  var div = root$f();
  var div_1 = child(div);
  var node = child(div_1);
  ItemSheetComponent(node, {
    children: ($$anchor2, $$slotProps) => {
      var fragment = root_1$a();
      var node_1 = first_child(fragment);
      Image(node_1, {
        get entity() {
          return item2();
        }
      });
      var input = sibling(node_1, 2);
      input.__change = [on_change$6, item2];
      var node_2 = sibling(input, 2);
      StatCard(node_2, spread_props(() => get$1(priorityEntry)));
      bind_value(input, () => item2().name, ($$value) => item2().name = $$value);
      append($$anchor2, fragment);
    }
  });
  var node_3 = sibling(node, 2);
  {
    var consequent = ($$anchor2) => {
      ItemSheetComponent($$anchor2, {
        children: ($$anchor3, $$slotProps) => {
          var fragment_2 = root_3$6();
          var h3 = first_child(fragment_2);
          var text2 = child(h3);
          var div_2 = sibling(h3, 2);
          each(div_2, 21, () => get$1(agerange), index, ($$anchor4, entry) => {
            StatCard($$anchor4, spread_props(() => get$1(entry)));
          });
          template_effect(($0) => set_text(text2, $0), [() => localize(traits.agerange)]);
          append($$anchor3, fragment_2);
        }
      });
    };
    if_block(node_3, ($$render) => {
      if (get$1(agerange)) $$render(consequent);
    });
  }
  var node_4 = sibling(node_3, 2);
  {
    var consequent_1 = ($$anchor2) => {
      ItemSheetComponent($$anchor2, {
        children: ($$anchor3, $$slotProps) => {
          var fragment_5 = root_6$2();
          var h3_1 = first_child(fragment_5);
          var text_1 = child(h3_1);
          var div_3 = sibling(h3_1, 2);
          each(div_3, 21, () => get$1(height), index, ($$anchor4, entry) => {
            StatCard($$anchor4, spread_props(() => get$1(entry)));
          });
          template_effect(($0) => set_text(text_1, $0), [() => localize(traits.height)]);
          append($$anchor3, fragment_5);
        }
      });
    };
    if_block(node_4, ($$render) => {
      if (get$1(height)) $$render(consequent_1);
    });
  }
  var node_5 = sibling(node_4, 2);
  {
    var consequent_2 = ($$anchor2) => {
      ItemSheetComponent($$anchor2, {
        children: ($$anchor3, $$slotProps) => {
          var fragment_8 = root_9$1();
          var h3_2 = first_child(fragment_8);
          var text_2 = child(h3_2);
          var div_4 = sibling(h3_2, 2);
          each(div_4, 21, () => get$1(weight), index, ($$anchor4, entry) => {
            StatCard($$anchor4, spread_props(() => get$1(entry)));
          });
          template_effect(($0) => set_text(text_2, $0), [() => localize(traits.weight)]);
          append($$anchor3, fragment_8);
        }
      });
    };
    if_block(node_5, ($$render) => {
      if (get$1(weight)) $$render(consequent_2);
    });
  }
  var node_6 = sibling(node_5, 2);
  ItemSheetComponent(node_6, {
    children: ($$anchor2, $$slotProps) => {
      var fragment_10 = root_11();
      var h3_3 = first_child(fragment_10);
      var text_3 = child(h3_3);
      var div_5 = sibling(h3_3, 2);
      each(div_5, 21, () => get$1(attributeLimits), index, ($$anchor3, entry) => {
        StatCard($$anchor3, spread_props(() => get$1(entry)));
      });
      template_effect(($0) => set_text(text_3, $0), [() => localize(attributes.limits)]);
      append($$anchor2, fragment_10);
    }
  });
  var node_7 = sibling(node_6, 2);
  ItemSheetComponent(node_7, {
    children: ($$anchor2, $$slotProps) => {
      var fragment_12 = root_13();
      var h3_4 = first_child(fragment_12);
      var text_4 = child(h3_4);
      var div_6 = sibling(h3_4, 2);
      each(div_6, 21, () => get$1(karma), index, ($$anchor3, entry) => {
        StatCard($$anchor3, spread_props(() => get$1(entry)));
      });
      template_effect(($0) => set_text(text_4, $0), [() => localize(config().karma.karma)]);
      append($$anchor2, fragment_12);
    }
  });
  var node_8 = sibling(node_7, 2);
  ItemSheetComponent(node_8, {
    children: ($$anchor2, $$slotProps) => {
      ActiveEffectsViewer($$anchor2, {
        get document() {
          return item2();
        },
        get config() {
          return config();
        },
        isSlim: true
      });
    }
  });
  var node_9 = sibling(node_8, 2);
  JournalViewer(node_9, {
    get document() {
      return item2();
    },
    get config() {
      return config();
    }
  });
  template_effect(() => set_class(div_1, `sr3e-waterfall sr3e-waterfall--${layoutMode}`));
  append($$anchor, div);
  pop();
}
delegate(["change"]);
class MetatypeItemSheet extends foundry.applications.sheets.ItemSheetV2 {
  constructor() {
    super(...arguments);
    __privateAdd(this, _metatype);
  }
  get title() {
    return `${localize(CONFIG.sr3e.traits.metatype)}: ${this.item.name}`;
  }
  static get DEFAULT_OPTIONS() {
    return {
      ...super.DEFAULT_OPTIONS,
      id: `sr3e-item-sheet-${foundry.utils.randomID()}`,
      classes: ["sr3e", "sheet", "item", "metatype"],
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
    if (__privateGet(this, _metatype)) {
      unmount(__privateGet(this, _metatype));
      __privateSet(this, _metatype, null);
    }
    __privateSet(this, _metatype, mount(MetatypeApp, {
      target: windowContent,
      props: {
        item: this.document,
        config: CONFIG.sr3e
      }
    }));
    return windowContent;
  }
  async _tearDown() {
    if (__privateGet(this, _metatype)) await unmount(__privateGet(this, _metatype));
    __privateSet(this, _metatype, null);
    return super._tearDown();
  }
  /** @override prevent submission, since Svelte is managing state */
  _onSubmit(event2) {
    return;
  }
}
_metatype = new WeakMap();
var on_change$5 = (e, item2) => item2().update({ name: e.target.value });
var root_2$7 = /* @__PURE__ */ template(`<input>`);
var root_1$9 = /* @__PURE__ */ template(`<!> <div class="stat-grid single-column"><!> <!> <!></div>`, 1);
var root_3$5 = /* @__PURE__ */ template(`<!> <!> <!>`, 1);
var root$e = /* @__PURE__ */ template(`<div class="sr3e-waterfall-wrapper"><div><!> <!> <!></div></div>`);
function MagicApp($$anchor, $$props) {
  push($$props, true);
  let item2 = prop($$props, "item", 23, () => ({})), config = prop($$props, "config", 19, () => ({}));
  const system = proxy(item2().system);
  const awakened = proxy(system.awakened);
  const magicianData = proxy(system.magicianData);
  proxy(awakened.adeptData);
  const labels = config().magic;
  let layoutMode = "double";
  const archetypeOptions = [
    localize(labels.adept),
    localize(labels.magician)
  ];
  const magicianTypeOptions = [
    localize(labels.fullmage),
    localize(labels.aspectedmage)
  ];
  const aspectsOptions = [
    localize(labels.conjurer),
    localize(labels.sorcerer),
    localize(labels.elementalist),
    localize(config().common.custom)
  ];
  const resistanceAttributeOptions = [
    localize(config().attributes.willpower),
    localize(config().attributes.charisma),
    localize(config().attributes.intelligence)
  ];
  const traditionOptions = [
    localize(labels.hermetic),
    localize(labels.shamanic),
    localize(config().common.other)
  ];
  const archetype = /* @__PURE__ */ derived$1(() => ({
    item: item2(),
    key: "archetype",
    label: localize(labels.archetype),
    value: awakened.archetype,
    path: "system.awakened",
    type: "select",
    options: archetypeOptions
  }));
  const priority = /* @__PURE__ */ derived$1(() => ({
    item: item2(),
    key: "priority",
    label: localize(labels.priority),
    value: awakened.priority,
    path: "system.awakened",
    type: "select",
    options: ["A", "B"]
  }));
  const magicianType = /* @__PURE__ */ derived$1(() => ({
    item: item2(),
    key: "magicianType",
    label: localize(labels.magicianType),
    value: magicianData.magicianType,
    path: "system.magicianData",
    type: "select",
    options: magicianTypeOptions
  }));
  const aspect = /* @__PURE__ */ derived$1(() => ({
    item: item2(),
    key: "aspect",
    label: localize(labels.aspect),
    value: magicianData.aspect,
    path: "system.magicianData",
    type: "select",
    options: aspectsOptions
  }));
  const magicianFields = /* @__PURE__ */ derived$1(() => [
    {
      item: item2(),
      key: "tradition",
      label: localize(labels.tradition),
      value: magicianData.tradition,
      path: "system.magicianData",
      type: "select",
      options: traditionOptions
    },
    {
      item: item2(),
      key: "drainResistanceAttribute",
      label: localize(labels.drainResistanceAttribute),
      value: magicianData.drainResistanceAttribute,
      path: "system.magicianData",
      type: "select",
      options: resistanceAttributeOptions
    },
    {
      item: item2(),
      key: "canAstrallyProject",
      label: localize(labels.canAstrallyProject),
      value: magicianData.canAstrallyProject,
      path: "system.magicianData",
      type: "checkbox",
      options: []
    },
    {
      item: item2(),
      key: "totem",
      label: localize(labels.totem),
      value: magicianData.totem ?? localize(labels.shamannote),
      path: "system.magicianData",
      type: "text",
      options: []
    }
  ]);
  const adeptFields = /* @__PURE__ */ derived$1(() => []);
  let isAspected = state(false);
  user_effect(() => {
    set(isAspected, get$1(magicianType).value === localize(labels.aspectedmage));
  });
  var div = root$e();
  var div_1 = child(div);
  var node = child(div_1);
  ItemSheetComponent(node, {
    children: ($$anchor2, $$slotProps) => {
      var fragment = root_1$9();
      var node_1 = first_child(fragment);
      Image(node_1, {
        get entity() {
          return item2();
        }
      });
      var div_2 = sibling(node_1, 2);
      var node_2 = child(div_2);
      StatCard(node_2, {
        children: ($$anchor3, $$slotProps2) => {
          var input = root_2$7();
          input.__change = [on_change$5, item2];
          bind_value(input, () => item2().name, ($$value) => item2().name = $$value);
          append($$anchor3, input);
        },
        $$slots: { default: true }
      });
      var node_3 = sibling(node_2, 2);
      StatCard(node_3, spread_props(() => get$1(archetype)));
      var node_4 = sibling(node_3, 2);
      StatCard(node_4, spread_props(() => get$1(priority)));
      append($$anchor2, fragment);
    }
  });
  var node_5 = sibling(node, 2);
  {
    var consequent_1 = ($$anchor2) => {
      var fragment_1 = root_3$5();
      var node_6 = first_child(fragment_1);
      ItemSheetComponent(node_6, {
        children: ($$anchor3, $$slotProps) => {
          StatCard($$anchor3, spread_props(() => get$1(magicianType)));
        }
      });
      var node_7 = sibling(node_6, 2);
      {
        var consequent = ($$anchor3) => {
          ItemSheetComponent($$anchor3, {
            children: ($$anchor4, $$slotProps) => {
              StatCard($$anchor4, spread_props(() => get$1(aspect)));
            }
          });
        };
        if_block(node_7, ($$render) => {
          if (get$1(isAspected)) $$render(consequent);
        });
      }
      var node_8 = sibling(node_7, 2);
      each(node_8, 17, () => get$1(magicianFields), index, ($$anchor3, entry) => {
        ItemSheetComponent($$anchor3, {
          children: ($$anchor4, $$slotProps) => {
            StatCard($$anchor4, spread_props(() => get$1(entry)));
          }
        });
      });
      append($$anchor2, fragment_1);
    };
    var alternate = ($$anchor2) => {
      var fragment_7 = comment();
      var node_9 = first_child(fragment_7);
      {
        var consequent_2 = ($$anchor3) => {
          var fragment_8 = comment();
          var node_10 = first_child(fragment_8);
          each(node_10, 17, () => get$1(adeptFields), index, ($$anchor4, entry) => {
            ItemSheetComponent($$anchor4, {
              children: ($$anchor5, $$slotProps) => {
                StatCard($$anchor5, spread_props(() => get$1(entry)));
              }
            });
          });
          append($$anchor3, fragment_8);
        };
        if_block(
          node_9,
          ($$render) => {
            if (awakened.archetype === get$1(archetype).options[0]) $$render(consequent_2);
          },
          true
        );
      }
      append($$anchor2, fragment_7);
    };
    if_block(node_5, ($$render) => {
      if (awakened.archetype === get$1(archetype).options[1]) $$render(consequent_1);
      else $$render(alternate, false);
    });
  }
  var node_11 = sibling(node_5, 2);
  JournalViewer(node_11, {
    get document() {
      return item2();
    },
    get config() {
      return config();
    }
  });
  template_effect(() => set_class(div_1, `sr3e-waterfall sr3e-waterfall--${layoutMode}`));
  append($$anchor, div);
  pop();
}
delegate(["change"]);
class MagicItemSheet extends foundry.applications.sheets.ItemSheetV2 {
  constructor() {
    super(...arguments);
    __privateAdd(this, _magic);
  }
  get title() {
    return `${localize(CONFIG.sr3e.magic.magician)}: ${this.item.name}`;
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
}
_magic = new WeakMap();
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
        magicianType: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),
        tradition: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),
        drainResistanceAttribute: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),
        aspect: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),
        canAstrallyProject: new foundry.data.fields.BooleanField({
          required: false,
          initial: false
        }),
        totem: new foundry.data.fields.StringField({
          required: false,
          initial: ""
        }),
        //NOTE: Not exposed in the magic sheet
        spellPoints: new foundry.data.fields.NumberField({
          required: false,
          initial: 0
        })
      }),
      adeptData: new foundry.data.fields.SchemaField({
        //NOTE: Not exposed in the magic sheet
        powerPoints: new foundry.data.fields.NumberField({
          required: false,
          initial: 0
        })
      })
    };
  }
}
var root_1$8 = /* @__PURE__ */ template(`<h3> </h3> <div></div>`, 1);
function Commodity($$anchor, $$props) {
  push($$props, true);
  let gridCss = prop($$props, "gridCss", 3, "");
  const system = proxy($$props.item.system);
  const commodity = system.commodity;
  const entries = [
    {
      item: $$props.item,
      key: "days",
      label: localize($$props.config.commodity.days),
      value: commodity.days,
      path: "system.commodity",
      type: "number"
    },
    {
      item: $$props.item,
      key: "cost",
      label: localize($$props.config.commodity.cost),
      value: commodity.cost,
      path: "system.commodity",
      type: "number"
    },
    {
      item: $$props.item,
      key: "streetIndex",
      label: localize($$props.config.commodity.streetIndex),
      value: commodity.streetIndex,
      path: "system.commodity",
      type: "number"
    },
    {
      item: $$props.item,
      key: "restrictionLevel",
      label: localize($$props.config.commodity.restrictionLevel),
      value: commodity.legality.restrictionLevel,
      path: "system.commodity.legality",
      type: "number"
    },
    {
      item: $$props.item,
      key: "type",
      label: localize($$props.config.commodity.legalityType),
      value: commodity.legality.type,
      path: "system.commodity.legality",
      type: "text"
    },
    {
      item: $$props.item,
      key: "category",
      label: localize($$props.config.commodity.legalityCategory),
      value: commodity.legality.category,
      path: "system.commodity.legality",
      type: "text"
    },
    {
      item: $$props.item,
      key: "isBroken",
      label: localize($$props.config.commodity.isBroken),
      value: commodity.isBroken,
      path: "system.commodity",
      type: "checkbox"
    }
  ];
  ItemSheetComponent($$anchor, {
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = root_1$8();
      var h3 = first_child(fragment_1);
      var text2 = child(h3);
      var div = sibling(h3, 2);
      each(div, 21, () => entries, index, ($$anchor3, entry) => {
        StatCard($$anchor3, spread_props(() => get$1(entry)));
      });
      template_effect(
        ($0) => {
          set_text(text2, $0);
          set_class(div, `stat-grid ${gridCss() ?? ""}`);
        },
        [
          () => localize($$props.config.commodity.commodity)
        ]
      );
      append($$anchor2, fragment_1);
    }
  });
  pop();
}
var root$d = /* @__PURE__ */ template(`<div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><h3> </h3> <div></div></div></div></div>`);
function Portability($$anchor, $$props) {
  push($$props, true);
  const system = proxy($$props.item.system);
  const portability = system.portability;
  const entries = [
    {
      item: $$props.item,
      key: "conceal",
      label: localize($$props.config.portability.concealability),
      value: portability.conceal,
      path: "system.portability",
      type: "number"
    },
    {
      item: $$props.item,
      key: "weight",
      label: localize($$props.config.portability.weight),
      value: portability.weight,
      path: "system.portability",
      type: "number"
    }
  ];
  var div = root$d();
  var div_1 = child(div);
  var div_2 = sibling(child(div_1), 2);
  var h3 = child(div_2);
  var text2 = child(h3);
  var div_3 = sibling(h3, 2);
  each(div_3, 21, () => entries, index, ($$anchor2, entry) => {
    StatCard($$anchor2, spread_props(() => get$1(entry)));
  });
  template_effect(
    ($0) => {
      set_text(text2, $0);
      set_class(div_3, `stat-grid ${$$props.gridCss ?? ""}`);
    },
    [
      () => localize($$props.config.portability.portability)
    ]
  );
  append($$anchor, div);
  pop();
}
var on_change$4 = (e, item2) => item2().update({ name: e.target.value });
var root_2$6 = /* @__PURE__ */ template(`<input class="large" name="name" type="text">`);
var root_1$7 = /* @__PURE__ */ template(`<!> <div class="stat-grid single-column"><!></div>`, 1);
var root_3$4 = /* @__PURE__ */ template(`<h3> </h3> <div class="stat-grid single-column"><!></div> <div class="stat-grid two-column"></div>`, 1);
var root$c = /* @__PURE__ */ template(`<div class="sr3e-waterfall-wrapper"><div><!> <!> <!> <!> <!></div></div>`);
function WeaponApp($$anchor, $$props) {
  push($$props, true);
  let layoutMode = "double";
  let item2 = prop($$props, "item", 23, () => ({})), config = prop($$props, "config", 19, () => ({}));
  const system = proxy(item2().system);
  const weapon = system.weapon;
  const weaponMode = {
    item: item2(),
    key: "mode",
    label: "Mode",
    value: weapon.mode,
    path: "system.weapon",
    type: "select",
    options: [
      localize(config().weapon.manual),
      localize(config().weapon.semiauto),
      localize(config().weapon.fullauto),
      localize(config().weapon.blade),
      localize(config().weapon.explosive),
      localize(config().weapon.energy),
      localize(config().weapon.blunt)
    ]
  };
  const weaponEntries = [
    {
      item: item2(),
      key: "damage",
      label: localize(config().weapon.damage),
      value: weapon.damage,
      path: "system.weapon",
      type: "text"
    },
    {
      item: item2(),
      key: "range",
      label: localize(config().weapon.range),
      value: weapon.range,
      path: "system.weapon",
      type: "number"
    },
    {
      item: item2(),
      key: "recoilComp",
      label: localize(config().weapon.recoilCompensation),
      value: weapon.recoilComp,
      path: "system.weapon",
      type: "number"
    },
    {
      item: item2(),
      key: "currentClipId",
      label: localize(config().weapon.currentClip),
      value: weapon.currentClipId,
      path: "system.weapon",
      type: "text"
    }
  ];
  var div = root$c();
  var div_1 = child(div);
  var node = child(div_1);
  ItemSheetComponent(node, {
    children: ($$anchor2, $$slotProps) => {
      var fragment = root_1$7();
      var node_1 = first_child(fragment);
      Image(node_1, {
        get src() {
          return item2().img;
        },
        get title() {
          return item2().name;
        }
      });
      var div_2 = sibling(node_1, 2);
      var node_2 = child(div_2);
      StatCard(node_2, {
        children: ($$anchor3, $$slotProps2) => {
          var input = root_2$6();
          input.__change = [on_change$4, item2];
          bind_value(input, () => item2().name, ($$value) => item2().name = $$value);
          append($$anchor3, input);
        },
        $$slots: { default: true }
      });
      append($$anchor2, fragment);
    }
  });
  var node_3 = sibling(node, 2);
  ItemSheetComponent(node_3, {
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = root_3$4();
      var h3 = first_child(fragment_1);
      var text2 = child(h3);
      var div_3 = sibling(h3, 2);
      var node_4 = child(div_3);
      StatCard(node_4, spread_props(weaponMode));
      var div_4 = sibling(div_3, 2);
      each(div_4, 21, () => weaponEntries, index, ($$anchor3, entry) => {
        StatCard($$anchor3, spread_props(() => get$1(entry)));
      });
      template_effect(($0) => set_text(text2, $0), [
        () => localize(config().common.details)
      ]);
      append($$anchor2, fragment_1);
    }
  });
  var node_5 = sibling(node_3, 2);
  Commodity(node_5, {
    get item() {
      return item2();
    },
    get config() {
      return config();
    },
    gridCss: "two-column"
  });
  var node_6 = sibling(node_5, 2);
  Portability(node_6, {
    get item() {
      return item2();
    },
    get config() {
      return config();
    },
    gridCss: "two-column"
  });
  var node_7 = sibling(node_6, 2);
  JournalViewer(node_7, {
    get document() {
      return item2();
    },
    get config() {
      return config();
    }
  });
  template_effect(() => set_class(div_1, `sr3e-waterfall sr3e-waterfall--${layoutMode}`));
  append($$anchor, div);
  pop();
}
delegate(["change"]);
class WeaponItemSheet extends foundry.applications.sheets.ItemSheetV2 {
  constructor() {
    super(...arguments);
    __privateAdd(this, _weapon);
  }
  get title() {
    return `${localize(CONFIG.sr3e.weapon.weapon)}: ${this.item.name}`;
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
    if (__privateGet(this, _weapon)) {
      unmount(__privateGet(this, _weapon));
      __privateSet(this, _weapon, null);
    }
    __privateSet(this, _weapon, mount(WeaponApp, {
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
_weapon = new WeakMap();
class CommodityModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      commodity: new foundry.data.fields.SchemaField({
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
        isBroken: new foundry.data.fields.BooleanField({ initial: false })
      })
    };
  }
}
class PortabilityModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      portability: new foundry.data.fields.SchemaField({
        conceal: new foundry.data.fields.NumberField({
          required: true,
          initial: 0
        }),
        weight: new foundry.data.fields.NumberField({
          required: true,
          initial: 0
        })
      })
    };
  }
}
class WeaponModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      weapon: new foundry.data.fields.SchemaField({
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
        })
      }),
      ...PortabilityModel.defineSchema(),
      ...CommodityModel.defineSchema()
    };
  }
}
class AmmunitionModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      type: new foundry.data.fields.StringField({
        required: true,
        initial: "regular"
      }),
      rounds: new foundry.data.fields.NumberField({
        required: true,
        initial: 10,
        integer: true
      }),
      compatibleWeaponIds: new foundry.data.fields.ArrayField(
        new foundry.data.fields.StringField()
      ),
      ...PortabilityModel.defineSchema(),
      ...CommodityModel.defineSchema()
    };
  }
}
var on_change$3 = (e, item2) => item2().update({ name: e.target.value });
var root_1$6 = /* @__PURE__ */ template(`<!> <input> <div class="stat-grid two-column"></div>`, 1);
var root$b = /* @__PURE__ */ template(`<div class="sr3e-waterfall-wrapper"><div><!> <!> <!> <!></div></div>`);
function AmmunitionApp($$anchor, $$props) {
  push($$props, true);
  let item2 = prop($$props, "item", 23, () => ({})), config = prop($$props, "config", 19, () => ({}));
  const ammunition = item2().system;
  let layoutMode = "single";
  const ammoEntries = [
    {
      item: item2(),
      key: "type",
      label: localize(config().ammunition.type),
      value: ammunition.type,
      path: "system.ammunition",
      type: "text"
    },
    {
      item: item2(),
      key: "rounds",
      label: localize(config().ammunition.rounds),
      value: ammunition.rounds,
      path: "system.ammunition",
      type: "number"
    }
  ];
  var div = root$b();
  var div_1 = child(div);
  var node = child(div_1);
  ItemSheetComponent(node, {
    children: ($$anchor2, $$slotProps) => {
      var fragment = root_1$6();
      var node_1 = first_child(fragment);
      Image(node_1, {
        get src() {
          return item2().img;
        },
        get title() {
          return item2().name;
        }
      });
      var input = sibling(node_1, 2);
      input.__change = [on_change$3, item2];
      var div_2 = sibling(input, 2);
      each(div_2, 21, () => ammoEntries, index, ($$anchor3, entry) => {
        StatCard($$anchor3, spread_props(() => get$1(entry)));
      });
      bind_value(input, () => item2().name, ($$value) => item2().name = $$value);
      append($$anchor2, fragment);
    }
  });
  var node_2 = sibling(node, 2);
  Commodity(node_2, {
    get item() {
      return item2();
    },
    get config() {
      return config();
    },
    gridCss: "two-column"
  });
  var node_3 = sibling(node_2, 2);
  Portability(node_3, {
    get item() {
      return item2();
    },
    get config() {
      return config();
    },
    gridCss: "two-column"
  });
  var node_4 = sibling(node_3, 2);
  JournalViewer(node_4, {
    get document() {
      return item2();
    },
    get config() {
      return config();
    }
  });
  template_effect(() => set_class(div_1, `sr3e-waterfall sr3e-waterfall--${layoutMode}`));
  append($$anchor, div);
  pop();
}
delegate(["change"]);
class AmmunitionItemSheet extends foundry.applications.sheets.ItemSheetV2 {
  constructor() {
    super(...arguments);
    __privateAdd(this, _ammunition);
  }
  get title() {
    return `${localize(CONFIG.sr3e.ammunition.ammunition)}: ${this.item.name}`;
  }
  static get DEFAULT_OPTIONS() {
    return {
      ...super.DEFAULT_OPTIONS,
      id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
      classes: ["sr3e", "sheet", "item", "ammunition"],
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
    if (__privateGet(this, _ammunition)) {
      unmount(__privateGet(this, _ammunition));
      __privateSet(this, _ammunition, null);
    }
    __privateSet(this, _ammunition, mount(AmmunitionApp, {
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
_ammunition = new WeakMap();
var on_change$2 = (e, item2) => item2().update({ name: e.target.value });
var root_2$5 = /* @__PURE__ */ template(`<div class="stat-card-background"></div> <input class="large" name="name" type="text">`, 1);
var on_change_1$1 = (e, updateSkillType) => updateSkillType(e.target.value);
var root_4$5 = /* @__PURE__ */ template(`<option> </option>`);
var root_3$3 = /* @__PURE__ */ template(`<select></select>`);
var on_change_2 = (e, item2) => item2().update({
  "system.activeSkill.linkedAttribute": e.target.value
});
var root_7 = /* @__PURE__ */ template(`<option> </option>`);
var root_6$1 = /* @__PURE__ */ template(`<select><option disabled> </option><!></select>`);
var on_change_3 = (e, item2) => item2().update({
  "system.activeSkill.associatedDicePool": e.target.value
});
var root_9 = /* @__PURE__ */ template(`<option> </option>`);
var root_8$1 = /* @__PURE__ */ template(`<select><option disabled selected> </option><option> </option><!></select>`);
var root_5$3 = /* @__PURE__ */ template(`<!> <!>`, 1);
var root_1$5 = /* @__PURE__ */ template(`<!> <div class="stat-grid single-column"><!> <!> <!></div>`, 1);
var root$a = /* @__PURE__ */ template(`<div class="sr3e-waterfall-wrapper"><div><!> <!></div></div>`);
function SkillApp($$anchor, $$props) {
  push($$props, true);
  let item2 = prop($$props, "item", 7);
  let layoutMode = "single";
  let value = state(proxy(item2().system.skillType));
  state(`${item2().system.amount} ¥`);
  const typeOfSkillSelectOptions = [
    {
      value: "active",
      label: localize($$props.config.skill.active)
    },
    {
      value: "knowledge",
      label: localize($$props.config.skill.knowledge)
    },
    {
      value: "language",
      label: localize($$props.config.skill.language)
    }
  ];
  const baseAttributeKeys = [
    "body",
    "quickness",
    "strength",
    "charisma",
    "intelligence",
    "willpower",
    "reaction"
  ];
  const attributeOptions = baseAttributeKeys.map((key) => ({
    value: key,
    label: localize($$props.config.attributes[key])
  }));
  const associatedDicepoolKeys = [
    "astral",
    "combat",
    "hacking",
    "control",
    "spell"
  ];
  const dicePoolOptions = associatedDicepoolKeys.map((key) => ({
    value: key,
    label: localize($$props.config.dicepools[key])
  }));
  function updateSkillType(type) {
    set(value, proxy(type));
    item2().update({ "system.skillType": type });
  }
  var div = root$a();
  var div_1 = child(div);
  var node = child(div_1);
  ItemSheetComponent(node, {
    children: ($$anchor2, $$slotProps) => {
      var fragment = root_1$5();
      var node_1 = first_child(fragment);
      Image(node_1, {
        get src() {
          return item2().img;
        },
        get title() {
          return item2().name;
        }
      });
      var div_2 = sibling(node_1, 2);
      var node_2 = child(div_2);
      StatCard$1(node_2, {
        children: ($$anchor3, $$slotProps2) => {
          var fragment_1 = root_2$5();
          var input = sibling(first_child(fragment_1), 2);
          input.__change = [on_change$2, item2];
          template_effect(() => set_value(input, item2().name));
          append($$anchor3, fragment_1);
        },
        $$slots: { default: true }
      });
      var node_3 = sibling(node_2, 2);
      StatCard$1(node_3, {
        children: ($$anchor3, $$slotProps2) => {
          var select = root_3$3();
          init_select(select, () => get$1(value));
          var select_value;
          select.__change = [on_change_1$1, updateSkillType];
          each(select, 21, () => typeOfSkillSelectOptions, index, ($$anchor4, option) => {
            var option_1 = root_4$5();
            var option_1_value = {};
            var text2 = child(option_1);
            template_effect(() => {
              if (option_1_value !== (option_1_value = get$1(option).value)) {
                option_1.value = null == (option_1.__value = get$1(option).value) ? "" : get$1(option).value;
              }
              set_text(text2, get$1(option).label);
            });
            append($$anchor4, option_1);
          });
          template_effect(() => {
            if (select_value !== (select_value = get$1(value))) {
              select.value = null == (select.__value = get$1(value)) ? "" : get$1(value), select_option(select, get$1(value));
            }
          });
          append($$anchor3, select);
        },
        $$slots: { default: true }
      });
      var node_4 = sibling(node_3, 2);
      {
        var consequent = ($$anchor3) => {
          var fragment_2 = root_5$3();
          var node_5 = first_child(fragment_2);
          StatCard$1(node_5, {
            children: ($$anchor4, $$slotProps2) => {
              var select_1 = root_6$1();
              init_select(select_1, () => item2().system.activeSkill.linkedAttribute);
              var select_1_value;
              select_1.__change = [on_change_2, item2];
              var option_2 = child(select_1);
              option_2.value = null == (option_2.__value = "") ? "" : "";
              var text_1 = child(option_2);
              var node_6 = sibling(option_2);
              each(node_6, 17, () => attributeOptions, index, ($$anchor5, option) => {
                var option_3 = root_7();
                var option_3_value = {};
                var text_2 = child(option_3);
                template_effect(() => {
                  if (option_3_value !== (option_3_value = get$1(option).value)) {
                    option_3.value = null == (option_3.__value = get$1(option).value) ? "" : get$1(option).value;
                  }
                  set_text(text_2, get$1(option).label);
                });
                append($$anchor5, option_3);
              });
              template_effect(
                ($0) => {
                  if (select_1_value !== (select_1_value = item2().system.activeSkill.linkedAttribute)) {
                    select_1.value = null == (select_1.__value = item2().system.activeSkill.linkedAttribute) ? "" : item2().system.activeSkill.linkedAttribute, select_option(select_1, item2().system.activeSkill.linkedAttribute);
                  }
                  set_text(text_1, $0);
                },
                [
                  () => localize($$props.config.skill.linkedAttribute)
                ]
              );
              append($$anchor4, select_1);
            },
            $$slots: { default: true }
          });
          var node_7 = sibling(node_5, 2);
          StatCard$1(node_7, {
            children: ($$anchor4, $$slotProps2) => {
              var select_2 = root_8$1();
              init_select(select_2, () => item2().system.activeSkill.associatedDicePool);
              var select_2_value;
              select_2.__change = [on_change_3, item2];
              var option_4 = child(select_2);
              var text_3 = child(option_4);
              var option_5 = sibling(option_4);
              option_5.value = null == (option_5.__value = "") ? "" : "";
              var text_4 = child(option_5);
              var node_8 = sibling(option_5);
              each(node_8, 17, () => dicePoolOptions, index, ($$anchor5, option) => {
                var option_6 = root_9();
                var option_6_value = {};
                var text_5 = child(option_6);
                template_effect(() => {
                  if (option_6_value !== (option_6_value = get$1(option).value)) {
                    option_6.value = null == (option_6.__value = get$1(option).value) ? "" : get$1(option).value;
                  }
                  set_text(text_5, get$1(option).label);
                });
                append($$anchor5, option_6);
              });
              template_effect(
                ($0) => {
                  if (select_2_value !== (select_2_value = item2().system.activeSkill.associatedDicePool)) {
                    select_2.value = null == (select_2.__value = item2().system.activeSkill.associatedDicePool) ? "" : item2().system.activeSkill.associatedDicePool, select_option(select_2, item2().system.activeSkill.associatedDicePool);
                  }
                  set_text(text_3, $0);
                  set_text(text_4, $0);
                },
                [
                  () => localize($$props.config.dicepools.associateselect)
                ]
              );
              append($$anchor4, select_2);
            },
            $$slots: { default: true }
          });
          append($$anchor3, fragment_2);
        };
        if_block(node_4, ($$render) => {
          if (get$1(value) === "active") $$render(consequent);
        });
      }
      append($$anchor2, fragment);
    }
  });
  var node_9 = sibling(node, 2);
  JournalViewer(node_9, {
    get document() {
      return item2();
    },
    get config() {
      return $$props.config;
    }
  });
  template_effect(() => set_class(div_1, `sr3e-waterfall sr3e-waterfall--${layoutMode}`));
  append($$anchor, div);
  pop();
}
delegate(["change"]);
class SkillItemSheet extends foundry.applications.sheets.ItemSheetV2 {
  constructor() {
    super(...arguments);
    __privateAdd(this, _skill);
  }
  get title() {
    const type = this.item.system.skillType ?? "active";
    const typeLabel = localize(CONFIG.sr3e.skill[type]);
    return `${typeLabel}: ${this.item.name}`;
  }
  static get DEFAULT_OPTIONS() {
    return {
      ...super.DEFAULT_OPTIONS,
      id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
      classes: ["sr3e", "sheet", "item", "skill"],
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
    if (__privateGet(this, _skill)) {
      unmount(__privateGet(this, _skill));
      __privateSet(this, _skill, null);
    }
    __privateSet(this, _skill, mount(SkillApp, {
      target: windowContent,
      props: {
        item: this.document,
        config: CONFIG.sr3e,
        onTitleChange: (newTitle) => {
          const titleElement = this.element.querySelector(".window-title");
          if (titleElement) {
            titleElement.textContent = newTitle;
          }
        }
      }
    }));
    return windowContent;
  }
  /** @override prevent submission, since Svelte is managing state */
  _onSubmit(event2) {
    return;
  }
}
_skill = new WeakMap();
class SkillSpecialization extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      name: new foundry.data.fields.StringField({
        required: true,
        initial: ""
      }),
      value: new foundry.data.fields.NumberField({
        required: true,
        integer: true,
        initial: 0
      })
    };
  }
}
class SkillModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      skillType: new foundry.data.fields.StringField({
        required: true,
        initial: "active"
      }),
      activeSkill: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        }),
        linkedAttribute: new foundry.data.fields.StringField({
          required: true,
          initial: ""
        }),
        associatedDicePool: new foundry.data.fields.StringField({
          required: true,
          initial: ""
        }),
        specializations: new foundry.data.fields.ArrayField(
          new foundry.data.fields.SchemaField({
            ...SkillSpecialization.defineSchema()
          }),
          {
            initial: []
          }
        )
      }),
      knowledgeSkill: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        }),
        linkedAttribute: new foundry.data.fields.StringField({
          required: true,
          initial: "intelligence"
        }),
        specializations: new foundry.data.fields.ArrayField(
          new foundry.data.fields.SchemaField({
            ...SkillSpecialization.defineSchema()
          }),
          {
            initial: []
          }
        )
      }),
      languageSkill: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        }),
        linkedAttribute: new foundry.data.fields.StringField({
          required: true,
          initial: "intelligence"
        }),
        //lingos
        specializations: new foundry.data.fields.ArrayField(
          new foundry.data.fields.SchemaField({
            ...SkillSpecialization.defineSchema()
          }),
          {
            initial: []
          }
        ),
        readwrite: new foundry.data.fields.SchemaField({
          value: new foundry.data.fields.NumberField({
            required: true,
            initial: 0,
            integer: true
          })
        }),
        journalId: new foundry.data.fields.StringField({
          required: true,
          initial: ""
        })
      })
    };
  }
}
class CharacterGeneratorService {
  static generatePriorityCombination({ metatypeOptions = [], magicOptions = [] } = {}) {
    const priorities = [...this.VALID_PRIORITIES];
    console.log(`sr3d | Randomizer | Initial Priorities: ${priorities.join(", ")}`);
    const weights = {
      metatype: { E: 64, C: 18, D: 18 },
      magic: { A: 2, B: 2, C: 32, D: 32, E: 32 }
    };
    const combination = {};
    const isOnlyOneMeta = metatypeOptions.length === 1;
    combination.metatype = isOnlyOneMeta ? this._forcePriority(priorities, metatypeOptions[0].priority) : this._draw(priorities, weights.metatype);
    console.log(`sr3d | Randomizer | metatype Priority: ${combination.metatype}`);
    const isOnlyOneMagic = magicOptions.length === 1;
    combination.magic = isOnlyOneMagic ? this._forcePriority(priorities, magicOptions[0].priority) : this._draw(priorities, weights.magic);
    console.log(`sr3d | Randomizer | Magic Priority: ${combination.magic}`);
    ["attribute", "skills", "resources"].forEach((type) => {
      combination[type] = this._draw(priorities);
    });
    console.log("sr3d | Randomizer | Final Combination:", combination);
    return combination;
  }
  static _draw(priorities, weightMap = null) {
    if (!priorities.length) throw new Error("No valid priorities remaining.");
    let choice;
    if (weightMap) {
      const pool = priorities.flatMap((p) => Array(weightMap[p] || 0).fill(p));
      if (!pool.length) throw new Error("Weighted pool is empty.");
      choice = pool[Math.floor(Math.random() * pool.length)];
    } else {
      choice = priorities[Math.floor(Math.random() * priorities.length)];
    }
    priorities.splice(priorities.indexOf(choice), 1);
    return choice;
  }
  static _forcePriority(priorities, forced) {
    const index2 = priorities.indexOf(forced);
    if (index2 === -1) throw new Error(`Forced priority "${forced}" not available.`);
    priorities.splice(index2, 1);
    return forced;
  }
}
__publicField(CharacterGeneratorService, "VALID_PRIORITIES", ["A", "B", "C", "D", "E"]);
function handleClear(_, selectedmetatype, selectedMagic, selectedAttribute, selectedSkill, selectedResource, characterAge, characterHeight, characterWeight, metatypeItem, metatypes) {
  set(selectedmetatype, "");
  set(selectedMagic, "");
  set(selectedAttribute, "");
  set(selectedSkill, "");
  set(selectedResource, "");
  set(characterAge, 25);
  set(characterHeight, 175);
  set(characterWeight, 75);
  set(metatypeItem, proxy(get$1(metatypes).find((m) => m.name === "Human") || get$1(metatypes)[0]));
}
var root_1$4 = /* @__PURE__ */ template(`<option> </option>`);
var root_2$4 = /* @__PURE__ */ template(`<option> </option>`);
var root_3$2 = /* @__PURE__ */ template(`<option> </option>`);
var root_4$4 = /* @__PURE__ */ template(`<option> </option>`);
var root_5$2 = /* @__PURE__ */ template(`<option> </option>`);
var root$9 = /* @__PURE__ */ template(`<form><div class="sr3e-waterfall-wrapper"><div><div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><div class="image-mask"><img role="presentation" data-edit="img"></div> <input id="character-name" type="text" placeholder="Enter character name"></div></div></div> <div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><div for="age-slider"> </div> <input id="age-slider" type="range" step="1"> <div for="height-slider"> </div> <input id="height-slider" type="range" step="1"> <div for="weight-slider"> </div> <input id="weight-slider" type="range" step="1"></div></div></div> <div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><div><div class="creation-dropdwn"><h3> </h3> <select id="metatype-select"><option disabled selected hidden></option><!></select></div> <div class="creation-dropdwn"><h3> </h3> <select id="magic-select"><option disabled selected hidden></option><!></select></div> <div class="creation-dropdwn"><h3> </h3> <select id="attributes-select"><option disabled selected hidden></option><!></select></div> <div class="creation-dropdwn"><h3> </h3> <select id="skills-select"><option disabled selected hidden></option><!></select></div> <div class="creation-dropdwn"><h3> </h3> <select id="resource-select"><option disabled selected hidden></option><!></select></div></div></div></div></div> <div class="item-sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><div class="character-creation-buttonpanel"><button type="button"><i class="fas fa-dice"></i> </button> <button type="button"><i class="fas fa-eraser"></i> </button> <button type="submit"><i class="fas fa-check"></i> </button></div></div></div></div></div></div></form>`);
function CharacterCreationDialogApp($$anchor, $$props) {
  push($$props, true);
  let actor = prop($$props, "actor", 7);
  let layoutMode = "double";
  proxy(actor().system);
  let characterName = state(proxy(actor().name));
  let characterAge = state(25);
  let characterWeight = state(75);
  let characterHeight = state(175);
  let selectedmetatype = state("");
  let selectedMagic = state("");
  let selectedAttribute = state("");
  let selectedSkill = state("");
  let selectedResource = state("");
  let chooseAnOption = localize($$props.config.sheet.chooseanoption);
  let metatypeItem = state(null);
  let metatypes = state(proxy([]));
  let magics = state(proxy([]));
  onMount(async () => {
    var _a;
    set(metatypes, proxy(ItemDataService.getAllItemsOfType("metatype")));
    if (get$1(metatypes).length === 0) {
      const humanItem = ItemDataService.getDefaultHumanItem();
      await Item.create(humanItem);
      set(metatypes, proxy(ItemDataService.getAllItemsOfType("metatype")));
    }
    set(magics, proxy(ItemDataService.getAllItemsOfType("magic")));
    if (get$1(magics).length === 0) {
      const magicItem = ItemDataService.getDefaultMagic();
      await Item.create(magicItem);
      set(magics, proxy(ItemDataService.getAllItemsOfType("magic")));
    }
    set(metatypeItem, proxy(get$1(metatypes).find((m) => m.name === "Human") || get$1(metatypes)[0]));
    console.log("Available metatypes:", get$1(metatypes).map((m) => m.name));
    console.log("Selected default metatype:", (_a = get$1(metatypeItem)) == null ? void 0 : _a.name);
  });
  const metatypeDropdownOptions = /* @__PURE__ */ derived$1(() => ItemDataService.getAllMetatypes(get$1(metatypes)));
  const magicsDropdownOptions = /* @__PURE__ */ derived$1(() => ItemDataService.getAllMagics(get$1(magics)));
  const priorities = ActorDataService.getCharacterCreationStats();
  const attributPointDropdownOptions = priorities.attributes;
  const skillPointDropdownOptions = priorities.skills;
  const resourcesDropdownOptions = priorities.resources;
  CharacterGeneratorService.generatePriorityCombination(
    // svelte-ignore state_referenced_locally
    get$1(metatypes)[0],
    // svelte-ignore state_referenced_locally
    get$1(magics)[0]
  );
  console.log("CHARACTER", actor());
  user_effect(() => {
    if (get$1(selectedmetatype)) {
      const foundItem = get$1(metatypes).find((i) => i.id === get$1(selectedmetatype));
      if (foundItem) {
        set(metatypeItem, proxy(foundItem));
      }
    } else {
      const fallback = get$1(metatypes).find((m) => m.name === "Human") || get$1(metatypes)[0];
      if (fallback) {
        set(metatypeItem, proxy(fallback));
      }
    }
  });
  user_effect(() => {
    if (actor() && get$1(characterName) !== actor().name) {
      actor().name = get$1(characterName);
      if (get$1(characterName).length > 0) {
        actor().update({ name: get$1(characterName) });
      }
    }
  });
  let canCreate = /* @__PURE__ */ derived$1(() => get$1(selectedmetatype) && get$1(selectedMagic) && get$1(selectedAttribute) && get$1(selectedSkill) && get$1(selectedResource));
  let ageMin = 0;
  let ageMax = /* @__PURE__ */ derived$1(() => {
    var _a, _b, _c;
    return ((_c = (_b = (_a = get$1(metatypeItem)) == null ? void 0 : _a.system) == null ? void 0 : _b.agerange) == null ? void 0 : _c.max) ?? 100;
  });
  let lifespan = /* @__PURE__ */ derived$1(() => get$1(ageMax) - ageMin);
  let phaseTemplate = ActorDataService.getPhaseTemplate();
  let agePhases = /* @__PURE__ */ derived$1(() => phaseTemplate.map((p) => {
    const from = ageMin + p.from * get$1(lifespan);
    const to = ageMin + p.to * get$1(lifespan);
    const midpoint = (from + to) / 2;
    return {
      text: p.text,
      from,
      to,
      midpoint,
      percent: (midpoint - ageMin) / get$1(lifespan) * 100
    };
  }));
  let currentPhase = /* @__PURE__ */ derived$1(() => {
    var _a;
    return ((_a = get$1(agePhases).find((p) => get$1(characterAge) >= p.from && get$1(characterAge) <= p.to)) == null ? void 0 : _a.text) ?? "";
  });
  let usedPriorities = state(proxy([]));
  user_effect(() => {
    const arr = [];
    const m = get$1(metatypeDropdownOptions).find((o) => o.foundryitemid === get$1(selectedmetatype));
    if (m) arr.push(m.priority);
    const g = get$1(magicsDropdownOptions).find((o) => o.foundryitemid === get$1(selectedMagic));
    if (g) arr.push(g.priority);
    if (get$1(selectedAttribute)) arr.push(get$1(selectedAttribute));
    if (get$1(selectedSkill)) arr.push(get$1(selectedSkill));
    if (get$1(selectedResource)) arr.push(get$1(selectedResource));
    set(usedPriorities, proxy(arr));
  });
  async function handleSubmit(event2) {
    var _a;
    event2.preventDefault();
    console.log("Handle submit was entered");
    const metatype = get$1(metatypes).find((m) => m.id === get$1(selectedmetatype));
    const worldmetatype = game.items.get(metatype.id);
    const selectedAttributeObj = attributPointDropdownOptions.find((attr) => attr.priority === get$1(selectedAttribute));
    const selectedSkillObj = skillPointDropdownOptions.find((skill) => skill.priority === get$1(selectedSkill));
    let remainingPoints = selectedAttributeObj.points - 6;
    await actor().update({
      "system.profile.age": get$1(characterAge),
      "system.profile.height": get$1(characterHeight),
      "system.profile.weight": get$1(characterWeight),
      "system.creation.attributePoints": remainingPoints,
      "system.creation.activePoints": selectedSkillObj.points,
      "system.attributes.body.value": 1,
      "system.attributes.strength.value": 1,
      "system.attributes.charisma.value": 1,
      "system.attributes.willpower.value": 1,
      "system.attributes.quickness.value": 1,
      "system.attributes.intelligence.value": 1,
      "system.attributes.initiative.value": 1,
      "system.karma.karmaPool.value": 1
    });
    await actor().createEmbeddedDocuments("Item", [worldmetatype.toObject()]);
    const magic = get$1(magics).find((m) => m.id === get$1(selectedMagic));
    if (["A", "B"].includes(get$1(selectedMagic).priority)) {
      const worldMagic = game.items.get(magic.id);
      await actor().createEmbeddedDocuments("Item", [worldMagic.toObject()]);
      actor().setFlag(flags.sr3e, flags.actor.hasAwakened, true);
      await actor().update({ "system.attributes.magic.value": 6 });
    }
    (_a = $$props.onSubmit) == null ? void 0 : _a.call($$props, true);
    console.log("Handle submit was exited");
  }
  function handleRandomize() {
    let combo, metaOpts, magicOpts;
    do {
      combo = CharacterGeneratorService.generatePriorityCombination({
        metatypeOptions: get$1(metatypeDropdownOptions),
        magicOptions: get$1(magicsDropdownOptions)
      });
      metaOpts = get$1(metatypeDropdownOptions).filter((i) => i.priority === combo.metatype);
      magicOpts = get$1(magicsDropdownOptions).filter((i) => i.priority === combo.magic);
    } while (!metaOpts.length || !magicOpts.length);
    set(selectedmetatype, proxy(metaOpts[getRandomIntinRange(0, metaOpts.length - 1)].foundryitemid));
    set(selectedMagic, proxy(magicOpts[getRandomIntinRange(0, magicOpts.length - 1)].foundryitemid));
    set(metatypeItem, proxy(get$1(metatypes).find((i) => i.id === get$1(selectedmetatype))));
    const ageSrc = get$1(metatypeItem).system.agerange ?? get$1(metatypeItem).system.lifespan;
    set(characterAge, proxy(getRandomBellCurveWithMode(ageSrc.min, ageSrc.max, ageSrc.average)));
    const h = get$1(metatypeItem).system.physical.height;
    set(characterHeight, proxy(getRandomBellCurveWithMode(h.min, h.max, h.average)));
    const w = get$1(metatypeItem).system.physical.weight;
    set(characterWeight, proxy(getRandomBellCurveWithMode(w.min, w.max, w.average)));
    set(selectedAttribute, proxy(combo.attribute));
    set(selectedSkill, proxy(combo.skills));
    set(selectedResource, proxy(combo.resources));
  }
  var form = root$9();
  var div = child(form);
  var div_1 = child(div);
  var div_2 = child(div_1);
  var div_3 = child(div_2);
  var div_4 = sibling(child(div_3), 2);
  var div_5 = child(div_4);
  var img = child(div_5);
  var input = sibling(div_5, 2);
  var div_6 = sibling(div_2, 2);
  var div_7 = child(div_6);
  var div_8 = sibling(child(div_7), 2);
  var div_9 = child(div_8);
  var text2 = child(div_9);
  var input_1 = sibling(div_9, 2);
  var div_10 = sibling(input_1, 2);
  var text_1 = child(div_10);
  var input_2 = sibling(div_10, 2);
  var div_11 = sibling(input_2, 2);
  var text_2 = child(div_11);
  var input_3 = sibling(div_11, 2);
  var div_12 = sibling(div_6, 2);
  var div_13 = child(div_12);
  var div_14 = sibling(child(div_13), 2);
  var div_15 = child(div_14);
  var div_16 = child(div_15);
  var h3 = child(div_16);
  var text_3 = child(h3);
  var select = sibling(h3, 2);
  var option = child(select);
  option.value = null == (option.__value = "") ? "" : "";
  option.textContent = chooseAnOption;
  var node = sibling(option);
  each(node, 17, () => get$1(metatypeDropdownOptions), index, ($$anchor2, metatype) => {
    var option_1 = root_1$4();
    var option_1_value = {};
    var text_4 = child(option_1);
    template_effect(() => {
      if (option_1_value !== (option_1_value = get$1(metatype).foundryitemid)) {
        option_1.value = null == (option_1.__value = get$1(metatype).foundryitemid) ? "" : get$1(metatype).foundryitemid;
      }
      set_text(text_4, `${get$1(metatype).priority ?? ""}: ${get$1(metatype).name ?? ""}`);
    });
    append($$anchor2, option_1);
  });
  var div_17 = sibling(div_16, 2);
  var h3_1 = child(div_17);
  var text_5 = child(h3_1);
  var select_1 = sibling(h3_1, 2);
  var option_2 = child(select_1);
  option_2.value = null == (option_2.__value = "") ? "" : "";
  option_2.textContent = chooseAnOption;
  var node_1 = sibling(option_2);
  each(node_1, 17, () => get$1(magicsDropdownOptions), index, ($$anchor2, magic) => {
    var option_3 = root_2$4();
    var option_3_value = {};
    var text_6 = child(option_3);
    template_effect(
      ($0) => {
        if (option_3_value !== (option_3_value = get$1(magic).foundryitemid)) {
          option_3.value = null == (option_3.__value = get$1(magic).foundryitemid) ? "" : get$1(magic).foundryitemid;
        }
        option_3.disabled = $0;
        set_text(text_6, `${get$1(magic).priority ?? ""}: ${get$1(magic).name ?? ""}`);
      },
      [
        () => get$1(usedPriorities).includes(get$1(magic).priority) && get$1(magic).foundryitemid !== get$1(selectedMagic)
      ]
    );
    append($$anchor2, option_3);
  });
  var div_18 = sibling(div_17, 2);
  var h3_2 = child(div_18);
  var text_7 = child(h3_2);
  var select_2 = sibling(h3_2, 2);
  var option_4 = child(select_2);
  option_4.value = null == (option_4.__value = "") ? "" : "";
  option_4.textContent = chooseAnOption;
  var node_2 = sibling(option_4);
  each(node_2, 17, () => attributPointDropdownOptions, index, ($$anchor2, attribute) => {
    var option_5 = root_3$2();
    var option_5_value = {};
    var text_8 = child(option_5);
    template_effect(
      ($0) => {
        if (option_5_value !== (option_5_value = get$1(attribute).priority)) {
          option_5.value = null == (option_5.__value = get$1(attribute).priority) ? "" : get$1(attribute).priority;
        }
        option_5.disabled = $0;
        set_text(text_8, `${get$1(attribute).priority ?? ""}: ${get$1(attribute).points ?? ""}`);
      },
      [
        () => get$1(usedPriorities).includes(get$1(attribute).priority) && get$1(attribute).priority !== get$1(selectedAttribute)
      ]
    );
    append($$anchor2, option_5);
  });
  var div_19 = sibling(div_18, 2);
  var h3_3 = child(div_19);
  var text_9 = child(h3_3);
  var select_3 = sibling(h3_3, 2);
  var option_6 = child(select_3);
  option_6.value = null == (option_6.__value = "") ? "" : "";
  option_6.textContent = chooseAnOption;
  var node_3 = sibling(option_6);
  each(node_3, 17, () => skillPointDropdownOptions, index, ($$anchor2, skill) => {
    var option_7 = root_4$4();
    var option_7_value = {};
    var text_10 = child(option_7);
    template_effect(
      ($0) => {
        if (option_7_value !== (option_7_value = get$1(skill).priority)) {
          option_7.value = null == (option_7.__value = get$1(skill).priority) ? "" : get$1(skill).priority;
        }
        option_7.disabled = $0;
        set_text(text_10, `${get$1(skill).priority ?? ""}: ${get$1(skill).points ?? ""}`);
      },
      [
        () => get$1(usedPriorities).includes(get$1(skill).priority) && get$1(skill).priority !== get$1(selectedSkill)
      ]
    );
    append($$anchor2, option_7);
  });
  var div_20 = sibling(div_19, 2);
  var h3_4 = child(div_20);
  var text_11 = child(h3_4);
  var select_4 = sibling(h3_4, 2);
  var option_8 = child(select_4);
  option_8.value = null == (option_8.__value = "") ? "" : "";
  option_8.textContent = chooseAnOption;
  var node_4 = sibling(option_8);
  each(node_4, 17, () => resourcesDropdownOptions, index, ($$anchor2, resource) => {
    var option_9 = root_5$2();
    var option_9_value = {};
    var text_12 = child(option_9);
    template_effect(
      ($0) => {
        if (option_9_value !== (option_9_value = get$1(resource).priority)) {
          option_9.value = null == (option_9.__value = get$1(resource).priority) ? "" : get$1(resource).priority;
        }
        option_9.disabled = $0;
        set_text(text_12, `${get$1(resource).priority ?? ""}: ${get$1(resource).points ?? ""}`);
      },
      [
        () => get$1(usedPriorities).includes(get$1(resource).priority) && get$1(resource).priority !== get$1(selectedResource)
      ]
    );
    append($$anchor2, option_9);
  });
  var div_21 = sibling(div_12, 2);
  var div_22 = child(div_21);
  var div_23 = sibling(child(div_22), 2);
  var div_24 = child(div_23);
  var button = child(div_24);
  button.__click = handleRandomize;
  var text_13 = sibling(child(button));
  var button_1 = sibling(button, 2);
  button_1.__click = [
    handleClear,
    selectedmetatype,
    selectedMagic,
    selectedAttribute,
    selectedSkill,
    selectedResource,
    characterAge,
    characterHeight,
    characterWeight,
    metatypeItem,
    metatypes
  ];
  var text_14 = sibling(child(button_1));
  var button_2 = sibling(button_1, 2);
  var text_15 = sibling(child(button_2));
  template_effect(
    ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
      set_class(div_1, `sr3e-waterfall sr3e-waterfall--${layoutMode}`);
      set_attribute(img, "src", ((_a = get$1(metatypeItem)) == null ? void 0 : _a.img) ?? "");
      set_attribute(img, "title", ((_b = get$1(metatypeItem)) == null ? void 0 : _b.name) ?? "");
      set_attribute(img, "alt", ((_c = get$1(metatypeItem)) == null ? void 0 : _c.name) ?? "");
      set_text(text2, `${$0 ?? ""}: ${get$1(characterAge) ?? ""} (${get$1(currentPhase) ?? ""})`);
      set_attribute(input_1, "min", ((_f = (_e = (_d = get$1(metatypeItem)) == null ? void 0 : _d.system) == null ? void 0 : _e.agerange) == null ? void 0 : _f.min) ?? 0);
      set_attribute(input_1, "max", ((_i = (_h = (_g = get$1(metatypeItem)) == null ? void 0 : _g.system) == null ? void 0 : _h.agerange) == null ? void 0 : _i.max) ?? 100);
      set_text(text_1, `${$1 ?? ""}: ${get$1(characterHeight) ?? ""}`);
      set_attribute(input_2, "min", ((_m = (_l = (_k = (_j = get$1(metatypeItem)) == null ? void 0 : _j.system) == null ? void 0 : _k.physical) == null ? void 0 : _l.height) == null ? void 0 : _m.min) ?? 0);
      set_attribute(input_2, "max", ((_q = (_p = (_o = (_n = get$1(metatypeItem)) == null ? void 0 : _n.system) == null ? void 0 : _o.physical) == null ? void 0 : _p.height) == null ? void 0 : _q.max) ?? 200);
      set_text(text_2, `${$2 ?? ""}: ${get$1(characterWeight) ?? ""}`);
      set_attribute(input_3, "min", ((_u = (_t = (_s = (_r = get$1(metatypeItem)) == null ? void 0 : _r.system) == null ? void 0 : _s.physical) == null ? void 0 : _t.weight) == null ? void 0 : _u.min) ?? 0);
      set_attribute(input_3, "max", ((_y = (_x = (_w = (_v = get$1(metatypeItem)) == null ? void 0 : _v.system) == null ? void 0 : _w.physical) == null ? void 0 : _x.weight) == null ? void 0 : _y.max) ?? 200);
      set_text(text_3, $3);
      set_text(text_5, $4);
      set_text(text_7, $5);
      set_text(text_9, $6);
      set_text(text_11, $7);
      set_text(text_13, ` ${$8 ?? ""}`);
      set_text(text_14, ` ${$9 ?? ""}`);
      button_2.disabled = !get$1(canCreate);
      set_text(text_15, ` ${$10 ?? ""}`);
    },
    [
      () => localize($$props.config.traits.age),
      () => localize($$props.config.traits.height),
      () => localize($$props.config.traits.weight),
      () => localize($$props.config.traits.metaType),
      () => localize($$props.config.magic.tradition),
      () => localize($$props.config.sheet.attributepoints),
      () => localize($$props.config.sheet.skillpoints),
      () => localize($$props.config.sheet.resources),
      () => localize($$props.config.sheet.randomize),
      () => localize($$props.config.sheet.clear),
      () => localize($$props.config.sheet.createCharacter)
    ]
  );
  event$1("submit", form, handleSubmit);
  bind_value(input, () => get$1(characterName), ($$value) => set(characterName, $$value));
  bind_value(input_1, () => get$1(characterAge), ($$value) => set(characterAge, $$value));
  bind_value(input_2, () => get$1(characterHeight), ($$value) => set(characterHeight, $$value));
  bind_value(input_3, () => get$1(characterWeight), ($$value) => set(characterWeight, $$value));
  bind_select_value(select, () => get$1(selectedmetatype), ($$value) => set(selectedmetatype, $$value));
  bind_select_value(select_1, () => get$1(selectedMagic), ($$value) => set(selectedMagic, $$value));
  bind_select_value(select_2, () => get$1(selectedAttribute), ($$value) => set(selectedAttribute, $$value));
  bind_select_value(select_3, () => get$1(selectedSkill), ($$value) => set(selectedSkill, $$value));
  bind_select_value(select_4, () => get$1(selectedResource), ($$value) => set(selectedResource, $$value));
  append($$anchor, form);
  pop();
}
delegate(["click"]);
class CharacterCreationApp extends foundry.applications.api.ApplicationV2 {
  constructor(actor, options = {}) {
    const mergedOptions = foundry.utils.mergeObject({
      onSubmit: null,
      onCancel: null
    }, options);
    super(mergedOptions);
    __privateAdd(this, _actor2);
    __privateAdd(this, _onSubmit);
    __privateAdd(this, _onCancel);
    __privateAdd(this, _svelteApp);
    __privateAdd(this, _wasSubmitted, false);
    __privateSet(this, _actor2, actor);
    __privateSet(this, _onSubmit, mergedOptions.onSubmit);
    __privateSet(this, _onCancel, mergedOptions.onCancel);
  }
  _renderHTML() {
    return null;
  }
  _replaceHTML(_, windowContent) {
    if (__privateGet(this, _svelteApp)) unmount(__privateGet(this, _svelteApp));
    __privateSet(this, _svelteApp, mount(CharacterCreationDialogApp, {
      target: windowContent,
      props: {
        actor: __privateGet(this, _actor2),
        config: CONFIG.sr3e,
        onSubmit: (result) => {
          var _a;
          __privateSet(this, _wasSubmitted, true);
          (_a = __privateGet(this, _onSubmit)) == null ? void 0 : _a.call(this, result);
          this.close();
        },
        onCancel: () => {
          var _a;
          (_a = __privateGet(this, _onCancel)) == null ? void 0 : _a.call(this);
          this.close();
        }
      }
    }));
  }
  async close(options = {}) {
    var _a;
    if (__privateGet(this, _svelteApp)) {
      unmount(__privateGet(this, _svelteApp));
      __privateSet(this, _svelteApp, null);
    }
    if (!__privateGet(this, _wasSubmitted)) {
      (_a = __privateGet(this, _onCancel)) == null ? void 0 : _a.call(this);
    }
    return super.close(options);
  }
}
_actor2 = new WeakMap();
_onSubmit = new WeakMap();
_onCancel = new WeakMap();
_svelteApp = new WeakMap();
_wasSubmitted = new WeakMap();
__publicField(CharacterCreationApp, "DEFAULT_OPTIONS", {
  id: "sr3e-character-creation",
  classes: ["sr3e", "sheet", "charactercreation"],
  tag: "form",
  window: {
    title: "Character Creation",
    resizable: false
  },
  position: {
    width: "auto",
    height: "auto"
  }
});
async function displayCreationDialog(actor, options, userId) {
  var _a;
  if (actor.type !== "character") return true;
  if (!((_a = game.users.get(userId)) == null ? void 0 : _a.isSelf)) return true;
  const dialogResult = await _runCharacterCreationDialog(actor);
  if (!dialogResult) {
    console.log(`Character creation canceled for actor: ${actor.name}. Deleting actor.`);
    await actor.delete();
    return false;
  }
  actor.sheet.render(true);
  return true;
}
async function _runCharacterCreationDialog(actor) {
  return new Promise((resolve) => {
    try {
      const app = new CharacterCreationApp(actor, {
        onSubmit: (result) => {
          resolve(result);
        },
        onCancel: () => {
          resolve(false);
        }
      });
      app.render(true);
    } catch (e) {
      console.error("Failed to create character creation dialog:", e);
      resolve(false);
    }
  });
}
async function stopDefaultCharacterSheetRenderOnCreation(_docs, actor, options, _userId) {
  if (actor.type !== "character") return true;
  options.renderSheet = false;
}
class RollService {
  static async AttributeRoll(actor, attributeName, dice, options = {
    targetNumber: 0,
    //Target number 0 is forbidden in shadowrun, so we can know that thw roll has no target if target < 2
    explodes: true,
    defaulted: false,
    modifiers: 0
  }) {
    let formula = "";
    if (options.explodes) {
      formula = `${dice}d6x`;
      if (options.targetNumber && options.targetNumber > 1) {
        formula += (options.targetNumber + options.modifiers).toString();
      }
    } else {
      formula = `${dice}d6`;
    }
    const roll = new Roll(formula);
    await roll.evaluate();
    const term = roll.terms.find((t) => t instanceof foundry.dice.terms.Die);
    const isSR3 = term instanceof CONFIG.Dice.terms["d"];
    let resultSummary = "";
    if (isSR3 && typeof term.successes === "number") {
      if (term.successes > 0) {
        resultSummary = `${term.successes} success${term.successes > 1 ? "es" : ""}`;
      } else if (term.isBotch) {
        resultSummary = `Oopsie! Disastrous mistake! ${term.ones} ones and no successes.`;
      } else {
        resultSummary = "No successes.";
      }
    }
    let flavor = "";
    if (options.defaulted) {
      flavor = `${actor.name} rolls a skill default on linked attribute ${attributeName} (${formula})${resultSummary ? `<br>${resultSummary}` : ""}`;
    } else if (options.modifier > 0) {
      flavor = `${actor.name} rolls ${attributeName} (${formula}) with ${options.modifiers} modifier${resultSummary ? `<br>${resultSummary}` : ""}`;
    } else {
      flavor = `${actor.name} rolls ${attributeName} (${formula})${resultSummary ? `<br>${resultSummary}` : ""}`;
    }
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor,
      rollMode: options.rollMode ?? game.settings.get("core", "rollMode")
    });
  }
  // NOTE: May need to diverge from attribute rolls in the future
  static async SkillRoll(actor, skillName, dice, options) {
    this.AttributeRoll(actor, skillName, dice, options);
  }
  // NOTE: May need to diverge from attribute rolls in the future
  static async SpecializationRoll(actor, skillName, dice, options) {
    this.AttributeRoll(actor, skillName, dice, options);
  }
  static async Initiaitve(actor) {
    const storeManager2 = StoreManager.Subscribe(actor);
    const initiativeDiceStore = storeManager2.GetSumROStore("attributes.initiative");
    const reactionStore = storeManager2.GetSumROStore("attributes.reaction");
    const initiativeDice = get(initiativeDiceStore).sum;
    const reaction = get(reactionStore).sum;
    StoreManager.Unsubscribe(actor);
    const roll = await new Roll(`${initiativeDice}d6`).evaluate();
    const totalInit = roll.total + reaction;
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `${actor.name} rolls Initiative: ${initiativeDice}d6 + ${reaction}`
    });
    if (actor.combatant) {
      await actor.combatant.update({ initiative: totalInit });
    } else if (game.combat) {
      const combatant = game.combat.combatants.find((c) => c.actor.id === actor.id);
      if (combatant) {
        await game.combat.setInitiative(combatant.id, totalInit);
      }
    }
    return totalInit;
  }
}
class SR3EActor extends Actor {
  /*
     getRollData() {
        const data = super.getRollData();
        
        console.log("I WAS CALLED! getRollData");
        
        // Debug: Log the structure to see what we're working with
        console.log("Base getRollData result:", data);
        console.log("this.system:", this.system);
        console.log("this.system.attributes:", this.system.attributes);
        console.log("this.system.attributes.quickness:", this.system.attributes.quickness);
        
        // The system data should already be in the data object
        // Check if attributes are already there
        if (data.attributes) {
           console.log("Attributes found in data:", data.attributes);
           // Flatten attributes to root level
           for (const [k, v] of Object.entries(data.attributes)) {
              data[k] = v;
              console.log(`Set data.${k} = ${v}`);
           }
        } else {
           console.log("No attributes in data, adding manually");
        // Add attributes manually from this.system
        data.quickness = this.system.attributes.quickness;
        data.intelligence = this.system.attributes.intelligence;
        data.willpower = this.system.attributes.willpower;
        data.strength = this.system.attributes.strength;
        data.body = this.system.attributes.body;
        data.charisma = this.system.attributes.charisma;
     }
     
     console.log("Final roll data:", data);
     return data;
  }
  */
  async InitiativeRoll() {
    return await RollService.Initiaitve(this);
  }
  async AttributeRoll(dice, attributeName, options = { targetNumber: -1, modifiers: 0, explodes: true }) {
    await RollService.AttributeRoll(this, attributeName, dice, options);
  }
  async SkillRoll(dice, skillName, options = { targetNumber: -1, modifiers: 0, explodes: true }) {
    await RollService.SkillRoll(this, skillName, dice, options);
  }
  async SpecializationRoll(dice, specializationName, options = { targetNumber: -1, modifiers: 0, explodes: true }) {
    await RollService.SpecializationRoll(this, specializationName, dice, options);
  }
  async canAcceptmetatype(incomingItem) {
    const existing = this.items.filter((i) => i.type === "metatype");
    if (existing.length > 1) {
      const [oldest, ...rest] = existing.sort((a, b) => a.id.localeCompare(b.id));
      const toDelete = rest.map((i) => i.id);
      await this.deleteEmbeddedDocuments("Item", toDelete);
    }
    const current = this.items.find((i) => i.type === "metatype");
    if (!current) return "accept";
    const incomingName = incomingItem.name.toLowerCase();
    const currentName = current.name.toLowerCase();
    const isIncomingHuman = incomingName === "human";
    const isCurrentHuman = currentName === "human";
    if (isCurrentHuman && !isIncomingHuman) return "goblinize";
    if (!isCurrentHuman && isIncomingHuman) return "reject";
    if (incomingName === currentName) return "reject";
    return "reject";
  }
  async replacemetatype(newItem) {
    const current = this.items.find((i) => i.type === "metatype");
    if (current) await this.deleteEmbeddedDocuments("Item", [current.id]);
    await this.createEmbeddedDocuments("Item", [newItem.toObject()]);
    await this.update({
      "system.profile.metaType": newItem.name,
      "system.profile.img": newItem.img
    });
  }
  static Register() {
    CONFIG.Actor.documentClass = SR3EActor;
    console.log("sr3e /// ---> SR3EActor registered");
  }
}
function attachLightEffect(html2, activeTheme) {
  function rgb(r, g, b) {
    return `rgb(${r}, ${g}, ${b})`;
  }
  const colors = {
    light: {
      silver: rgb(200, 200, 200),
      lightGray: rgb(235, 235, 235),
      darkGray: rgb(150, 150, 150),
      highlight: rgb(255, 192, 203)
      // soft cherry blossom
    },
    dark: {
      silver: rgb(77, 77, 77),
      lightGray: rgb(31, 31, 32),
      darkGray: rgb(23, 22, 22),
      highlight: rgb(102, 119, 115)
    }
  };
  const isDark = activeTheme.toLowerCase().includes("dark");
  const themeColors = isDark ? colors.dark : colors.light;
  const brushedBase = `repeating-linear-gradient(
    33deg,
    ${themeColors.darkGray} 0px,
    ${themeColors.silver} 0.15px,
    ${themeColors.lightGray} 0.75px,
    ${themeColors.darkGray} 1.5px
  )`;
  const windowContent = html2.querySelector(".window-content");
  if (!windowContent) return;
  let lastMouse = { x: 0, y: 0 };
  let frameRequested = false;
  function updateLightEffect() {
    const globalX = lastMouse.x;
    const globalY = lastMouse.y;
    const selectors = [".stat-card-background", ".skill-background-layer"];
    const targetElements = html2.querySelectorAll(selectors.join(", "));
    targetElements.forEach((element) => {
      const rect2 = element.getBoundingClientRect();
      const centerX = (rect2.left + rect2.width) * 0.5;
      const centerY = (rect2.top + rect2.height) * 0.5;
      const dx = globalX - centerX;
      const dy = globalY - centerY;
      const distance = Math.sqrt(dx ** 2 + dy ** 2);
      const maxDistance = Math.max(rect2.width, rect2.height) * 3.5;
      const intensity = Math.max(0, 1 - distance / maxDistance);
      const radialGradient = `radial-gradient(
        circle at ${globalX - rect2.left}px ${globalY - rect2.top}px,
        ${themeColors.highlight} 0%,
        ${themeColors.highlight} ${Math.round(intensity * 40)}%,
        rgba(255, 192, 203, 0.15) 75%,
        transparent 100%
      )`;
      element.style.background = `${radialGradient}, ${brushedBase}`;
      element.style.backgroundBlendMode = "screen";
    });
    frameRequested = false;
  }
  windowContent.addEventListener("mousemove", (event2) => {
    lastMouse.x = event2.clientX;
    lastMouse.y = event2.clientY;
    if (!frameRequested) {
      frameRequested = true;
      requestAnimationFrame(updateLightEffect);
    }
  });
  const rect = windowContent.getBoundingClientRect();
  lastMouse.x = rect.left + rect.width / 2;
  lastMouse.y = rect.top + rect.height / 2;
  updateLightEffect();
}
class StorytellerScreenModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      attributes: new foundry.data.fields.SchemaField(AttributesModel$1.defineSchema()),
      dicePools: new foundry.data.fields.SchemaField(DicePoolsModel.defineSchema()),
      movement: new foundry.data.fields.SchemaField(AttributesModel2.defineSchema()),
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
var on_click$1 = (_, onDelta) => onDelta()(-1);
var on_keydown$1 = (e) => {
  if (e.key === "Enter") e.target.blur();
};
var on_click_1$1 = (__1, onDelta) => onDelta()(1);
var root$8 = /* @__PURE__ */ template(`<div class="stat-card"><div class="stat-card-background"></div> <h1> </h1> <div class="time-editor-component"><button type="button"><i class="fa-solid fa-circle-left"></i></button> <input class="time-display" type="number"> <button type="button"><i class="fa-solid fa-circle-right"></i></button></div></div>`);
function TimeActuatorInput($$anchor, $$props) {
  push($$props, true);
  const label = prop($$props, "label", 3, "Seconds"), onDelta = prop($$props, "onDelta", 3, () => {
  });
  let input = state("");
  var div = root$8();
  var h1 = sibling(child(div), 2);
  var text2 = child(h1);
  var div_1 = sibling(h1, 2);
  var button = child(div_1);
  button.__click = [on_click$1, onDelta];
  var input_1 = sibling(button, 2);
  input_1.__keydown = [on_keydown$1];
  var button_1 = sibling(input_1, 2);
  button_1.__click = [on_click_1$1, onDelta];
  template_effect(
    ($0) => {
      set_text(text2, label());
      set_attribute(button, "aria-label", `Decrement ${label()}`);
      set_attribute(input_1, "placeholder", $0);
      set_attribute(button_1, "aria-label", `Increment ${label()}`);
    },
    [() => `± ${label().toLowerCase()}`]
  );
  event$1("blur", input_1, (e) => {
    const delta = e.target.valueAsNumber;
    if (!Number.isNaN(delta) && delta !== 0) {
      onDelta()(delta);
    }
    set(input, "");
  });
  bind_value(input_1, () => get$1(input), ($$value) => set(input, $$value));
  append($$anchor, div);
  pop();
}
delegate(["click", "keydown"]);
class TimeService {
  static update(ms) {
    game.time.advance(ms);
  }
  static updateSeconds(n = 1) {
    this.update(n * 1e3);
  }
  static updateMinutes(n = 1) {
    this.update(n * 60 * 1e3);
  }
  static updateHours(n = 1) {
    this.update(n * 60 * 60 * 1e3);
  }
  static updateDays(n = 1) {
    const date = new Date(game.time.worldTime);
    date.setDate(date.getDate() + n);
    game.time.set(date.getTime());
  }
  static updateMonths(n = 1) {
    const date = new Date(game.time.worldTime);
    date.setMonth(date.getMonth() + n);
    game.time.set(date.getTime());
  }
  static updateYears(n = 1) {
    const date = new Date(game.time.worldTime);
    date.setFullYear(date.getFullYear() + n);
    game.time.set(date.getTime());
  }
  static dateToGameTime(date) {
    if (!(date instanceof Date)) throw new Error("Expected Date instance");
    return date.getTime();
  }
  static gameTimeToDate(ms) {
    if (typeof ms !== "number") throw new Error("Expected number");
    return new Date(ms);
  }
}
__publicField(TimeService, "unit", {
  seconds: "Seconds",
  minutes: "Minutes",
  hours: "Hours",
  days: "Days",
  months: "Months",
  years: "Years"
});
var root$7 = /* @__PURE__ */ template(`<div class="sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><div class="counter-bar"><h1 class="text-display"><div> </div> <div> </div> - <div> </div> <div> </div> - <div class="clock"> </div> : <div class="clock"> </div> : <div class="clock"> </div></h1> <div class="time-editor"><!> <!> <!> <!> <!> <!></div></div></div></div></div>`);
function TimeManager($$anchor, $$props) {
  push($$props, true);
  let config = prop($$props, "config", 19, () => ({}));
  let currentDate = state(proxy(new Date(game.time.worldTime)));
  onMount(() => {
    const handler = () => {
      set(currentDate, proxy(new Date(game.time.worldTime)));
    };
    Hooks.on("updateWorldTime", handler);
    return () => Hooks.off("updateWorldTime", handler);
  });
  const year = /* @__PURE__ */ derived$1(() => get$1(currentDate).getFullYear());
  const day = /* @__PURE__ */ derived$1(() => get$1(currentDate).getDate());
  const hours = /* @__PURE__ */ derived$1(() => get$1(currentDate).getHours());
  const minutes = /* @__PURE__ */ derived$1(() => get$1(currentDate).getMinutes());
  const seconds = /* @__PURE__ */ derived$1(() => get$1(currentDate).getSeconds());
  const weekdayAsString = /* @__PURE__ */ derived$1(() => get$1(currentDate).toLocaleDateString(void 0, { weekday: "long" }));
  const monthAsString = /* @__PURE__ */ derived$1(() => get$1(currentDate).toLocaleDateString(void 0, { month: "long" }));
  var div = root$7();
  var div_1 = child(div);
  var div_2 = sibling(child(div_1), 2);
  var div_3 = child(div_2);
  var h1 = child(div_3);
  var div_4 = child(h1);
  var text2 = child(div_4);
  var div_5 = sibling(div_4, 2);
  var text_1 = child(div_5);
  var div_6 = sibling(div_5, 2);
  var text_2 = child(div_6);
  var div_7 = sibling(div_6, 2);
  var text_3 = child(div_7);
  var div_8 = sibling(div_7, 2);
  var text_4 = child(div_8);
  var div_9 = sibling(div_8, 2);
  var text_5 = child(div_9);
  var div_10 = sibling(div_9, 2);
  var text_6 = child(div_10);
  var div_11 = sibling(h1, 2);
  var node = child(div_11);
  const expression = /* @__PURE__ */ derived$1(() => localize(config().time.year));
  TimeActuatorInput(node, {
    get label() {
      return get$1(expression);
    },
    onDelta: (n) => {
      TimeService.updateYears(n);
    }
  });
  var node_1 = sibling(node, 2);
  const expression_1 = /* @__PURE__ */ derived$1(() => localize(config().time.month));
  TimeActuatorInput(node_1, {
    get label() {
      return get$1(expression_1);
    },
    onDelta: (n) => {
      TimeService.updateMonths(n);
    }
  });
  var node_2 = sibling(node_1, 2);
  const expression_2 = /* @__PURE__ */ derived$1(() => localize(config().time.day));
  TimeActuatorInput(node_2, {
    get label() {
      return get$1(expression_2);
    },
    onDelta: (n) => {
      TimeService.updateDays(n);
    }
  });
  var node_3 = sibling(node_2, 2);
  const expression_3 = /* @__PURE__ */ derived$1(() => localize(config().time.hours));
  TimeActuatorInput(node_3, {
    get label() {
      return get$1(expression_3);
    },
    onDelta: (n) => {
      TimeService.updateHours(n);
    }
  });
  var node_4 = sibling(node_3, 2);
  const expression_4 = /* @__PURE__ */ derived$1(() => localize(config().time.minutes));
  TimeActuatorInput(node_4, {
    get label() {
      return get$1(expression_4);
    },
    onDelta: (n) => {
      TimeService.updateMinutes(n);
    }
  });
  var node_5 = sibling(node_4, 2);
  const expression_5 = /* @__PURE__ */ derived$1(() => localize(config().time.seconds));
  TimeActuatorInput(node_5, {
    get label() {
      return get$1(expression_5);
    },
    onDelta: (n) => {
      TimeService.updateSeconds(n);
    }
  });
  template_effect(
    ($0, $1, $2, $3) => {
      set_text(text2, get$1(weekdayAsString));
      set_text(text_1, $0);
      set_text(text_2, get$1(monthAsString));
      set_text(text_3, get$1(year));
      set_text(text_4, $1);
      set_text(text_5, $2);
      set_text(text_6, $3);
    },
    [
      () => get$1(day).toString().padStart(2, "0"),
      () => get$1(hours).toString().padStart(2, "0"),
      () => get$1(minutes).toString().padStart(2, "0"),
      () => get$1(seconds).toString().padStart(2, "0")
    ]
  );
  append($$anchor, div);
  pop();
}
var root$6 = /* @__PURE__ */ template(`<tr><td class="portrait-cell"><!></td><td><h3> </h3></td><td><input type="number"></td><td><h3> </h3></td><td><h3> </h3></td><td><h3> </h3></td><td><input type="checkbox"></td></tr>`);
function KarmaRow($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $readyForCommit = () => store_get(readyForCommit, "$readyForCommit", $$stores);
  const $lifetimeKarma = () => store_get(lifetimeKarma, "$lifetimeKarma", $$stores);
  const $pendingKarmaReward = () => store_get(pendingKarmaReward, "$pendingKarmaReward", $$stores);
  const $karmaPoolCeiling = () => store_get(karmaPoolCeiling, "$karmaPoolCeiling", $$stores);
  const $goodKarma = () => store_get(goodKarma, "$goodKarma", $$stores);
  const $spentKarma = () => store_get(spentKarma, "$spentKarma", $$stores);
  onMount(() => {
    if ($$props.onmount) {
      $$props.onmount({
        CommitSelected,
        Select,
        Deselect,
        get readyForCommit() {
          return $readyForCommit();
        }
      });
    }
  });
  let storeManager2 = StoreManager.Subscribe($$props.actor);
  onDestroy(() => {
    StoreManager.Unsubscribe($$props.actor);
  });
  let pendingKarmaReward = storeManager2.GetRWStore("karma.pendingKarmaReward");
  let goodKarma = storeManager2.GetRWStore("karma.goodKarma");
  let karmaPoolCeiling = storeManager2.GetRWStore("karma.karmaPoolCeiling");
  let spentKarma = storeManager2.GetRWStore("karma.spentKarma");
  let lifetimeKarma = storeManager2.GetRWStore("karma.lifetimeKarma");
  let readyForCommit = storeManager2.GetRWStore("karma.readyForCommit");
  async function CommitSelected() {
    if ($readyForCommit()) {
      const metatypeItem = $$props.actor.items.find((i) => i.type === "metatype");
      store_set(lifetimeKarma, $lifetimeKarma() + $pendingKarmaReward());
      if (metatypeItem.system.karma.factor) {
        store_set(karmaPoolCeiling, proxy(Math.floor($lifetimeKarma() * metatypeItem.system.karma.factor)));
      }
      store_set(goodKarma, $lifetimeKarma() - $spentKarma() - $karmaPoolCeiling());
      store_set(pendingKarmaReward, 0);
      store_set(readyForCommit, false);
      $$props.OnCommitStatusChange();
    }
  }
  user_effect(() => {
    $readyForCommit();
    $$props.OnCommitStatusChange();
  });
  function Select() {
    store_set(readyForCommit, true);
    $$props.OnCommitStatusChange();
  }
  function Deselect() {
    store_set(readyForCommit, false);
    $$props.OnCommitStatusChange();
  }
  var tr = root$6();
  var td = child(tr);
  var node = child(td);
  Image(node, {
    get entity() {
      return $$props.actor;
    }
  });
  var td_1 = sibling(td);
  var h3 = child(td_1);
  var text2 = child(h3);
  var td_2 = sibling(td_1);
  var input = child(td_2);
  var td_3 = sibling(td_2);
  var h3_1 = child(td_3);
  var text_1 = child(h3_1);
  var td_4 = sibling(td_3);
  var h3_2 = child(td_4);
  var text_2 = child(h3_2);
  var td_5 = sibling(td_4);
  var h3_3 = child(td_5);
  var text_3 = child(h3_3);
  var td_6 = sibling(td_5);
  var input_1 = child(td_6);
  template_effect(() => {
    set_text(text2, $$props.actor.name);
    set_attribute(input, "id", $$props.actor.id);
    set_text(text_1, $goodKarma());
    set_text(text_2, $karmaPoolCeiling());
    set_text(text_3, $lifetimeKarma());
  });
  bind_value(input, $pendingKarmaReward, ($$value) => store_set(pendingKarmaReward, $$value));
  bind_checked(input_1, $readyForCommit, ($$value) => store_set(readyForCommit, $$value));
  append($$anchor, tr);
  pop();
  $$cleanup();
}
async function commitSelected$1(_, listboxContent, rowRefs) {
  for (const actor of get$1(listboxContent)) {
    const row = rowRefs.get(actor.id);
    if (row == null ? void 0 : row.CommitSelected) await row.CommitSelected();
  }
}
function selectAll$1(__1, listboxContent, rowRefs) {
  for (const actor of get$1(listboxContent)) {
    const row = rowRefs.get(actor.id);
    if (row == null ? void 0 : row.Select) row.Select();
  }
}
function deselectAll$1(__2, listboxContent, rowRefs) {
  for (const actor of get$1(listboxContent)) {
    const row = rowRefs.get(actor.id);
    if (row == null ? void 0 : row.Deselect) row.Deselect();
  }
}
var root_1$3 = /* @__PURE__ */ template(`<option> </option>`);
var root_2$3 = /* @__PURE__ */ template(`<table><thead><tr><th>Portrait</th><th>Name</th><th>Points</th><th> </th><th> </th><th> </th><th> </th></tr></thead><tbody></tbody></table>`);
var root_4$3 = /* @__PURE__ */ template(`<div class="empty">No actors found</div>`);
var root$5 = /* @__PURE__ */ template(`<div class="sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><div class="karma-manager"><div class="points-container"></div> <div class="player-handler"><select name="typeOfCharacter" class="typeOfCharacter"></select> <input type="text"> <button> </button> <button> </button> <button> </button></div> <div class="list-box"><!></div></div></div></div></div>`);
function KarmaManager($$anchor, $$props) {
  push($$props, true);
  let delimiter = state("");
  let filter = state("character");
  let listboxContent = state(null);
  const rowRefs = /* @__PURE__ */ new Map();
  const options = [
    {
      value: "character",
      label: localize($$props.config.karmamanager.character)
    },
    {
      value: "npc",
      label: localize($$props.config.karmamanager.npc)
    }
  ];
  let anyReady = state(proxy([]));
  function OnCommitStatusChange() {
    set(anyReady, proxy(Array.from(rowRefs.values()).some((row) => row.readyForCommit)));
  }
  user_effect(() => {
    var _a;
    let baseList = [];
    switch (get$1(filter)) {
      case "character":
        baseList = game.actors.filter((a) => a.type === "character");
        break;
      case "npc":
        baseList = game.actors.filter((a) => a.type === "npc");
        break;
      default:
        baseList = game.actors.filter((a) => {
          var _a2;
          return (_a2 = a.system) == null ? void 0 : _a2.karma;
        });
        break;
    }
    set(listboxContent, proxy(((_a = get$1(delimiter)) == null ? void 0 : _a.length) > 0 ? baseList.filter((a) => a.name.toLowerCase().includes(get$1(delimiter).toLowerCase())) : baseList));
  });
  var div = root$5();
  var div_1 = child(div);
  var div_2 = sibling(child(div_1), 2);
  var div_3 = child(div_2);
  var div_4 = sibling(child(div_3), 2);
  var select = child(div_4);
  each(select, 21, () => options, index, ($$anchor2, $$item) => {
    let value = () => get$1($$item).value;
    let label = () => get$1($$item).label;
    var option = root_1$3();
    var option_value = {};
    var text2 = child(option);
    template_effect(() => {
      if (option_value !== (option_value = value())) {
        option.value = null == (option.__value = value()) ? "" : value();
      }
      set_text(text2, label());
    });
    append($$anchor2, option);
  });
  var input = sibling(select, 2);
  var button = sibling(input, 2);
  button.__click = [selectAll$1, listboxContent, rowRefs];
  var text_1 = child(button);
  var button_1 = sibling(button, 2);
  button_1.__click = [deselectAll$1, listboxContent, rowRefs];
  var text_2 = child(button_1);
  var button_2 = sibling(button_1, 2);
  button_2.__click = [commitSelected$1, listboxContent, rowRefs];
  var text_3 = child(button_2);
  var div_5 = sibling(div_4, 2);
  var node = child(div_5);
  {
    var consequent = ($$anchor2) => {
      var table = root_2$3();
      var thead = child(table);
      var tr = child(thead);
      var th = sibling(child(tr), 3);
      var text_4 = child(th);
      var th_1 = sibling(th);
      var text_5 = child(th_1);
      var th_2 = sibling(th_1);
      var text_6 = child(th_2);
      var th_3 = sibling(th_2);
      var text_7 = child(th_3);
      var tbody = sibling(thead);
      each(tbody, 21, () => get$1(listboxContent), (actor) => actor.id, ($$anchor3, actor) => {
        KarmaRow($$anchor3, {
          get actor() {
            return get$1(actor);
          },
          get config() {
            return $$props.config;
          },
          OnCommitStatusChange,
          onmount: (el) => rowRefs.set(get$1(actor).id, el)
        });
      });
      template_effect(
        ($0, $1, $2, $3) => {
          set_text(text_4, $0);
          set_text(text_5, $1);
          set_text(text_6, $2);
          set_text(text_7, $3);
        },
        [
          () => localize($$props.config.karma.goodkarma),
          () => localize($$props.config.karma.karmapool),
          () => localize($$props.config.karma.lifetimekarma),
          () => localize($$props.config.karma.commit)
        ]
      );
      append($$anchor2, table);
    };
    var alternate = ($$anchor2) => {
      var div_6 = root_4$3();
      append($$anchor2, div_6);
    };
    if_block(node, ($$render) => {
      var _a;
      if ((_a = get$1(listboxContent)) == null ? void 0 : _a.length) $$render(consequent);
      else $$render(alternate, false);
    });
  }
  template_effect(
    ($0, $1, $2) => {
      set_text(text_1, $0);
      set_text(text_2, $1);
      button_2.disabled = !get$1(anyReady);
      set_text(text_3, $2);
    },
    [
      () => localize($$props.config.karma.selectall),
      () => localize($$props.config.karma.deselectall),
      () => localize($$props.config.karma.commitselected)
    ]
  );
  bind_select_value(select, () => get$1(filter), ($$value) => set(filter, $$value));
  bind_value(input, () => get$1(delimiter), ($$value) => set(delimiter, $$value));
  append($$anchor, div);
  pop();
}
delegate(["click"]);
var on_click = (__1, $$props) => $$props.actor.RefreshKarmaPool();
var on_click_1 = (__2, $$props) => $$props.actor.RefreshCombatPool();
var on_click_2 = (__3, $$props) => $$props.actor.RefreshAstralPool();
var on_click_3 = (__4, $$props) => $$props.actor.RefreshSpellPool();
var on_click_4 = (__5, $$props) => $$props.actor.RefreshControlPool();
var on_click_5 = (__6, $$props) => $$props.actor.RefreshHackingPool();
var on_change$1 = (e, $readyForCommit, readyForCommit) => {
  store_set(readyForCommit, proxy(e.target.checked));
};
var root$4 = /* @__PURE__ */ template(`<tr><td class="portrait-cell"><!></td><td><h3> </h3></td><td><h3> </h3> <button> <i class="fa-solid fa-dharmachakra"></i></button></td><td><h3> </h3> <button> <i class="fa-solid fa-person-rifle"></i></button></td><td><h3> </h3> <button> <i class="fa-solid fa-star"></i></button></td><td><h3> </h3> <button> <i class="fa-solid fa-wand-sparkles"></i></button></td><td><h3> </h3> <button> <i class="fa-solid fa-robot"></i></button></td><td><h3> </h3> <button> <i class="fa-solid fa-computer"></i></button></td><td><input type="checkbox"></td></tr>`);
function DicePoolRow($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $readyForCommit = () => store_get(readyForCommit, "$readyForCommit", $$stores);
  const $karmaPoolStore = () => store_get(karmaPoolStore, "$karmaPoolStore", $$stores);
  const $karmaPoolCeilingStore = () => store_get(karmaPoolCeilingStore, "$karmaPoolCeilingStore", $$stores);
  const $combatPoolStore = () => store_get(combatPoolStore, "$combatPoolStore", $$stores);
  const $quicknessStore = () => store_get(quicknessStore, "$quicknessStore", $$stores);
  const $intelligenceStore = () => store_get(intelligenceStore, "$intelligenceStore", $$stores);
  const $willpowerStore = () => store_get(willpowerStore, "$willpowerStore", $$stores);
  const $astralPoolStore = () => store_get(astralPoolStore, "$astralPoolStore", $$stores);
  const $spellPoolStore = () => store_get(spellPoolStore, "$spellPoolStore", $$stores);
  const $controlPoolStore = () => store_get(controlPoolStore, "$controlPoolStore", $$stores);
  const $hackingPoolStore = () => store_get(hackingPoolStore, "$hackingPoolStore", $$stores);
  const isMagician = $$props.actor.items.some((i) => i.type === "metatype") && $$props.actor.system.attributes.magic.isBurnedOut;
  $$props.actor.system.attributes;
  onMount(() => {
    if ($$props.onmount) {
      $$props.onmount({
        CommitSelected,
        Select,
        Deselect,
        get readyForCommit() {
          return $readyForCommit();
        }
      });
    }
  });
  let storeManager2 = StoreManager.Subscribe($$props.actor);
  onDestroy(() => {
    StoreManager.Unsubscribe($$props.actor);
  });
  let intelligenceStore = storeManager2.GetRWStore("attributes.intelligence");
  let quicknessStore = storeManager2.GetRWStore("attributes.quickness");
  let willpowerStore = storeManager2.GetRWStore("attributes.willpower");
  storeManager2.GetRWStore("attributes.charisma");
  let karmaPoolCeilingStore = storeManager2.GetRWStore("karma.karmaPoolCeiling");
  let karmaPoolStore = storeManager2.GetRWStore("karma.karmaPool");
  let combatPoolStore = storeManager2.GetRWStore("dicePools.combat.value");
  let astralPoolStore = storeManager2.GetRWStore("dicePools.astral.value");
  let hackingPoolStore = storeManager2.GetRWStore("dicePools.hacking.value");
  let controlPoolStore = storeManager2.GetRWStore("dicePools.control.value");
  let spellPoolStore = storeManager2.GetRWStore("dicePools.spell.value");
  let readyForCommit = storeManager2.GetFlagStore($$props.actor.id, "sr3e.actor.poolcommit");
  async function CommitSelected() {
    if ($readyForCommit()) {
      $$props.actor.RefreshKarmaPool();
      $$props.actor.RefreshCombatPool();
      $$props.actor.RefreshHackingPool();
      if (isMagician) {
        $$props.actor.RefreshAstralPool();
        $$props.actor.RefreshSpellPool();
      }
      $$props.OnCommitStatusChange();
      store_set(readyForCommit, false);
    }
  }
  user_effect(() => {
    $readyForCommit();
    $$props.OnCommitStatusChange();
  });
  function Select() {
    store_set(readyForCommit, true);
    $$props.OnCommitStatusChange();
  }
  function Deselect() {
    store_set(readyForCommit, false);
    $$props.OnCommitStatusChange();
  }
  var tr = root$4();
  var td = child(tr);
  var node = child(td);
  Image(node, {
    get entity() {
      return $$props.actor;
    }
  });
  var td_1 = sibling(td);
  var h3 = child(td_1);
  var text2 = child(h3);
  var td_2 = sibling(td_1);
  var h3_1 = child(td_2);
  var text_1 = child(h3_1);
  var button = sibling(h3_1, 2);
  button.__click = [on_click, $$props];
  var text_2 = child(button);
  var td_3 = sibling(td_2);
  var h3_2 = child(td_3);
  var text_3 = child(h3_2);
  var button_1 = sibling(h3_2, 2);
  button_1.__click = [on_click_1, $$props];
  var text_4 = child(button_1);
  var td_4 = sibling(td_3);
  var h3_3 = child(td_4);
  var text_5 = child(h3_3);
  var button_2 = sibling(h3_3, 2);
  button_2.__click = [on_click_2, $$props];
  var text_6 = child(button_2);
  var td_5 = sibling(td_4);
  var h3_4 = child(td_5);
  var text_7 = child(h3_4);
  var button_3 = sibling(h3_4, 2);
  button_3.__click = [on_click_3, $$props];
  var text_8 = child(button_3);
  var td_6 = sibling(td_5);
  var h3_5 = child(td_6);
  var text_9 = child(h3_5);
  var button_4 = sibling(h3_5, 2);
  button_4.__click = [on_click_4, $$props];
  var text_10 = child(button_4);
  var td_7 = sibling(td_6);
  var h3_6 = child(td_7);
  var text_11 = child(h3_6);
  var button_5 = sibling(h3_6, 2);
  button_5.__click = [on_click_5, $$props];
  var text_12 = child(button_5);
  var td_8 = sibling(td_7);
  var input = child(td_8);
  input.__change = [on_change$1, $readyForCommit, readyForCommit];
  template_effect(
    ($0, $1, $2, $3, $4, $5, $6, $7, $8) => {
      set_text(text2, $$props.actor.name);
      set_text(text_1, `${$karmaPoolStore() ?? ""} / ${$karmaPoolCeilingStore() ?? ""}`);
      set_attribute(button, "aria-label", $0);
      set_text(text_2, `${$1 ?? ""} `);
      set_text(text_3, `${$combatPoolStore() ?? ""} / ${$2 ?? ""}`);
      set_attribute(button_1, "aria-label", $3);
      set_text(text_4, `${$1 ?? ""} `);
      set_text(text_5, `${$astralPoolStore() ?? ""} / ${$4 ?? ""}`);
      set_attribute(button_2, "aria-label", $5);
      set_text(text_6, `${$1 ?? ""} `);
      set_text(text_7, `${$spellPoolStore() ?? ""} / ${$4 ?? ""}`);
      set_attribute(button_3, "aria-label", $6);
      set_text(text_8, $1);
      set_text(text_9, `${$controlPoolStore() ?? ""} / TODO`);
      set_attribute(button_4, "aria-label", $7);
      set_text(text_10, `${$1 ?? ""} `);
      set_text(text_11, `${$hackingPoolStore() ?? ""} / TODO`);
      set_attribute(button_5, "aria-label", $8);
      set_text(text_12, `${$1 ?? ""} `);
      set_checked(input, $readyForCommit());
    },
    [
      () => localize($$props.config.storytellerscreen.refreshkarmapool),
      () => localize($$props.config.storytellerscreen.refresh),
      () => Math.floor(($quicknessStore() + $intelligenceStore() + $willpowerStore()) * 0.5),
      () => localize($$props.config.storytellerscreen.refreshcombatpool),
      () => Math.floor(($intelligenceStore() + $willpowerStore()) * 0.5),
      () => localize($$props.config.storytellerscreen.refreshastralpool),
      () => localize($$props.config.storytellerscreen.refreshspellpool),
      () => localize($$props.config.storytellerscreen.refreshcontrolpool),
      () => localize($$props.config.storytellerscreen.refreshhackingpool)
    ]
  );
  append($$anchor, tr);
  pop();
  $$cleanup();
}
delegate(["click", "change"]);
async function commitSelected(_, listboxContent, rowRefs) {
  for (const actor of get$1(listboxContent)) {
    const row = rowRefs.get(actor.id);
    if (row == null ? void 0 : row.CommitSelected) await row.CommitSelected();
  }
}
function selectAll(__1, listboxContent, rowRefs) {
  for (const actor of get$1(listboxContent)) {
    const row = rowRefs.get(actor.id);
    if (row == null ? void 0 : row.Select) row.Select();
  }
}
function deselectAll(__2, listboxContent, rowRefs) {
  for (const actor of get$1(listboxContent)) {
    const row = rowRefs.get(actor.id);
    if (row == null ? void 0 : row.Deselect) row.Deselect();
  }
}
var root_1$2 = /* @__PURE__ */ template(`<option> </option>`);
var root_2$2 = /* @__PURE__ */ template(`<table><thead><tr><th>Portrait</th><th>Name</th><th> </th><th> </th><th> </th><th> </th><th> </th><th> </th></tr></thead><tbody></tbody></table>`);
var root_4$2 = /* @__PURE__ */ template(`<div class="empty">No actors found</div>`);
var root$3 = /* @__PURE__ */ template(`<div class="sheet-component"><div class="sr3e-inner-background-container"><div class="fake-shadow"></div> <div class="sr3e-inner-background"><div class="karma-manager"><div class="points-container"></div> <div class="player-handler"><select name="typeOfCharacter" class="typeOfCharacter"></select> <input type="text"> <button> </button> <button> </button> <button> </button></div> <div class="list-box"><!></div></div></div></div></div>`);
function DicePoolManager($$anchor, $$props) {
  push($$props, true);
  let delimiter = state("");
  let filter = state("character");
  let listboxContent = state(null);
  const rowRefs = /* @__PURE__ */ new Map();
  const options = [
    {
      value: "character",
      label: localize($$props.config.karmamanager.character)
    },
    {
      value: "npc",
      label: localize($$props.config.karmamanager.npc)
    }
  ];
  let anyReady = state(proxy([]));
  function OnCommitStatusChange() {
    set(anyReady, proxy(Array.from(rowRefs.values()).some((row) => row.readyForCommit)));
  }
  user_effect(() => {
    var _a;
    let baseList = [];
    switch (get$1(filter)) {
      case "character":
        baseList = game.actors.filter((a) => {
          var _a2, _b;
          return a.type === "character" && ((_a2 = a.system) == null ? void 0 : _a2.karma) && ((_b = a.system) == null ? void 0 : _b.dicePools);
        });
        break;
      case "npc":
        baseList = game.actors.filter((a) => {
          var _a2, _b;
          return a.type === "npc" && ((_a2 = a.system) == null ? void 0 : _a2.karma) && ((_b = a.system) == null ? void 0 : _b.dicePools);
        });
        break;
      default:
        baseList = game.actors.filter((a) => {
          var _a2;
          return (_a2 = a.system) == null ? void 0 : _a2.karma;
        });
        break;
    }
    set(listboxContent, proxy(((_a = get$1(delimiter)) == null ? void 0 : _a.length) > 0 ? baseList.filter((a) => a.name.toLowerCase().includes(get$1(delimiter).toLowerCase())) : baseList));
  });
  var div = root$3();
  var div_1 = child(div);
  var div_2 = sibling(child(div_1), 2);
  var div_3 = child(div_2);
  var div_4 = sibling(child(div_3), 2);
  var select = child(div_4);
  each(select, 21, () => options, index, ($$anchor2, $$item) => {
    let value = () => get$1($$item).value;
    let label = () => get$1($$item).label;
    var option = root_1$2();
    var option_value = {};
    var text2 = child(option);
    template_effect(() => {
      if (option_value !== (option_value = value())) {
        option.value = null == (option.__value = value()) ? "" : value();
      }
      set_text(text2, label());
    });
    append($$anchor2, option);
  });
  var input = sibling(select, 2);
  var button = sibling(input, 2);
  button.__click = [selectAll, listboxContent, rowRefs];
  var text_1 = child(button);
  var button_1 = sibling(button, 2);
  button_1.__click = [deselectAll, listboxContent, rowRefs];
  var text_2 = child(button_1);
  var button_2 = sibling(button_1, 2);
  button_2.__click = [commitSelected, listboxContent, rowRefs];
  var text_3 = child(button_2);
  var div_5 = sibling(div_4, 2);
  var node = child(div_5);
  {
    var consequent = ($$anchor2) => {
      var table = root_2$2();
      var thead = child(table);
      var tr = child(thead);
      var th = sibling(child(tr), 2);
      var text_4 = child(th);
      var th_1 = sibling(th);
      var text_5 = child(th_1);
      var th_2 = sibling(th_1);
      var text_6 = child(th_2);
      var th_3 = sibling(th_2);
      var text_7 = child(th_3);
      var th_4 = sibling(th_3);
      var text_8 = child(th_4);
      var th_5 = sibling(th_4);
      var text_9 = child(th_5);
      var tbody = sibling(thead);
      each(tbody, 21, () => get$1(listboxContent), (actor) => actor.id, ($$anchor3, actor) => {
        DicePoolRow($$anchor3, {
          get actor() {
            return get$1(actor);
          },
          get config() {
            return $$props.config;
          },
          OnCommitStatusChange,
          onmount: (el) => rowRefs.set(get$1(actor).id, el)
        });
      });
      template_effect(
        ($0, $1, $2, $3, $4, $5) => {
          set_text(text_4, $0);
          set_text(text_5, $1);
          set_text(text_6, $2);
          set_text(text_7, $3);
          set_text(text_8, $4);
          set_text(text_9, $5);
        },
        [
          () => localize($$props.config.karma.karmapool),
          () => localize($$props.config.dicepools.combat),
          () => localize($$props.config.dicepools.astral),
          () => localize($$props.config.dicepools.spell),
          () => localize($$props.config.dicepools.control),
          () => localize($$props.config.dicepools.hacking)
        ]
      );
      append($$anchor2, table);
    };
    var alternate = ($$anchor2) => {
      var div_6 = root_4$2();
      append($$anchor2, div_6);
    };
    if_block(node, ($$render) => {
      var _a;
      if ((_a = get$1(listboxContent)) == null ? void 0 : _a.length) $$render(consequent);
      else $$render(alternate, false);
    });
  }
  template_effect(
    ($0, $1, $2) => {
      set_text(text_1, $0);
      set_text(text_2, $1);
      button_2.disabled = !get$1(anyReady);
      set_text(text_3, $2);
    },
    [
      () => localize($$props.config.karma.selectall),
      () => localize($$props.config.karma.deselectall),
      () => localize($$props.config.karma.commitselected)
    ]
  );
  bind_select_value(select, () => get$1(filter), ($$value) => set(filter, $$value));
  bind_value(input, () => get$1(delimiter), ($$value) => set(delimiter, $$value));
  append($$anchor, div);
  pop();
}
delegate(["click"]);
var root$2 = /* @__PURE__ */ template(`<div><!> <!> <!></div>`);
function StorytellerScreenApp($$anchor, $$props) {
  prop($$props, "actor", 19, () => ({}));
  let config = prop($$props, "config", 19, () => ({}));
  var div = root$2();
  var node = child(div);
  TimeManager(node, {
    get config() {
      return config();
    }
  });
  var node_1 = sibling(node, 2);
  KarmaManager(node_1, {
    get config() {
      return config();
    }
  });
  var node_2 = sibling(node_1, 2);
  DicePoolManager(node_2, {
    get config() {
      return config();
    }
  });
  append($$anchor, div);
}
class StorytellerScreenActorSheet extends foundry.applications.sheets.ActorSheetV2 {
  constructor() {
    super(...arguments);
    __privateAdd(this, _app4);
  }
  get title() {
    return `${localize(CONFIG.sr3e.storytellerscreen.storytellerscreen)}`;
  }
  static get DEFAULT_OPTIONS() {
    return {
      ...super.DEFAULT_OPTIONS,
      id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
      classes: ["sr3e", "sheet", "storytellerscreen", "ActorSheetV2"],
      template: null,
      position: { width: 820, height: 820 },
      window: {
        resizable: true
      },
      submitOnChange: true,
      closeOnSubmit: false
    };
  }
  _renderHTML() {
    return null;
  }
  _replaceHTML(_, windowContent) {
    if (__privateGet(this, _app4)) {
      unmount(__privateGet(this, _app4));
      __privateSet(this, _app4, null);
    }
    __privateSet(this, _app4, mount(StorytellerScreenApp, {
      target: windowContent,
      props: {
        actor: this.document,
        config: CONFIG.sr3e
      }
    }));
  }
  async _tearDown() {
    if (__privateGet(this, _app4)) await unmount(__privateGet(this, _app4));
    __privateSet(this, _app4, null);
    return super._tearDown();
  }
}
_app4 = new WeakMap();
class TransactionModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      amount: new foundry.data.fields.NumberField({
        required: true,
        initial: 0
      }),
      recurrent: new foundry.data.fields.BooleanField({
        //Expose
        required: true,
        initial: false
      }),
      isCreditStick: new foundry.data.fields.BooleanField({
        //Expose
        required: true,
        initial: false
      }),
      type: new foundry.data.fields.StringField({
        //Expose, is a select with Asset, Debt, Expense as options will be localized later
        required: true,
        initial: ""
      }),
      creditorId: new foundry.data.fields.StringField({
        // If it is a debt, who is owed to, not exposed
        required: false,
        initial: ""
      }),
      interestPerMonth: new foundry.data.fields.NumberField({
        //Expose
        required: true,
        initial: 0
      }),
      journalId: new foundry.data.fields.StringField({
        //Exposed already
        required: true,
        initial: ""
      })
    };
  }
}
function handleKeyDown(e) {
  if ([8, 9, 27, 13, 46].includes(e.keyCode) || e.ctrlKey && [65, 67, 86, 88].includes(e.keyCode) || e.keyCode >= 35 && e.keyCode <= 39) return;
  if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
    e.preventDefault();
  }
}
var on_change = (e, item2) => item2().update({ name: e.target.value });
var root_2$1 = /* @__PURE__ */ template(`<input name="amount" type="text">`);
var on_change_1 = (e, item2) => item2().update({ "system.type": e.target.value });
var root_3$1 = /* @__PURE__ */ template(`<select name="type"><option disabled> </option><option> </option><option> </option><option> </option><option> </option></select>`);
var root_4$1 = /* @__PURE__ */ template(`<input type="text" placeholder="0.00%">`);
var root_5$1 = /* @__PURE__ */ template(`<input type="checkbox">`);
var root_6 = /* @__PURE__ */ template(`<input type="checkbox">`);
var root_1$1 = /* @__PURE__ */ template(`<!> <div class="stat-grid single-column"><div class="stat-card"><div class="stat-card-background"></div> <input class="large" name="name" type="text"></div> <!> <!> <!> <div class="stat-grid two-column"><!> <!></div></div>`, 1);
var root_8 = /* @__PURE__ */ template(`<div class="stat-grid single-column"><div class="stat-card"><div class="stat-card-background"></div> <h3>Creditor</h3></div> <!></div>`);
var root$1 = /* @__PURE__ */ template(`<div class="sr3e-waterfall-wrapper"><div><!> <!></div> <!></div>`);
function TransactionApp($$anchor, $$props) {
  push($$props, true);
  let item2 = prop($$props, "item", 7);
  let layoutMode = "single";
  let formattedAmount = state(`${item2().system.amount} ¥`);
  let creditorOptions = state(proxy([]));
  let selectedId = state(proxy(item2().system.creditorId ?? ""));
  let interest = state("");
  let delimiter = "";
  user_effect(() => {
    set(formattedAmount, `${formatNumber(item2().system.amount)} ¥`);
  });
  user_effect(() => {
    const actors = game.actors.filter((actor) => game.user.isGM || actor.testUserPermission(game.user, "OBSERVER"));
    const filtered = delimiter.trim().length > 0 ? actors.filter((a) => a.name.toLowerCase().includes(delimiter.toLowerCase())) : actors;
    set(creditorOptions, proxy(filtered.map((a) => ({ value: a.id, label: a.name }))));
  });
  function handleSelection(event2) {
    const id = event2.detail.value;
    set(selectedId, proxy(id));
    item2().update({ "system.creditorId": id });
  }
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  function handleInput(e) {
    const inputValue = e.target.value.trim();
    const raw = inputValue.replace(/[^\d]/g, "");
    const parsed = parseInt(raw, 10) || 0;
    item2().system.amount = parsed;
    e.target.value = `${formatNumber(parsed)} ¥`;
  }
  function handleFocus(e) {
    e.target.select();
  }
  function handleBlur(e) {
    const raw = e.target.value.replace(/[^\d]/g, "");
    const parsed = parseInt(raw, 10) || 0;
    item2().system.amount = parsed;
    item2().update({ "system.amount": parsed }, { render: false });
    e.target.value = `${formatNumber(parsed)} ¥`;
  }
  var div = root$1();
  var div_1 = child(div);
  var node = child(div_1);
  ItemSheetComponent(node, {
    children: ($$anchor2, $$slotProps) => {
      var fragment = root_1$1();
      var node_1 = first_child(fragment);
      Image(node_1, {
        get entity() {
          return item2();
        }
      });
      var div_2 = sibling(node_1, 2);
      var div_3 = child(div_2);
      var input = sibling(child(div_3), 2);
      input.__change = [on_change, item2];
      var node_2 = sibling(div_3, 2);
      StatCard$1(node_2, {
        children: ($$anchor3, $$slotProps2) => {
          var input_1 = root_2$1();
          input_1.__input = handleInput;
          input_1.__keydown = [handleKeyDown];
          template_effect(() => set_value(input_1, get$1(formattedAmount)));
          event$1("focus", input_1, handleFocus);
          event$1("blur", input_1, handleBlur);
          append($$anchor3, input_1);
        },
        $$slots: { default: true }
      });
      var node_3 = sibling(node_2, 2);
      StatCard$1(node_3, {
        children: ($$anchor3, $$slotProps2) => {
          var select = root_3$1();
          select.__change = [on_change_1, item2];
          var option = child(select);
          option.value = null == (option.__value = "") ? "" : "";
          var text2 = child(option);
          var option_1 = sibling(option);
          option_1.value = null == (option_1.__value = "income") ? "" : "income";
          var text_1 = child(option_1);
          var option_2 = sibling(option_1);
          option_2.value = null == (option_2.__value = "asset") ? "" : "asset";
          var text_2 = child(option_2);
          var option_3 = sibling(option_2);
          option_3.value = null == (option_3.__value = "debt") ? "" : "debt";
          var text_3 = child(option_3);
          var option_4 = sibling(option_3);
          option_4.value = null == (option_4.__value = "expense") ? "" : "expense";
          var text_4 = child(option_4);
          template_effect(
            ($0, $1, $2, $3, $4) => {
              set_text(text2, $0);
              set_text(text_1, $1);
              set_text(text_2, $2);
              set_text(text_3, $3);
              set_text(text_4, $4);
            },
            [
              () => localize($$props.config.transaction.select),
              () => localize($$props.config.transaction.income),
              () => localize($$props.config.transaction.asset),
              () => localize($$props.config.transaction.debt),
              () => localize($$props.config.transaction.expense)
            ]
          );
          bind_select_value(select, () => item2().system.type, ($$value) => item2().system.type = $$value);
          append($$anchor3, select);
        },
        $$slots: { default: true }
      });
      var node_4 = sibling(node_3, 2);
      StatCard$1(node_4, {
        children: ($$anchor3, $$slotProps2) => {
          var input_2 = root_4$1();
          bind_value(input_2, () => get$1(interest), ($$value) => set(interest, $$value));
          append($$anchor3, input_2);
        },
        $$slots: { default: true }
      });
      var div_4 = sibling(node_4, 2);
      var node_5 = child(div_4);
      StatCard$1(node_5, {
        get label() {
          return $$props.config.transaction.recurrent;
        },
        children: ($$anchor3, $$slotProps2) => {
          var input_3 = root_5$1();
          bind_value(input_3, () => item2().isRecurrent, ($$value) => item2().isRecurrent = $$value);
          append($$anchor3, input_3);
        },
        $$slots: { default: true }
      });
      var node_6 = sibling(node_5, 2);
      StatCard$1(node_6, {
        get label() {
          return $$props.config.transaction.creditstick;
        },
        children: ($$anchor3, $$slotProps2) => {
          var input_4 = root_6();
          bind_value(input_4, () => item2().isCreditStick, ($$value) => item2().isCreditStick = $$value);
          append($$anchor3, input_4);
        },
        $$slots: { default: true }
      });
      template_effect(() => set_value(input, item2().name));
      append($$anchor2, fragment);
    }
  });
  var node_7 = sibling(node, 2);
  {
    var consequent = ($$anchor2) => {
      ItemSheetComponent($$anchor2, {
        children: ($$anchor3, $$slotProps) => {
          var div_5 = root_8();
          var node_8 = sibling(child(div_5), 2);
          const expression = /* @__PURE__ */ derived$1(() => localize($$props.config.combosearch.search));
          const expression_1 = /* @__PURE__ */ derived$1(() => localize($$props.config.combosearch.noresult));
          ComboSearch(node_8, {
            get options() {
              return get$1(creditorOptions);
            },
            get placeholder() {
              return get$1(expression);
            },
            get nomatchplaceholder() {
              return get$1(expression_1);
            },
            get value() {
              return get$1(selectedId);
            },
            set value($$value) {
              set(selectedId, proxy($$value));
            },
            $$events: { select: handleSelection }
          });
          append($$anchor3, div_5);
        }
      });
    };
    if_block(node_7, ($$render) => {
      if (item2().system.type !== "asset") $$render(consequent);
    });
  }
  var node_9 = sibling(div_1, 2);
  JournalViewer(node_9, {
    get document() {
      return item2();
    },
    get config() {
      return $$props.config;
    }
  });
  template_effect(() => set_class(div_1, `sr3e-waterfall sr3e-waterfall--${layoutMode}`));
  append($$anchor, div);
  pop();
}
delegate(["change", "input", "keydown"]);
class TransactionItemSheet extends foundry.applications.sheets.ItemSheetV2 {
  constructor() {
    super(...arguments);
    __privateAdd(this, _app5);
  }
  get title() {
    return `${localize(CONFIG.sr3e.transaction.transaction)}: ${this.item.name}`;
  }
  static get DEFAULT_OPTIONS() {
    return {
      ...super.DEFAULT_OPTIONS,
      id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
      classes: ["sr3e", "sheet", "item", "transaction"],
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
    if (__privateGet(this, _app5)) {
      unmount(__privateGet(this, _app5));
      __privateSet(this, _app5, null);
    }
    __privateSet(this, _app5, mount(TransactionApp, {
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
_app5 = new WeakMap();
function Print(message = "Combat Service Print Function") {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const tag = "[COMBAT]";
  const finalMessage = `${tag} ${timestamp} - ${message}`;
  ui.notifications.info(message);
  console.log(finalMessage);
}
class SR3ECombat extends foundry.documents.Combat {
  async startCombat() {
    Print("=== COMBAT STARTED ===");
    await this.setFlag("sr3e", "combatTurn", 1);
    await this.setFlag("sr3e", "initiativePass", 1);
    return super.startCombat();
  }
  async rollInitiative(ids, { createCombatants = false, updateTurn = true } = {}) {
    const updates = [];
    for (let id of ids) {
      const combatant = this.combatants.get(id);
      if (!combatant || !combatant.actor) continue;
      const totalInit = await combatant.actor.InitiativeRoll();
      updates.push({ _id: id, initiative: totalInit });
    }
    if (updates.length > 0) {
      await this.updateEmbeddedDocuments("Combatant", updates);
    }
    if (updateTurn) await this.update({ turn: 0 });
    return this;
  }
  async nextTurn() {
    const result = await super.nextTurn();
    const combatant = this.combatant;
    if (!combatant) return result;
    if (combatant.initiative < 1) {
      await this._advanceInitiativePass();
    } else {
      Print(`-> ${combatant.name} acts (Init: ${combatant.initiative})`);
    }
    return result;
  }
  async _advanceInitiativePass() {
    const currentPass = this.getFlag("sr3e", "initiativePass") || 1;
    Print(`--- Ending Initiative Pass ${currentPass} ---`);
    for (const c of this.combatants.contents) {
      if (c.initiative > 0) {
        const newInit = Math.max(0, c.initiative - 10);
        await c.update({ initiative: newInit });
      }
    }
    const stillActive = this.combatants.contents.some((c) => c.initiative > 0);
    if (stillActive) {
      const newPass = currentPass + 1;
      Print(`--- New Initiative Pass ${newPass} ---`);
      await this.setFlag("sr3e", "initiativePass", newPass);
      await this.update({ turn: 0 });
    } else {
      Print("— All Initiative Passes Completed — Proceeding to next round —");
      await this.nextRound();
    }
  }
  async nextRound() {
    const initiativePass = this.getFlag("sr3e", "initiativePass") || 1;
    const hasPositive = this.combatants.contents.some((c) => c.initiative > 0);
    if (hasPositive && initiativePass > 0) {
      return await this._advanceInitiativePass();
    } else {
      const round = this.round + 1;
      game.time.advance(3);
      Print(`=== STARTING COMBAT TURN ${round} ===`);
      await this.setFlag("sr3e", "combatTurn", round);
      await this.setFlag("sr3e", "initiativePass", 1);
      await this.resetAll({ updateTurn: false });
      return super.nextRound();
    }
  }
  static Register() {
    CONFIG.Combat.documentClass = SR3ECombat;
  }
}
const _SR3Edie = class _SR3Edie extends foundry.dice.terms.Die {
  /* ------------------------------------------------------------------ */
  /*  Evaluation                                                        */
  /* ------------------------------------------------------------------ */
  // INFO:
  // Must support 1d6 for non exploding rolls
  // Must support 1d6x for uncapped exploding rolls (infinte recursion)
  // Must support 1d6xN where N is a positive number higher than 2 (If lower than two, use two anyway). N is the cap of the roll. When any individual die reaches the cap, the explosion ends and the accumulative result of the die is reported, just like with uncapped
  // Must not support xo or xo N, as they are not a part of Shadowrun Third Editionrules.
  // Must No dice generate new dice. Instead they accumulate their value. So if I roll six, it explodes, then I roll again and get value, the six sided die should report 11, and not spawn a new die.
  async _evaluate(opts = {}) {
    return this._evaluateSync(opts);
  }
  _evaluateSync({ maximize = false, minimize = false } = {}) {
    this.results = [];
    const randomFace = () => super.randomFace({ maximize, minimize });
    const explodeMod = this.modifiers.find((m) => /^x\d*$/.test(m));
    if (!explodeMod) {
      for (let i = 0; i < this.number; i++)
        this.results.push({ result: randomFace(), active: true, exploded: false });
      return this;
    }
    const cap = explodeMod === "x" ? Infinity : Math.max(2, parseInt(explodeMod.slice(1)));
    this._targetNumber = cap === Infinity ? null : cap;
    const canExplode = !(maximize || minimize);
    for (let i = 0; i < this.number; i++) {
      let total = 0;
      let didExplode = false;
      while (true) {
        const roll = randomFace();
        total += roll;
        if (roll === 6 && canExplode && total < cap) {
          didExplode = true;
        } else {
          break;
        }
      }
      this.results.push({ result: total, active: true, exploded: didExplode });
    }
    return this;
  }
  get successes() {
    if (this._targetNumber == null) return null;
    return this.results.filter((r) => r.active && r.result >= this._targetNumber).length;
  }
  get isBotch() {
    const active = this.results.filter((r) => r.active);
    return active.length && !this.successes && active.every((r) => r.result === 1);
  }
  get isFailure() {
    return !this.successes && !this.isBotch;
  }
  static Register() {
    CONFIG.Dice.terms.d = _SR3Edie;
    CONFIG.Dice.terms.SR3Edie = _SR3Edie;
  }
};
/** Keep the normal “d” so 10d still parses */
__publicField(_SR3Edie, "DENOMINATION", "d");
/* ------------------------------------------------------------------ */
/*  Declare custom modifiers so the parser accepts ! and !o            */
/* ------------------------------------------------------------------ */
__publicField(_SR3Edie, "MODIFIERS", {
  ...foundry.dice.terms.Die.MODIFIERS,
  x(mod) {
    return this;
  }
  // disable core explode
});
let SR3Edie = _SR3Edie;
class SR3ERoll extends Roll {
  constructor(formula, data = {}, options = {}) {
    if (Object.keys(data).length === 0) {
      const speaker = ChatMessage.getSpeaker();
      const actor = ChatMessage.getSpeakerActor(speaker);
      if (actor == null ? void 0 : actor.getRollData) {
        data = actor.getRollData();
      }
    }
    super(formula, data, options);
  }
  static create(formula, data = {}, options = {}) {
    if (Object.keys(data).length === 0) {
      const speaker = ChatMessage.getSpeaker();
      const actor = ChatMessage.getSpeakerActor(speaker);
      if (actor == null ? void 0 : actor.getRollData) {
        data = actor.getRollData();
      }
    }
    return new this(formula, data, options);
  }
  // Update your Register method
  static Register() {
    CONFIG.Dice.rolls = [SR3ERoll];
    window.Roll = SR3ERoll;
  }
}
class BroadcasterModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      preparedNews: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField(), {
        initial: [],
        required: true
      }),
      rollingNews: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField(), {
        initial: [],
        required: true
      }),
      isBroadcasting: new foundry.data.fields.BooleanField({
        required: true,
        initial: false
      }),
      journalId: new foundry.data.fields.StringField({
        required: true,
        initial: ""
      })
    };
  }
}
var on_keydown = (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    e.currentTarget.blur();
  }
};
var root_1 = /* @__PURE__ */ template(`<div class="broadcaster-info"><!> <div class="broadcaster-control"><div class="editable-actor-name"><h1 class="no-margin" contenteditable="true"> </h1></div> <div class="broadcast-toggle"><p>Broadcasting:</p> <input type="checkbox" id="broadcasting-toggle" class="toggle-input"></div></div></div>`);
var root_2 = /* @__PURE__ */ template(`<div class="news-input"><input type="text"> <div class="buttons-vertical-distribution"><button type="button" class="link-button"><i></i></button> <button type="button" class="link-button" title="Delete Headline" aria-label="Delete Headline"><i class="fas fa-trash-can"></i></button></div></div>`);
var root_4 = /* @__PURE__ */ template(`<option> </option>`);
var root_5 = /* @__PURE__ */ template(`<option> </option>`);
var root_3 = /* @__PURE__ */ template(`<div class="list-box"><h3>Prepared Headlines</h3> <select size="5" multiple></select></div> <div class="buttons-vertical-distribution"><button type="button" class="link-button" title="Move to Rolling News" aria-label="Move to Rolling News"><i class="fas fa-arrow-down"></i></button> <button type="button" class="link-button" title="Move to Prepared News" aria-label="Move to Prepared News"><i class="fas fa-arrow-up"></i></button></div> <div class="list-box"><h3>Rolling Headlines</h3> <select size="5" multiple></select></div>`, 1);
var root = /* @__PURE__ */ template(`<!> <!> <!> <!>`, 1);
function BroadcasterApp($$anchor, $$props) {
  push($$props, true);
  const [$$stores, $$cleanup] = setup_stores();
  const $isBroadcastingStore = () => store_get(isBroadcastingStore, "$isBroadcastingStore", $$stores);
  const $rollingNewsStore = () => store_get(rollingNewsStore, "$rollingNewsStore", $$stores);
  const $preparedNewsStore = () => store_get(preparedNewsStore, "$preparedNewsStore", $$stores);
  let storeManager2 = StoreManager.Subscribe($$props.actor);
  onDestroy(() => {
    unsubscribe();
    StoreManager.Unsubscribe($$props.actor);
  });
  let preparedNewsStore = storeManager2.GetRWStore("preparedNews");
  let rollingNewsStore = storeManager2.GetRWStore("rollingNews");
  let isBroadcastingStore = storeManager2.GetRWStore("isBroadcasting");
  let headlineInput = state("");
  let selectedPrepared = [];
  let selectedRolling = [];
  let isEditing = state(false);
  const unsubscribe = rollingNewsStore.subscribe((currentRollingNews) => {
    if ($isBroadcastingStore()) {
      broadcastNews($$props.actor.name, currentRollingNews);
    }
  });
  user_effect(() => {
    if ($isBroadcastingStore()) {
      broadcastNews($$props.actor.name, $rollingNewsStore());
    } else {
      stopBroadcast($$props.actor.name);
    }
  });
  function addHeadline() {
    const trimmedInput = get$1(headlineInput).trim();
    if (get$1(isEditing) && selectedPrepared.length === 1) {
      const index2 = selectedPrepared[0];
      store_mutate(preparedNewsStore, untrack($preparedNewsStore)[index2] = trimmedInput, untrack($preparedNewsStore));
      store_set(preparedNewsStore, proxy([...$preparedNewsStore()]));
      set(isEditing, false);
      selectedPrepared = [];
    } else {
      store_set(preparedNewsStore, proxy([...$preparedNewsStore(), trimmedInput]));
    }
    set(headlineInput, "");
  }
  function deleteHeadlines() {
    const headlinesToDelete = selectedPrepared.map((i) => $preparedNewsStore()[i]);
    store_set(preparedNewsStore, proxy($preparedNewsStore().filter((_, i) => !selectedPrepared.includes(i))));
    store_set(rollingNewsStore, proxy($rollingNewsStore().filter((h) => !headlinesToDelete.includes(h))));
    selectedPrepared = [];
    set(headlineInput, "");
    set(isEditing, false);
  }
  function moveToRolling() {
    const moved = selectedPrepared.map((i) => $preparedNewsStore()[i]).filter(Boolean);
    store_set(preparedNewsStore, proxy($preparedNewsStore().filter((_, i) => !selectedPrepared.includes(i))));
    store_set(rollingNewsStore, proxy([
      ...$rollingNewsStore(),
      ...moved.filter((h) => !$rollingNewsStore().includes(h))
    ]));
    selectedPrepared = [];
    set(headlineInput, "");
    set(isEditing, false);
  }
  function moveToPrepared() {
    const moved = selectedRolling.map((i) => $rollingNewsStore()[i]).filter(Boolean);
    store_set(rollingNewsStore, proxy($rollingNewsStore().filter((_, i) => !selectedRolling.includes(i))));
    store_set(preparedNewsStore, proxy([
      ...$preparedNewsStore(),
      ...moved.filter((h) => !$preparedNewsStore().includes(h))
    ]));
    selectedRolling = [];
  }
  function updateSelectedHeadline() {
    if (selectedPrepared.length === 1) {
      set(headlineInput, proxy($preparedNewsStore()[selectedPrepared[0]]));
      set(isEditing, true);
    } else {
      set(headlineInput, "");
      set(isEditing, false);
    }
  }
  function commitName(event2) {
    const newName = event2.target.textContent.trim();
    if (newName !== $$props.actor.name) {
      $$props.actor.update({ name: newName });
    }
  }
  var fragment = root();
  var node = first_child(fragment);
  ItemSheetComponent(node, {
    children: ($$anchor2, $$slotProps) => {
      var div = root_1();
      var node_1 = child(div);
      Image(node_1, {
        get entity() {
          return $$props.actor;
        }
      });
      var div_1 = sibling(node_1, 2);
      var div_2 = child(div_1);
      var h1 = child(div_2);
      h1.__keydown = [on_keydown];
      var text2 = child(h1);
      var div_3 = sibling(div_2, 2);
      var input = sibling(child(div_3), 2);
      template_effect(() => set_text(text2, $$props.actor.name));
      event$1("blur", h1, (e) => commitName(e));
      bind_checked(input, $isBroadcastingStore, ($$value) => store_set(isBroadcastingStore, $$value));
      append($$anchor2, div);
    }
  });
  var node_2 = sibling(node, 2);
  ItemSheetComponent(node_2, {
    children: ($$anchor2, $$slotProps) => {
      var div_4 = root_2();
      var input_1 = child(div_4);
      var div_5 = sibling(input_1, 2);
      var button = child(div_5);
      button.__click = addHeadline;
      var i_1 = child(button);
      var button_1 = sibling(button, 2);
      button_1.__click = deleteHeadlines;
      template_effect(() => {
        set_attribute(input_1, "placeholder", get$1(isEditing) ? "Edit headline" : "Write a headline");
        set_attribute(button, "title", get$1(isEditing) ? "Update Headline" : "Add Headline");
        set_attribute(button, "aria-label", get$1(isEditing) ? "Update Headline" : "Add Headline");
        set_class(i_1, `fas ${(get$1(isEditing) ? "fa-save" : "fa-plus") ?? ""}`);
      });
      bind_value(input_1, () => get$1(headlineInput), ($$value) => set(headlineInput, $$value));
      append($$anchor2, div_4);
    }
  });
  var node_3 = sibling(node_2, 2);
  ItemSheetComponent(node_3, {
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = root_3();
      var div_6 = first_child(fragment_1);
      var select = sibling(child(div_6), 2);
      select.__change = updateSelectedHeadline;
      each(select, 5, $preparedNewsStore, index, ($$anchor3, headline, i) => {
        var option = root_4();
        option.value = null == (option.__value = i) ? "" : i;
        var text_1 = child(option);
        template_effect(() => set_text(text_1, get$1(headline)));
        append($$anchor3, option);
      });
      var div_7 = sibling(div_6, 2);
      var button_2 = child(div_7);
      button_2.__click = moveToRolling;
      var button_3 = sibling(button_2, 2);
      button_3.__click = moveToPrepared;
      var div_8 = sibling(div_7, 2);
      var select_1 = sibling(child(div_8), 2);
      each(select_1, 5, $rollingNewsStore, index, ($$anchor3, headline, i) => {
        var option_1 = root_5();
        option_1.value = null == (option_1.__value = i) ? "" : i;
        var text_2 = child(option_1);
        template_effect(() => set_text(text_2, get$1(headline)));
        append($$anchor3, option_1);
      });
      bind_select_value(select, () => selectedPrepared, ($$value) => selectedPrepared = $$value);
      bind_select_value(select_1, () => selectedRolling, ($$value) => selectedRolling = $$value);
      append($$anchor2, fragment_1);
    }
  });
  var node_4 = sibling(node_3, 2);
  JournalViewer(node_4, {
    get document() {
      return $$props.actor;
    },
    get config() {
      return $$props.config;
    }
  });
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
delegate(["keydown", "click", "change"]);
class BroadcasterActorSheet extends foundry.applications.sheets.ActorSheetV2 {
  constructor() {
    super(...arguments);
    __privateAdd(this, _app6);
    __privateAdd(this, _footer2);
  }
  static get DEFAULT_OPTIONS() {
    return {
      ...super.DEFAULT_OPTIONS,
      id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
      classes: ["sr3e", "sheet", "actor", "ActorSheetV2"],
      template: null,
      position: { width: 820, height: "auto" },
      window: { resizable: true },
      tag: "form",
      submitOnChange: true,
      closeOnSubmit: false
    };
  }
  _renderHTML() {
    return null;
  }
  _replaceHTML(_, windowContent) {
    if (__privateGet(this, _app6)) {
      unmount(__privateGet(this, _app6));
      __privateSet(this, _app6, null);
    }
    if (__privateGet(this, _footer2)) {
      unmount(__privateGet(this, _footer2));
      __privateSet(this, _footer2, null);
    }
    windowContent.innerHTML = "";
    const form = windowContent.parentNode;
    __privateSet(this, _app6, mount(BroadcasterApp, {
      target: windowContent,
      props: {
        actor: this.document,
        config: CONFIG.sr3e,
        form
      }
    }));
    this._injectFooter(form);
    return windowContent;
  }
  _injectFooter(form) {
    if (form.querySelector(".actor-footer")) return;
    const footer = document.createElement("div");
    footer.classList.add("actor-footer");
    const resizeHandle = form.querySelector(".window-resize-handle");
    if (resizeHandle == null ? void 0 : resizeHandle.parentNode) {
      resizeHandle.parentNode.insertBefore(footer, resizeHandle.nextSibling);
    } else {
      form.appendChild(footer);
    }
  }
  async _tearDown() {
    if (__privateGet(this, _app6)) await unmount(__privateGet(this, _app6));
    __privateSet(this, _app6, __privateSet(this, _footer2, null));
    return super._tearDown();
  }
  _onSubmit() {
    return false;
  }
  async _onDrop(event2) {
    event2.preventDefault();
    event2.stopPropagation();
    return false;
  }
}
_app6 = new WeakMap();
_footer2 = new WeakMap();
const { DocumentSheetConfig } = foundry.applications.apps;
function registerDocumentTypes({ args }) {
  args.forEach(({ docClass, type, model, sheet }) => {
    var _a;
    const docName = docClass.documentName;
    (_a = CONFIG[docName]).dataModels || (_a.dataModels = {});
    CONFIG[docName].dataModels[type] = model;
    DocumentSheetConfig.registerSheet(docClass, flags.sr3e, sheet, {
      types: [type],
      makeDefault: true
    });
  });
}
function configureProject() {
  SR3EActor.Register();
  SR3ECombat.Register();
  SR3Edie.Register();
  SR3ERoll.Register();
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
  CONFIG.Actor.typeLabels = {
    broadcaster: localize(CONFIG.sr3e.broadcaster.broadcaster),
    character: localize(CONFIG.sr3e.sheet.playercharacter),
    storytellerscreen: localize(CONFIG.sr3e.storytellerscreen.storytellerscreen)
  };
  CONFIG.Item.typeLabels = {
    ammunition: localize(CONFIG.sr3e.ammunition.ammunition),
    magic: localize(CONFIG.sr3e.magic.magic),
    metatype: localize(CONFIG.sr3e.traits.metatype),
    skill: localize(CONFIG.sr3e.skill.skill),
    transaction: localize(CONFIG.sr3e.transaction.transaction),
    weapon: localize(CONFIG.sr3e.weapon.weapon)
  };
  DocumentSheetConfig.unregisterSheet(Actor, flags.core, "ActorSheetV2");
  DocumentSheetConfig.unregisterSheet(Item, flags.core, "ItemSheetV2");
}
function setupMouseLightSourceEffect(includedThemes) {
  Hooks.on(hooks.renderApplicationV2, (app, html2) => {
    const activeTheme = game.settings.get("sr3e", "theme");
    console.log("active theme", activeTheme);
    if (includedThemes.includes(activeTheme)) {
      attachLightEffect(html2, activeTheme);
    }
  });
}
function configureThemes() {
  game.settings.register("sr3e", "theme", {
    name: "Theme",
    hint: "Choose a UI theme.",
    scope: "world",
    config: true,
    type: String,
    choices: { defaultDark: "Chummer Dark", defaultLight: "Chummer Light" },
    default: "defaultDark"
  });
  Hooks.on("ready", () => {
    const theme = game.settings.get("sr3e", "theme");
    document.body.classList.remove("theme-chummer", "theme-steel");
    document.body.classList.add(`theme-${theme}`);
  });
  setupMouseLightSourceEffect(["defaultDark", "defaultLight"]);
}
function wrapContent(root2) {
  var _a;
  if (!root2 || ((_a = root2.firstElementChild) == null ? void 0 : _a.classList.contains("sheet-component"))) return;
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
function setFlagsOnCharacterPreCreate(document2, data, options, userId) {
  const flagsToSet = [
    {
      namespace: flags.sr3e,
      flag: flags.actor.isCharacterCreation,
      value: true
    },
    { namespace: flags.sr3e, flag: flags.actor.hasAwakened, value: false },
    { namespace: flags.sr3e, flag: flags.actor.burntOut, value: false },
    {
      namespace: flags.sr3e,
      flag: flags.actor.attributeAssignmentLocked,
      value: false
    },
    {
      namespace: flags.sr3e,
      flag: flags.actor.persistanceBlobCharacterSheetSize,
      value: {}
    },
    { namespace: flags.sr3e, flag: flags.actor.isShoppingState, value: true }
  ];
  const updateData = {};
  flagsToSet.forEach(({ namespace, flag, value }) => {
    updateData[`flags.${namespace}.${flag}`] = value;
  });
  document2.updateSource(updateData);
}
function debugFlagsOnActor(actor, options, userId) {
  var _a;
  const actorFlags = (_a = actor.flags) == null ? void 0 : _a[flags.sr3e];
  if (!actorFlags) return console.warn("No sr3e flags found on actor:", actor);
  console.groupCollapsed(`Flags for actor "${actor.name}"`);
  for (const [key, value] of Object.entries(actorFlags)) {
    console.log(`→ ${key}:`, value);
  }
  console.groupEnd();
}
function wrapChatMessage(message, html2, context) {
  const isPopup = (context == null ? void 0 : context.canClose) && !(context == null ? void 0 : context.canDelete);
  if (isPopup) {
    console.log("=== POPUP CHAT MESSAGE DETECTED ===");
    console.log("HTML Element:\n", html2.outerHTML);
    console.log("Message:\n", message);
    console.log("Context:\n", context);
  }
  const wrapper = document.createElement("div");
  const dynamicBackground = document.createElement("div");
  const dynamicMessage = document.createElement("div");
  wrapper.classList.add("chat-message-wrapper");
  dynamicBackground.classList.add("chat-message-dynamic-background");
  dynamicMessage.classList.add("chat-message-dynamic");
  dynamicMessage.append(...html2.childNodes);
  wrapper.append(dynamicBackground);
  wrapper.append(dynamicMessage);
  html2.innerHTML = "";
  html2.appendChild(wrapper);
}
function applyAuthorColorToChatMessage(message, html2, context) {
  var _a;
  const color = (_a = message.author) == null ? void 0 : _a.color;
  if (color) {
    html2.style.setProperty("--author-color", color);
  }
}
function registerHooks() {
  Hooks.on(hooks.renderApplicationV2, (app, element) => {
    var _a;
    if ((_a = element.firstElementChild) == null ? void 0 : _a.classList.contains("sheet-component")) return;
    const typeSelectors = [
      { type: foundry.applications.api.DialogV2 },
      { type: foundry.applications.api.CategoryBrowser },
      { type: foundry.applications.api.DocumentSheetV2 },
      { type: foundry.applications.api.CategoryBrowser },
      { type: foundry.applications.sheets.journal.JournalEntryPageSheet },
      { type: foundry.applications.sheets.ActiveEffectConfig },
      { type: foundry.applications.sheets.AdventureImporterV2 },
      { type: foundry.applications.sheets.AmbientLightConfig },
      { type: foundry.applications.sheets.AmbientSoundConfig },
      { type: foundry.applications.sheets.CardConfig },
      { type: foundry.applications.sheets.CardDeckConfig },
      { type: foundry.applications.sheets.CardHandConfig },
      { type: foundry.applications.sheets.CardPileConfig },
      { type: foundry.applications.sheets.CardsConfig },
      { type: foundry.applications.sheets.CombatantConfig },
      { type: foundry.applications.sheets.DrawingConfig },
      { type: foundry.applications.sheets.FolderConfig },
      { type: foundry.applications.sheets.MacroConfig },
      { type: foundry.applications.sheets.MeasuredTemplateConfig },
      { type: foundry.applications.sheets.NoteConfig },
      { type: foundry.applications.sheets.PlaylistConfig },
      { type: foundry.applications.sheets.PlaylistSoundConfig },
      { type: foundry.applications.sheets.PrototypeTokenConfig },
      { type: foundry.applications.sheets.RegionBehaviorConfig },
      { type: foundry.applications.sheets.RegionConfig },
      { type: foundry.applications.sheets.RollTableSheet },
      { type: foundry.applications.sheets.SceneConfig },
      { type: foundry.applications.sheets.TableResultConfig },
      { type: foundry.applications.sheets.TileConfig },
      { type: foundry.applications.sheets.TokenConfig },
      { type: foundry.applications.sheets.UserConfig },
      { type: foundry.applications.sheets.WallConfig },
      { type: foundry.applications.apps.CombatTrackerConfig },
      { type: foundry.applications.apps.FilePicker },
      { type: foundry.applications.apps.PermissionConfig },
      { type: foundry.applications.apps.ImagePopout },
      { type: foundry.applications.apps.DocumentOwnershipConfig },
      { type: foundry.applications.apps.CombatTrackerConfig },
      { type: foundry.applications.apps.CompendiumArtConfig },
      { type: foundry.applications.apps.DocumentSheetConfig },
      { type: foundry.applications.apps.GridConfig },
      { type: foundry.applications.apps.av.CameraPopout },
      { type: foundry.applications.apps.av.CameraViews },
      { type: foundry.applications.sidebar.apps.ControlsConfig },
      { type: foundry.applications.sidebar.apps.ModuleManagement },
      { type: foundry.applications.sidebar.apps.WorldConfig },
      { type: foundry.applications.sidebar.apps.ToursManagement },
      { type: foundry.applications.sidebar.apps.SupportDetails },
      { type: foundry.applications.sidebar.apps.InvitationLinks },
      { type: foundry.applications.sidebar.apps.FolderExport },
      { type: foundry.applications.settings.SettingsConfig }
    ];
    const typeDeselectors = [
      { type: foundry.applications.sheets.ActorSheetV2 },
      { type: foundry.applications.sheets.ItemSheetV2 }
    ];
    if (typeDeselectors.some((entry) => app instanceof entry.type)) return;
    if (!typeSelectors.some((entry) => app instanceof entry.type)) return;
    wrapContent(element);
  });
  Hooks.on(hooks.preCreateActor, setFlagsOnCharacterPreCreate);
  Hooks.on(hooks.createActor, debugFlagsOnActor);
  Hooks.on(hooks.preCreateActor, stopDefaultCharacterSheetRenderOnCreation);
  Hooks.on(hooks.createActor, displayCreationDialog);
  Hooks.on(hooks.renderApplicationV2, injectCssSelectors);
  Hooks.on(hooks.renderChatMessageHTML, wrapChatMessage);
  Hooks.on(hooks.renderChatMessageHTML, applyAuthorColorToChatMessage);
  Hooks.on("createActiveEffect", (effect2, options, userId) => {
    if (effect2.parent instanceof Actor) {
      Hooks.callAll("actorSystemRecalculated", effect2.parent);
    }
  });
  Hooks.on("updateActiveEffect", (effect2, changes, options, userId) => {
    if (effect2.parent instanceof Actor) {
      Hooks.callAll("actorSystemRecalculated", effect2.parent);
    }
  });
  Hooks.on("deleteActiveEffect", (effect2, options, userId) => {
    if (effect2.parent instanceof Actor) {
      Hooks.callAll("actorSystemRecalculated", effect2.parent);
    }
  });
  Hooks.on("ready", () => {
    getNewsService();
    const activeBroadcasters = game.actors.filter(
      (actor) => actor.type === "broadcaster" && actor.system.isBroadcasting
    );
    activeBroadcasters.forEach((actor) => {
      const headlines = actor.system.rollingNews ?? [];
      broadcastNews(actor.name, headlines);
    });
  });
  Hooks.once(hooks.init, () => {
    configureProject();
    configureThemes();
    registerDocumentTypes({
      args: [
        {
          docClass: Actor,
          type: "character",
          model: CharacterModel,
          sheet: CharacterActorSheet
        },
        {
          docClass: Actor,
          type: "storytellerscreen",
          model: StorytellerScreenModel,
          sheet: StorytellerScreenActorSheet
        },
        {
          docClass: Actor,
          type: "broadcaster",
          model: BroadcasterModel,
          sheet: BroadcasterActorSheet
        },
        {
          docClass: Item,
          type: "metatype",
          model: MetatypeModel,
          sheet: MetatypeItemSheet
        },
        {
          docClass: Item,
          type: "magic",
          model: MagicModel,
          sheet: MagicItemSheet
        },
        {
          docClass: Item,
          type: "weapon",
          model: WeaponModel,
          sheet: WeaponItemSheet
        },
        {
          docClass: Item,
          type: "ammunition",
          model: AmmunitionModel,
          sheet: AmmunitionItemSheet
        },
        {
          docClass: Item,
          type: "skill",
          model: SkillModel,
          sheet: SkillItemSheet
        },
        {
          docClass: Item,
          type: "transaction",
          model: TransactionModel,
          sheet: TransactionItemSheet
        }
      ]
    });
    Log.success("Initialization Completed", "sr3e.js");
  });
}
registerHooks();
//# sourceMappingURL=bundle.js.map
