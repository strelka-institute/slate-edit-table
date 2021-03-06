const { Range } = require('immutable')
const createCell = require('../utils/createCell')
const { validateRules } = require('../utils/compat')

/**
 * Create a schema for tables
 * @param {String} opts.typeTable The type of table blocks
 * @param {String} opts.typeRow The type of row blocks
 * @param {String} opts.typeCell The type of cell blocks
 * @return {Object} A schema definition with rules to normalize tables
 */
function normalizeNode (opts) {
  return validateRules([
    rowsContainRequiredColumns(opts)
  ])
}

/**
 * @param {String} opts.typeTable The type of table blocks
 * @param {String} opts.typeRow The type of row blocks
 * @param {String} opts.typeCell The type of cell blocks
 * @return {Object} A rule that ensures rows contains only cells, and
 * as much cells as there is columns in the table.
 */
function rowsContainRequiredColumns (opts) {
  const isRow = (node) => node.type === opts.typeRow
  const isCell = (node) => node.type === opts.typeCell
  const countCells = (row) => row.nodes.count(isCell)

  return {
    match (node) {
      return node.type === opts.typeTable
    },

    validate (table) {
      const rows = table.nodes.filter(isRow)

      // The number of column this table has
      const columns = rows.reduce((count, row) => {
        return Math.max(count, countCells(row))
      }, 1) // Min 1 column

      // else normalize, by padding with empty cells
      const invalidRows = rows
        .map(row => {
          const cells = countCells(row)
          const invalids = row.nodes.filterNot(isCell)

          // Row is valid: right count of cells and no extra node
          if (invalids.isEmpty() && cells === columns) {
            return null
          }

          // Otherwise, remove the invalids and append the missing cells
          return {
            row,
            invalids,
            add: (columns - cells)
          }
        })
        .filter(Boolean)

      return invalidRows.size > 0 ? invalidRows : null
    },

    /**
     * Updates by key every given nodes
     * @param {List<Nodes>} value.toUpdate
     */
    normalize (change, node, rows) {
      rows.forEach(({ row, invalids, add }) => {
        invalids.forEach((child) => {
          return change.removeNodeByKey(child.key, { normalize: false })
        })

        Range(0, add).forEach(() => {
          const cell = createCell(opts)
          return change.insertNodeByKey(row.key, 0, cell, { normalize: false })
        })
      })
    }
  }
}

module.exports = normalizeNode
