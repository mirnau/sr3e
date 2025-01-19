class Profile extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      names: new foundry.data.fields.ArrayField(
        new foundry.data.fields.SchemaField({
          alias: new foundry.data.fields.StringField({
            required: false,
            initial: "",
          }),
        }),
        {
          required: true,
          initial: [],
        }
      ),

      metaHumanity: new foundry.data.fields.StringField({
        required: false,
        initial: "",
      }),

      // Image
      img: new foundry.data.fields.StringField({
        required: false,
        initial: "systems/sr3d/textures/ai-generated/humans.webp",
      }),

      // Pronouns
      pronouns: new foundry.data.fields.StringField({
        required: false,
        initial: "Them/They",
      }),

      // Age
      age: new foundry.data.fields.NumberField({
        required: false,
        initial: 0,
        integer: true,
      }),

      // Weight
      weight: new foundry.data.fields.NumberField({
        required: false,
        initial: 0,
        integer: true,
      }),

      // Height
      height: new foundry.data.fields.NumberField({
        required: false,
        initial: 0,
        integer: true,
      }),

      // Quote
      quote: new foundry.data.fields.StringField({
        required: false,
        initial: "Alea iacta es",
      }),
    };
  }
}

class SimpleStat extends foundry.abstract.TypeDataModel {
    static defineSchema() {
      return {
        total: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        value: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        mod: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
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
        integer: true,
      }),
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
      running: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
    };
  }
}

// src/item/data/components/CreationModel.js

class Creation extends foundry.abstract.TypeDataModel {
    static defineSchema() {
      return {
        attributePoints: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        activePoints: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        knowledgePoints: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        languagePoints: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      };
    }
  }

class KarmaModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
      return {
        goodKarma: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        karmaPool: new foundry.data.fields.NumberField({
          required: true,
          initial: 1,
          integer: true,
        }),
        lifetimeKarma: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        miraculousSurvival: new foundry.data.fields.BooleanField({
          required: true,
          initial: false,
        }),
      };
    }
  }

class HealthModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      stun: new foundry.data.fields.ArrayField(
        new foundry.data.fields.BooleanField({
          required: true,
        }),
        {
          required: true,
          initial: Array(10).fill(false), // Default to 10 false values
        }
      ),
      physical: new foundry.data.fields.ArrayField(
        new foundry.data.fields.BooleanField({
          required: true,
        }),
        {
          required: true,
          initial: Array(10).fill(false), // Default to 10 false values
        }
      ),
      overflow: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      penalty: new foundry.data.fields.NumberField({ // Fix the typo here
        required: true,
        initial: 0,
        integer: true,
      }),
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
        initial: "",
      }),
    };
  }
}

// generated during release, do not modify

const PUBLIC_VERSION = '5';

if (typeof window !== 'undefined')
	// @ts-ignore
	(window.__svelte ||= { v: new Set() }).v.add(PUBLIC_VERSION);

let legacy_mode_flag = false;
let tracing_mode_flag = false;

function enable_legacy_mode_flag() {
	legacy_mode_flag = true;
}

enable_legacy_mode_flag();

const PROPS_IS_IMMUTABLE = 1;
const PROPS_IS_RUNES = 1 << 1;
const TEMPLATE_USE_IMPORT_NODE = 1 << 1;

var DEV = false;

// Store the references to globals in case someone tries to monkey patch these, causing the below
// to de-opt (this occurs often when using popular extensions).
var index_of = Array.prototype.indexOf;
var get_descriptor = Object.getOwnPropertyDescriptor;
var get_descriptors = Object.getOwnPropertyDescriptors;
var get_prototype_of = Object.getPrototypeOf;

/** @param {Function} fn */
function run(fn) {
	return fn();
}

/** @param {Array<() => void>} arr */
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
/** Svelte 4 legacy mode props need to be handled with deriveds and be recognized elsewhere, hence the dedicated flag */
const LEGACY_DERIVED_PROP = 1 << 17;
const HEAD_EFFECT = 1 << 19;
const EFFECT_HAS_DERIVED = 1 << 20;

const STATE_SYMBOL = Symbol('$state');
const LEGACY_PROPS = Symbol('legacy props');

/** @import { Equals } from '#client' */
/** @type {Equals} */
function equals(value) {
	return value === this.v;
}

/**
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
function safe_not_equal(a, b) {
	return a != a
		? b == b
		: a !== b || (a !== null && typeof a === 'object') || typeof a === 'function';
}

/** @type {Equals} */
function safe_equals(value) {
	return !safe_not_equal(value, this.v);
}

/* This file is generated by scripts/process-messages/index.js. Do not edit! */


/**
 * `%rune%` cannot be used inside an effect cleanup function
 * @param {string} rune
 * @returns {never}
 */
function effect_in_teardown(rune) {
	{
		throw new Error(`https://svelte.dev/e/effect_in_teardown`);
	}
}

/**
 * Effect cannot be created inside a `$derived` value that was not itself created inside an effect
 * @returns {never}
 */
function effect_in_unowned_derived() {
	{
		throw new Error(`https://svelte.dev/e/effect_in_unowned_derived`);
	}
}

/**
 * `%rune%` can only be used inside an effect (e.g. during component initialisation)
 * @param {string} rune
 * @returns {never}
 */
function effect_orphan(rune) {
	{
		throw new Error(`https://svelte.dev/e/effect_orphan`);
	}
}

/**
 * Maximum update depth exceeded. This can happen when a reactive block or effect repeatedly sets a new value. Svelte limits the number of nested updates to prevent infinite loops
 * @returns {never}
 */
function effect_update_depth_exceeded() {
	{
		throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
	}
}

/**
 * Reading state that was created inside the same derived is forbidden. Consider using `untrack` to read locally created state
 * @returns {never}
 */
function state_unsafe_local_read() {
	{
		throw new Error(`https://svelte.dev/e/state_unsafe_local_read`);
	}
}

