export function debugActorPoolUpdates() {
   const ActorClass = CONFIG.Actor.documentClass;
   if (ActorClass.prototype.__sr3ePatchedUpdate) return;
   ActorClass.prototype.__sr3ePatchedUpdate = true;

   const _update = ActorClass.prototype.update;
   ActorClass.prototype.update = async function (data, opts) {
      const touched = [];
      const scan = (obj, path = []) => {
         if (!obj || typeof obj !== "object") return;
         for (const [k, v] of Object.entries(obj)) {
            const p = [...path, k];
            const s = p.join(".");
            if (/flags\.sr3e\.dicePools\.[^.]+\.(value|mod)$/.test(s)) {
               touched.push([s, v]);
            }
            scan(v, p);
         }
      };
      scan(data);

      if (touched.length) {
         const isToken = this.isToken;
         const before = {};
         for (const [k] of touched) before[k] = foundry.utils.getProperty(this, k);
         console.group(`[sr3e] dicePools update -> ${this.name} ${isToken ? "(token)" : "(actor)"}`);
         console.table(Object.fromEntries(touched));
         console.log("before", before);
         console.trace("stack");
         console.groupEnd();
      }

      const result = await _update.call(this, data, opts);

      if (touched.length) {
         const after = {};
         for (const [k] of touched) after[k] = foundry.utils.getProperty(this, k);
         console.log("[sr3e] after", after);
      }
      return result;
   };
}

export function debugAECreate() {
   const ActorClass = CONFIG.Actor.documentClass;
   if (ActorClass.prototype.__sr3ePatchedCreateEmbedded) return;
   ActorClass.prototype.__sr3ePatchedCreateEmbedded = true;

   const _createEmbedded = ActorClass.prototype.createEmbeddedDocuments;
   ActorClass.prototype.createEmbeddedDocuments = async function (embeddedName, data, ctx) {
      if (embeddedName === "ActiveEffect") {
         const arr = Array.isArray(data) ? data : [data];
         console.group(`[sr3e] AE create on ${this.name} ${this.isToken ? "(token)" : "(actor)"}`);
         for (const ae of arr) {
            console.log("AE payload", {
               label: ae.label || ae.name,
               flags: ae.flags,
               changes: ae.changes,
            });
         }
         console.trace("stack");
         console.groupEnd();
      }
      return _createEmbedded.call(this, embeddedName, data, ctx);
   };
}
