export function renderDefenderPrompt(
    contestId: string,
    targetName: string,
    attackerName: string,
    weaponName: string,
    nextKind: string,
): string {
    const isGeneric = nextKind === "skill-response" || nextKind === "attribute-response";
    const isDodge = nextKind === "dodge";

    const sourceLabel = isGeneric
        ? `${attackerName} challenges you${weaponName ? ` with ${weaponName}` : ""}`
        : `${attackerName} attacks with ${weaponName || "weapon"}`;

    let buttons: string;
    if (isGeneric) {
        buttons = `<button class="sr3e-responder-button" data-responder="accept"><span>Accept</span></button>
  <button class="sr3e-responder-button sr3e-responder-decline" data-responder="no"><span>Cancel</span></button>`;
    } else if (isDodge) {
        buttons = `<button class="sr3e-responder-button" data-responder="dodge"><span>Dodge</span></button>
  <button class="sr3e-responder-button sr3e-responder-decline" data-responder="no"><span>Cancel</span></button>`;
    } else {
        buttons = `<button class="sr3e-responder-button" data-responder="standard"><span>Standard Defense</span></button>
  <button class="sr3e-responder-button" data-responder="full"><span>Full Defense</span></button>
  <button class="sr3e-responder-button sr3e-responder-decline" data-responder="no"><span>Cancel</span></button>`;
    }

    return `<div class="sr3e-defender-prompt" data-contest-id="${contestId}">
  <div class="sr3e-defender-header">${targetName} — Respond?</div>
  <div class="sr3e-defender-source">${sourceLabel}</div>
  <div class="sr3e-defender-actions">
  ${buttons}
  </div>
</div>`;
}
