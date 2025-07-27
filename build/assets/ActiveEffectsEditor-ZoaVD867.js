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
var _app;
import { p as push, s as state, a as proxy, S as StoreManager, g as get, o as onMount, b as set, c as store_get, f as flags, d as store_set, e as onDestroy, u as user_effect, C as CharacterModel, l as localize, t as template, I as ItemSheetComponent, h as first_child, i as sibling, j as Image, k as derived, m as child, n as if_block, q as template_effect, r as set_text, v as event, w as bind_value, x as bind_select_value, y as bind_checked, z as append, A as each, B as ComboSearch, D as index, E as set_value, F as pop, G as setup_stores, H as delegate, J as unmount, K as mount } from "../bundle.js";
function addChange(_, changes, commitChanges) {
  set(changes, proxy([
    ...get(changes),
    { key: "", mode: 1, value: "", priority: 0 }
  ]));
  commitChanges();
}
var on_change = (e, setDurationField) => setDurationField("type", e.target.value);
var on_input = (e, setDurationField) => setDurationField("value", e.target.value);
var root_2 = template(`<div class="stat-card"><div class="stat-card-background"></div> <h4> </h4> <input type="number"></div>`);
var root_1 = template(`<h3> </h3> <div class="stat-grid single-column"><!> <div class="stat-card"><div class="stat-card-background"></div> <h4> </h4> <input type="text"></div> <div class="stat-card"><div class="stat-card-background"></div> <h4> </h4> <select><option>self</option><option disabled>item</option><option>character</option><option disabled>vehicle</option></select></div> <div class="stat-card"><div class="stat-card-background"></div> <h4> </h4> <input type="checkbox"></div> <div class="stat-card"><div class="stat-card-background"></div> <h4> </h4> <select><option> </option><option> </option><option> </option><option> </option><option> </option><option> </option><option> </option></select></div> <!></div>`, 1);
var root_5 = template(`<option> </option>`);
var root_4 = template(`<tr><td><div class="stat-card"><div class="stat-card-background"></div> <!></div></td><td><div class="stat-card"><div class="stat-card-background"></div> <select></select></div></td><td><div class="stat-card"><div class="stat-card-background"></div> <input type="text"></div></td><td><div class="stat-card"><div class="stat-card-background"></div> <input type="number"></div></td><td><button>🗑</button></td></tr>`);
var root_3 = template(`<h1> </h1> <button> </button> <div class="table-wrapper"><table><thead><tr><th> </th><th> </th><th> </th><th> </th><th> </th></tr></thead><tbody></tbody></table></div>`, 1);
var root = template(`<div class="effects-editor"><!> <!></div>`);
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
  let storeManager = StoreManager.Subscribe($$props.document);
  let nameStore = storeManager.GetShallowStore($$props.document.id, `${$$props.activeEffect.id}:name`, $$props.activeEffect.name);
  let durationStore = storeManager.GetShallowStore($$props.document.id, `${$$props.activeEffect.id}:duration`, $$props.activeEffect.duration);
  let disabledStore = storeManager.GetShallowStore($$props.document.id, `${$$props.activeEffect.id}:disabled`, $$props.activeEffect.disabled);
  let targetStore = storeManager.GetShallowStore($$props.document.id, `${$$props.activeEffect.id}:target`, get(target));
  onMount(async () => {
    set(origin, proxy(await foundry.utils.fromUuid($$props.activeEffect.origin)));
    set(originIsItem, get(origin) instanceof Item);
    const storedName = $nameStore();
    const storedDuration = $durationStore();
    const storedDisabled = $disabledStore();
    const flagTarget = getProperty($$props.activeEffect, `flags.${flags.sr3e}.target`);
    if (flagTarget) {
      set(target, proxy(flagTarget));
      store_set(targetStore, proxy(get(target)));
    }
    const baseDuration = JSON.stringify(storedDuration) !== JSON.stringify($$props.activeEffect.duration) ? storedDuration : $$props.activeEffect.duration;
    set(duration, proxy({
      ...baseDuration,
      value: baseDuration[baseDuration.type] ?? 0
    }));
    if (storedName !== $$props.activeEffect.name) set(name, proxy(storedName));
    if (storedDisabled !== $$props.activeEffect.disabled) set(disabled, proxy(storedDisabled));
    store_set(nameStore, proxy(get(name)));
    store_set(disabledStore, proxy(get(disabled)));
    store_set(durationStore, proxy(get(duration)));
  });
  onDestroy(() => {
    commitChanges();
    StoreManager.Unsubscribe($$props.document);
  });
  function setDurationField(field, val) {
    set(duration, proxy({
      ...get(duration),
      [field]: field === "value" ? +val : val
    }));
    store_set(durationStore, proxy(get(duration)));
  }
  user_effect(() => {
    store_set(disabledStore, proxy(get(disabled)));
  });
  user_effect(() => {
    store_set(nameStore, proxy(get(name)));
  });
  user_effect(() => {
    store_set(targetStore, proxy(get(target)));
  });
  let allowedPatterns = [];
  user_effect(async () => {
    var _a;
    if (!((_a = get(origin)) == null ? void 0 : _a.toObject)) return;
    let rawPaths = [];
    switch (get(target)) {
      case "self": {
        allowedPatterns = ["system"];
        set(isTransferable, false);
        rawPaths = Object.keys(foundry.utils.flattenObject({
          system: get(origin).toObject().system
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
        console.warn(`Unhandled target type: ${get(target)}`);
      }
    }
    const newOptions = rawPaths.filter((path) => allowedPatterns.some((p) => path.startsWith(p)) && path.endsWith(".mod")).map((path) => ({
      value: path,
      label: getLocalizedPath(path)
    })).sort((a, b) => a.label.localeCompare(b.label));
    if (JSON.stringify(newOptions) !== JSON.stringify(get(propertyOptions))) {
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
    const key = get(duration).type;
    const expandedDuration = {
      type: key,
      rounds: key === "rounds" ? get(duration).value : void 0,
      seconds: key === "seconds" ? get(duration).value : void 0,
      turns: key === "turns" ? get(duration).value : void 0,
      startTime: get(duration).startTime,
      startRound: get(duration).startRound,
      startTurn: get(duration).startTurn,
      combat: get(duration).combat
    };
    await $$props.activeEffect.update(
      {
        name: extractValue(get(name)),
        transfer: get(isTransferable),
        disabled: get(disabled),
        duration: expandedDuration,
        changes: [...get(changes)],
        flags: {
          ...$$props.activeEffect.flags ?? {},
          [flags.sr3e]: {
            ...((_a = $$props.activeEffect.flags) == null ? void 0 : _a[flags.sr3e]) ?? {},
            target: get(target)
          }
        }
      },
      { render: false }
    );
  }
  function updateChange(index2, field, value) {
    const extractedValue = extractValue(value);
    set(changes, proxy(get(changes).map((c, i) => i === index2 ? { ...c, [field]: extractedValue } : c)));
    commitChanges();
  }
  function deleteChange(index2) {
    get(changes).splice(index2, 1);
    set(changes, proxy([...get(changes)]));
    commitChanges();
  }
  var div = root();
  var node = child(div);
  ItemSheetComponent(node, {
    children: ($$anchor2, $$slotProps) => {
      var fragment = root_1();
      var h3 = first_child(fragment);
      var text = child(h3);
      var div_1 = sibling(h3, 2);
      var node_1 = child(div_1);
      const expression = derived(() => extractValue(get(name)));
      Image(node_1, {
        get src() {
          return $$props.activeEffect.img;
        },
        get title() {
          return get(expression);
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
      select_1.__change = [on_change, setDurationField];
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
          var div_6 = root_2();
          var h4_4 = sibling(child(div_6), 2);
          var text_12 = child(h4_4);
          var input_2 = sibling(h4_4, 2);
          input_2.__input = [on_input, setDurationField];
          template_effect(($0) => set_text(text_12, `${$0 ?? ""}:`), [
            () => localize($$props.config.effects.durationValue)
          ]);
          event("blur", input_2, commitChanges);
          bind_value(input_2, () => get(duration).value, ($$value) => get(duration).value = $$value);
          append($$anchor3, div_6);
        };
        if_block(node_2, ($$render) => {
          if (get(duration).type !== "none") $$render(consequent);
        });
      }
      template_effect(
        ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) => {
          set_text(text, $0);
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
      event("blur", input, commitChanges);
      bind_value(input, () => get(name), ($$value) => set(name, $$value));
      bind_select_value(select, () => get(target), ($$value) => set(target, $$value));
      bind_checked(input_1, () => get(disabled), ($$value) => set(disabled, $$value));
      bind_select_value(select_1, () => get(duration).type, ($$value) => get(duration).type = $$value);
      append($$anchor2, fragment);
    }
  });
  var node_3 = sibling(node, 2);
  ItemSheetComponent(node_3, {
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = root_3();
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
      each(tbody, 21, () => get(changes), index, ($$anchor3, change, i) => {
        var tr_1 = root_4();
        var td = child(tr_1);
        var div_8 = child(td);
        var node_4 = sibling(child(div_8), 2);
        const expression_1 = derived(() => localize($$props.config.effects.selectProperty));
        const expression_2 = derived(() => localize($$props.config.effects.noMatch));
        ComboSearch(node_4, {
          get options() {
            return get(propertyOptions);
          },
          get placeholder() {
            return get(expression_1);
          },
          get nomatchplaceholder() {
            return get(expression_2);
          },
          onselect: (e) => updateChange(i, "key", e.detail.value),
          css: "table",
          get value() {
            return get(changes)[i].key;
          },
          set value($$value) {
            get(changes)[i].key = $$value;
          }
        });
        var td_1 = sibling(td);
        var div_9 = child(td_1);
        var select_2 = sibling(child(div_9), 2);
        select_2.__change = (e) => updateChange(i, "mode", parseInt(e.target.value));
        each(select_2, 20, () => Object.entries(CONST.ACTIVE_EFFECT_MODES).filter(([label]) => label !== "CUSTOM" && label !== "MULTIPLY"), index, ($$anchor4, $$item) => {
          let label = () => $$item[0];
          let val = () => $$item[1];
          var option_11 = root_5();
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
          set_value(input_3, get(change).value);
          set_value(input_4, get(change).priority);
        });
        bind_select_value(select_2, () => get(change).mode, ($$value) => get(change).mode = $$value);
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
  constructor(document, activeEffect, config, updateEffectsState) {
    const appId = _ActiveEffectsEditor.getAppIdFor(activeEffect.id);
    super({ id: appId });
    __privateAdd(this, _app);
    this.doc = document;
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
  static launch(document, config) {
    const existing = this.getExisting(document.id);
    if (existing) {
      existing.bringToTop();
      return existing;
    }
    const sheet = new this(document, config);
    sheet.render(true);
    return sheet;
  }
  _renderHTML() {
    return null;
  }
  _replaceHTML(_, windowContent) {
    if (__privateGet(this, _app)) {
      unmount(__privateGet(this, _app));
    }
    __privateSet(this, _app, mount(ActiveEffectsEditorApp, {
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
    if (__privateGet(this, _app)) await unmount(__privateGet(this, _app));
    __privateSet(this, _app, null);
    return super._tearDown();
  }
};
_app = new WeakMap();
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
export {
  ActiveEffectsEditor as default
};
//# sourceMappingURL=ActiveEffectsEditor-ZoaVD867.js.map
