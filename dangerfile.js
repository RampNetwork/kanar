const axios = require("axios");
const axiosRetry = require("axios-retry");

const getTasks = require("./lib/get-tasks.js");

axiosRetry.default(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    if (axiosRetry.isNetworkOrIdempotentRequestError(error)) {
      return true;
    }
    // Sometimes Jira API returns 403 when it's unavailable
    if (error.response?.status === 403) {
      return true;
    }
    return false;
  },
});

const JIRA_BASE_URL = "https://rampnetwork.atlassian.net";
const JIRA_API_URL = `${JIRA_BASE_URL}/rest/api/2`;

const getJiraIssueName = async (issueId) => {
  const resource = `/issue/${issueId}?fields=summary`;

  const response = await axios
    .get(resource, {
      baseURL: JIRA_API_URL,
      auth: {
        username: process.env.JIRA_TOKEN_USER,
        password: process.env.JIRA_TOKEN,
      },
    })
    .catch((error) => {
      console.error(`::error::Request to ${resource} has failed - ${error}`);
      console.log("::group::Response");
      console.log(error.response.data);
      console.log("::endgroup::");
    });
  return response?.data?.fields?.summary ?? undefined;
};

const parallelRequests = (tasks, req) => {
  if (tasks.length === 0) {
    return [];
  }

  return Promise.all(tasks.map(req));
};

const checkTasks = async () => {
  const source = danger.github.pr.title;
  const author = danger.github.pr.user.login;
  const tasks = getTasks(source, author);
  const allTasks = await parallelRequests(tasks, async ({ taskId }) => {
    return {
      taskId: taskId,
      name: await getJiraIssueName(taskId),
    };
  });

  const tasksWithName = allTasks.filter(({ name }) => name);
  if (tasksWithName.length === 0) {
    const isDependabot = author === 'dependabot[bot]';
    const positionText = isDependabot ? 'at the beginning' : 'at the end';
    const exampleText = isDependabot ? '#DATA-98 Update package' : 'PR title #DATA-98';

    fail(`
      <p>
        <b>Please add the Jira issue key ${positionText} of PR title e.g.: ${exampleText}</b> (remember to add hash)
      </p>
      <p>
        <i>
          You can find issue key eg. in the last part of URL when issue is viewed in the browser eg.:
          URL: ${JIRA_BASE_URL}/browse/DATA-98 -> issue key: DATA-98 -> what should be added to the PR title: #DATA-98
        </i>
      </p>
      <p>
        <i>
          You can add more than one issue key in the PR title.
        </i>
      </p>`);
    console.error("::error::No Jira issue key found in PR title");
    return;
  }

  message(
    `Jira issue(s) related to this PR:
${tasksWithName
  .map(
    ({ taskId, name }) =>
      `+ :link: <a href="${JIRA_BASE_URL}/browse/${taskId}">${name} [#${taskId}]</a>`
  )
  .join("\n")}`
  );
  console.info(
    "::notice::Jira issue(s) related to this PR:",
    tasksWithName.map(({ taskId }) => taskId).join(", ")
  );
};

checkTasks();
