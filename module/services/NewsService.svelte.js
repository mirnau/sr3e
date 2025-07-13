// Updated NewsService.svelte.js
import { writable, get } from "svelte/store";

export class NewsService {
   activeBroadcasters = writable(new Map());
   allFeeds = writable({});
   currentDisplayFrame = writable({ buffer: [], timestamp: Date.now() });

   #feedBuffer = [];
   #currentIndices = new Map();
   #maxVisible = 5;
   #lastBroadcasterIndex = -1;
   #frameUpdateInterval = null;
   #initialized = false;
   #nextTick = null;
   #tickerLock = {
      userId: null,
      timestamp: 0,
   };
   AVG_CHAR_PX = 12; // average width of one glyph
   SCROLL_SPEED = 100; // px per second (matches NewsFeed)
   DEFAULT_MS = 10_000; // fallback when nothing to measure

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
      this.#requestStateSync();

      CONFIG.sr3e = CONFIG.sr3e || {};
      CONFIG.sr3e.newsService = this;
   }

   TryClaimBroadcast() {
      const userId = game.user?.id;
      const now = Date.now();

      if (!this.#tickerLock || !this.#tickerLock.userId || now - this.#tickerLock.timestamp > 30000) {
         this.#tickerLock = {
            userId,
            timestamp: now,
         };
         console.log("✅ Broadcast lock claimed by", userId);
         return true;
      }

      if (this.#tickerLock.userId === userId) {
         this.#tickerLock.timestamp = now;
         return true;
      }

      return false;
   }

   #setupSocket() {
      game.socket.on("module.sr3e", (data) => {
         const { type, actorName, headlines, buffer, timestamp, userId, broadcasters, duration } = data;

         switch (type) {
            case "syncBroadcast":
               this.#receiveBroadcastSync(actorName, headlines);
               break;
            case "stopBroadcast":
               this.#stopBroadcaster(actorName);
               break;
            case "requestFrameSync":
               this.#sendCurrentFrame();
               break;
            case "frameUpdate": {
               const current = get(this.currentDisplayFrame).timestamp;
               if (timestamp > current) this.currentDisplayFrame.set({ buffer, timestamp, duration });
               break;
            }
            case "forceResync":
               Hooks.call("sr3e.forceResync");
               break;
            case "requestStateSync":
               this.#handleStateSyncRequest(userId);
               break;
            case "stateSyncResponse":
               this.#handleStateSyncResponse(broadcasters);
               break;
         }
      });
   }

   #requestStateSync() {
      console.log("📡 Requesting state sync from other clients");
      game.socket.emit("module.sr3e", {
         type: "requestStateSync",
         userId: game.user?.id,
      });
   }

   #handleStateSyncRequest(requestingUserId) {
      if (requestingUserId === game.user?.id) return;

      const broadcasters = get(this.activeBroadcasters);
      if (broadcasters.size === 0) return;

      const broadcastersData = {};
      broadcasters.forEach((headlines, actorName) => {
         broadcastersData[actorName] = headlines;
      });

      console.log("📤 Sending state sync response to", requestingUserId);
      game.socket.emit("module.sr3e", {
         type: "stateSyncResponse",
         broadcasters: broadcastersData,
      });
   }

   #handleStateSyncResponse(broadcastersData) {
      console.log("📥 Received state sync response:", broadcastersData);

      Object.entries(broadcastersData).forEach(([actorName, headlines]) => {
         this.#receiveBroadcastSync(actorName, headlines);
      });
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

   sendNextFrame(duration = null) {
      this.#fillFeedBuffer(10);
      const buffer = [...this.#feedBuffer];

      if (duration == null) duration = this.#guessDuration(buffer);

      const frame = {
         buffer,
         timestamp: Date.now(),
         duration,
      };

      this.currentDisplayFrame.set(frame);

      game.socket.emit("module.sr3e", {
         type: "frameUpdate",
         buffer,
         timestamp: frame.timestamp,
         duration,
      });

      game.socket.emit("module.sr3e", {
         type: "forceResync",
      });

      clearTimeout(this.#nextTick);
      this.#nextTick = setTimeout(() => {
         if (this.TryClaimBroadcast()) this.sendNextFrame();
      }, duration);
   }

   #guessDuration(buffer) {
      const AVG_CHAR_PX = 12;
      const SCROLL_SPEED = 100;
      const DEFAULT_MS = 10000;

      const totalPx = buffer.reduce((sum, msg) => sum + msg.headline.length, 0) * AVG_CHAR_PX;
      return Math.ceil((totalPx / SCROLL_SPEED) * 1000) || DEFAULT_MS;
   }

   #sendCurrentFrame() {
      const frame = get(this.currentDisplayFrame);
      if (!frame?.buffer?.length) return;

      game.socket.emit("module.sr3e", {
         type: "frameUpdate",
         buffer: frame.buffer,
         timestamp: frame.timestamp,
         duration: frame.duration,
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

      while (buffer.length < minLength) {
         const nextHeadline = this.#pumpNextHeadline();
         if (!nextHeadline) break;
         buffer.push(nextHeadline);
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

      if (!get(this.currentDisplayFrame).buffer.length && this.TryClaimBroadcast()) {
         this.sendNextFrame();
      }
   }

   #publishFeed() {
      const feeds = {};
      this.#feedBuffer.forEach((message) => {
         feeds[message.sender] = feeds[message.sender] || [];
         feeds[message.sender].push(message);
      });
      this.allFeeds.set(feeds);
   }

   destroy() {
      game.socket.off("module.sr3e");
      this.#initialized = false;
      clearTimeout(this.#nextTick);
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

export const requestFrameSync = () => {
   game.socket.emit("module.sr3e", {
      type: "requestFrameSync",
   });
};

export const currentDisplayFrame = () => CONFIG.sr3e?.newsService?.currentDisplayFrame;
