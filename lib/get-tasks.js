/**
 * Acceptable formats:
 * - #CORE-123 (at the end for regular PRs, at the beginning for dependabot[bot] PRs)
 */
const getTasks = (source, author = null) => {
  const isDependabot = author === 'dependabot[bot]';

  // Choose regex pattern based on author type
  const prefixWithRefsRegex = isDependabot
    ? /^((\s+|^)#[A-Z]{2,10}-\d+)+\s*/  // Beginning for dependabot
    : /((\s+|^)#[A-Z]{2,10}-\d+)+\s*$/; // End for regular PRs

  const [prefix] = source.match(prefixWithRefsRegex) || [""];
  // Picks individual issue references from the string
  const taskRefRegex = /(?<=(\s|^)#)[A-Z]{2,10}-\d+/g;
  const refs = prefix.match(taskRefRegex) || [];
  const uniqueRefs = new Set(refs);

  const tasks = [];
  for (const ref of uniqueRefs) {
    tasks.push({
      taskId: ref,
    });
  }
  return tasks;
};

module.exports = getTasks;
