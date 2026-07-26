import baseConfig from "@spottgeo/config/eslint.config.mjs";
import nextConfig from "eslint-config-next";

const config = [...baseConfig, ...nextConfig];

export default config;
