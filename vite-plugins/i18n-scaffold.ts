import type { Plugin } from 'vite';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { createHash } from 'crypto';
import path from 'path';
import { Project, SyntaxKind } from 'ts-morph';
import { glob } from 'glob';

export interface I18nScaffoldOptions {
  /** Directory containing config files to watch */
  configDir: string;
  /** Output directory for JSON files */
  langDir: string;
  /** System namespace prefix (e.g., "sr3e") */
  systemNamespace: string;
}

interface ParsedConfig {
  /** Category name (e.g., "attributes") */
  category: string;
  /** Array of keys extracted from the constant */
  keys: string[];
  /** Source file path */
  sourcePath: string;
}

/**
 * Vite plugin that auto-scaffolds i18n JSON files from TypeScript config files.
 *
 * Uses Vite's native watch system (same as SCSS compilation) for automatic updates.
 * Preserves existing translations while adding new keys and pruning orphaned ones.
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { i18nScaffold } from './vite-plugins/i18n-scaffold';
 *
 * export default defineConfig({
 *   plugins: [
 *     i18nScaffold({
 *       configDir: 'lang/config',
 *       langDir: 'lang',
 *       systemNamespace: 'sr3e'
 *     })
 *   ]
 * });
 * ```
 */
export function i18nScaffold(options: I18nScaffoldOptions): Plugin {
  const { configDir, langDir, systemNamespace } = options;

  let projectRoot: string;
  let configDirPath: string;
  let langDirPath: string;
  let tsProject: Project;

  // Track file hashes to avoid unnecessary writes
  const fileHashes = new Map<string, string>();

  return {
    name: 'i18n-scaffold',

    configResolved(config) {
      projectRoot = config.root;
      configDirPath = path.resolve(projectRoot, configDir);
      langDirPath = path.resolve(projectRoot, langDir);

      // Initialize ts-morph project
      tsProject = new Project({
        tsConfigFilePath: path.resolve(projectRoot, 'tsconfig.json'),
        skipAddingFilesFromTsConfig: true
      });
    },

    async buildStart() {
      // Find all config files
      const configFiles = await glob('**/*.ts', {
        cwd: configDirPath,
        absolute: true
      });

      // Add config files to Vite's watch system (same as SCSS)
      for (const file of configFiles) {
        this.addWatchFile(file);
      }

      // Also add the main config file
      const mainConfigPath = path.resolve(projectRoot, configDir, '../config.ts');
      if (existsSync(mainConfigPath)) {
        this.addWatchFile(mainConfigPath);
      }

      console.log(`[i18n-scaffold] Watching ${configFiles.length} config file(s) via Vite's watch system`);

      // Run initial scaffold
      for (const file of configFiles) {
        scaffoldFromFile(file);
      }
    },

    handleHotUpdate({ file }) {
      // Trigger when config files change (via Vite's watch)
      if (file.startsWith(configDirPath) && file.endsWith('.ts')) {
        console.log(`[i18n-scaffold] Config changed: ${path.relative(projectRoot, file)}`);
        scaffoldFromFile(file);
        return [];  // Don't trigger HMR
      }
    }
  };

  /**
   * Parse a TypeScript config file to extract createCategory calls
   * Pattern: createCategory('category', KEYS_VAR)
   */
  function parseConfigFile(filePath: string): ParsedConfig[] {
    try {
      const sourceFile = tsProject.addSourceFileAtPath(filePath);
      const results: ParsedConfig[] = [];

      // First, find all exported const array declarations
      const arrayDeclarations = new Map<string, string[]>();

      sourceFile.getVariableStatements()
        .filter(stmt => stmt.hasExportKeyword())
        .flatMap(stmt => stmt.getDeclarations())
        .forEach(decl => {
          const name = decl.getName();
          const initializer = decl.getInitializer();

          if (!initializer || initializer.getKind() !== SyntaxKind.AsExpression) return;

          const asExpression = initializer.asKindOrThrow(SyntaxKind.AsExpression);
          const arrayLiteral = asExpression.getExpression();

          if (arrayLiteral.getKind() !== SyntaxKind.ArrayLiteralExpression) return;

          const elements = arrayLiteral
            .asKindOrThrow(SyntaxKind.ArrayLiteralExpression)
            .getElements()
            .filter(el => el.getKind() === SyntaxKind.StringLiteral)
            .map(el => el.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralText());

          if (elements.length > 0) {
            arrayDeclarations.set(name, elements);
          }
        });

      // Now find createCategory calls
      sourceFile.getVariableStatements()
        .filter(stmt => stmt.hasExportKeyword())
        .flatMap(stmt => stmt.getDeclarations())
        .forEach(decl => {
          const initializer = decl.getInitializer();
          if (!initializer || initializer.getKind() !== SyntaxKind.CallExpression) return;

          const callExpr = initializer.asKindOrThrow(SyntaxKind.CallExpression);
          const functionName = callExpr.getExpression().getText();

          if (functionName !== 'createCategory') return;

          const args = callExpr.getArguments();
          if (args.length !== 2) return;

          // Get category string (first argument)
          const categoryArg = args[0];
          if (!categoryArg || categoryArg.getKind() !== SyntaxKind.StringLiteral) return;
          const category = categoryArg.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue();

          // Get array variable name (second argument)
          const arrayArg = args[1];
          if (!arrayArg) return;
          const arrayVarName = arrayArg.getText();

          // Look up the keys from the array declaration
          const keys = arrayDeclarations.get(arrayVarName);
          if (!keys) return;

          results.push({
            category,
            keys,
            sourcePath: filePath
          });
        });

      // Clean up
      sourceFile.forget();
      return results;
    } catch (error) {
      console.error(`[i18n-scaffold] Error parsing ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Discover all locale codes by scanning lang/*.json files
   */
  function discoverLocales(): string[] {
    if (!existsSync(langDirPath)) {
      return [];
    }

    return readdirSync(langDirPath)
      .filter(file => file.endsWith('.json'))
      .map(file => path.basename(file, '.json'));
  }

  /**
   * Compute hash of content for change detection
   */
  function hashContent(content: string): string {
    return createHash('md5').update(content).digest('hex');
  }

  /**
   * Parse a TypeScript file and scaffold JSON files
   */
  function scaffoldFromFile(filePath: string) {
    try {
      const parsed = parseConfigFile(filePath);
      if (parsed.length === 0) {
        return;
      }

      // Discover locales from existing JSON files
      let locales = discoverLocales();

      // Edge case: if no locale files exist, create en.json
      if (locales.length === 0) {
        console.log('[i18n-scaffold] No locale files found, creating en.json');
        const enPath = path.join(langDirPath, 'en.json');
        writeFileSync(enPath, '{}', 'utf-8');
        locales = ['en'];
      }

      for (const locale of locales) {
        const jsonPath = path.join(langDirPath, `${locale}.json`);
        mergeIntoJson(jsonPath, parsed);
      }
    } catch (error) {
      console.error(`[i18n-scaffold] Error processing ${filePath}:`, error);
    }
  }

  /**
   * Set a nested property in an object using a path array
   */
  function setNestedProperty(obj: any, path: string[], value: any): void {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!key) continue;
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
    const lastKey = path[path.length - 1];
    if (lastKey) {
      current[lastKey] = value;
    }
  }

  /**
   * Get a nested property from an object using a path array
   */
  function getNestedProperty(obj: any, path: string[]): any {
    let current = obj;
    for (const key of path) {
      if (!current || typeof current !== 'object') {
        return undefined;
      }
      current = current[key];
    }
    return current;
  }

  /**
   * Delete a nested property from an object using a path array
   */
  function deleteNestedProperty(obj: any, path: string[]): void {
    if (path.length === 0) return;

    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!key || !current[key]) return;
      current = current[key];
    }
    const lastKey = path[path.length - 1];
    if (lastKey) {
      delete current[lastKey];
    }
  }

  /**
   * Merge parsed keys into a JSON file (non-destructive, prunes orphans)
   * Handles edge case of empty JSON files
   */
  function mergeIntoJson(jsonPath: string, parsedConfigs: ParsedConfig[]) {
    // Read existing JSON or start with empty object
    let json: Record<string, any> = {};

    if (existsSync(jsonPath)) {
      try {
        const content = readFileSync(jsonPath, 'utf-8').trim();

        // Edge case: handle empty files
        if (content === '' || content === '{}') {
          console.log(`[i18n-scaffold] Empty JSON file detected: ${path.relative(projectRoot, jsonPath)}`);
          json = {};
        } else {
          json = JSON.parse(content);
        }
      } catch (error) {
        console.error(`[i18n-scaffold] Failed to parse ${jsonPath}, treating as empty:`, error);
        json = {};
      }
    }

    const addedKeys: string[] = [];
    const prunedKeys: string[] = [];

    // Process each parsed config
    for (const config of parsedConfigs) {
      const { category, keys } = config;
      const namespacePath = [systemNamespace, category];

      // Build set of expected keys
      const expectedKeys = new Set(keys);

      // Get existing keys at this namespace
      const existingObj = getNestedProperty(json, namespacePath) || {};
      const existingKeys = Object.keys(existingObj);

      // Prune orphaned keys
      for (const key of existingKeys) {
        if (!expectedKeys.has(key)) {
          const fullPath = [...namespacePath, key].join('.');
          deleteNestedProperty(json, [...namespacePath, key]);
          prunedKeys.push(fullPath);
        }
      }

      // Add missing keys with capitalized default values
      for (const key of keys) {
        const fullPath = [...namespacePath, key];
        const existing = getNestedProperty(json, fullPath);

        if (existing === undefined) {
          // Default value: capitalize first letter
          const defaultValue = key.charAt(0).toUpperCase() + key.slice(1);
          setNestedProperty(json, fullPath, defaultValue);
          addedKeys.push(fullPath.join('.'));
        }
      }
    }

    // Sort keys alphabetically for stable diffs
    const sortedJson = sortObjectKeys(json);

    // Convert to string with formatting
    const newContent = JSON.stringify(sortedJson, null, 2) + '\n';

    // Check if content actually changed (hash guard)
    const newHash = hashContent(newContent);
    const oldHash = fileHashes.get(jsonPath);

    if (newHash === oldHash) {
      // No actual change, skip write to avoid rebuild loop
      return;
    }

    // Write back to file
    writeFileSync(jsonPath, newContent, 'utf-8');
    fileHashes.set(jsonPath, newHash);

    // Log results
    const relativePath = path.relative(projectRoot, jsonPath);
    if (addedKeys.length > 0) {
      console.log(`[i18n-scaffold] Added ${addedKeys.length} key(s) to ${relativePath}:`);
      addedKeys.forEach(key => console.log(`  + ${key}`));
    }
    if (prunedKeys.length > 0) {
      console.log(`[i18n-scaffold] Pruned ${prunedKeys.length} orphaned key(s) from ${relativePath}`);
    }
    if (addedKeys.length === 0 && prunedKeys.length === 0) {
      console.log(`[i18n-scaffold] ${relativePath} is up to date`);
    }
  }

  /**
   * Recursively sort object keys for stable diffs
   */
  function sortObjectKeys(obj: any): any {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return obj;
    }

    const sorted: Record<string, any> = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortObjectKeys(obj[key]);
    }
    return sorted;
  }
}
