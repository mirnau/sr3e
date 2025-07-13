// Fixed NewsService.svelte.js
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
   #broadcastController = null; // The authoritative client
   #isController = false;
   #controllerHeartbeat = null;
   #lastHeartbeat = 0;
   #syncRequestTimeout = null;
   
   AVG_CHAR_PX = 12;
   SCROLL_SPEED = 100;
   DEFAULT_MS = 10_000;
   CONTROLLER_TIMEOUT = 15000; // 15 seconds before controller is considered dead
   HEARTBEAT_INTERVAL = 5000; // 5 seconds between heartbeats

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

      CONFIG.sr3e = CONFIG.sr3e || {};
      CONFIG.sr3e.newsService = this;
   }

   #setupSocket() {
      game.socket.on("module.sr3e", (data) => {
         const { type, actorName, headlines, buffer, timestamp, userId, broadcasters, duration, controllerId } = data;

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
         }
      });
   }

   #requestControllerElection() {
      console.log("📊 Requesting controller election");
      game.socket.emit("module.sr3e", {
         type: "controllerElection",
         userId: game.user?.id,
      });

      // Wait for responses, then determine controller
      clearTimeout(this.#syncRequestTimeout);
      this.#syncRequestTimeout = setTimeout(() => {
         this.#becomeController();
      }, 2000);
   }

   #handleControllerElection(userId) {
      if (userId === game.user?.id) return;

      // Respond to election request
      game.socket.emit("module.sr3e", {
         type: "controllerElection",
         userId: game.user?.id,
      });

      // Let the user with lowest ID become controller (deterministic)
      const allUsers = [userId, game.user?.id].sort();
      if (allUsers[0] === game.user?.id) {
         clearTimeout(this.#syncRequestTimeout);
         this.#syncRequestTimeout = setTimeout(() => {
            this.#becomeController();
         }, 1000);
      }
   }

   #becomeController() {
      if (this.#isController) return;
      
      console.log("👑 Becoming broadcast controller");
      this.#isController = true;
      this.#broadcastController = game.user?.id;
      this.#startControllerHeartbeat();
      this.#loadActiveBroadcasters();
      this.#scheduleNextFrame();
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
      if (userId === game.user?.id) return;

      this.#broadcastController = userId;
      this.#lastHeartbeat = Date.now();
      
      // Stop being controller if we thought we were
      if (this.#isController) {
         console.log("👑 Stepping down as controller - another client is active");
         this.#isController = false;
         clearInterval(this.#controllerHeartbeat);
         clearTimeout(this.#nextTick);
      }
   }

   #checkControllerHealth() {
      if (this.#isController) return;

      const now = Date.now();
      if (this.#lastHeartbeat > 0 && now - this.#lastHeartbeat > this.CONTROLLER_TIMEOUT) {
         console.log("💀 Controller appears dead, taking over");
         this.#becomeController();
      }
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

   #scheduleNextFrame() {
      if (!this.#isController) return;

      this.#fillFeedBuffer(10);
      const buffer = [...this.#feedBuffer];
      const duration = this.#guessDuration(buffer);

      // Schedule frame to start at a future time for sync
      const startTime = Date.now() + 100; // 100ms in future for processing
      
      const frame = {
         buffer,
         timestamp: startTime,
         duration,
      };

      // Send to all clients including self
      game.socket.emit("module.sr3e", {
         type: "frameUpdate",
         buffer,
         timestamp: startTime,
         duration,
      });

      // Apply to self
      this.#receiveFrameUpdate(buffer, startTime, duration);

      // Schedule next frame
      clearTimeout(this.#nextTick);
      this.#nextTick = setTimeout(() => {
         this.#scheduleNextFrame();
      }, duration);
   }

   #receiveFrameUpdate(buffer, timestamp, duration) {
      const current = get(this.currentDisplayFrame);
      
      // Only apply if this is newer than current frame
      if (timestamp > current.timestamp) {
         this.currentDisplayFrame.set({ buffer, timestamp, duration });
      }
   }

   #guessDuration(buffer) {
      if (buffer.length === 0) return this.DEFAULT_MS;
      
      const totalPx = buffer.reduce((sum, msg) => sum + msg.headline.length, 0) * this.AVG_CHAR_PX;
      const calculatedDuration = Math.ceil((totalPx / this.SCROLL_SPEED) * 1000);
      
      return Math.max(calculatedDuration, this.DEFAULT_MS);
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

export const currentDisplayFrame = () => CONFIG.sr3e?.newsService?.currentDisplayFrame;