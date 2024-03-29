"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Topics extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Topics.belongsTo(models.Subjects, { foreignKey: "subjectId" });
      // define association here
    }
  }
  Topics.init(
    {
      name: DataTypes.STRING,
      subjectId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Topics",
    }
  );
  return Topics;
};
