import EcgAnimator from "./CardiogramAnimationService.js";

export default class ElectroCardiogramService {
  #ecgCanvas;
  #ecgPointCanvas;
  #ctxLine;
  #ctxPoint;
  #actor;
  #html;
  ecgAnimator;

  constructor(actor, html) {
    this.#actor = actor;
    this.#html = html;

    this.#ecgCanvas = html.find("#ecg-canvas")[0];
    this.#ecgPointCanvas = html.find("#ecg-point-canvas")[0];

    this.#ctxLine = this.#ecgCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    this.#ctxPoint = this.#ecgPointCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    this.#resizeCanvas();

    this.#ecgCanvas.addEventListener("resize", this.#resizeCanvas.bind(this));
    this.#ecgPointCanvas.addEventListener(
      "resize",
      this.#resizeCanvas.bind(this)
    );

    this.ecgAnimator = new EcgAnimator(this.#ecgCanvas, this.#ecgPointCanvas, {
      freq: 2,
      amp: 30,
      color: "lime",
      lineWidth: 2,
      bottomColor: "#32CD32",
      topColor: "#00FFFF",
    });

    this.ecgAnimator.start();
  }

  #resizeCanvas() {
    const wRatio = window.devicePixelRatio;

    const resize = (canvas, ctx) => {
      const width = canvas.offsetWidth * wRatio;
      const height = canvas.offsetHeight * wRatio;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(wRatio, wRatio);
    };

    resize(this.#ecgCanvas, this.#ctxLine);
    resize(this.#ecgPointCanvas, this.#ctxPoint);
  }

  async onHealthBoxChange(event) {
    const clicked = event.currentTarget;
    const clickedIndex = parseInt(clicked.id.replace("healthBox", ""), 10);
    const isStun = clickedIndex <= 10;
    const localIndex = isStun ? clickedIndex - 1 : clickedIndex - 11;

    const stunArray = [...this.#actor.system.health.stun];
    const physicalArray = [...this.#actor.system.health.physical];
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
        const box = this.#html.find(`#healthBox${globalId}`);
        box.prop("checked", shouldCheck);

        const siblingH4 = box.closest(".damage-input").find("h4");
        if (siblingH4.length) {
          siblingH4.toggleClass("lit", shouldCheck);
          siblingH4.toggleClass("unlit", !shouldCheck);
        }
      }
    }

    if (isStun) {
      this.#actor.system.health.stun = stunArray;
    } else {
      this.#actor.system.health.physical = physicalArray;
    }

    const penalty = this.calculatePenalty(stunArray, physicalArray);
    this.#html.find(".health-penalty").text(penalty);

    await this.#actor.update(
      {
        ["system.health.stun"]: stunArray,
        ["system.health.physical"]: physicalArray,
        ["system.health.penalty"]: penalty,
      },
      { render: false }
    );
  }

  updateHealthOnStart() {
    const stunArray = [...this.#actor.system.health.stun];
    const physicalArray = [...this.#actor.system.health.physical];
    const penalty = this.calculatePenalty(stunArray, physicalArray);
    this.#html.find(".health-penalty").text(penalty);
  }

  calculatePenalty(stunArray, physicalArray) {
    const degreeStun = stunArray.filter(Boolean).length;
    const degreePhysical = physicalArray.filter(Boolean).length;
    const maxDegree = Math.max(degreeStun, degreePhysical);
    return this._calculateSeverity(maxDegree);
  }

 _calculateSeverity(degree = 0) {
    if (degree === 0) return this.#setPace(1.5, 20), 0;
    if (degree < 3) return this.#setPace(2, 20), 1;
    if (degree < 6) return this.#setPace(4, 25), 2;
    if (degree < 9) return this.#setPace(8, 35), 3;
    if (degree === 9) return this.#setPace(10, 40), 4;
    return this.#setPace(1, 8), 4;
  }

  #setPace(freq, amp) {
    this.ecgAnimator.setFrequency(freq);
    this.ecgAnimator.setAmplitude(amp);
  }
}
