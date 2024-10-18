/**
 * Acceptable formats:
 * - #CORE-123
 */
const getTasks = (source) => {
  // Matches the prefix of the string containg only issue references delimited with whitespaces
  const prefixWithRefsRegex = /((\s+|^)#[A-Z]{2,10}-\d+)+\s*$/;
  const [prefix] = source.match(prefixWithRefsRegex) || [''];
  // Picks individual issue references from the string
  const taskRefRegex = /(?<=(\s|^)#)[A-Z]{2,10}-\d+/g;
  const refs = prefix.match(taskRefRegex) || [];
  const uniqueRefs = new Set(refs);

  let tasks = [];
  for (const ref of uniqueRefs) {
    tasks.push({
      taskId: ref,
    });
  }
  return tasks;
};

module.exports = getTasks;