/** @import { Derived, Effect, Reaction, Source, Value } from '#client' */

/**
 * @template V
 * @param {V} v
 * @param {Error | null} [stack]
 * @returns {Source<V>}
 */
function source(v, stack) {
	/** @type {Value} */
	var signal = {
		f: 0, // TODO ideally we could skip this altogether, but it causes type errors
		v,
		reactions: null,
		equals,
		rv: 0,
		wv: 0
	};

	return signal;
}

/** @import { TemplateNode } from '#client' */

/** @type {() => Node | null} */
var first_child_getter;
/** @type {() => Node | null} */
var next_sibling_getter;

/**
 * @template {Node} N
 * @param {N} node
 * @returns {Node | null}
 */
/*@__NO_SIDE_EFFECTS__*/
function get_first_child(node) {
	return first_child_getter.call(node);
}

/**
 * @template {Node} N
 * @param {N} node
 * @returns {Node | null}
 */
/*@__NO_SIDE_EFFECTS__*/
function get_next_sibling(node) {
	return next_sibling_getter.call(node);
}

/**
 * Don't mark this as side-effect-free, hydration needs to walk all nodes
 * @template {Node} N
 * @param {N} node
 * @param {boolean} is_text
 * @returns {Node | null}
 */
function child(node, is_text) {
	{
		return get_first_child(node);
	}
}

/**
 * Don't mark this as side-effect-free, hydration needs to walk all nodes
 * @param {TemplateNode} node
 * @param {number} count
 * @param {boolean} is_text
 * @returns {Node | null}
 */
function sibling(node, count = 1, is_text = false) {
	let next_sibling = node;

	while (count--) {
		next_sibling = /** @type {TemplateNode} */ (get_next_sibling(next_sibling));
	}

	{
		return next_sibling;
	}
}

/** @import { Derived, Effect } from '#client' */

/**
 * @template V
 * @param {() => V} fn
 * @returns {Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
function derived(fn) {
	var flags = DERIVED | DIRTY;

	if (active_effect === null) {
		flags |= UNOWNED;
	} else {
		// Since deriveds are evaluated lazily, any effects created inside them are
		// created too late to ensure that the parent effect is added to the tree
		active_effect.f |= EFFECT_HAS_DERIVED;
	}

	var parent_derived =
		active_reaction !== null && (active_reaction.f & DERIVED) !== 0
			? /** @type {Derived} */ (active_reaction)
			: null;

	/** @type {Derived<V>} */
	const signal = {
		children: null,
		ctx: component_context,
		deps: null,
		equals,
		f: flags,
		fn,
		reactions: null,
		rv: 0,
		v: /** @type {V} */ (null),
		wv: 0,
		parent: parent_derived ?? active_effect
	};

	if (parent_derived !== null) {
		(parent_derived.children ??= []).push(signal);
	}

	return signal;
}

/**
 * @template V
 * @param {() => V} fn
 * @returns {Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
function derived_safe_equal(fn) {
	const signal = derived(fn);
	signal.equals = safe_equals;
	return signal;
}

/**
 * @param {Derived} derived
 * @returns {void}
 */
function destroy_derived_children(derived) {
	var children = derived.children;

	if (children !== null) {
		derived.children = null;

		for (var i = 0; i < children.length; i += 1) {
			var child = children[i];
			if ((child.f & DERIVED) !== 0) {
				destroy_derived(/** @type {Derived} */ (child));
			} else {
				destroy_effect(/** @type {Effect} */ (child));
			}
		}
	}
}

/**
 * @param {Derived} derived
 * @returns {Effect | null}
 */
function get_derived_parent_effect(derived) {
	var parent = derived.parent;
	while (parent !== null) {
		if ((parent.f & DERIVED) === 0) {
			return /** @type {Effect} */ (parent);
		}
		parent = parent.parent;
	}
	return null;
}

/**
 * @template T
 * @param {Derived} derived
 * @returns {T}
 */
function execute_derived(derived) {
	var value;
	var prev_active_effect = active_effect;

	set_active_effect(get_derived_parent_effect(derived));

	{
		try {
			destroy_derived_children(derived);
			value = update_reaction(derived);
		} finally {
			set_active_effect(prev_active_effect);
		}
	}

	return value;
}

/**
 * @param {Derived} derived
 * @returns {void}
 */
function update_derived(derived) {
	var value = execute_derived(derived);
	var status =
		(skip_reaction || (derived.f & UNOWNED) !== 0) && derived.deps !== null ? MAYBE_DIRTY : CLEAN;

	set_signal_status(derived, status);

	if (!derived.equals(value)) {
		derived.v = value;
		derived.wv = increment_write_version();
	}
}

/**
 * @param {Derived} derived
 * @returns {void}
 */
function destroy_derived(derived) {
	destroy_derived_children(derived);
	remove_reactions(derived, 0);
	set_signal_status(derived, DESTROYED);

	derived.v = derived.children = derived.deps = derived.ctx = derived.reactions = null;
}

/** @import { ComponentContext, ComponentContextLegacy, Derived, Effect, TemplateNode, TransitionManager } from '#client' */

/**
 * @param {'$effect' | '$effect.pre' | '$inspect'} rune
 */
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

/**
 * @param {Effect} effect
 * @param {Effect} parent_effect
 */
function push_effect(effect, parent_effect) {
	var parent_last = parent_effect.last;
	if (parent_last === null) {
		parent_effect.last = parent_effect.first = effect;
	} else {
		parent_last.next = effect;
		effect.prev = parent_last;
		parent_effect.last = effect;
	}
}

/**
 * @param {number} type
 * @param {null | (() => void | (() => void))} fn
 * @param {boolean} sync
 * @param {boolean} push
 * @returns {Effect}
 */
