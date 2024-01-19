"use strict";

const fp = require("fastify-plugin");
const path = require("path");

/**
 * This plugins adds static files support
 *
 * @see https://github.com/fastify/fastify-static
 */
module.exports = fp(async function (fastify, opts) {
  fastify.register(require("@fastify/static"), {
    root: path.join(__dirname, "..", "public"),
    prefix: "/public/",
  });
});
