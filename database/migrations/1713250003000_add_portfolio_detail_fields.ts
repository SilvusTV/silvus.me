import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'portfolio_entries'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('slug', 220).nullable()
      table.text('cover_image_url').nullable()
      table.text('details_html').nullable()
      table.jsonb('external_links').notNullable().defaultTo('[]')
    })

    this.schema.raw(`
      update ${this.tableName}
      set slug = case
        when trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')) = ''
          then 'entry-' || id::text
        else trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'))
      end
      where slug is null
    `)

    this.schema.raw(`
      update ${this.tableName}
      set details_html = concat(
        '<p>', coalesce(summary, ''), '</p>',
        case
          when context is not null and context <> '' then concat('<p>', context, '</p>')
          else ''
        end
      )
      where details_html is null
    `)

    this.schema.raw(`
      alter table ${this.tableName}
      alter column slug set not null
    `)

    this.schema.raw(`
      alter table ${this.tableName}
      add constraint portfolio_entries_slug_unique unique (slug)
    `)
  }

  async down() {
    this.schema.raw(`
      alter table ${this.tableName}
      drop constraint if exists portfolio_entries_slug_unique
    `)

    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('slug')
      table.dropColumn('cover_image_url')
      table.dropColumn('details_html')
      table.dropColumn('external_links')
    })
  }
}