function create_effect(type, fn, sync, push = true) {
	var is_root = (type & ROOT_EFFECT) !== 0;
	var parent_effect = active_effect;

	/** @type {Effect} */
	var effect = {
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
			update_effect(effect);
			effect.f |= EFFECT_RAN;
		} catch (e) {
			destroy_effect(effect);
			throw e;
		} finally {
			set_is_flushing_effect(previously_flushing_effect);
		}
	} else if (fn !== null) {
		schedule_effect(effect);
	}

	// if an effect has no dependencies, no DOM and no teardown function,
	// don't bother adding it to the effect tree
	var inert =
		sync &&
		effect.deps === null &&
		effect.first === null &&
		effect.nodes_start === null &&
		effect.teardown === null &&
		(effect.f & (EFFECT_HAS_DERIVED | BOUNDARY_EFFECT)) === 0;

	if (!inert && !is_root && push) {
		if (parent_effect !== null) {
			push_effect(effect, parent_effect);
		}

		// if we're in a derived, add the effect there too
		if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0) {
			var derived = /** @type {Derived} */ (active_reaction);
			(derived.children ??= []).push(effect);
		}
	}

	return effect;
}

/**
 * Internal representation of `$effect(...)`
 * @param {() => void | (() => void)} fn
 */
function user_effect(fn) {
	validate_effect();

	// Non-nested `$effect(...)` in a component should be deferred
	// until the component is mounted
	var defer =
		active_effect !== null &&
		(active_effect.f & BRANCH_EFFECT) !== 0 &&
		component_context !== null &&
		!component_context.m;

	if (defer) {
		var context = /** @type {ComponentContext} */ (component_context);
		(context.e ??= []).push({
			fn,
			effect: active_effect,
			reaction: active_reaction
		});
	} else {
		var signal = effect(fn);
		return signal;
	}
}

/**
 * Internal representation of `$effect.pre(...)`
 * @param {() => void | (() => void)} fn
 * @returns {Effect}
 */
function user_pre_effect(fn) {
	validate_effect();
	return render_effect(fn);
}

/**
 * @param {() => void | (() => void)} fn
 * @returns {Effect}
 */
function effect(fn) {
	return create_effect(EFFECT, fn, false);
}

/**
 * @param {() => void | (() => void)} fn
 * @returns {Effect}
 */
function render_effect(fn) {
	return create_effect(RENDER_EFFECT, fn, true);
}

/**
 * @param {Effect} effect
 */
function execute_effect_teardown(effect) {
	var teardown = effect.teardown;
	if (teardown !== null) {
		const previously_destroying_effect = is_destroying_effect;
		const previous_reaction = active_reaction;
		set_is_destroying_effect(true);
		set_active_reaction(null);
		try {
			teardown.call(null);
		} finally {
			set_is_destroying_effect(previously_destroying_effect);
			set_active_reaction(previous_reaction);
		}
	}
}

/**
 * @param {Effect} signal
 * @returns {void}
 */
function destroy_effect_deriveds(signal) {
	var deriveds = signal.deriveds;

	if (deriveds !== null) {
		signal.deriveds = null;

		for (var i = 0; i < deriveds.length; i += 1) {
			destroy_derived(deriveds[i]);
		}
	}
}

/**
 * @param {Effect} signal
 * @param {boolean} remove_dom
 * @returns {void}
 */
function destroy_effect_children(signal, remove_dom = false) {
	var effect = signal.first;
	signal.first = signal.last = null;

	while (effect !== null) {
		var next = effect.next;
		destroy_effect(effect, remove_dom);
		effect = next;
	}
}

/**
 * @param {Effect} signal
 * @returns {void}
 */
function destroy_block_effect_children(signal) {
	var effect = signal.first;

	while (effect !== null) {
		var next = effect.next;
		if ((effect.f & BRANCH_EFFECT) === 0) {
			destroy_effect(effect);
		}
		effect = next;
	}
}

/**
 * @param {Effect} effect
 * @param {boolean} [remove_dom]
 * @returns {void}
 */
function destroy_effect(effect, remove_dom = true) {
	var removed = false;

	if ((remove_dom || (effect.f & HEAD_EFFECT) !== 0) && effect.nodes_start !== null) {
		/** @type {TemplateNode | null} */
		var node = effect.nodes_start;
		var end = effect.nodes_end;

		while (node !== null) {
			/** @type {TemplateNode | null} */
			var next = node === end ? null : /** @type {TemplateNode} */ (get_next_sibling(node));

			node.remove();
			node = next;
		}

		removed = true;
	}

	destroy_effect_children(effect, remove_dom && !removed);
	destroy_effect_deriveds(effect);
	remove_reactions(effect, 0);
	set_signal_status(effect, DESTROYED);

	var transitions = effect.transitions;

	if (transitions !== null) {
		for (const transition of transitions) {
			transition.stop();
		}
	}

	execute_effect_teardown(effect);

	var parent = effect.parent;

	// If the parent doesn't have any children, then skip this work altogether
	if (parent !== null && parent.first !== null) {
		unlink_effect(effect);
	}

	// `first` and `child` are nulled out in destroy_effect_children
	// we don't null out `parent` so that error propagation can work correctly
	effect.next =
		effect.prev =
		effect.teardown =
		effect.ctx =
		effect.deps =
		effect.fn =
		effect.nodes_start =
		effect.nodes_end =
			null;
}

/**
 * Detach an effect from the effect tree, freeing up memory and
 * reducing the amount of work that happens on subsequent traversals
 * @param {Effect} effect
 */
function unlink_effect(effect) {
	var parent = effect.parent;
	var prev = effect.prev;
	var next = effect.next;

	if (prev !== null) prev.next = next;
	if (next !== null) next.prev = prev;

	if (parent !== null) {
		if (parent.first === effect) parent.first = next;
		if (parent.last === effect) parent.last = prev;
	}
}

/** @import { ComponentContext, Derived, Effect, Reaction, Signal, Source, Value } from '#client' */
let is_throwing_error = false;
// Used for handling scheduling
let is_micro_task_queued = false;

