const axios = require('axios');

const getTasks = require('./lib/get-tasks.js');

const JIRA_BASE_URL = 'https://rampnetwork.atlassian.net';
const JIRA_API_URL = `${JIRA_BASE_URL}/rest/api/2`;

const jiraRequest = async ({ resource, method = 'GET', data = {} }) =>
  axios({
    method,
    url: resource,
    baseURL: JIRA_API_URL,
    auth: {
      username: process.env.JIRA_TOKEN_USER,
      password: process.env.JIRA_TOKEN,
    },
    data,
  }).catch(error => {
    console.error(`Error getting ${resource} - ${error}`)
  });

const getJiraIssueName = async (issueId) => {
  const resource = `/issue/${issueId}?fields=summary`

  const response = await jiraRequest({
    resource,
    method: 'GET',
  });
  return response?.data?.fields?.summary ?? undefined
}

const parallelRequests = (tasks = [], req) => {
  if (tasks.length === 0) {
    return [];
  }

  return Promise.all(tasks.map(req));
};

const checkTasks = async () => {
  const source = danger.github.pr.title;
  const tasks = getTasks(source);
  const allTasks = await parallelRequests(tasks, async ({ taskId }) => {
    return {
      taskId: taskId,
      name: await getJiraIssueName(taskId),
    }
  });

  const tasksWithName = allTasks.filter(({ name }) => name);
  if (tasksWithName.length === 0) {
    fail(
      '<b>Please add the Jira issue key at the end of PR title e.g.: #DATA-98</b> (remember to add hash)\n\n' +
      '<i>You can find issue key eg. in the last part of URL when issue is viewed in the browser eg.:\n' +
      `URL: ${JIRA_BASE_URL}/browse/DATA-98 -> issue key: DATA-98 -> what should be added to the PR title: #DATA-98\n\n` +
      'You can add more than one issue key in the PR title.</i>'
    );
    return;
  }

  message(
    'Jira issue(s) related to this PR:\n' +
    tasksWithName.map(
      ({ taskId, name }) =>
        `+ :link: <a href="${JIRA_BASE_URL}/browse/${taskId}">${name} [#${taskId}]</a>`
    ).join('\n')
  );
};

checkTasks();
