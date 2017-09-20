'use strict'

const Schema = use('Schema')

class TokenRepairSchema extends Schema {
  up () {
    this.table('tokens', (table) => {
      table.string('type', 40).notNullable()
    })
  }

  down () {
    this.table('tokens', (table) => {
      table.dropColumn('type')
    })
  }
}

module.exports = TokenRepairSchema
