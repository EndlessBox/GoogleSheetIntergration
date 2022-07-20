var consts = require('../bundle/backend/src/services/consts').default;

exports.up = async function (knex) {

  await knex.raw("SET FOREIGN_KEY_CHECKS=0");
  await knex.raw(
    `DROP TABLE IF EXISTS accounts, google_account, automations`
  );
  await knex.raw("SET FOREIGN_KEY_CHECKS=1");

  return knex.schema
    .createTable("accounts", function (table) {
      table.increments();
      table.integer("lightfunnels_account_id").unsigned().unique();
      table.string("lightfunnels_token").notNullable();
    })
    .createTable("google_account", function (table){
      table.increments();
      table.string("email").notNullable();
      table.string("name").notNullable();
      table.string("given_name").notNullable();
      table.string("family_name").notNullable();
      table.string("picture").notNullable();
      table.string("access_token").notNullable();
      table.string("refresh_token").notNullable();
      table.bigInteger("access_exp_date").notNullable();
	  table.boolean("revoked").notNullable().defaultTo(false);
      table.integer("account_id").unsigned().notNullable().unique();
      table
        .foreign("account_id")
        .references("accounts.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
    })
  .createTable("automations", function (table) {
    table.string("id", 40).primary().notNullable();
    table.integer("google_account_id").unsigned().notNullable();
    table
        .foreign("google_account_id")
        .references("google_account.id")
        .onUpdate("CASCADE")
        .onDelete("CASCADE")
    table.integer("account_id").unsigned().notNullable();
    table
      .foreign("account_id")
      .references("accounts.id")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
    table.timestamp('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP')).notNullable();
    table.enu('type', [consts.ORDERS, consts.CONTACTS]).notNullable();
    table.string('spreadsheet_id').notNullable();
    table.integer('sheet_id').notNullable();
    table.json('meta_fields').notNullable();
    table.integer("webhookId").unsigned().notNullable();
    table.boolean("active").defaultTo(true).notNullable();
    table.boolean("group").defaultTo(false).notNullable();
	table.string("tags").defaultTo("").notNullable();
  });
};

exports.down = async function (knex) {};