/** @type {Effect | null} */
let last_scheduled_effect = null;

let is_flushing_effect = false;
let is_destroying_effect = false;

/** @param {boolean} value */
function set_is_flushing_effect(value) {
	is_flushing_effect = value;
}

/** @param {boolean} value */
function set_is_destroying_effect(value) {
	is_destroying_effect = value;
}

// Handle effect queues

/** @type {Effect[]} */
let queued_root_effects = [];

let flush_count = 0;
/** @type {Effect[]} Stack of effects, dev only */
let dev_effect_stack = [];
// Handle signal reactivity tree dependencies and reactions

/** @type {null | Reaction} */
let active_reaction = null;

/** @param {null | Reaction} reaction */
function set_active_reaction(reaction) {
	active_reaction = reaction;
}

/** @type {null | Effect} */
let active_effect = null;

/** @param {null | Effect} effect */
function set_active_effect(effect) {
	active_effect = effect;
}

/**
 * When sources are created within a derived, we record them so that we can safely allow
 * local mutations to these sources without the side-effect error being invoked unnecessarily.
 * @type {null | Source[]}
 */
let derived_sources = null;

/**
 * The dependencies of the reaction that is currently being executed. In many cases,
 * the dependencies are unchanged between runs, and so this will be `null` unless
 * and until a new dependency is accessed — we track this via `skipped_deps`
 * @type {null | Value[]}
 */
let new_deps = null;

let skipped_deps = 0;

/**
 * Tracks writes that the effect it's executed in doesn't listen to yet,
 * so that the dependency can be added to the effect later on if it then reads it
 * @type {null | Source[]}
 */
let untracked_writes = null;

/**
 * @type {number} Used by sources and deriveds for handling updates.
 * Version starts from 1 so that unowned deriveds differentiate between a created effect and a run one for tracing
 **/
let write_version = 1;

/** @type {number} Used to version each read of a source of derived to avoid duplicating depedencies inside a reaction */
let read_version = 0;

// If we are working with a get() chain that has no active container,
// to prevent memory leaks, we skip adding the reaction.
let skip_reaction = false;

// Handling runtime component context
/** @type {ComponentContext | null} */
let component_context = null;

function increment_write_version() {
	return ++write_version;
}

/** @returns {boolean} */
function is_runes() {
	return !legacy_mode_flag || (component_context !== null && component_context.l === null);
}

/**
 * Determines whether a derived or effect is dirty.
 * If it is MAYBE_DIRTY, will set the status to CLEAN
 * @param {Reaction} reaction
 * @returns {boolean}
 */
function check_dirtiness(reaction) {
	var flags = reaction.f;

	if ((flags & DIRTY) !== 0) {
		return true;
	}

	if ((flags & MAYBE_DIRTY) !== 0) {
		var dependencies = reaction.deps;
		var is_unowned = (flags & UNOWNED) !== 0;

		if (dependencies !== null) {
			var i;
			var dependency;
			var is_disconnected = (flags & DISCONNECTED) !== 0;
			var is_unowned_connected = is_unowned && active_effect !== null && !skip_reaction;
			var length = dependencies.length;

			// If we are working with a disconnected or an unowned signal that is now connected (due to an active effect)
			// then we need to re-connect the reaction to the dependency
			if (is_disconnected || is_unowned_connected) {
				for (i = 0; i < length; i++) {
					dependency = dependencies[i];

					// We always re-add all reactions (even duplicates) if the derived was
					// previously disconnected
					if (is_disconnected || !dependency?.reactions?.includes(reaction)) {
						(dependency.reactions ??= []).push(reaction);
					}
				}

				if (is_disconnected) {
					reaction.f ^= DISCONNECTED;
				}
			}

			for (i = 0; i < length; i++) {
				dependency = dependencies[i];

				if (check_dirtiness(/** @type {Derived} */ (dependency))) {
					update_derived(/** @type {Derived} */ (dependency));
				}

				if (dependency.wv > reaction.wv) {
					return true;
				}
			}
		}

		// Unowned signals should never be marked as clean unless they
		// are used within an active_effect without skip_reaction
		if (!is_unowned || (active_effect !== null && !skip_reaction)) {
			set_signal_status(reaction, CLEAN);
		}
	}

	return false;
}

/**
 * @param {unknown} error
 * @param {Effect} effect
 */
function propagate_error(error, effect) {
	/** @type {Effect | null} */
	var current = effect;

	while (current !== null) {
		if ((current.f & BOUNDARY_EFFECT) !== 0) {
			try {
				// @ts-expect-error
				current.fn(error);
				return;
			} catch {
				// Remove boundary flag from effect
				current.f ^= BOUNDARY_EFFECT;
			}
		}

		current = current.parent;
	}

	is_throwing_error = false;
	throw error;
}

/**
 * @param {Effect} effect
 */
function should_rethrow_error(effect) {
	return (
		(effect.f & DESTROYED) === 0 &&
		(effect.parent === null || (effect.parent.f & BOUNDARY_EFFECT) === 0)
	);
}

/**
 * @param {unknown} error
 * @param {Effect} effect
 * @param {Effect | null} previous_effect
 * @param {ComponentContext | null} component_context
 */
function handle_error(error, effect, previous_effect, component_context) {
	if (is_throwing_error) {
		if (previous_effect === null) {
			is_throwing_error = false;
		}

		if (should_rethrow_error(effect)) {
			throw error;
		}

		return;
	}

	if (previous_effect !== null) {
		is_throwing_error = true;
	}

	{
		propagate_error(error, effect);
		return;
	}
}

/**
 * @param {Value} signal
 * @param {Effect} effect
 * @param {number} [depth]
 */
