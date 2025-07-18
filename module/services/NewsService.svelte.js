console.log(
   "%cNewsService module evaluated →",
   "color:#ff66aa;font-weight:bold;",
   import.meta.url,
   performance.now().toFixed(1)
);

import { writable, get, derived } from "svelte/store";

export class NewsService {
   activeBroadcasters = writable(new Map());
   allFeeds = writable({});
   currentDisplayFrame = writable({ buffer: [], timestamp: 0 });

   #feedBuffer = [];
   #currentIndices = new Map();
   #maxVisible = 5;
   #lastBroadcasterIndex = -1;
   #frameUpdateInterval = null;
   #initialized = false;
   #nextTick = null;
   #broadcastController = null;
   #isController = false;
   #controllerHeartbeat = null;
   #lastHeartbeat = 0;
   #syncRequestTimeout = null;
   #electionCandidates = new Set();
   #electionInProgress = false;

   AVG_CHAR_PX = 12;
   SCROLL_SPEED = 100;
   DEFAULT_MS = 10000;
   CONTROLLER_TIMEOUT = 15000;
   HEARTBEAT_INTERVAL = 5000;
   ELECTION_DELAY = 1000;

   #defaultMessages = [
   { sender: "System", headline: "Please stand by." },
   { sender: "System", headline: "Waiting for broadcast..." },
   { sender: "System", headline: "No active news sources." },
];


   static #instance = null;

   static Instance() {
      if (!this.#instance) {
         this.#instance = new NewsService();
      }
      return this.#instance;
   }

   initialize() {
      if (this.#initialized) return;
      this.#initialized = true;

      this.#setupSocket();
      this.#loadActiveBroadcasters();
      this.#requestControllerElection();
      this.#startControllerHealthCheck();

      CONFIG.sr3e = CONFIG.sr3e || {};
      CONFIG.sr3e.newsService = this;
   }

   #loadActiveBroadcasters() {
      const allBroadcasters = game.actors.filter(
         (actor) => actor.type === "broadcaster" && actor.system.isBroadcasting
      );

      allBroadcasters.forEach((broadcaster) => {
         const headlines = broadcaster.system.rollingNews || [];
         this.#receiveBroadcastSync(broadcaster.name, headlines);
      });
   }

   #startControllerHealthCheck() {
      setInterval(() => this.#checkControllerHealth(), this.HEARTBEAT_INTERVAL);
   }

   #setupSocket() {
      game.socket.on("module.sr3e", (data) => {
         const {
            type,
            actorName,
            headlines,
            buffer,
            timestamp,
            userId,
            broadcasters,
            duration,
            controllerId,
            targetId,
         } = data;

         switch (type) {
            case "syncBroadcast":
               this.#receiveBroadcastSync(actorName, headlines);
               break;
            case "stopBroadcast":
               this.#stopBroadcaster(actorName);
               break;
            case "frameUpdate":
               this.#receiveFrameUpdate(buffer, timestamp, duration);
               break;
            case "controllerElection":
               this.#handleControllerElection(userId);
               break;
            case "controllerHeartbeat":
               this.#handleControllerHeartbeat(userId);
               break;
            case "requestStateSync":
               this.#handleStateSyncRequest(userId);
               break;
            case "stateSyncResponse":
               this.#handleStateSyncResponse(broadcasters);
               break;
            case "controllerAnnouncement":
               this.#handleControllerHeartbeat(userId);
               break;
            case "controllerStatusRequest":
               this.#handleControllerStatusRequest(userId);
               break;
            case "controllerStatusResponse":
               this.#handleControllerStatusResponse(controllerId, targetId);
               break;
            case "forceResync":
               Hooks.callAll("sr3e.forceResync");
               break;
         }
      });
   }

   #requestControllerElection() {
      if (this.#electionInProgress) return;
      this.#electionInProgress = true;
      this.#electionCandidates.clear();
      this.#electionCandidates.add(game.user?.id);

      game.socket.emit("module.sr3e", {
         type: "controllerElection",
         userId: game.user?.id,
      });

      clearTimeout(this.#syncRequestTimeout);
      this.#syncRequestTimeout = setTimeout(() => {
         this.#resolveElection();
      }, this.ELECTION_DELAY);
   }

   #resolveElection() {
      const sorted = Array.from(this.#electionCandidates).sort();
      const winner = sorted[0];
      this.#electionInProgress = false;

      if (winner === game.user?.id) {
         this.#becomeController();
      } else {
         this.#broadcastController = winner;
      }
   }

   #handleControllerElection(userId) {
      this.#electionCandidates.add(userId);
      if (!this.#electionInProgress) {
         this.#requestControllerElection();
      }
   }

   #becomeController() {
      if (this.#isController) return;

      this.#announceController();
      this.#isController = true;
      this.#broadcastController = game.user?.id;
      this.#startControllerHeartbeat();
      this.#loadActiveBroadcasters();
      this.#scheduleNextFrame();
   }

   #announceController() {
      game.socket.emit("module.sr3e", {
         type: "controllerAnnouncement",
         userId: game.user?.id,
      });
   }

   #requestControllerStatus() {
      game.socket.emit("module.sr3e", {
         type: "controllerStatusRequest",
         userId: game.user?.id,
      });

      clearTimeout(this.#syncRequestTimeout);
      this.#syncRequestTimeout = setTimeout(() => {
         this.#requestControllerElection();
      }, 2000);
   }

   #handleControllerStatusRequest(requesterId) {
      if (!this.#isController) return;
      game.socket.emit("module.sr3e", {
         type: "controllerStatusResponse",
         controllerId: game.user?.id,
         targetId: requesterId,
      });
   }

   #handleControllerStatusResponse(controllerId, targetId) {
      if (targetId !== game.user?.id) return;
      this.#broadcastController = controllerId;
      this.#lastHeartbeat = Date.now();
   }

   #startControllerHeartbeat() {
      clearInterval(this.#controllerHeartbeat);
      this.#controllerHeartbeat = setInterval(() => {
         if (this.#isController) {
            game.socket.emit("module.sr3e", {
               type: "controllerHeartbeat",
               userId: game.user?.id,
            });
         }
      }, this.HEARTBEAT_INTERVAL);
   }

   #handleControllerHeartbeat(userId) {
      this.#broadcastController = userId;
      this.#lastHeartbeat = Date.now();

      if (userId === game.user?.id) return;

      if (this.#isController) {
         this.#isController = false;
         clearInterval(this.#controllerHeartbeat);
         clearTimeout(this.#nextTick);
      }
   }

   #checkControllerHealth() {
      if (this.#isController) return;
      const now = Date.now();
      const elapsed = now - this.#lastHeartbeat;
      if (elapsed > this.CONTROLLER_TIMEOUT + 200) {
         this.#requestControllerElection();
      }
   }

   #scheduleNextFrame() {
      if (!this.#isController) return;

      this.#loadActiveBroadcasters();

      this.#fillFeedBuffer(10);

      if (this.#feedBuffer.length === 0) {
         clearTimeout(this.#nextTick);
         this.#nextTick = setTimeout(() => {
            this.#scheduleNextFrame();
         }, 1000);
         return;
      }

      const buffer = [...this.#feedBuffer];
      const duration = this.#guessDuration(buffer);
      const startTime = Date.now() + 200;
      const frame = { buffer, timestamp: startTime, duration };

      this.currentDisplayFrame.set(frame);

      game.socket.emit("module.sr3e", {
         type: "frameUpdate",
         buffer,
         timestamp: startTime,
         duration,
      });

      clearTimeout(this.#nextTick);
      this.#nextTick = setTimeout(() => {
         this.#scheduleNextFrame();
      }, duration);
   }

   #receiveFrameUpdate(buffer, timestamp, duration) {
      const current = get(this.currentDisplayFrame);
      if (!Array.isArray(buffer)) return;
      if (!timestamp) return;
      if (timestamp <= current.timestamp) return;

      this.currentDisplayFrame.set({ buffer, timestamp, duration });
   }

   #guessDuration(buffer) {
      if (!Array.isArray(buffer) || buffer.length === 0) return this.DEFAULT_MS;

      const FONT_SIZE_PX = 24; // 1.5rem = 24px typically

      const calculateTextWidth = (text = "") => {
         let totalWidth = 0;

         for (const char of text) {
            const code = char.codePointAt(0);

            // CJK (Chinese, Japanese, Korean) - full width
            if (
               (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
               (code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
               (code >= 0x3040 && code <= 0x309f) || // Hiragana
               (code >= 0x30a0 && code <= 0x30ff) || // Katakana
               (code >= 0xac00 && code <= 0xd7af)
            ) {
               // Hangul
               totalWidth += FONT_SIZE_PX * 1.0; // Full width
            }
            // Cyrillic
            else if (code >= 0x0400 && code <= 0x04ff) {
               totalWidth += FONT_SIZE_PX * 0.75; // Similar to Latin
            }
            // Arabic/Hebrew (RTL)
            else if (
               (code >= 0x0590 && code <= 0x05ff) || // Hebrew
               (code >= 0x0600 && code <= 0x06ff)
            ) {
               // Arabic
               totalWidth += FONT_SIZE_PX * 0.65; // Often condensed
            }
            // Thai, Devanagari, etc.
            else if (code >= 0x0e00 && code <= 0x0e7f) {
               // Thai
               totalWidth += FONT_SIZE_PX * 0.6;
            } else if (code >= 0x0900 && code <= 0x097f) {
               // Devanagari
               totalWidth += FONT_SIZE_PX * 0.7;
            }
            // Latin narrow characters
            else if ("iltfj".includes(char)) {
               totalWidth += FONT_SIZE_PX * 0.4;
            }
            // Latin wide characters
            else if ("wmMW".includes(char)) {
               totalWidth += FONT_SIZE_PX * 1.2;
            }
            // Default Latin
            else if (code < 0x0080) {
               totalWidth += FONT_SIZE_PX * 0.75;
            }
            // Fallback for other scripts
            else {
               totalWidth += FONT_SIZE_PX * 0.8;
            }
         }

         return totalWidth;
      };

      // Calculate total content width
      const marqueeWidth = buffer.reduce((sum, msg) => {
         const senderWidth = calculateTextWidth(msg.sender);
         const headlineWidth = calculateTextWidth(msg.headline);
         const itemPadding = 64; // 2rem left + 2rem right
         return sum + senderWidth + headlineWidth + itemPadding;
      }, 0);

      // Estimated ticker container width
      const estimatedTickerWidth = this.ESTIMATED_TICKER_WIDTH || 400;

      // Total animation distance: from ticker-width to -marquee-width
      const totalDistance = estimatedTickerWidth + marqueeWidth;

      const duration = (totalDistance / this.SCROLL_SPEED) * 1000;

      return Math.max(Math.ceil(duration), this.DEFAULT_MS);
   }

   #handleStateSyncRequest(requestingUserId) {
      if (requestingUserId === game.user?.id) return;
      const broadcasters = get(this.activeBroadcasters);
      if (broadcasters.size === 0) return;
      const broadcastersData = {};
      broadcasters.forEach((headlines, actorName) => {
         broadcastersData[actorName] = headlines;
      });
      game.socket.emit("module.sr3e", {
         type: "stateSyncResponse",
         broadcasters: broadcastersData,
      });
   }

   #handleStateSyncResponse(broadcastersData) {
      Object.entries(broadcastersData).forEach(([actorName, headlines]) => {
         this.#receiveBroadcastSync(actorName, headlines);
      });
   }

   #receiveBroadcastSync(actorName, headlines) {
      const broadcasters = get(this.activeBroadcasters);
      if (!headlines || headlines.length === 0) {
         broadcasters.delete(actorName);
         this.#currentIndices.delete(actorName);
      } else {
         broadcasters.set(actorName, headlines);
         const currentIndex = this.#currentIndices.get(actorName) || 0;
         this.#currentIndices.set(actorName, currentIndex % headlines.length);
      }
      this.activeBroadcasters.set(new Map(broadcasters));
      this.#updateFeedBuffer();
   }

   #stopBroadcaster(actorName) {
      const broadcasters = get(this.activeBroadcasters);
      broadcasters.delete(actorName);
      this.#currentIndices.delete(actorName);
      this.activeBroadcasters.set(new Map(broadcasters));
      this.#updateFeedBuffer();
   }

   #pumpNextHeadline() {
      const broadcasters = get(this.activeBroadcasters);
      if (broadcasters.size === 0) return null;
      const broadcasterNames = Array.from(broadcasters.keys());
      for (let offset = 0; offset < broadcasterNames.length; offset++) {
         const index = (this.#lastBroadcasterIndex + offset + 1) % broadcasterNames.length;
         const broadcasterName = broadcasterNames[index];
         const headlines = broadcasters.get(broadcasterName);
         if (!headlines || headlines.length === 0) continue;
         const currentIndex = this.#currentIndices.get(broadcasterName) || 0;
         const headline = headlines[currentIndex];
         this.#currentIndices.set(broadcasterName, (currentIndex + 1) % headlines.length);
         this.#lastBroadcasterIndex = index;
         return { sender: broadcasterName, headline };
      }
      return null;
   }

