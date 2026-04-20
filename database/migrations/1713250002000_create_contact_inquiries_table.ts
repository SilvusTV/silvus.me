import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'contact_inquiries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id')

      table.string('name', 120).notNullable()
      table.string('email', 255).notNullable()
      table.string('subject', 255).nullable()
      table.text('message').notNullable()
      table.string('source_page', 120).nullable()
      table.string('related_post_slug', 220).nullable()
      table.timestamp('sent_at', { useTz: true }).nullable()
      table.string('status', 32).notNullable().defaultTo('pending')

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['created_at'], 'contact_inquiries_created_idx')
      table.index(['status'], 'contact_inquiries_status_idx')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
