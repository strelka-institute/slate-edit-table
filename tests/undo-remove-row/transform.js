
module.exports = function (plugin, value) {
  const cursorBlock = value.document.getDescendant('_cursor_')
  const change = value.change()

  change.moveToRangeOfNode(cursorBlock)
  plugin.changes.removeRow(change)

  return change.undo()
}
