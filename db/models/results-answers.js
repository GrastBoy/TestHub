"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ResultsAnswers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ResultsAnswers.belongsTo(models.Questions, { foreignKey: "questionId" });
      ResultsAnswers.belongsTo(models.Results, { foreignKey: "resultId" });
      // define association here
    }
  }
  ResultsAnswers.init(
    {
      answer: DataTypes.TEXT,
      points: DataTypes.NUMBER,
    },
    {
      sequelize,
      modelName: "ResultsAnswers",
    }
  );

  return ResultsAnswers;
};