function schedule_possible_effect_self_invalidation(signal, effect, depth = 0) {
	var reactions = signal.reactions;
	if (reactions === null) return;

	for (var i = 0; i < reactions.length; i++) {
		var reaction = reactions[i];
		if ((reaction.f & DERIVED) !== 0) {
			schedule_possible_effect_self_invalidation(
				/** @type {Derived} */ (reaction),
				effect,
				depth + 1
			);
		} else if (effect === reaction) {
			if (depth === 0) {
				set_signal_status(reaction, DIRTY);
			} else if ((reaction.f & CLEAN) !== 0) {
				set_signal_status(reaction, MAYBE_DIRTY);
			}
			schedule_effect(/** @type {Effect} */ (reaction));
		}
	}
}

/**
 * @template V
 * @param {Reaction} reaction
 * @returns {V}
 */
function update_reaction(reaction) {
	var previous_deps = new_deps;
	var previous_skipped_deps = skipped_deps;
	var previous_untracked_writes = untracked_writes;
	var previous_reaction = active_reaction;
	var previous_skip_reaction = skip_reaction;
	var prev_derived_sources = derived_sources;
	var previous_component_context = component_context;
	var flags = reaction.f;

	new_deps = /** @type {null | Value[]} */ (null);
	skipped_deps = 0;
	untracked_writes = null;
	active_reaction = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;
	skip_reaction = !is_flushing_effect && (flags & UNOWNED) !== 0;
	derived_sources = null;
	component_context = reaction.ctx;
	read_version++;

	try {
		var result = /** @type {Function} */ (0, reaction.fn)();
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
					(deps[i].reactions ??= []).push(reaction);
				}
			}
		} else if (deps !== null && skipped_deps < deps.length) {
			remove_reactions(reaction, skipped_deps);
			deps.length = skipped_deps;
		}

		// If we're inside an effect and we have untracked writes, then we need to
		// ensure that if any of those untracked writes result in re-invalidation
		// of the current effect, then that happens accordingly
		if (
			is_runes() &&
			untracked_writes !== null &&
			(reaction.f & (DERIVED | MAYBE_DIRTY | DIRTY)) === 0
		) {
			for (i = 0; i < /** @type {Source[]} */ (untracked_writes).length; i++) {
				schedule_possible_effect_self_invalidation(
					untracked_writes[i],
					/** @type {Effect} */ (reaction)
				);
			}
		}

		// If we are returning to an previous reaction then
		// we need to increment the read version to ensure that
		// any dependencies in this reaction aren't marked with
		// the same version
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
	}
}

/**
 * @template V
 * @param {Reaction} signal
 * @param {Value<V>} dependency
 * @returns {void}
 */
function remove_reaction(signal, dependency) {
	let reactions = dependency.reactions;
	if (reactions !== null) {
		var index = index_of.call(reactions, signal);
		if (index !== -1) {
			var new_length = reactions.length - 1;
			if (new_length === 0) {
				reactions = dependency.reactions = null;
			} else {
				// Swap with last element and then remove.
				reactions[index] = reactions[new_length];
				reactions.pop();
			}
		}
	}
	// If the derived has no reactions, then we can disconnect it from the graph,
	// allowing it to either reconnect in the future, or be GC'd by the VM.
	if (
		reactions === null &&
		(dependency.f & DERIVED) !== 0 &&
		// Destroying a child effect while updating a parent effect can cause a dependency to appear
		// to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
		// allows us to skip the expensive work of disconnecting and immediately reconnecting it
		(new_deps === null || !new_deps.includes(dependency))
	) {
		set_signal_status(dependency, MAYBE_DIRTY);
		// If we are working with a derived that is owned by an effect, then mark it as being
		// disconnected.
		if ((dependency.f & (UNOWNED | DISCONNECTED)) === 0) {
			dependency.f ^= DISCONNECTED;
		}
		remove_reactions(/** @type {Derived} **/ (dependency), 0);
	}
}

/**
 * @param {Reaction} signal
 * @param {number} start_index
 * @returns {void}
 */
function remove_reactions(signal, start_index) {
	var dependencies = signal.deps;
	if (dependencies === null) return;

	for (var i = start_index; i < dependencies.length; i++) {
		remove_reaction(signal, dependencies[i]);
	}
}

/**
 * @param {Effect} effect
 * @returns {void}
 */
function update_effect(effect) {
	var flags = effect.f;

	if ((flags & DESTROYED) !== 0) {
		return;
	}

	set_signal_status(effect, CLEAN);

	var previous_effect = active_effect;
	var previous_component_context = component_context;

	active_effect = effect;

	try {
		if ((flags & BLOCK_EFFECT) !== 0) {
			destroy_block_effect_children(effect);
		} else {
			destroy_effect_children(effect);
		}
		destroy_effect_deriveds(effect);

		execute_effect_teardown(effect);
		var teardown = update_reaction(effect);
		effect.teardown = typeof teardown === 'function' ? teardown : null;
		effect.wv = write_version;

		var deps = effect.deps;

		// In DEV, we need to handle a case where $inspect.trace() might
		// incorrectly state a source dependency has not changed when it has.
		// That's beacuse that source was changed by the same effect, causing
		// the versions to match. We can avoid this by incrementing the version
		var dep; if (DEV && tracing_mode_flag && (effect.f & DIRTY) !== 0 && deps !== null) ;

		if (DEV) ;
	} catch (error) {
		handle_error(error, effect, previous_effect, previous_component_context || effect.ctx);
	} finally {
		active_effect = previous_effect;
	}
}

function infinite_loop_guard() {
	if (flush_count > 1000) {
		flush_count = 0;
		try {
			effect_update_depth_exceeded();
		} catch (error) {
			// Try and handle the error so it can be caught at a boundary, that's
			// if there's an effect available from when it was last scheduled
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

/**
 * @param {Array<Effect>} root_effects
 * @returns {void}
 */
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
			var effect = root_effects[i];

			if ((effect.f & CLEAN) === 0) {
				effect.f ^= CLEAN;
			}

			/** @type {Effect[]} */
			var collected_effects = [];

			process_effects(effect, collected_effects);
			flush_queued_effects(collected_effects);
		}
	} finally {
		is_flushing_effect = previously_flushing_effect;
	}
}

