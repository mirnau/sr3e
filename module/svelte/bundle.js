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
function set_data(text, data) {
    data = '' + data;
    if (text.data === data)
        return;
    text.data = data;
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
let outros;
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
    else if (callback) {
        callback();
    }
}
function create_component(block) {
    block && block.c();
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

/* module\svelte\apps\components\Dossier.svelte generated by Svelte v3.59.2 */

function create_fragment$1(ctx) {
	let div;
	let h2;
	let t1;
	let p0;
	let t2;
	let t3;
	let t4;
	let p1;
	let t5;
	let t6;

	return {
		c() {
			div = element("div");
			h2 = element("h2");
			h2.textContent = "Nested Partial App";
			t1 = space();
			p0 = element("p");
			t2 = text("Actor Name: ");
			t3 = text(/*actorName*/ ctx[0]);
			t4 = space();
			p1 = element("p");
			t5 = text("Message: ");
			t6 = text(/*message*/ ctx[1]);
			attr(div, "class", "partial-app-container");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, h2);
			append(div, t1);
			append(div, p0);
			append(p0, t2);
			append(p0, t3);
			append(div, t4);
			append(div, p1);
			append(p1, t5);
			append(p1, t6);
		},
		p(ctx, [dirty]) {
			if (dirty & /*actorName*/ 1) set_data(t3, /*actorName*/ ctx[0]);
			if (dirty & /*message*/ 2) set_data(t6, /*message*/ ctx[1]);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let { actorName = "Default Name" } = $$props;
	let { message = "No message provided" } = $$props;

	$$self.$$set = $$props => {
		if ('actorName' in $$props) $$invalidate(0, actorName = $$props.actorName);
		if ('message' in $$props) $$invalidate(1, message = $$props.message);
	};

	return [actorName, message];
}

class Dossier extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { actorName: 0, message: 1 });
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
	let div50;
	let div0;
	let t0;
	let div1;
	let t1;
	let div5;
	let div4;
	let div2;
	let t2;
	let div3;
	let h10;
	let t4;
	let dossier0;
	let t5;
	let div9;
	let div8;
	let div6;
	let t6;
	let div7;
	let h11;
	let t8;
	let dossier1;
	let t9;
	let div13;
	let div12;
	let div10;
	let t10;
	let div11;
	let h12;
	let t12;
	let dossier2;
	let t13;
	let div17;
	let div16;
	let div14;
	let t14;
	let div15;
	let h13;
	let t16;
	let dossier3;
	let t17;
	let div21;
	let div20;
	let div18;
	let t18;
	let div19;
	let h14;
	let t20;
	let dossier4;
	let t21;
	let div25;
	let div24;
	let div22;
	let t22;
	let div23;
	let h15;
	let t24;
	let t25;
	let div29;
	let div28;
	let div26;
	let t26;
	let div27;
	let h16;
	let t28;
	let t29;
	let div33;
	let div32;
	let div30;
	let t30;
	let div31;
	let h17;
	let t32;
	let t33;
	let div37;
	let div36;
	let div34;
	let t34;
	let div35;
	let h18;
	let t36;
	let t37;
	let div41;
	let div40;
	let div38;
	let t38;
	let div39;
	let h19;
	let t40;
	let t41;
	let div45;
	let div44;
	let div42;
	let t42;
	let div43;
	let h110;
	let t44;
	let t45;
	let div49;
	let div48;
	let div46;
	let t46;
	let div47;
	let h111;
	let t48;
	let current;

	dossier0 = new Dossier({
			props: {
				actorName: /*name*/ ctx[0],
				message: "Hello from Parent Component!"
			}
		});

	dossier1 = new Dossier({
			props: {
				actorName: /*name*/ ctx[0],
				message: "Hello from Parent Component!"
			}
		});

	dossier2 = new Dossier({
			props: {
				actorName: /*name*/ ctx[0],
				message: "Hello from Parent Component!"
			}
		});

	dossier3 = new Dossier({
			props: {
				actorName: /*name*/ ctx[0],
				message: "Hello from Parent Component!"
			}
		});

	dossier4 = new Dossier({
			props: {
				actorName: /*name*/ ctx[0],
				message: "Hello from Parent Component!"
			}
		});

	return {
		c() {
			div50 = element("div");
			div0 = element("div");
			t0 = space();
			div1 = element("div");
			t1 = space();
			div5 = element("div");
			div4 = element("div");
			div2 = element("div");
			t2 = space();
			div3 = element("div");
			h10 = element("h1");
			h10.textContent = `${/*test*/ ctx[1]}`;
			t4 = space();
			create_component(dossier0.$$.fragment);
			t5 = space();
			div9 = element("div");
			div8 = element("div");
			div6 = element("div");
			t6 = space();
			div7 = element("div");
			h11 = element("h1");
			h11.textContent = `${/*test*/ ctx[1]}`;
			t8 = space();
			create_component(dossier1.$$.fragment);
			t9 = space();
			div13 = element("div");
			div12 = element("div");
			div10 = element("div");
			t10 = space();
			div11 = element("div");
			h12 = element("h1");
			h12.textContent = `${/*test*/ ctx[1]}`;
			t12 = space();
			create_component(dossier2.$$.fragment);
			t13 = space();
			div17 = element("div");
			div16 = element("div");
			div14 = element("div");
			t14 = space();
			div15 = element("div");
			h13 = element("h1");
			h13.textContent = `${/*test*/ ctx[1]}`;
			t16 = space();
			create_component(dossier3.$$.fragment);
			t17 = space();
			div21 = element("div");
			div20 = element("div");
			div18 = element("div");
			t18 = space();
			div19 = element("div");
			h14 = element("h1");
			h14.textContent = `${/*test*/ ctx[1]}`;
			t20 = space();
			create_component(dossier4.$$.fragment);
			t21 = space();
			div25 = element("div");
			div24 = element("div");
			div22 = element("div");
			t22 = space();
			div23 = element("div");
			h15 = element("h1");
			h15.textContent = `${/*test*/ ctx[1]}`;
			t24 = text("\r\n        Testing Databind");
			t25 = space();
			div29 = element("div");
			div28 = element("div");
			div26 = element("div");
			t26 = space();
			div27 = element("div");
			h16 = element("h1");
			h16.textContent = `${/*test*/ ctx[1]}`;
			t28 = text("\r\n        Testing Databind");
			t29 = space();
			div33 = element("div");
			div32 = element("div");
			div30 = element("div");
			t30 = space();
			div31 = element("div");
			h17 = element("h1");
			h17.textContent = `${/*test*/ ctx[1]}`;
			t32 = text("\r\n        Testing Databind");
			t33 = space();
			div37 = element("div");
			div36 = element("div");
			div34 = element("div");
			t34 = space();
			div35 = element("div");
			h18 = element("h1");
			h18.textContent = `${/*test*/ ctx[1]}`;
			t36 = text("\r\n        Testing Databind");
			t37 = space();
			div41 = element("div");
			div40 = element("div");
			div38 = element("div");
			t38 = space();
			div39 = element("div");
			h19 = element("h1");
			h19.textContent = `${/*test*/ ctx[1]}`;
			t40 = text("\r\n        Testing Databind");
			t41 = space();
			div45 = element("div");
			div44 = element("div");
			div42 = element("div");
			t42 = space();
			div43 = element("div");
			h110 = element("h1");
			h110.textContent = `${/*test*/ ctx[1]}`;
			t44 = text("\r\n        Testing Databind");
			t45 = space();
			div49 = element("div");
			div48 = element("div");
			div46 = element("div");
			t46 = space();
			div47 = element("div");
			h111 = element("h1");
			h111.textContent = `${/*test*/ ctx[1]}`;
			t48 = text("\r\n        Testing Databind");
			attr(div0, "class", "layout-gutter-sizer");
			attr(div1, "class", "layout-grid-sizer");
			attr(div2, "class", "fake-shadow");
			attr(div3, "class", "inner-background");
			attr(div4, "class", "inner-background-container");
			attr(div5, "class", "sheet-component");
			attr(div6, "class", "fake-shadow");
			attr(div7, "class", "inner-background");
			attr(div8, "class", "inner-background-container");
			attr(div9, "class", "sheet-component");
			attr(div10, "class", "fake-shadow");
			attr(div11, "class", "inner-background");
			attr(div12, "class", "inner-background-container");
			attr(div13, "class", "sheet-component two-span-selectable");
			attr(div14, "class", "fake-shadow");
			attr(div15, "class", "inner-background");
			attr(div16, "class", "inner-background-container");
			attr(div17, "class", "sheet-component");
			attr(div18, "class", "fake-shadow");
			attr(div19, "class", "inner-background");
			attr(div20, "class", "inner-background-container");
			attr(div21, "class", "sheet-component");
			attr(div22, "class", "fake-shadow");
			attr(div23, "class", "inner-background");
			attr(div24, "class", "inner-background-container");
			attr(div25, "class", "sheet-component");
			attr(div26, "class", "fake-shadow");
			attr(div27, "class", "inner-background");
			attr(div28, "class", "inner-background-container");
			attr(div29, "class", "sheet-component two-span-selectable");
			attr(div30, "class", "fake-shadow");
			attr(div31, "class", "inner-background");
			attr(div32, "class", "inner-background-container");
			attr(div33, "class", "sheet-component");
			attr(div34, "class", "fake-shadow");
			attr(div35, "class", "inner-background");
			attr(div36, "class", "inner-background-container");
			attr(div37, "class", "sheet-component");
			attr(div38, "class", "fake-shadow");
			attr(div39, "class", "inner-background");
			attr(div40, "class", "inner-background-container");
			attr(div41, "class", "sheet-component");
			attr(div42, "class", "fake-shadow");
			attr(div43, "class", "inner-background");
			attr(div44, "class", "inner-background-container");
			attr(div45, "class", "sheet-component");
			attr(div46, "class", "fake-shadow");
			attr(div47, "class", "inner-background");
			attr(div48, "class", "inner-background-container");
			attr(div49, "class", "sheet-component");
			attr(div50, "class", "character-sheet-masonry");
		},
		m(target, anchor) {
			insert(target, div50, anchor);
			append(div50, div0);
			append(div50, t0);
			append(div50, div1);
			append(div50, t1);
			append(div50, div5);
			append(div5, div4);
			append(div4, div2);
			append(div4, t2);
			append(div4, div3);
			append(div3, h10);
			append(div3, t4);
			mount_component(dossier0, div3, null);
			append(div50, t5);
			append(div50, div9);
			append(div9, div8);
			append(div8, div6);
			append(div8, t6);
			append(div8, div7);
			append(div7, h11);
			append(div7, t8);
			mount_component(dossier1, div7, null);
			append(div50, t9);
			append(div50, div13);
			append(div13, div12);
			append(div12, div10);
			append(div12, t10);
			append(div12, div11);
			append(div11, h12);
			append(div11, t12);
			mount_component(dossier2, div11, null);
			append(div50, t13);
			append(div50, div17);
			append(div17, div16);
			append(div16, div14);
			append(div16, t14);
			append(div16, div15);
			append(div15, h13);
			append(div15, t16);
			mount_component(dossier3, div15, null);
			append(div50, t17);
			append(div50, div21);
			append(div21, div20);
			append(div20, div18);
			append(div20, t18);
			append(div20, div19);
			append(div19, h14);
			append(div19, t20);
			mount_component(dossier4, div19, null);
			append(div50, t21);
			append(div50, div25);
			append(div25, div24);
			append(div24, div22);
			append(div24, t22);
			append(div24, div23);
			append(div23, h15);
			append(div23, t24);
			append(div50, t25);
			append(div50, div29);
			append(div29, div28);
			append(div28, div26);
			append(div28, t26);
			append(div28, div27);
			append(div27, h16);
			append(div27, t28);
			append(div50, t29);
			append(div50, div33);
			append(div33, div32);
			append(div32, div30);
			append(div32, t30);
			append(div32, div31);
			append(div31, h17);
			append(div31, t32);
			append(div50, t33);
			append(div50, div37);
			append(div37, div36);
			append(div36, div34);
			append(div36, t34);
			append(div36, div35);
			append(div35, h18);
			append(div35, t36);
			append(div50, t37);
			append(div50, div41);
			append(div41, div40);
			append(div40, div38);
			append(div40, t38);
			append(div40, div39);
			append(div39, h19);
			append(div39, t40);
			append(div50, t41);
			append(div50, div45);
			append(div45, div44);
			append(div44, div42);
			append(div44, t42);
			append(div44, div43);
			append(div43, h110);
			append(div43, t44);
			append(div50, t45);
			append(div50, div49);
			append(div49, div48);
			append(div48, div46);
			append(div48, t46);
			append(div48, div47);
			append(div47, h111);
			append(div47, t48);
			current = true;
		},
		p: noop,
		i(local) {
			if (current) return;
			transition_in(dossier0.$$.fragment, local);
			transition_in(dossier1.$$.fragment, local);
			transition_in(dossier2.$$.fragment, local);
			transition_in(dossier3.$$.fragment, local);
			transition_in(dossier4.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(dossier0.$$.fragment, local);
			transition_out(dossier1.$$.fragment, local);
			transition_out(dossier2.$$.fragment, local);
			transition_out(dossier3.$$.fragment, local);
			transition_out(dossier4.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div50);
			destroy_component(dossier0);
			destroy_component(dossier1);
			destroy_component(dossier2);
			destroy_component(dossier3);
			destroy_component(dossier4);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let { app } = $$props;
	let { config } = $$props;
	let { jQueryObject } = $$props;
	let actor = app.actor;
	let name = actor?.name || "Unknown Actor";
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
		if ('app' in $$props) $$invalidate(2, app = $$props.app);
		if ('config' in $$props) $$invalidate(3, config = $$props.config);
		if ('jQueryObject' in $$props) $$invalidate(4, jQueryObject = $$props.jQueryObject);
	};

	return [name, test, app, config, jQueryObject];
}

class CharacterSheetApp extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { app: 2, config: 3, jQueryObject: 4 });
	}
}

class CharacterActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['sr3e', 'sheet', 'character'],
      template: "/systems/sr3e/templates/sheet/actor/character-sheet.html",
      width: 800,
      height: 600,
    });
  }
}

const sr3e = {};

sr3e.test = "sr3e.test";

const hooks = {
  renderCharacterActorSheet: "renderCharacterActorSheet",
  closeCharacterActorSheet: "closeCharacterActorSheet",
  init: "init",
  ready: "ready"
};

function registerHooks() {

  Hooks.on(hooks.renderCharacterActorSheet, (app, html, data) => {

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
  });

  Hooks.on(hooks.closeCharacterActorSheet, (app) => {
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
  });

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
