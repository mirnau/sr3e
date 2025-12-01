/**
 * Type declarations for SR3E extensions to Foundry VTT global objects
 */

import type { Sr3eConfig } from "@config/config";

declare global {
  /**
   * The global game instance
   */
  var game: Game;

  interface Game {
    messages: foundry.utils.Collection<foundry.documents.BaseChatMessage>;
    users: foundry.utils.Collection<foundry.documents.BaseUser>;
    user: foundry.documents.BaseUser;
    settings: {
      get(namespace: string, key: string): any;
      register(namespace: string, key: string, options: any): void;
    };
  }

  interface CONFIG {
    /**
     * SR3E system configuration object containing all i18n keys
     */
    sr3e: Sr3eConfig;

    /**
     * Query handlers for inter-client communication
     */
    queries?: Record<string, (...args: any[]) => Promise<any>>;

    /**
     * Allow indexing CONFIG with string keys
     */
    [key: string]: any;
  }

  /**
   * Global DEBUG flag for development logging
   */
  var DEBUG: boolean;

  /**
   * Global LOG object for debug logging
   */
  var LOG: {
    inspect: (message: string, location: [string, number], ...args: any[]) => void;
    info: (message: string, location: [string, number], ...args: any[]) => void;
    warn: (message: string, location: [string, number], ...args: any[]) => void;
    error: (message: string, location: [string, number], ...args: any[]) => void;
  };

  /**
   * Vite injected file/line/dir constants
   */
  var __FILE__: string;
  var __LINE__: number;
  var __DIR__: string;

  namespace foundry {
    namespace applications {
      namespace sheets {
        /**
         * ItemSheetV2 class for v13
         */
        class ItemSheetV2 extends foundry.applications.api.ApplicationV2 {
          document: foundry.documents.BaseItem;
          get item(): foundry.documents.BaseItem;
          get title(): string;
          static DEFAULT_OPTIONS: foundry.applications.types.ApplicationConfiguration;
        }
      }

      namespace apps {
        /**
         * Extension for DocumentSheetConfig to add missing v13 static methods
         */
        class DocumentSheetConfig {
          /**
           * Register a sheet class
           */
          static registerSheet(
            documentClass: any,
            scope: string,
            sheetClass: any,
            options?: { types?: string[]; makeDefault?: boolean }
          ): void;

          /**
           * Unregister a sheet class, removing it from the list of available Applications to use for a Document type
           * @param documentClass - The Document class to unregister the sheet for
           * @param scope - A unique namespace scope for this sheet
           * @param sheetClass - The Application class to unregister (or string identifier)
           * @param options - Optional configuration with types array
           */
          static unregisterSheet(
            documentClass: any,
            scope: string,
            sheetClass: string | (typeof foundry.applications.api.ApplicationV2) | (typeof foundry.applications.api.HandlebarsApplicationMixin),
            options?: { types?: string[] }
          ): void;
        }
      }

      namespace api {
        /**
         * ApplicationV2 base class
         */
        class ApplicationV2 {
          element: HTMLElement;
          static DEFAULT_OPTIONS: foundry.applications.types.ApplicationConfiguration;
        }
      }
    }
  }
}

export {};
