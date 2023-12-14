/**
 * Acceptable formats:
 * - #20jt35r
 * - #CORE-123
 */
const getTasks = (source) => {
    const ticketRefRegex = /#(([A-Z]{2,10}-\d+)|(\w{7,10}))/g;
    const ticketIdRegex = /#(?<taskId>([A-Z]{2,10}-\d+)|(\w{7,10}))/;
    const customTicketIdRegex = /#[A-Z]{2,10}-\d+/;
    const ids =
      source.match(ticketRefRegex)?.map(v => ({
        ...v.match(ticketIdRegex).groups,
        isCustom: customTicketIdRegex.test(v),
      })) || [];

    return Object.values(
      ids.reduce(
        (tasks, task) => ({
          ...tasks,
          [task.taskId]: task,
        }),
        {}
      )
    );
  };

module.exports = getTasks;
