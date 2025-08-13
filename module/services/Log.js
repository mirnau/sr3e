export default class Log {
   static timers = new Map();

   static error(message, location, obj) {
      this._print("❌", "coral", message, location, obj);
   }
   static warn(message, location, obj) {
      this._print("⚠️", "orange", message, location, obj);
   }
   static info(message, location, obj) {
      this._print("ℹ️", "white", message, location, obj);
   }
   static success(message, location, obj) {
      this._print("✅", "lightgreen", message, location, obj);
   }
   static inspect(message, location, obj) {
      this._print("🔎", "white", message, location, obj);
   }

   static time(label) {
      if (typeof DEBUG !== "undefined" && !DEBUG) return;
      this.timers.set(label, performance.now());
   }

   static timeEnd(label, location) {
      if (typeof DEBUG !== "undefined" && !DEBUG) return;
      const start = this.timers.get(label);
      if (start == null) return;
      const ms = Math.max(0, performance.now() - start).toFixed(2);
      this.timers.delete(label);
      this.info(`⏱ ${label}: ${ms} ms`, location);
   }

   static _print(icon, color, message, location, obj) {
      if (typeof DEBUG !== "undefined" && !DEBUG) return;

      const now = new Date();
      const timestamp =
         `${now.getHours().toString().padStart(2, "0")}:` +
         `${now.getMinutes().toString().padStart(2, "0")}:` +
         `${now.getSeconds().toString().padStart(2, "0")}:` +
         `${now.getMilliseconds().toString().padStart(3, "0")}`;
      const iconStyle = `font-weight: bold; color: ${color};`;
      const brandStyle = `font-weight: bold; color: ${color};`;
      const msgStyle = "color: orange;";
      const labelStyle = `font-weight: bold; color: ${color};`;
      const fileStyle = `font-weight: bold; color: ${color};`;
      const classStyle = "font-weight: bold; color: #16a379ff;";
      const methodStyle = "font-weight: bold; color: #FADA5E;";
      const lineStyle = "font-weight: bold; color: #a0b6e4ff;";

      // ---- flexible normalization for location ----
      const isArrayLike = (v) =>
         v && typeof v === "object" && (Array.isArray(v) || "0" in v || typeof v.length === "number");

      let loc;
      if (Array.isArray(location)) {
         const [file, line, method] = location;
         loc = { file, line: Number.isFinite(Number(line)) ? Number(line) : undefined, method };
      } else if (isArrayLike(location)) {
         const tmp = Array.from(location);
         const [file, line, method] = tmp;
         loc = { file, line: Number.isFinite(Number(line)) ? Number(line) : undefined, method };
      } else if (location && typeof location === "object") {
         // Accept { file, line, method, class }
         const line = Number.isFinite(Number(location.line)) ? Number(location.line) : undefined;
         loc = { file: location.file, class: location.class, method: location.method, line };
      } else if (typeof location === "string") {
         loc = { file: location };
      } else {
         loc = this._inferLocation();
      }

      if (!loc) loc = {};
      loc.file = this._base(loc.file);

      // ---------------------------------------------

      let format = `%c${icon} | %csr3e | %c${message} %c@ ${timestamp} in `;
      const styles = [iconStyle, brandStyle, msgStyle, labelStyle];

      let printed = false;
      if (loc?.file) {
         format += `%c${loc.file}`;
         styles.push(fileStyle);
         printed = true;
      }
      if (loc?.class) {
         format += (printed ? " " : "") + `%c${loc.class}`;
         styles.push(classStyle);
         printed = true;
      }
      if (loc?.method) {
         format += (printed ? " " : "") + `%c${loc.method}`;
         styles.push(methodStyle);
         printed = true;
      }
      if (loc?.line) {
         format += (printed ? " " : "") + `%cL${loc.line}`;
         styles.push(lineStyle);
         printed = true;
      }

      if (!printed) {
         format += `%cunknown`;
         styles.push(fileStyle);
      }

      if (obj !== undefined) {
         console.groupCollapsed(format, ...styles);
         console.log(obj);
         console.groupEnd();
      } else {
         console.log(format, ...styles);
      }
   }

   static _inferLocation() {
      try {
         const stack = new Error().stack ?? "";
         const lines = stack.split("\n").slice(1);

         // Find first frame that is not this logger
         const frame = lines.find((l) => !/Log\._print|Log\._inferLocation|at new Log/.test(l)) || lines[0];
         if (!frame) return null;

         // Examples to match:
         // "    at Challenge (http://localhost:3000/Challenge.svelte:45:18)"
         // "    at http://app/dist/assets/chunk-ABC123.js:1:12345"
         const methodMatch = frame.match(/at\s+(.*?)\s+\((.*)\)/) || frame.match(/at\s+(.*)/);

         let method = undefined;
         let fileWithPos = undefined;

         if (methodMatch) {
            if (methodMatch.length === 3) {
               method = methodMatch[1];
               fileWithPos = methodMatch[2];
            } else if (methodMatch.length === 2) {
               fileWithPos = methodMatch[1];
            }
         }

         const pathMatch = (fileWithPos || "").match(/(.*):(\d+):\d+\)?$/);
         let file = fileWithPos;
         let line = undefined;

         if (pathMatch) {
            file = pathMatch[1];
            line = Number(pathMatch[2]);
         }

         if (file) {
            // Trim to basename if possible
            const parts = file.split(/[\\/]/);
            file = parts[parts.length - 1];
         }

         // Hide internal method names like "HTMLButtonElement.onclick"
         if (method && /HTML.*\.(on|addEventListener)/i.test(method)) method = undefined;

         file = this._base(file);
         return { file, method, line };
      } catch {
         return null;
      }
   }

   static _base(p) {
      if (typeof p !== "string") return p;
      const noQuery = p.split(/[?#]/)[0];
      return noQuery.split(/[\\/]/).pop();
   }
}
