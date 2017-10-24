function shouldIgnore(row) {
  const ignores = ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
  return ignores.some(p => row.itemName.includes(p));
}

module.exports = shouldIgnore;
