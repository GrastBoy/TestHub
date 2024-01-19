"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Answers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Answers.belongsTo(models.Questions, { foreignKey: "questionId" });
      // define association here
    }
  }
  Answers.init(
    {
      name: DataTypes.STRING,
      isAnswer: DataTypes.BOOLEAN,
      value: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Answers",
    }
  );
  return Answers;
};
