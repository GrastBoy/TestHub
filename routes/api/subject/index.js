"use strict";

const models = require("../../../db/models");

const Subject = models.Subjects;

module.exports = async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    await Subject.sync();

    const items = await Subject.findAll();

    return {
      items,
    };
  });

  fastify.post("/", async function (request, reply) {
    const { name } = request.body;

    await Subject.sync();
    const items = await Subject.findAll();

    const isDefine = items.some((item) => item.name === name);

    if (isDefine) {
      return {
        error: "Subject already exists",
      };
    }

    const item = await Subject.create({
      name,
    });

    return {
      item,
      result: "Subject created",
    };
  });

  // TODO: Should be DELETE request
  fastify.delete("/", async function (request, reply) {
    const { id } = request.query;

    await Subject.sync();

    const item = await Subject.findOne({
      where: {
        id,
      },
    });

    if (!item) {
      return {
        error: "Subject not found",
      };
    }

    item.destroy();

    return {
      result: "Subject deleted",
    };
  });
};
