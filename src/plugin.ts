import type { Plugin, ResolvedConfig } from "vite";
import type { MetaVariablesJsonConfig } from "./types";
import { generateTypes } from "./generate";
import * as fs from "fs";
import path from "path";

const GLOBAL_OBJECT = "window";

export const metaVariables = (options: MetaVariablesJsonConfig): Plugin => {
  let vite_config: ResolvedConfig;
  let runtimeJsonConfig: MetaVariablesJsonConfig;
  return {
    name: "vite-plugin-meta-variables",
    configResolved(config) {
      vite_config = config;
      runtimeJsonConfig = { ...options, ...vite_config.metaVariables };
    },
    buildStart() {
      generateTypes(options);
    },

    handleHotUpdate({ file }) {
      if (file.endsWith(".json")) {
        generateTypes(options);
      }
    },

    transform(code: string): string {
      const jsonNames = runtimeJsonConfig.JsonFiles.map((file) => file.name);
      const jsonNamesPattern = jsonNames.join("|");

      // Match the full path, including nested properties for any JSON file name
      const importMetaRegex = new RegExp(`import\\.meta\\.(${jsonNamesPattern})(\\.[a-zA-Z_$][\\w$]*)*`, "g");

      code = code.replace(importMetaRegex, (match) => {
        return match.replace("import.meta", GLOBAL_OBJECT);
      });

      return code;
    },
    transformIndexHtml() {
      let script: string | undefined;
      return runtimeJsonConfig.JsonFiles.map((file) => {
        const destFilePath = path.resolve(file.path);
        const source = JSON.parse(fs.readFileSync(destFilePath, "utf-8"));
        if (vite_config.command === "serve") {
          script = `${GLOBAL_OBJECT}.${file.name} = {...${GLOBAL_OBJECT}.${file.name}, ...${JSON.stringify(source)}};`;
        } else {
          script = `import ${file.name} from '${vite_config.base}${file.name}.js'; ${GLOBAL_OBJECT}.${file.name} = {...${GLOBAL_OBJECT}.${file.name}, ...${file.name}};`;
        }
        return {
          tag: "script",
          attrs: {
            type: "module",
          },
          children: script,
          injectTo: "head-prepend",
        };
      });
    },
    generateBundle() {
      runtimeJsonConfig.JsonFiles.forEach((file) => {
        const destFilePath = path.resolve(file.path);
        const fileContent = fs.readFileSync(destFilePath, "utf-8");
        const jsonData = JSON.parse(fileContent);
        const jsonTojs = `export default ${JSON.stringify(jsonData, null, 2)}`;
        this.emitFile({
          type: "asset",
          fileName: `${file.name}.js`,
          source: jsonTojs,
        });
      });
    },
  };
};
