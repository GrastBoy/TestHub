"use strict";

const models = require("../db/models");

const Subject = models.Subjects;
const Topic = models.Topics;
const Question = models.Questions;
const Answer = models.Answers;

const Op = models.Sequelize.Op;

const Result = models.Results;
const ResultAnswer = models.ResultsAnswers;

module.exports = async function (fastify, opts) {
  async function getSubjectsWithTopics(subjectId) {
    await Topic.sync();
    await Subject.sync();

    const subjects = await Subject.findAll().then((result) => {
      return result.map((item) => ({
        ...item.toJSON(),
        url: `/tests/${item.id}`,
      }));
    });

    const where = {
      subjectId,
    };

    if (!where.subjectId) {
      where.subjectId = {
        [Op.ne]: null,
      };
    }

    const topics = await Topic.findAll({ where }).then(async (result) => {
      return await Promise.all(
        result.map(async (item) => {
          const questions = await Question.findAll({
            where: {
              topicId: item.id,
            },
          });

          return {
            ...item.toJSON(),
            url: `/tests/${item.subjectId}/${item.id}`,
            questionsCount: questions.length,
          };
        })
      );
    });

    return {
      subjects,
      topics,
    };
  }

  fastify.get("/result/:resultId", async function (request, reply) {
    const { resultId } = request.params;

    await Result.sync();
    await ResultAnswer.sync();

    const resultItem = await Result.findOne({
      where: {
        id: resultId,
      },
    });

    const resultAnswers = await ResultAnswer.findAll({
      where: {
        resultId,
      },
    }).then(async (items) => {
      return await Promise.all(
        items.map(async (item) => {
          const question = await Question.findOne({
            where: {
              id: item.questionId,
            },
          });

          const answers = await Answer.findAll({
            where: {
              questionId: question.id,
            },
          });

          const adaptedAnswers = answers.map((answer) => {
            let color = "none";

            if (question.answerType === "single") {
              if (answer.isAnswer) {
                color = "green";
              }

              if (answer.id == item.answer) {
                color = answer.isAnswer ? "green" : "red";
              }
            }

            if (question.answerType === "text") {
              color = answer.value === item.answer ? "green" : "red";
            }

            return {
              ...answer.toJSON(),
              __color: color,
            };
          });

          return {
            ...item.toJSON(),
            question: {
              ...question.toJSON(),
              answers: adaptedAnswers,
            },
          };
        })
      );
    });

    const correctAnswers = resultAnswers.filter((item) => item.points > 0);
    const wrongAnswers = resultAnswers.filter((item) => item.points === 0);

    const totalPoints = resultAnswers.reduce(
      (acc, item) => acc + item.points,
      0
    );

    return reply.view(
      "templates/site/result.ejs",
      {
        result: resultItem,
        correctAnswers,
        wrongAnswers,
        totalPoints,
        resultAnswers,
        resultAnswersString: resultAnswers
          .map((item) => JSON.stringify(item))
          .join(" \n "),
      },
      { layout: "templates/layouts/site.ejs" }
    );
  });

  fastify.get("/", async function (request, reply) {
    return reply.view(
      "templates/site/index.ejs",
      {},
      { layout: "templates/layouts/site.ejs" }
    );
  });

  fastify.get("/tests", async function (request, reply) {
    const title = "Предмети";
    const subtitle = "Виберіть щоб перейти до тем";

    const { subjects, topics } = await getSubjectsWithTopics();

    return reply.view(
      "templates/site/tests.ejs",
      { subjects, items: topics, title, subtitle },
      { layout: "templates/layouts/site.ejs" }
    );
  });

  fastify.get("/tests/:subjectId", async function (request, reply) {
    const title = "Теми";
    const subtitle = "Виберіть тему щоб перейти до тестування";

    const { subjectId } = request.params;

    const { subjects, topics } = await getSubjectsWithTopics(subjectId);

    const selectedSubject = await Subject.findOne({
      where: {
        id: subjectId,
      },
    });

    return reply.view(
      "templates/site/tests.ejs",
      {
        subjects,
        items: topics,
        title: `${selectedSubject.name}: ${title}`,
        subtitle,
      },
      { layout: "templates/layouts/site.ejs" }
    );
  });

  fastify.get("/tests/:subjectId/:topicId", async function (request, reply) {
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
