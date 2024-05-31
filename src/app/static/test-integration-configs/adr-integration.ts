import baseConfig from "../vitest.config.mts";
import { mergeConfig, defineConfig } from "vitest/config";

export default mergeConfig(
    baseConfig,
    defineConfig({
        test: {
            include: ["**/adr-dataset.itest.ts"],
            testTimeout: 120000,
            setupFiles: ["./src/tests/setup.integration.mts"]
        }
    })
);