/**
 * @param {Array<Effect>} effects
 * @returns {void}
 */
function flush_queued_effects(effects) {
	var length = effects.length;
	if (length === 0) return;

	for (var i = 0; i < length; i++) {
		var effect = effects[i];

		if ((effect.f & (DESTROYED | INERT)) === 0) {
			try {
				if (check_dirtiness(effect)) {
					update_effect(effect);

					// Effects with no dependencies or teardown do not get added to the effect tree.
					// Deferred effects (e.g. `$effect(...)`) _are_ added to the tree because we
					// don't know if we need to keep them until they are executed. Doing the check
					// here (rather than in `update_effect`) allows us to skip the work for
					// immediate effects.
					if (effect.deps === null && effect.first === null && effect.nodes_start === null) {
						if (effect.teardown === null) {
							// remove this effect from the graph
							unlink_effect(effect);
						} else {
							// keep the effect in the graph, but free up some memory
							effect.fn = null;
						}
					}
				}
			} catch (error) {
				handle_error(error, effect, null, effect.ctx);
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

/**
 * @param {Effect} signal
 * @returns {void}
 */
function schedule_effect(signal) {
	{
		if (!is_micro_task_queued) {
			is_micro_task_queued = true;
			queueMicrotask(process_deferred);
		}
	}

	last_scheduled_effect = signal;

	var effect = signal;

	while (effect.parent !== null) {
		effect = effect.parent;
		var flags = effect.f;

		if ((flags & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
			if ((flags & CLEAN) === 0) return;
			effect.f ^= CLEAN;
		}
	}

	queued_root_effects.push(effect);
}

/**
 *
 * This function both runs render effects and collects user effects in topological order
 * from the starting effect passed in. Effects will be collected when they match the filtered
 * bitwise flag passed in only. The collected effects array will be populated with all the user
 * effects to be flushed.
 *
 * @param {Effect} effect
 * @param {Effect[]} collected_effects
 * @returns {void}
 */
function process_effects(effect, collected_effects) {
	var current_effect = effect.first;
	var effects = [];

	main_loop: while (current_effect !== null) {
		var flags = current_effect.f;
		var is_branch = (flags & BRANCH_EFFECT) !== 0;
		var is_skippable_branch = is_branch && (flags & CLEAN) !== 0;
		var sibling = current_effect.next;

		if (!is_skippable_branch && (flags & INERT) === 0) {
			if ((flags & RENDER_EFFECT) !== 0) {
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

				var child = current_effect.first;

				if (child !== null) {
					current_effect = child;
					continue;
				}
			} else if ((flags & EFFECT) !== 0) {
				effects.push(current_effect);
			}
		}

		if (sibling === null) {
			let parent = current_effect.parent;

			while (parent !== null) {
				if (effect === parent) {
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

		current_effect = sibling;
	}

	// We might be dealing with many effects here, far more than can be spread into
	// an array push call (callstack overflow). So let's deal with each effect in a loop.
	for (var i = 0; i < effects.length; i++) {
		child = effects[i];
		collected_effects.push(child);
		process_effects(child, collected_effects);
	}
}

/**
 * @template V
 * @param {Value<V>} signal
 * @returns {V}
 */
function get(signal) {
	var flags = signal.f;
	var is_derived = (flags & DERIVED) !== 0;

	// If the derived is destroyed, just execute it again without retaining
	// its memoisation properties as the derived is stale
	if (is_derived && (flags & DESTROYED) !== 0) {
		var value = execute_derived(/** @type {Derived} */ (signal));
		// Ensure the derived remains destroyed
		destroy_derived(/** @type {Derived} */ (signal));
		return value;
	}

	// Register the dependency on the current reaction signal.
	if (active_reaction !== null) {
		if (derived_sources !== null && derived_sources.includes(signal)) {
			state_unsafe_local_read();
		}
		var deps = active_reaction.deps;
		if (signal.rv < read_version) {
			signal.rv = read_version;
			// If the signal is accessing the same dependencies in the same
			// order as it did last time, increment `skipped_deps`
			// rather than updating `new_deps`, which creates GC cost
			if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
				skipped_deps++;
			} else if (new_deps === null) {
				new_deps = [signal];
			} else {
				new_deps.push(signal);
			}
		}
	} else if (is_derived && /** @type {Derived} */ (signal).deps === null) {
		var derived = /** @type {Derived} */ (signal);
		var parent = derived.parent;
		var target = derived;

		while (parent !== null) {
			// Attach the derived to the nearest parent effect, if there are deriveds
			// in between then we also need to attach them too
			if ((parent.f & DERIVED) !== 0) {
				var parent_derived = /** @type {Derived} */ (parent);

				target = parent_derived;
				parent = parent_derived.parent;
			} else {
				var parent_effect = /** @type {Effect} */ (parent);

				if (!parent_effect.deriveds?.includes(target)) {
					(parent_effect.deriveds ??= []).push(target);
				}
				break;
			}
		}
	}

	if (is_derived) {
		derived = /** @type {Derived} */ (signal);

		if (check_dirtiness(derived)) {
			update_derived(derived);
		}
	}

	return signal.v;
}

/**
 * When used inside a [`$derived`](https://svelte.dev/docs/svelte/$derived) or [`$effect`](https://svelte.dev/docs/svelte/$effect),
 * any state read inside `fn` will not be treated as a dependency.
 *
 * ```ts
 * $effect(() => {
 *   // this will run when `data` changes, but not when `time` changes
 *   save(data, {
 *     timestamp: untrack(() => time)
 *   });
 * });
 * ```
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
function untrack(fn) {
	const previous_reaction = active_reaction;
	try {
		active_reaction = null;
		return fn();
	} finally {
		active_reaction = previous_reaction;
	}
}

const STATUS_MASK = -7169;

/**
 * @param {Signal} signal
 * @param {number} status
 * @returns {void}
 */
function set_signal_status(signal, status) {
	signal.f = (signal.f & STATUS_MASK) | status;
}

/**
 * @param {Record<string, unknown>} props
 * @param {any} runes
 * @param {Function} [fn]
 * @returns {void}
 */
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

/**
 * @template {Record<string, any>} T
 * @param {T} [component]
 * @returns {T}
 */
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
	// Micro-optimization: Don't set .a above to the empty object
	// so it can be garbage-collected when the return here is unused
	return /** @type {T} */ ({});
}

/**
 * Possibly traverse an object and read all its properties so that they're all reactive in case this is `$state`.
 * Does only check first level of an object for performance reasons (heuristic should be good for 99% of all cases).
 * @param {any} value
 * @returns {void}
 */
function deep_read_state(value) {
	if (typeof value !== 'object' || !value || value instanceof EventTarget) {
		return;
	}

	if (STATE_SYMBOL in value) {
		deep_read(value);
	} else if (!Array.isArray(value)) {
		for (let key in value) {
			const prop = value[key];
			if (typeof prop === 'object' && prop && STATE_SYMBOL in prop) {
				deep_read(prop);
			}
		}
	}
}

/**
 * Deeply traverse an object and read all its properties
 * so that they're all reactive in case this is `$state`
 * @param {any} value
 * @param {Set<any>} visited
 * @returns {void}
 */
function deep_read(value, visited = new Set()) {
	if (
		typeof value === 'object' &&
		value !== null &&
		// We don't want to traverse DOM elements
		!(value instanceof EventTarget) &&
		!visited.has(value)
	) {
		visited.add(value);
		// When working with a possible SvelteDate, this
		// will ensure we capture changes to it.
		if (value instanceof Date) {
			value.getTime();
		}
		for (let key in value) {
			try {
				deep_read(value[key], visited);
			} catch (e) {
				// continue
			}
		}
		const proto = get_prototype_of(value);
		if (
			proto !== Object.prototype &&
			proto !== Array.prototype &&
			proto !== Map.prototype &&
			proto !== Set.prototype &&
			proto !== Date.prototype
		) {
			const descriptors = get_descriptors(proto);
			for (let key in descriptors) {
				const get = descriptors[key].get;
				if (get) {
					try {
						get.call(value);
					} catch (e) {
						// continue
					}
				}
			}
		}
	}
}

/** @param {string} html */
function create_fragment_from_html(html) {
	var elem = document.createElement('template');
	elem.innerHTML = html;
	return elem.content;
}

/** @import { Effect, TemplateNode } from '#client' */

/**
 * @param {TemplateNode} start
 * @param {TemplateNode | null} end
 */
function assign_nodes(start, end) {
	var effect = /** @type {Effect} */ (active_effect);
	if (effect.nodes_start === null) {
		effect.nodes_start = start;
		effect.nodes_end = end;
	}
}

/**
 * @param {string} content
 * @param {number} flags
 * @returns {() => Node | Node[]}
 */
/*#__NO_SIDE_EFFECTS__*/
function template(content, flags) {
	var use_import_node = (flags & TEMPLATE_USE_IMPORT_NODE) !== 0;

	/** @type {Node} */
	var node;

	/**
	 * Whether or not the first item is a text/element node. If not, we need to
	 * create an additional comment node to act as `effect.nodes.start`
	 */
	var has_start = !content.startsWith('<!>');

	return () => {

		if (node === undefined) {
			node = create_fragment_from_html(has_start ? content : '<!>' + content);
			node = /** @type {Node} */ (get_first_child(node));
		}

		var clone = /** @type {TemplateNode} */ (
			use_import_node ? document.importNode(node, true) : node.cloneNode(true)
		);

		{
			assign_nodes(clone, clone);
		}

		return clone;
	};
}

/**
 * Assign the created (or in hydration mode, traversed) dom elements to the current block
 * and insert the elements into the dom (in client mode).
 * @param {Text | Comment | Element} anchor
 * @param {DocumentFragment | Element} dom
 */
function append(anchor, dom) {

	if (anchor === null) {
		// edge case — void `<svelte:element>` with content
		return;
	}

	anchor.before(/** @type {Node} */ (dom));
}

/** @import { ComponentContextLegacy } from '#client' */

/**
 * Legacy-mode only: Call `onMount` callbacks and set up `beforeUpdate`/`afterUpdate` effects
 * @param {boolean} [immutable]
 */
function init(immutable = false) {
	const context = /** @type {ComponentContextLegacy} */ (component_context);

	const callbacks = context.l.u;
	if (!callbacks) return;

	let props = () => deep_read_state(context.s);

	if (immutable) {
		let version = 0;
		let prev = /** @type {Record<string, any>} */ ({});

		// In legacy immutable mode, before/afterUpdate only fire if the object identity of a prop changes
		const d = derived(() => {
			let changed = false;
			const props = context.s;
			for (const key in props) {
				if (props[key] !== prev[key]) {
					prev[key] = props[key];
					changed = true;
				}
			}
			if (changed) version++;
			return version;
		});

		props = () => get(d);
	}

	// beforeUpdate
	if (callbacks.b.length) {
		user_pre_effect(() => {
			observe_all(context, props);
			run_all(callbacks.b);
		});
	}

	// onMount (must run before afterUpdate)
	user_effect(() => {
		const fns = untrack(() => callbacks.m.map(run));
		return () => {
			for (const fn of fns) {
				if (typeof fn === 'function') {
					fn();
				}
			}
		};
	});

	// afterUpdate
	if (callbacks.a.length) {
		user_effect(() => {
			observe_all(context, props);
			run_all(callbacks.a);
		});
	}
}

/**
 * Invoke the getter of all signals associated with a component
 * so they can be registered to the effect this function is called in.
 * @param {ComponentContextLegacy} context
 * @param {(() => void)} props
 */
function observe_all(context, props) {
	if (context.l.s) {
		for (const signal of context.l.s) get(signal);
	}

	props();
}

/** @import { StoreReferencesContainer } from '#client' */
/** @import { Store } from '#shared' */

/**
 * Whether or not the prop currently being read is a store binding, as in
 * `<Child bind:x={$y} />`. If it is, we treat the prop as mutable even in
 * runes mode, and skip `binding_property_non_reactive` validation
 */
let is_store_binding = false;

/**
 * Returns a tuple that indicates whether `fn()` reads a prop that is a store binding.
 * Used to prevent `binding_property_non_reactive` validation false positives and
 * ensure that these props are treated as mutable even in runes mode
 * @template T
 * @param {() => T} fn
 * @returns {[T, boolean]}
 */
function capture_store_binding(fn) {
	var previous_is_store_binding = is_store_binding;

	try {
		is_store_binding = false;
		return [fn(), is_store_binding];
	} finally {
		is_store_binding = previous_is_store_binding;
	}
}

/** @import { Source } from './types.js' */

/**
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
function with_parent_branch(fn) {
	var effect = active_effect;
	var previous_effect = active_effect;

	while (effect !== null && (effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0) {
		effect = effect.parent;
	}
	try {
		set_active_effect(effect);
		return fn();
	} finally {
		set_active_effect(previous_effect);
	}
}

/**
 * This function is responsible for synchronizing a possibly bound prop with the inner component state.
 * It is used whenever the compiler sees that the component writes to the prop, or when it has a default prop_value.
 * @template V
 * @param {Record<string, unknown>} props
 * @param {string} key
 * @param {number} flags
 * @param {V | (() => V)} [fallback]
 * @returns {(() => V | ((arg: V) => V) | ((arg: V, mutation: boolean) => V))}
 */
function prop(props, key, flags, fallback) {
	var immutable = (flags & PROPS_IS_IMMUTABLE) !== 0;
	var runes = !legacy_mode_flag || (flags & PROPS_IS_RUNES) !== 0;

	{
		capture_store_binding(() => /** @type {V} */ (props[key]));
	}

	// Can be the case when someone does `mount(Component, props)` with `let props = $state({...})`
	// or `createClassComponent(Component, props)`
	var is_entry_props = STATE_SYMBOL in props || LEGACY_PROPS in props;

	((get_descriptor(props, key)?.set ??
				(is_entry_props && key in props && ((v) => (props[key] = v))))) ||
		undefined;

	var fallback_value = /** @type {V} */ (fallback);
	var fallback_dirty = true;

	var get_fallback = () => {
		if (fallback_dirty) {
			fallback_dirty = false;
			{
				fallback_value = /** @type {V} */ (fallback);
			}
		}

		return fallback_value;
	};

	/** @type {() => V} */
	var getter;
	if (runes) {
		getter = () => {
			var value = /** @type {V} */ (props[key]);
			if (value === undefined) return get_fallback();
			fallback_dirty = true;
			return value;
		};
	} else {
		// Svelte 4 did not trigger updates when a primitive value was updated to the same value.
		// Replicate that behavior through using a derived
		var derived_getter = with_parent_branch(() =>
			(immutable ? derived : derived_safe_equal)(() => /** @type {V} */ (props[key]))
		);
		derived_getter.f |= LEGACY_DERIVED_PROP;
		getter = () => {
			var value = get(derived_getter);
			if (value !== undefined) fallback_value = /** @type {V} */ (undefined);
			return value === undefined ? fallback_value : value;
		};
	}

	// easy mode — prop is never written to
	{
		return getter;
	}
}

var root = template(`<div><h1></h1> <p></p></div>`);

function CharacterSheetApp($$anchor, $$props) {
	push($$props, false);

	let actor = prop($$props, 'actor', 8);

	// Log the actor prop to the console
	console.log("Actor in Svelte App:", actor());

	// Fallbacks to ensure rendering does not break
	let name = actor()?.name || "Unknown Actor";
	let type = actor()?.type || "Unknown Type";

	init();

	var div = root();
	var h1 = child(div);

	h1.textContent = name;

	var p = sibling(h1, 2);

	p.textContent = `Type: ${type}`;
	append($$anchor, div);
	pop();
}

class CharacterActorSheet extends ActorSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['sr3e', 'sheet', 'character'],
            template: 'systems/sr3e/templates/sheet/actor/character-sheet.html',
            width: 800,
            height: 600,
        });
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        const selector = ".window-content";

        const container = document.querySelector(selector);
        container.innerHTML = '';

        if (container) {
            console.log("Mounting Svelte app...");
            this.svelteApp = new CharacterSheetApp({
                target: container,
                props: { actor: { name: "Test Actor", type: "Test Type" } },
            });

        } else {
            console.warn(`Container not found. Ensure ${selector} exists in the template.`);
        }

        console.log("End of Activate Listeners");
    }

    /** @override */
    close(options) {
        if (this.svelteApp) {
            console.log("Destroying Svelte app...");
            this.svelteApp.$destroy();
            this.svelteApp = null;
        }
        return super.close(options);
    }
}

async function registerTemplatesFromPathsAsync() {
  const rootFolder = "systems/sr3e/templates";
  const paths = [];

  async function gatherFiles(folder) {
      const { files, dirs } = await FilePicker.browse("data", folder);
      paths.push(...files.filter(file => file.endsWith(".hbs")));
      await Promise.all(dirs.map(gatherFiles));
  }

  await gatherFiles(rootFolder);
  return loadTemplates(paths);
}

Hooks.once("init", function () {

  Actors.unregisterSheet("core", ActorSheet);

  CONFIG.Actor.dataModels = {
      "character": CharacterModel,
  };

  Actors.registerSheet("sr3e", CharacterActorSheet, { types: ["character"], makeDefault: true });

  registerTemplatesFromPathsAsync();
});
