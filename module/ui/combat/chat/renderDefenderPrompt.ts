export function renderDefenderPrompt(
    contestId: string,
    targetName: string,
    attackerName: string,
    weaponName: string,
    nextKind: string,
): string {
    const weapon = weaponName || "weapon";
    const buttons = nextKind === "dodge"
        ? `<button class="sr3e-responder-button" data-responder="dodge">Dodge</button>
  <button class="sr3e-responder-button sr3e-responder-decline" data-responder="no">Don't Dodge</button>`
        : `<button class="sr3e-responder-button" data-responder="standard">Standard Defense</button>
  <button class="sr3e-responder-button" data-responder="full">Full Defense</button>
  <button class="sr3e-responder-button sr3e-responder-decline" data-responder="no">Don't Defend</button>`;

    return `<div class="sr3e-defender-prompt" data-contest-id="${contestId}">
  <div class="sr3e-defender-header">${targetName} — Defend?</div>
  <div class="sr3e-defender-source">${attackerName} attacks with ${weapon}</div>
  <div class="sr3e-defender-actions">
  ${buttons}
  </div>
</div>`;
}
