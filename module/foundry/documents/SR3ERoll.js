export default class SR3ERoll extends foundry.dice.Roll {
  /** @override */
  async evaluate({}) {
    await super.evaluate({async});

    const tn = this.options.target || 7; // Default TN>6 should come from options
    this.terms = this.terms.flatMap(term => {
      if (term instanceof DieTerm && term.faces === 6 && tn > 6) {
        const newResults = [];
        for (const r of term.results) {
          if (r.result === 6) {
            let total = 6;
            let keepRolling = true;
            while (keepRolling) {
              const reroll = new DieTerm({faces: 6, number: 1});
              reroll.evaluateSync(); // synchronous roll
              const rv = reroll.total;
              total += rv;
              keepRolling = (rv === 6 && total < tn);
            }
            newResults.push({result: total, active: true, d: 6});
          } else {
            newResults.push(r);
          }
        }
        return [term.clone({results: newResults})];
      }
      return [term];
    });

    this._evaluateTotal(); // recalculate total from modified terms

    console.log("SR3eRoll.evaluate", this);

    return this;
  }
}
