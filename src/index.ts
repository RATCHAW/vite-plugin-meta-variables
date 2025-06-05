import { MetaVariablesJsonConfig } from "./types";

export { metaVariables } from "./plugin";
declare module "vite" {
  interface UserConfig {
    /**
     * Options for vite-plugin-runtime-env
     */
    metaVariables?: MetaVariablesJsonConfig;
  }
}
export type { MetaVariablesJsonConfig } from "./types";
