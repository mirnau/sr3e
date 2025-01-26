const sr3e = {};

sr3e.test = "sr3e.test";

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
        initial: "systems/sr3e/textures/ai-generated/humans.webp",
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

class CharacterActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['sr3e', 'sheet', 'character'],
      template: "/systems/sr3e/templates/sheet/actor/character-sheet.html"
    });
  }
}

class Log {
    static error(message, sender, obj) {
        this._print('❌', 'red', message, sender, obj);
    }

    static warn(message, sender, obj) {
        this._print('⚠️', 'orange', message, sender, obj);
    }

    static info(message, sender, obj) {
        this._print('ℹ️', 'blue', message, sender, obj);
    }

    static success(message, sender, obj) {
        this._print('✅', 'lightgreen', message, sender, obj);
    }

    static inspect(message, sender, obj) {
        this._print('🔎', 'purple', message, sender, obj);
    }

    static _print(icon, color, message, sender, obj) {
        const iconStyle = `font-weight: bold; color: ${color};`;
        const sr3eStyle = `font-weight: bold; color: ${color};`;
        const msgStyle = 'color: orange;';
        const senderStyle = `font-weight: bold; color: ${color};`;

        if (obj !== undefined) {
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

function noop() { }
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    if (node.parentNode) {
        node.parentNode.removeChild(node);
    }
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
/**
 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
 * it can be called from an external module).
 *
 * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
 *
 * https://svelte.dev/docs#run-time-svelte-onmount
 */
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}

const dirty_components = [];
const binding_callbacks = [];
let render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = /* @__PURE__ */ Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();
let flushidx = 0; // Do *not* move this inside the flush() function
function flush() {
    // Do not reenter flush while dirty components are updated, as this can
    // result in an infinite loop. Instead, let the inner flush handle it.
    // Reentrancy is ok afterwards for bindings etc.
    if (flushidx !== 0) {
        return;
    }
    const saved_component = current_component;
    do {
        // first, call beforeUpdate functions
        // and update components
        try {
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
        }
        catch (e) {
            // reset dirty state to not end up in a deadlocked state and then rethrow
            dirty_components.length = 0;
            flushidx = 0;
            throw e;
        }
        set_current_component(null);
        dirty_components.length = 0;
        flushidx = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
/**
 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
 */
function flush_render_callbacks(fns) {
    const filtered = [];
    const targets = [];
    render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
    targets.forEach((c) => c());
    render_callbacks = filtered;
}
const outroing = new Set();
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
            // if the component was destroyed immediately
            // it will update the `$$.on_destroy` reference to `null`.
            // the destructured on_destroy may still reference to the old array
            if (component.$$.on_destroy) {
                component.$$.on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
    }
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        flush_render_callbacks($$.after_update);
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: [],
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false,
        root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor, options.customElement);
        flush();
    }
    set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        if (!is_function(callback)) {
            return noop;
        }
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

function getResizeObserver(masonryInstance, gridElement, func = null) {

    gridElement.masonryInstance = masonryInstance;

    const resizeObserver = new ResizeObserver(() => {
        
        if(func) { 
            func(); 
        }
        
        masonryInstance.layout();
    });
    
    resizeObserver.observe(gridElement);

    return resizeObserver;
}

/**
 * Observes and manages the resizing behavior for the masonry layout.
 * Sets up the observer to trigger grid adjustments on resize.
 * @param {Object} masonryResizeConfig - Configuration for the masonry layout.
 * @returns {ResizeObserver} - The resize observer instance.
 */
function observeMasonryResize(masonryResizeConfig, isMainGrid = false) {
  const {
    jQueryObject,          // The jQuery object representing the sheet
    parentSelector,
    childSelector,
    gridSizerSelector,
    gutterSizerSelector,
    app
  } = masonryResizeConfig;

  // For debugging
  Log.inspect("Html element 1", observeMasonryResize.name, jQueryObject);

  // Use jQuery find (not .querySelector)
  // This gives us another jQuery object, potentially with 1 item
  const $grid = jQueryObject.find(parentSelector);

  Log.inspect("Html element 2 (jQuery grid)", observeMasonryResize.name, $grid);

  // Store it back into the config so adjustMasonryOnResize can see it
  masonryResizeConfig.grid = $grid;

  const rawGrid = $grid[0]; // The raw DOM node
  if (!rawGrid) {
    Log.warn("No matching grid found in jQuery object", observeMasonryResize.name);
    return;
  }

  // If there's no masonryInstance, create one
  if (!rawGrid.masonryInstance) {
    const masonryInstance = new Masonry(rawGrid, {
      itemSelector: childSelector,
      columnWidth: gridSizerSelector,
      gutter: gutterSizerSelector,
      fitWidth: true
    });

    rawGrid.masonryInstance = masonryInstance;

    // Optionally watch layoutComplete
    if (isMainGrid) {
      masonryInstance.on("layoutComplete", function () {
        // do something if needed
      });
    }

    // The resize callback
    let resizeHandler = () => {
      adjustMasonryOnResize(masonryResizeConfig);
    };

    // If this is the "main" grid, also run the layoutStateMachine
    if (isMainGrid) {
      resizeHandler = () => {
        adjustMasonryOnResize(masonryResizeConfig);
        layoutStateMachine(app, $grid);
      };
    }

    // Attach the observer
    masonryResizeConfig.observer = getResizeObserver(masonryInstance, rawGrid, resizeHandler);
  }

  // If we already had a masonry instance, layout again
  if (rawGrid.masonryInstance) {
    rawGrid.masonryInstance.layout();
  }

  // Start observing changes
  masonryResizeConfig.observer.observe(rawGrid.parentNode);

  Log.success("Masonry Resize Observer Initialized", observeMasonryResize.name, masonryResizeConfig.observer);

  return masonryResizeConfig.observer;
}

/**
 * Adjusts grid items within the masonry layout on resize.
 * Ensures items fit perfectly within the parent container.
 * @param {Object} masonryResizeConfig - Configuration for the masonry layout.
 */
function adjustMasonryOnResize(masonryResizeConfig) {
  const { grid, childSelector, gridSizerSelector, gutterSizerSelector } = masonryResizeConfig;
  // `grid` is a jQuery object
  if (!grid || !grid.length) return;

  const $gridItems = grid.find(childSelector);
  const $gridSizer = grid.find(gridSizerSelector);
  const $gutter    = grid.find(gutterSizerSelector);

  if (!$gridSizer.length || !$gridItems.length) return;

  // Access the raw DOM nodes
  const rawGrid   = grid[0];
  const rawSizer  = $gridSizer[0];
  const rawGutter = $gutter[0];

  // Calculate sizes
  const parentPadding   = parseFloat(getComputedStyle(rawGrid.parentNode).paddingLeft) || 0;
  const gridWidthPx     = rawGrid.parentNode.offsetWidth - 2 * parentPadding;
  const gutterPx        = parseFloat(getComputedStyle(rawGutter).width);
  const minItemWidthPx  = parseFloat(getComputedStyle($gridItems[0]).minWidth);

  // Calculate columns
  let columnCount = Math.floor((gridWidthPx + gutterPx) / (minItemWidthPx + gutterPx));
  columnCount = Math.max(columnCount, 1);

  // Calculate item width
  const totalGutterWidthPx  = gutterPx * (columnCount - 1);
  const itemWidthPx         = (gridWidthPx - totalGutterWidthPx) / columnCount;
  const adjustedItemWidthPx = Math.floor(itemWidthPx);

  // Apply the new width to each item
  // jQuery .toArray() -> real array, so we can .forEach
  $gridItems.toArray().forEach((item) => {
    item.style.width = `${adjustedItemWidthPx}px`;
  });

  // Adjust the grid sizer
  rawSizer.style.width = `${adjustedItemWidthPx}px`;

  // Trigger layout if we have a masonry instance
  if (rawGrid.masonryInstance) {
    rawGrid.masonryInstance.layout();
  }
}

/**
 * Adjust sheet layout states using a jQuery object.
 * @param {ActorSheet} app - The Foundry sheet object
 * @param {JQuery} $html - jQuery object for the sheet's main container
 */
function layoutStateMachine(app, $html) {
  const sheetWidth = app.position?.width || 1400; 
  const maxWidth   = 1400;

  // Layout thresholds
  const lowerLimit  = 0.5 * maxWidth;
  const middleLimit = 0.66 * maxWidth;

  // Determine layout state
  let layoutState = "small";
  if (sheetWidth > middleLimit) {
    layoutState = "wide";
  } else if (sheetWidth > lowerLimit) {
    layoutState = "medium";
  }

  // Column widths
  const columnWidthPercent = { small: 100, medium: 50, wide: 25 };
  const columnWidth        = columnWidthPercent[layoutState];

  // Apply a custom CSS variable on the raw element
  const rawHtml = $html[0]; // raw DOM node
  rawHtml.style.setProperty("--column-width", `${columnWidth}%`);

  // Grab components with jQuery
  const $twoSpan   = $html.find(".two-span-selectable");
  const $threeSpan = $html.find(".three-span-selectable");

  // We can convert them to arrays if we want .forEach:
  const twoSpanArray   = $twoSpan.toArray();
  const threeSpanArray = $threeSpan.toArray();

  // Adjust widths
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
        actor.mainLayoutResizeObserver.disconnect();
        actor.mainLayoutResizeObserver = null;
    }

    actor.mainLayoutResizeObserver?.disconnect();
    actor.mainLayoutResizeObserver = observeMasonryResize(masonryResizeConfig, true);
}

/* module\svelte\apps\CharacterSheetApp.svelte generated by Svelte v3.59.2 */

function create_fragment(ctx) {
	let div3;
	let div2;
	let div0;
	let t0;
	let div1;
	let h10;
	let t2;
	let t3;
	let div7;
	let div6;
	let div4;
	let t4;
	let div5;
	let h11;
	let t6;
	let t7;
	let div11;
	let div10;
	let div8;
	let t8;
	let div9;
	let h12;
	let t10;
	let t11;
	let div15;
	let div14;
	let div12;
	let t12;
	let div13;
	let h13;
	let t14;
	let t15;
	let div19;
	let div18;
	let div16;
	let t16;
	let div17;
	let h14;
	let t18;
	let t19;
	let div23;
	let div22;
	let div20;
	let t20;
	let div21;
	let h15;
	let t22;
	let t23;
	let div27;
	let div26;
	let div24;
	let t24;
	let div25;
	let h16;
	let t26;

	return {
		c() {
			div3 = element("div");
			div2 = element("div");
			div0 = element("div");
			t0 = space();
			div1 = element("div");
			h10 = element("h1");
			h10.textContent = `${/*test*/ ctx[0]}`;
			t2 = text("\r\n        Testing Databind");
			t3 = space();
			div7 = element("div");
			div6 = element("div");
			div4 = element("div");
			t4 = space();
			div5 = element("div");
			h11 = element("h1");
			h11.textContent = `${/*test*/ ctx[0]}`;
			t6 = text("\r\n        Testing Databind");
			t7 = space();
			div11 = element("div");
			div10 = element("div");
			div8 = element("div");
			t8 = space();
			div9 = element("div");
			h12 = element("h1");
			h12.textContent = `${/*test*/ ctx[0]}`;
			t10 = text("\r\n        Testing Databind");
			t11 = space();
			div15 = element("div");
			div14 = element("div");
			div12 = element("div");
			t12 = space();
			div13 = element("div");
			h13 = element("h1");
			h13.textContent = `${/*test*/ ctx[0]}`;
			t14 = text("\r\n        Testing Databind");
			t15 = space();
			div19 = element("div");
			div18 = element("div");
			div16 = element("div");
			t16 = space();
			div17 = element("div");
			h14 = element("h1");
			h14.textContent = `${/*test*/ ctx[0]}`;
			t18 = text("\r\n        Testing Databind");
			t19 = space();
			div23 = element("div");
			div22 = element("div");
			div20 = element("div");
			t20 = space();
			div21 = element("div");
			h15 = element("h1");
			h15.textContent = `${/*test*/ ctx[0]}`;
			t22 = text("\r\n        Testing Databind");
			t23 = space();
			div27 = element("div");
			div26 = element("div");
			div24 = element("div");
			t24 = space();
			div25 = element("div");
			h16 = element("h1");
			h16.textContent = `${/*test*/ ctx[0]}`;
			t26 = text("\r\n        Testing Databind");
			attr(div0, "class", "fake-shadow");
			attr(div1, "class", "inner-background");
			attr(div2, "class", "inner-background-container");
			attr(div3, "class", "sheet-component");
			attr(div4, "class", "fake-shadow");
			attr(div5, "class", "inner-background");
			attr(div6, "class", "inner-background-container");
			attr(div7, "class", "sheet-component two-span-selectable");
			attr(div8, "class", "fake-shadow");
			attr(div9, "class", "inner-background");
			attr(div10, "class", "inner-background-container");
			attr(div11, "class", "sheet-component");
			attr(div12, "class", "fake-shadow");
			attr(div13, "class", "inner-background");
			attr(div14, "class", "inner-background-container");
			attr(div15, "class", "sheet-component");
			attr(div16, "class", "fake-shadow");
			attr(div17, "class", "inner-background");
			attr(div18, "class", "inner-background-container");
			attr(div19, "class", "sheet-component");
			attr(div20, "class", "fake-shadow");
			attr(div21, "class", "inner-background");
			attr(div22, "class", "inner-background-container");
			attr(div23, "class", "sheet-component");
			attr(div24, "class", "fake-shadow");
			attr(div25, "class", "inner-background");
			attr(div26, "class", "inner-background-container");
			attr(div27, "class", "sheet-component");
		},
		m(target, anchor) {
			insert(target, div3, anchor);
			append(div3, div2);
			append(div2, div0);
			append(div2, t0);
			append(div2, div1);
			append(div1, h10);
			append(div1, t2);
			insert(target, t3, anchor);
			insert(target, div7, anchor);
			append(div7, div6);
			append(div6, div4);
			append(div6, t4);
			append(div6, div5);
			append(div5, h11);
			append(div5, t6);
			insert(target, t7, anchor);
			insert(target, div11, anchor);
			append(div11, div10);
			append(div10, div8);
			append(div10, t8);
			append(div10, div9);
			append(div9, h12);
			append(div9, t10);
			insert(target, t11, anchor);
			insert(target, div15, anchor);
			append(div15, div14);
			append(div14, div12);
			append(div14, t12);
			append(div14, div13);
			append(div13, h13);
			append(div13, t14);
			insert(target, t15, anchor);
			insert(target, div19, anchor);
			append(div19, div18);
			append(div18, div16);
			append(div18, t16);
			append(div18, div17);
			append(div17, h14);
			append(div17, t18);
			insert(target, t19, anchor);
			insert(target, div23, anchor);
			append(div23, div22);
			append(div22, div20);
			append(div22, t20);
			append(div22, div21);
			append(div21, h15);
			append(div21, t22);
			insert(target, t23, anchor);
			insert(target, div27, anchor);
			append(div27, div26);
			append(div26, div24);
			append(div26, t24);
			append(div26, div25);
			append(div25, h16);
			append(div25, t26);
		},
		p: noop,
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div3);
			if (detaching) detach(t3);
			if (detaching) detach(div7);
			if (detaching) detach(t7);
			if (detaching) detach(div11);
			if (detaching) detach(t11);
			if (detaching) detach(div15);
			if (detaching) detach(t15);
			if (detaching) detach(div19);
			if (detaching) detach(t19);
			if (detaching) detach(div23);
			if (detaching) detach(t23);
			if (detaching) detach(div27);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let { app } = $$props;
	let { config } = $$props;
	let { jQueryObject } = $$props;
	let actor = app.actor;
	actor?.name || "Unknown Actor";
	let test = game.i18n.localize(config.test);

	onMount(() => {
		const args = {
			jQueryObject,
			parentSelector: ".character-sheet-masonry",
			childSelector: ".sheet-component",
			gridSizerSelector: ".layout-grid-sizer",
			gutterSizerSelector: ".layout-gutter-sizer",
			observer: actor.mainLayoutResizeObserver,
			app
		};

		initializeMasonryLayout(args);
		Log.success("Masonry layout initialized", "CharacterSheetApp.svelte");
	});

	$$self.$$set = $$props => {
		if ('app' in $$props) $$invalidate(1, app = $$props.app);
		if ('config' in $$props) $$invalidate(2, config = $$props.config);
		if ('jQueryObject' in $$props) $$invalidate(3, jQueryObject = $$props.jQueryObject);
	};

	return [test, app, config, jQueryObject];
}

class CharacterSheetApp extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { app: 1, config: 2, jQueryObject: 3 });
	}
}

