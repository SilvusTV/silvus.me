import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'blog_posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id')

      table.string('title', 220).notNullable()
      table.string('slug', 220).notNullable().unique()
      table.text('excerpt').notNullable()
      table.text('content').notNullable()
      table.jsonb('tags').notNullable().defaultTo('[]')
      table.timestamp('published_at', { useTz: true }).nullable()
      table.string('binance_symbol', 32).nullable()
      table.text('binance_embed_url').nullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['published_at'], 'blog_posts_published_idx')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
