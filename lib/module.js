const { readFileSync, accessSync, constants } = require("fs");
const { join } = require("path");
const { parse } = require("dotenv");
const logger = require("./logger");

module.exports = function (moduleOptions, nuxt) {
  const options = {
    only: null,
    path: nuxt.options.srcDir,
    filename: ".env",
    systemvars: false,
    ...nuxt.options.dotenv,
    ...moduleOptions,
  };

  const envFilePath = join(options.path, options.filename);

  try {
    accessSync(envFilePath, constants.R_OK);
  } catch (err) {
    logger.warn(
      `No \`${options.filename}\` file found in \`${options.path}\`.`
    );
    return;
  }

  const envConfig = parse(readFileSync(envFilePath));

  if (options.systemvars) {
    Object.keys(process.env).map((key) => {
      if (!(key in envConfig)) {
        envConfig[key] = process.env[key];
      }
    });
  }

  Object.keys(envConfig).forEach((key) => {
    if (!Array.isArray(options.only) || options.only.includes(key)) {
      nuxt.options.runtimeConfig[key] =
        nuxt.options.runtimeConfig[key] || envConfig[key];
    }
  });
};

module.exports.meta = require("../package.json");
