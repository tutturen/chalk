function isLastAttempt(row) {
  if (!row.attempt.includes('(Attempt')) {
    return true;
  }

  const nr = row.attempt.split('(Attempt ')[1].split(' of')[0];
  const total = row.attempt.split(' of ')[1].split(')')[0];
  return nr === total;
}

module.exports = isLastAttempt;
