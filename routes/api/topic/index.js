"use strict";

const models = require("../../../db/models");
const Topic = models.Topics;

module.exports = async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    const { subjectId } = request.query;

    await Topic.sync();

    const items = await Topic.findAll({
      where: {
        subjectId,
      },
    });

    return {
      items,
    };
  });

  fastify.post("/", async function (request, reply) {
    const { name, subjectId } = request.body;

    if (!name || !subjectId) {
      return {
        error: "SubjectId and name are required",
      };
    }

    await Topic.sync();
    const items = await Topic.findAll();

    const isDefine = items.some(
      (item) => item.name === name && item.subjectId === subjectId
    );

    if (isDefine) {
      return {
        error: "Topic already exists",
      };
    }

    const item = await Topic.create({
      name,
      subjectId,
    });

    return {
      item,
      result: "Topic created",
    };
  });

  // TODO: Should be DELETE request
  fastify.delete("/", async function (request, reply) {
    const { id } = request.query;

    await Topic.sync();

    const item = await Topic.findOne({
      where: {
        id,
      },
    });

    if (!item) {
      return {
        error: "Topic not found",
      };
    }

    item.destroy();

    return {
      result: "Topic deleted",
    };
  });
};
