import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'blog_posts'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('behance_url').nullable()
      table.dropColumn('binance_symbol')
      table.dropColumn('binance_embed_url')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('behance_url')
      table.string('binance_symbol', 32).nullable()
      table.text('binance_embed_url').nullable()
    })
  }
}