import baseConfig from "../vitest.config.mts";
import { mergeConfig, defineConfig } from "vitest/config";

export default mergeConfig(
    baseConfig,
    defineConfig({
        test: {
            include: ['**/*.{itest,ispec}.?(c|m)[jt]s?(x)'],
            exclude: ["**/adr-dataset.itest.ts"],
            coverage: { reportsDirectory: "./coverage/integration/" },
            testTimeout: 6000,
            setupFiles: ["./src/tests/setup.integration.ts"]
        }
    })
);
