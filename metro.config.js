// @ts-check
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Avoid early Hermes/runtime errors loading packages that rely on "exports"
// (see Expo discussions re: "[runtime not ready]: Property 'require' doesn't exist").
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
