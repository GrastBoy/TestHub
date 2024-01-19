"use strict";

const models = require("../../../db/models");

const Answer = models.Answers;
const Question = models.Questions;

const Result = models.Results;
const ResultAnswer = models.ResultsAnswers;

module.exports = async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    const { resultId } = request.query;

    // await Answer.sync();
    // await Question.sync();

    // const items = await Question.findAll({
    //   where: {
    //     topicId,
    //   },
    // });

    // const itemsWithAnswers = await Promise.all(
    //   items.map(async (item) => {
    //     const answers = await Answer.findAll({
    //       where: {
    //         questionId: item.id,
    //       },
    //     });

    //     return {
    //       ...item.toJSON(),
    //       answers,
    //     };
    //   })
    // );

    // return {
    //   items: itemsWithAnswers,
    // };
    return {
      resultId
    }
  });

  fastify.post("/", async function (request, reply) {
    const { name, data } = request.body;

    if (!name || !data) {
      return {
        error: "data and name are required",
      };
    }

    const questionIds = Object.keys(data);

    await Answer.sync();
    await Question.sync();

    await Result.sync();
    await ResultAnswer.sync();

    const items = await Question.findAll({
      where: {
        id: questionIds
      }
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

    const totalPoints = Object.entries(data).map(([questionId, value]) => {
      const item = itemsWithAnswers.find(question => question.id === Number(questionId));

      let points = 0;

      if (!item) {
        return {
          questionId,
          points
        };
      }
  
      if (item.answerType ===  'single') {
        const answer = item.answers.find(answer => answer.id === Number(value));
    
        if (answer && answer.isAnswer) {
          points = item.cost;
        }
      }

      if (item.answerType ===  'text') {
        const isAnswer = item.answers.find(answer => answer.value === value);
    
        if (isAnswer) {
          points = item.cost;
        }
      }

      if (item.answerType ===  'matrix') {
        const costForOneMatrixPoint = item.cost / item.answers.length;

        const answerToCompare = item.answers.reduce((acc, answer) => {
          const lineResult = JSON.parse(answer.toJSON().value)
            .map(item => {
              if (typeof item === 'object') {
                return item[1];
              }

              return null
            })
            .filter(item => item !== null);

          acc.push(lineResult);

          return acc;
        }, [])

        points = answerToCompare.reduce((acc, item, index) => {
          if (item.join('-') === value[index].join('-')) {
            return acc + costForOneMatrixPoint;
          }
  
          return acc;
        }, 0);
      }

      return {
        questionId,
        points,
        answer: typeof value === 'object' ? JSON.stringify(value) : value
      }
    });

    const resultObject = await Result.create({
      name
    });

    totalPoints.forEach(async ({ questionId, points, answer }) => {
      await ResultAnswer.create({
        questionId,
        points,
        answer,
        resultId: resultObject.id
      });
    });

    return {
      resultId: resultObject.id
    }
  });
};
