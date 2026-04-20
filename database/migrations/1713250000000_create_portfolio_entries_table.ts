import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'portfolio_entries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id')

      table.string('type', 32).notNullable()
      table.string('title', 180).notNullable().unique()
      table.text('summary').notNullable()
      table.text('context').nullable()
      table.jsonb('stack').notNullable().defaultTo('[]')
      table.jsonb('impact_metrics').notNullable().defaultTo('{}')
      table.date('start_date').nullable()
      table.date('end_date').nullable()
      table.boolean('highlighted').notNullable().defaultTo(false)
      table.integer('sort_order').notNullable().defaultTo(0)

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['highlighted', 'sort_order', 'start_date'], 'portfolio_entries_sort_idx')
    })

    this.schema.raw(`
      alter table ${this.tableName}
      add constraint portfolio_entries_type_check
      check (type in ('project', 'event', 'experience', 'skill'))
    `)
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
