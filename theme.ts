import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {},
});

export const system = createSystem(defaultConfig, config);
