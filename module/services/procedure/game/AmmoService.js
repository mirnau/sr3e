export default class AmmoService {
  static getAttachedAmmo(actor, weapon) {
    const id = weapon?.system?.ammoId || "";
    if (!id) return null;
    return actor?.items?.get(id) || null;
  }

  static findCompatibleAmmo(actor, weapon) {
    const needClass = weapon.system.ammunitionClass?.trim().toLowerCase();
    const items = actor.items.filter((i) => i.type === "ammunition");
    return items.filter((i) => {
      const isEquipped = !!i.getFlag("sr3e", "isEquipped");
      const cls = i.system?.ammunition?.class ?? i.system?.class ?? i.system?.ammunitionClass;
      const rounds = i.system?.ammunition?.rounds ?? i.system?.rounds ?? 0;
      return isEquipped && rounds > 0 && (needClass ? String(cls).toLowerCase() === needClass : true);
    });
  }

  static async reload(actor, weapon) {
    const needClass = String(weapon.system?.ammunitionClass ?? "").trim();
    const compat = this.findCompatibleAmmo(actor, weapon);
    const chosen = await this.pickAmmoDialog(compat, weapon, { needClass, allowEmpty: true });
    if (chosen === null) return;

    if (chosen === "__EMPTY__") {
      await this.eject(actor, weapon, { silent: true });
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<b>${actor.name}</b> leaves <i>${weapon.name}</i> unloaded.`,
      });
      return;
    }

    await weapon.update({ "system.ammoId": chosen.id });
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<b>${actor.name}</b> reloads <i>${weapon.name}</i> with <i>${chosen.name}</i>.`,
    });
  }

  static async eject(actor, weapon, { silent = false } = {}) {
    const currentId = weapon.system?.ammoId;
    if (!currentId) return;
    await weapon.update({ "system.ammoId": "" });
    if (!silent) {
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<b>${actor.name}</b> ejects the magazine from <i>${weapon.name}</i>.`,
      });
    }
  }

  static async consume(actor, weapon, roundsToSpend = 1) {
    const magId = weapon.system?.ammoId;
    if (!magId) return { ok: false, reason: "no-mag" };

    const mag = actor.items.get(magId);
    if (!mag) {
      await weapon.update({ "system.ammoId": "" });
      return { ok: false, reason: "mag-missing" };
    }

    const current = mag.system?.ammunition?.rounds ?? mag.system?.rounds ?? 0;
    if (current <= 0) {
      await this.eject(actor, weapon, { silent: true });
      return { ok: false, reason: "empty" };
    }

    const newCount = Math.max(0, current - roundsToSpend);
    if (mag.system?.ammunition) await mag.update({ "system.ammunition.rounds": newCount });
    else await mag.update({ "system.rounds": newCount });

    if (newCount === 0) await this.eject(actor, weapon, { silent: true });
    return { ok: true, remaining: newCount };
  }

  // inlined here to keep @game self-contained
  static async pickAmmoDialog(ammoItems, weapon, { needClass = "", allowEmpty = false } = {}) {
    const emptyLabel = game.i18n.localize("sr3e.ammunition.empty") || "— Unloaded / Empty —";
    const roundsKey = game.i18n.localize("sr3e.ammunition.rounds") || "rounds";
    const ammoKey = game.i18n.localize("sr3e.ammunition.ammunition") || "Ammunition";

    const options = [];
    if (allowEmpty) options.push(`<option value="__EMPTY__">${emptyLabel}</option>`);

    for (const i of ammoItems) {
      const rounds = i.system?.ammunition?.rounds ?? i.system?.rounds ?? 0;
      const cls = i.system?.ammunition?.class ?? i.system?.class ?? i.system?.ammunitionClass ?? "";
      options.push(`<option value="${i.id}">${i.name} — ${rounds} ${roundsKey}${cls ? ` (${cls})` : ""}</option>`);
    }

    const needClassHint = needClass
      ? `<p class="notes"><small>${game.i18n.localize("sr3e.ammunition.requiredClass") || "Required class"}: <b>${needClass}</b></small></p>`
      : "";

    const content = `
      <div class="form-group">
        <label>${ammoKey}</label>
        <select name="ammoId">${options.join("")}</select>
        ${needClassHint}
      </div>`;

    const result = await foundry.applications.api.DialogV2.prompt({
      window: { title: `Reload ${weapon.name}` },
      content,
      ok: {
        label: game.i18n.localize("sr3e.modal.confirm") || "OK",
        callback: (event, button, dialog) => {
          const id = dialog.element.querySelector('select[name="ammoId"]').value;
          if (id === "__EMPTY__") return "__EMPTY__";
          return ammoItems.find((i) => i.id === id);
        },
      },
      cancel: { label: game.i18n.localize("sr3e.modal.decline") || "Cancel" },
      rejectClose: false,
      modal: true,
    });

    return result;
  }
}