#fillFeedBuffer(minLength = 10) {
   const buffer = [...this.#feedBuffer];
   const broadcasters = get(this.activeBroadcasters);

   while (buffer.length < minLength) {
      const nextHeadline = this.#pumpNextHeadline();
      if (!nextHeadline) break;
      buffer.push(nextHeadline);
   }

   // ⛔ No broadcasters, inject default system messages
   if (buffer.length === 0 && broadcasters.size === 0) {
      for (let i = 0; i < minLength; i++) {
         const msg = this.#defaultMessages[i % this.#defaultMessages.length];
         buffer.push(msg);
      }
   }

   this.#feedBuffer = buffer.slice(-this.#maxVisible);
   this.#publishFeed();
}


   #updateFeedBuffer() {
      const broadcasters = get(this.activeBroadcasters);
      if (broadcasters.size === 0) {
         this.#feedBuffer = [];
         this.#publishFeed();
         return;
      }
      this.#feedBuffer = this.#feedBuffer.filter(
         (message) => broadcasters.has(message.sender) && broadcasters.get(message.sender).includes(message.headline)
      );
      this.#fillFeedBuffer(this.#maxVisible);
   }

   #publishFeed() {
      const feeds = {};
      this.#feedBuffer.forEach((message) => {
         feeds[message.sender] = feeds[message.sender] || [];
         feeds[message.sender].push(message);
      });
      this.allFeeds.set(feeds);
   }

   requestFullResync() {
      this.#requestControllerStatus();
      game.socket.emit("module.sr3e", {
         type: "requestStateSync",
         userId: game.user?.id,
      });
   }

   destroy() {
      game.socket.off("module.sr3e");
      this.#initialized = false;
      clearTimeout(this.#nextTick);
      clearInterval(this.#controllerHeartbeat);
      clearTimeout(this.#syncRequestTimeout);
      this.#isController = false;
      if (CONFIG.sr3e?.newsService === this) CONFIG.sr3e.newsService = null;
   }
}

let newsServiceInstance = null;

export const getNewsService = () => {
   if (!newsServiceInstance) {
      newsServiceInstance = NewsService.Instance();
      newsServiceInstance.initialize();
   }
   return newsServiceInstance;
};

export const broadcastNews = (actorName, headlines) => {
   game.socket.emit("module.sr3e", {
      type: "syncBroadcast",
      actorName,
      headlines,
   });
};

export const stopBroadcast = (actorName) => {
   game.socket.emit("module.sr3e", {
      type: "stopBroadcast",
      actorName,
   });
};

export const currentDisplayFrame = derived(
   () => CONFIG.sr3e?.newsService?.currentDisplayFrame,
   ($store, set) => {
      if (!$store?.subscribe) {
         set({ buffer: [], timestamp: 0 });
         return;
      }

      return $store.subscribe(set);
   }
);
