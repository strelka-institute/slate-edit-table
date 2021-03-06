const TablePosition = require('../utils/TablePosition')
const createCell = require('../utils/createCell')
const moveSelection = require('./moveSelection')

/**
 * Insert a new column in current table
 *
 * @param {Object} opts
 * @param {Slate.Transform} change
 * @param {Number} at
 * @return {Slate.Transform}
 */
function insertColumn (opts, change, at) {
  const { value } = change
  const { startBlock } = value

  const pos = TablePosition.create(change, startBlock, opts)
  const { table } = pos

  if (typeof at === 'undefined') {
    at = pos.getColumnIndex() + 1
  }

  // Insert the new cell
  table.nodes.forEach((row) => {
    const newCell = createCell(opts)
    change.insertNodeByKey(row.key, at, newCell, { normalize: false })
  })

  // Update the selection (not doing can break the undo)
  return moveSelection(opts, change, pos.getColumnIndex() + 1, pos.getRowIndex())
}

module.exports = insertColumn
