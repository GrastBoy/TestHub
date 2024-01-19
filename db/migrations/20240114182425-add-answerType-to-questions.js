"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the new column
    await queryInterface.addColumn("Questions", "answerType", {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "Type of the answer: 'single', 'matrix', 'text'",
    });

    // Set default value for existing rows
    await queryInterface.sequelize.query(`
      UPDATE "Questions"
      SET "answerType" = 'single'
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Questions", "answerType");
  },
};
