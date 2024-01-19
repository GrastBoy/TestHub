"use strict";

const models = require("../../../db/models");

const Answer = models.Answers;
const Question = models.Questions;

module.exports = async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    const { topicId } = request.query;

    await Answer.sync();
    await Question.sync();

    const items = await Question.findAll({
      where: {
        topicId,
      },
    });

    const itemsWithAnswers = await Promise.all(
      items.map(async (item) => {
        const answers = await Answer.findAll({
          where: {
            questionId: item.id,
          },
        });

        return {
          ...item.toJSON(),
          answers,
        };
      })
    );

    return {
      items: itemsWithAnswers,
    };
  });

  fastify.post("/", async function (request, reply) {
    const { content, name, topicId, answers, cost, answerType } = request.body;

    if (!name || !topicId) {
      return {
        error: "topicId and name are required",
      };
    }

    await Answer.sync();
    await Question.sync();

    const items = await Question.findAll();

    const isDefine = items.some(
      (item) => item.name === name && item.topicId === topicId
    );

    if (isDefine) {
      return {
        error: "Question already exists",
      };
    }

    const item = await Question.create({
      name,
      cost,
      content,
      topicId,
      answerType,
    });

    answers.forEach(async (answer) => {
      await Answer.create({
        name: answer.name,
        isAnswer: answer.isAnswer,
        value: answer.value,
        questionId: item.id,
      });
    });

    return {
      item,
      result: "Question created",
    };
  });

  // TODO: Should be DELETE request
  fastify.delete("/", async function (request, reply) {
    const { id } = request.query;

    await Question.sync();

    const item = await Question.findOne({
      where: {
        id,
      },
    });

    if (!item) {
      return {
        error: "Question not found",
      };
    }

    item.destroy();

    return {
      result: "Question deleted",
    };
  });
};
