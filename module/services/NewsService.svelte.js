// NewsService.svelte.js
import { writable, get } from "svelte/store";

export class NewsService {
   activeBroadcasters = writable(new Map());
   allFeeds = writable({});
   currentDisplayFrame = writable({ buffer: [], timestamp: Date.now() });

   #feedBuffer = [];
   #currentIndices = new Map();
   #maxVisible = 5;
   #lastBroadcasterIndex = -1;
   #tickerInterval = null;
   #frameUpdateInterval = null;
   #initialized = false;

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
      this.#startTickerLoop();
      this.#loadActiveBroadcasters();
      
      // Register globally for easy access
      CONFIG.sr3e = CONFIG.sr3e || {};
      CONFIG.sr3e.newsService = this;
   }

   #setupSocket() {
      game.socket.on("module.sr3e", (data) => {
         const { type, actorName, headlines } = data;
         
         switch (type) {
            case "syncBroadcast":
               this.#receiveBroadcastSync(actorName, headlines);
               break;
            case "stopBroadcast":
               this.#stopBroadcaster(actorName);
               break;
            case "requestFrameSync":
               this.#sendFrameUpdate();
               break;
         }
      });
   }

   #startTickerLoop() {
      this.#tickerInterval = setInterval(() => {
         this.#updateTickerFrame();
      }, 3000);

      this.#frameUpdateInterval = setInterval(() => {
         this.#sendFrameUpdate();
      }, 1000);
   }

   #loadActiveBroadcasters() {
      const allBroadcasters = game.actors.filter(actor => 
         actor.type === "broadcaster" && actor.system.isBroadcasting
      );
      
      allBroadcasters.forEach(broadcaster => {
         const headlines = broadcaster.system.rollingNews || [];
         this.#receiveBroadcastSync(broadcaster.name, headlines);
      });
   }

   #updateTickerFrame() {
      this.#fillFeedBuffer(10);
      const buffer = [...this.#feedBuffer];
      const timestamp = Date.now();
      this.currentDisplayFrame.set({ buffer, timestamp });
   }

   #sendFrameUpdate() {
      const frame = get(this.currentDisplayFrame);
      game.socket.emit("module.sr3e", {
         type: "frameUpdate",
         buffer: frame.buffer,
         timestamp: frame.timestamp,
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
      
      this.#feedBuffer = this.#feedBuffer.filter(message => 
         broadcasters.has(message.sender) && 
         broadcasters.get(message.sender).includes(message.headline)
      );
      
      this.#fillFeedBuffer(this.#maxVisible);
   }

   #publishFeed() {
      const feeds = {};
      this.#feedBuffer.forEach(message => {
         feeds[message.sender] = feeds[message.sender] || [];
         feeds[message.sender].push(message);
      });
      this.allFeeds.set(feeds);
   }

   destroy() {
      if (this.#tickerInterval) {
         clearInterval(this.#tickerInterval);
         this.#tickerInterval = null;
      }
      
      if (this.#frameUpdateInterval) {
         clearInterval(this.#frameUpdateInterval);
         this.#frameUpdateInterval = null;
      }
      
      game.socket.off("module.sr3e");
      this.#initialized = false;
      
      if (CONFIG.sr3e && CONFIG.sr3e.newsService === this) {
         CONFIG.sr3e.newsService = null;
      }
   }
}

// Initialize the service when module loads
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
      headlines 
   });
};

export const stopBroadcast = (actorName) => {
   game.socket.emit("module.sr3e", { 
      type: "stopBroadcast", 
      actorName 
   });
};

export const requestFrameSync = () => {
   game.socket.emit("module.sr3e", { 
      type: "requestFrameSync" 
   });
};

export const currentDisplayFrame = () => 
   CONFIG.sr3e?.newsService?.currentDisplayFrame;