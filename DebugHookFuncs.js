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
         DEBUG && LOG.info(`[sr3e] dicePools update -> ${this.name} ${isToken ? "(token)" : "(actor)"}`, [__FILE__, __LINE__]);
         DEBUG && LOG.inspect("dicePools touched", [__FILE__, __LINE__], Object.fromEntries(touched));
         DEBUG && LOG.inspect("before", [__FILE__, __LINE__], before);
         DEBUG && LOG.inspect("stack", [__FILE__, __LINE__], new Error().stack);
      }

      const result = await _update.call(this, data, opts);

      if (touched.length) {
         const after = {};
         for (const [k] of touched) after[k] = foundry.utils.getProperty(this, k);
         DEBUG && LOG.inspect("[sr3e] after", [__FILE__, __LINE__], after);
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
         DEBUG && LOG.info(`[sr3e] AE create on ${this.name} ${this.isToken ? "(token)" : "(actor)"}`, [__FILE__, __LINE__]);
         for (const ae of arr) {
            DEBUG && LOG.inspect("AE payload", [__FILE__, __LINE__], {
               label: ae.label || ae.name,
               flags: ae.flags,
               changes: ae.changes,
            });
         }
         DEBUG && LOG.inspect("stack", [__FILE__, __LINE__], new Error().stack);
      }
      return _createEmbedded.call(this, embeddedName, data, ctx);
   };
}
