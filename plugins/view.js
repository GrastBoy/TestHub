"use strict";

const fp = require("fastify-plugin");
const path = require("path");

/**
 * This plugins adds templates rendering support
 *
 * @see https://github.com/fastify/point-of-view
 */
module.exports = fp(async function (fastify, opts) {
  fastify.register(require("@fastify/view"), {
    engine: {
      ejs: require("ejs"),
    },
  });
});