function initMainMasonryGrid(app, html, data) {
  if (!(app instanceof CharacterActorSheet)) return;

  const container = document.querySelector(".window-content");

  container.innerHTML = '';

  app.svelteApp = new CharacterSheetApp({
    target: container,
    props: {
      app: app,
      config: CONFIG.sr3e,
      jQueryObject: html
    },
  });

  Log.success("Svelte App Initialized", CharacterActorSheet.name);
}

function closeMainMasonryGrid(app) {
  if (!(app instanceof CharacterActorSheet)) return;

  if (app.svelteApp) {
    console.info("Actor", CharacterActorSheet.name, app.actor.mainLayoutResizeObserver);

    app.actor.mainLayoutResizeObserver?.disconnect();
    app.actor.mainLayoutResizeObserver = null;

    console.info("Masonry observer disconnected.", CharacterActorSheet.name);
    app.svelteApp.$destroy();
    app.svelteApp = null;

    console.info("Svelte App Destroyed.", CharacterActorSheet.name);
  }
}

const hooks = {
  renderCharacterActorSheet: "renderCharacterActorSheet",
  closeCharacterActorSheet: "closeCharacterActorSheet",
  init: "init",
  ready: "ready"
};

function registerHooks() {

  Hooks.on(hooks.renderCharacterActorSheet, initMainMasonryGrid);
  Hooks.on(hooks.closeCharacterActorSheet, closeMainMasonryGrid);


  Hooks.once(hooks.init, () => {

    CONFIG.sr3e = sr3e;

    Actors.unregisterSheet("core", ActorSheet);

    CONFIG.Actor.dataModels = {
      "character": CharacterModel,
    };

    Actors.registerSheet("sr3e", CharacterActorSheet, { types: ["character"], makeDefault: true });

  });
}

registerHooks();
//# sourceMappingURL=bundle.js.map
