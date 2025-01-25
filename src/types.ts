/**
 * Configuration for a JSON file containing configuration values
 * @property {string} name - The name to use when accessing values (e.g., import.meta.name)
 * @property {string} path - Path to the JSON file relative to the project root
 */
type JsonFileConfig = {
  name: string;
  path: string;
};

/**
 * Runtime configuration for type generation
 * @property {JsonFileConfig[]} JsonFiles - Array of JSON configuration files
 * @property {string} typesOutputPath - Path where the generated type definitions will be saved
 */
export type MetaVariablesJsonConfig = {
  JsonFiles: JsonFileConfig[];
  typesOutputPath: string;
};
