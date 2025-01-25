import * as fs from "fs";
import * as path from "path";
import jsonToTs from "json-to-ts";
import { MetaVariablesJsonConfig } from "./types";

/**
 * Loads and evaluates a JSON file that exports a configuration object
 * @param {string} filePath - Path to the JSON file
 * @returns {Record<string, unknown>} The exported configuration object
 */
function loadJsonFileContent(filePath: string): Record<string, unknown> {
  const fullPath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }

  const fileContent = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(fileContent);
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generates type definitions for a single configuration object
 * @param {Record<string, unknown>} jsonContent - The configuration object
 * @param {string} name - Name of the configuration
 * @returns {string} TypeScript type definition
 */
function generateTypesForJson(jsonContent: Record<string, unknown>, name: string): string {
  const typeName = `${capitalize(name)}Type =`;

  const types = jsonToTs(jsonContent).map((type) => {
    if (type.startsWith("interface RootObject")) {
      return type.replace("interface RootObject", `type ${typeName}`);
    }
    return type;
  });

  return types.join("\n\n");
}

/**
 * Generates type definitions for all configuration files
 * @param {MetaVariablesJsonConfig} config - Configuration for type generation
 * @returns {string} Generated TypeScript type definitions
 */
async function generateConfigTypes(config: MetaVariablesJsonConfig): Promise<string> {
  let output = "// Generated types for Json meta variables \n\n";

  for (const jsonFile of config.JsonFiles) {
    try {
      const jsonContent = loadJsonFileContent(jsonFile.path);
      const typeDefinition = generateTypesForJson(jsonContent, jsonFile.name);
      output += typeDefinition + "\n\n";
    } catch (error) {
      console.error(`Error processing ${jsonFile.path}: ${error}`);
      output += `// Error generating types for ${jsonFile.name}\n\n`;
    }
  }

  // Generate the ImportMeta interface
  output += "interface ImportMeta {\n";
  for (const jsonFile of config.JsonFiles) {
    const typeName = `${capitalize(jsonFile.name)}Type`;
    output += `  readonly ${jsonFile.name}: ${typeName};\n`;
  }
  output += "}\n";

  return output;
}

/**
 * Generates type definitions and writes them to a file
 * @param {MetaVariablesJsonConfig} config - Configuration for type generation
 */
export async function generateTypes(config: MetaVariablesJsonConfig): Promise<void> {
  const types = await generateConfigTypes(config);
  fs.writeFileSync(config.typesOutputPath, types);
}
