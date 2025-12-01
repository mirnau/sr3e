/**
 * Type declarations for SR3E extensions to Foundry VTT global objects
 */

import type { Sr3eConfig } from "@config/config";

declare global {
  interface CONFIG {
    /**
     * SR3E system configuration object containing all i18n keys
     */
    sr3e: Sr3eConfig;

    /**
     * Query handlers for inter-client communication
     */
    queries?: Record<string, (...args: any[]) => Promise<any>>;
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
      namespace apps {
        /**
         * Extension for DocumentSheetConfig to add missing v13 static methods
         */
        class DocumentSheetConfig {
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
    }
  }
}

export {};
