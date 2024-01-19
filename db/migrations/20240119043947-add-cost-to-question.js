"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the new column
    await queryInterface.addColumn("Questions", "cost", {
      type: Sequelize.NUMBER,
      allowNull: true,
    });

    // Set default value for existing rows
    await queryInterface.sequelize.query(`
      UPDATE "Questions"
      SET "cost" = 1
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Questions", "cost");
  },
};
