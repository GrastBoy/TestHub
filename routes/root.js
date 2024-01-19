"use strict";

const models = require("../db/models");

const Subject = models.Subjects;
const Topic = models.Topics;
const Question = models.Questions;
const Answer = models.Answers;

const Result = models.Results;
const ResultAnswer = models.ResultsAnswers;

module.exports = async function (fastify, opts) {
  fastify.get("/result/:resultId", async function (request, reply) {
    const { resultId } = request.params;
  
    await Result.sync();
    await ResultAnswer.sync();

    const resultItem = await Result.findOne({
      where: {
        id: resultId
      },
    });

    const resultAnswers = await ResultAnswer.findAll({
      where: {
        resultId
      }
    });

    const correctAnswers = resultAnswers.filter(item => item.points > 0);
    const wrongAnswers = resultAnswers.filter(item => item.points === 0);

    const totalPoints = resultAnswers.reduce((acc, item) => acc + item.points, 0);

    return reply.view(
      "templates/site/result.ejs",
      { result: resultItem, correctAnswers, wrongAnswers, totalPoints, resultAnswers },
      { layout: "templates/layouts/site.ejs" }
    );
  });

  fastify.get("/", async function (request, reply) {
    const title = "Предмети";
    const subtitle = "Виберіть щоб перейти до тем";

    await Subject.sync();

    const items = await Subject.findAll().then((result) => {
      return result.map((item) => ({
        ...item.toJSON(),
        url: `/${item.id}`,
      }));
    });

    return reply.view(
      "templates/site/index.ejs",
      { items, title, subtitle },
      { layout: "templates/layouts/site.ejs" }
    );
  });

  fastify.get("/:subjectId", async function (request, reply) {
    const title = "Теми";
    const subtitle = "Виберіть тему щоб перейти до тестування";

    const { subjectId } = request.params;

    await Topic.sync();
    await Subject.sync();

    const selectedSubject = await Subject.findOne({
      where: {
        id: subjectId,
      },
    });

    const items = await Topic.findAll({
      where: {
        subjectId,
      },
    }).then((result) => {
      return result.map((item) => ({
        ...item.toJSON(),
        url: `/${subjectId}/${item.id}`,
      }));
    });

    return reply.view(
      "templates/site/index.ejs",
      { items, title: `${selectedSubject.name}: ${title}`, subtitle },
      { layout: "templates/layouts/site.ejs" }
    );
  });

  fastify.get("/:subjectId/:topicId", async function (request, reply) {
    const { subjectId, topicId } = request.params;

    await Topic.sync();
    await Subject.sync();
    await Question.sync();
    await Answer.sync();

    const [selectedSubject, selectedTopic] = await Promise.all([
      Subject.findOne({
        where: {
          id: subjectId,
        },
      }),
      Topic.findOne({
        where: {
          id: topicId,
        },
      }),
    ]);

    const items = await Question.findAll({
      order: models.sequelize.random(),
      limit: 20,
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
      "templates/site/testing.ejs",
      {
        items: questionsWidthAnswers,
        subject: selectedSubject,
        topic: selectedTopic,
      },
      { layout: "templates/layouts/site.ejs" }
    );
  });
};
