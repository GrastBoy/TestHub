"use strict";

const models = require("../../db/models");

const Subject = models.Subjects;
const Topic = models.Topics;
const Question = models.Questions;
const Answer = models.Answers;

module.exports = async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    await Topic.sync();
    await Subject.sync();

    const items = await Subject.findAll();

    const itemsWithTopics = await Promise.all(
      items.map(async (item) => {
        const topics = await Topic.findAll({
          where: {
            subjectId: item.id,
          },
        });

        return {
          ...item.toJSON(),
          topics,
          topicsCount: topics.length,
        };
      })
    );

    return reply.view(
      "templates/dashboard/subjects.ejs",
      { items: itemsWithTopics },
      { layout: "templates/layouts/default.ejs" }
    );
  });

  fastify.get("/subjects/create", async function (request, reply) {
    return reply.view(
      "templates/dashboard/subjects-create.ejs",
      {},
      { layout: "templates/layouts/default.ejs" }
    );
  });

  fastify.get("/:subjectId/topics", async function (request, reply) {
    const { subjectId } = request.params;

    await Topic.sync();
    await Question.sync();

    const items = await Topic.findAll({
      where: {
        subjectId,
      },
    });

    const itemsWithQuestions = await Promise.all(
      items.map(async (item) => {
        const questions = await Question.findAll({
          where: {
            topicId: item.id,
          },
        });

        return {
          ...item.toJSON(),
          questions,
          questionsCount: questions.length,
        };
      })
    );

    return reply.view(
      "templates/dashboard/topics.ejs",
      { items: itemsWithQuestions, subjectId },
      { layout: "templates/layouts/default.ejs" }
    );
  });

  fastify.get("/:subjectId/topics/create", async function (request, reply) {
    const { subjectId } = request.params;

    return reply.view(
      "templates/dashboard/topics-create.ejs",
      { subjectId },
      { layout: "templates/layouts/default.ejs" }
    );
  });

  fastify.get(
    "/:subjectId/topics/:topicId/questions",
    async function (request, reply) {
      const { subjectId, topicId } = request.params;

      await Answer.sync();
      await Question.sync();

      const items = await Question.findAll({
        where: {
          topicId,
        },
      });

      const questionsWidthAnswers = await Promise.all(
        items.map(async (item) => {
          const answers = await Answer.findAll({
            where: {
              questionId: item.id,
            },
          });

          return {
            ...item.toJSON(),
            answers,
            answersCount: answers.length,
          };
        })
      );

      return reply.view(
        "templates/dashboard/questions.ejs",
        { items: questionsWidthAnswers, subjectId, topicId },
        { layout: "templates/layouts/default.ejs" }
      );
    }
  );

  fastify.get(
    "/:subjectId/topics/:topicId/questions/create",
    async function (request, reply) {
      const { subjectId, topicId } = request.params;

      return reply.view(
        "templates/dashboard/questions-create.ejs",
        { subjectId, topicId },
        { layout: "templates/layouts/default.ejs" }
      );
    }
  );
};
