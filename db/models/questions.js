"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Questions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Questions.belongsTo(models.Topics, { foreignKey: "topicId" });
      // define association here
    }
  }
  Questions.init(
    {
      name: DataTypes.STRING,
      cost: DataTypes.NUMBER,
      content: DataTypes.TEXT,
      topicId: DataTypes.INTEGER,
      answerType: DataTypes.STRING, // 'single', 'matrix', 'text'
    },
    {
      sequelize,
      modelName: "Questions",
    }
  );
  return Questions;
};
