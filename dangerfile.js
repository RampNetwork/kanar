const axios = require('axios');

const getTasks = require('./lib/get-tasks.js');

const CLICKUP_API_URL = 'https://api.clickup.com/api/v2';
const CLICKUP_TEAM_ID = '24301226';

const clickupRequest = async ({ resource, method = 'POST', data = {} }) =>
  axios({
    method,
    url: resource,
    baseURL: CLICKUP_API_URL,
    headers: {
      Authorization: process.env.CLICKUP_TOKEN,
      'Content-Type': 'application/json',
    },
    data,
  }).catch(
    function (error) {
      console.log(`Error getting ${resource}`)
    }
  );

const getClickupTicketName = async (taskId, isCustom) => {
  const resource = getTaskResource({ taskId, isCustom }, "")

  const response = await clickupRequest({
    resource,
    method: 'GET',
  });
  return response?.data?.name ?? undefined
}

const getTaskResource = ({ taskId, isCustom }, field = '') => {
  const customQuery = isCustom ? `?custom_task_ids=true&team_id=${CLICKUP_TEAM_ID}` : '';
  return `/task/${taskId}${field}${customQuery}`
}

const addClickupRefComment = async (taskId, isCustom) => {
  const resource = getTaskResource({ taskId, isCustom }, '/comment')
  const text = `This issue is referenced in ${danger.github.pr.html_url}`;

  const {
    data: { comments },
  } = await clickupRequest({
    resource,
    method: 'GET',
  });

  const hasRefComment = comments.find(({ comment_text }) =>
    comment_text.includes(text)
  );

  if (hasRefComment) {
    return;
  }

  await clickupRequest({
    resource,
    data: {
      comment: [
        {
          text,
        },
      ],
    },
  });
};

const parallelRequests = (tasks = [], req) => {
  if (tasks.length === 0) {
    return[];
  }

  return Promise.all(tasks.map(req));
};

const checkAndUpdateClickupIssues = async () => {
  const source = [danger.github.pr.title, danger.github.pr.body].join(' ');
  const tasks = getTasks(source);
  if (tasks.length === 0) {
    fail(
      '<b>Please add the issue key to the PR e.g.: #28zfr1a or #DATAENG-98</b>\n' +
      '(remember to add hash)\n\n' +
      '<i>You can find ticket key eg. in the last part of URL when ticket is viewed in the browser eg.:\n' +
      'URL: https://app.clickup.com/t/28zfr1a -> ticket issue key: 28zfr1a -> what should be added to PR: #28zfr1a\n' +
      'URL: https://app.clickup.com/t/24301226/DATAENG-98 -> ticket issue key: DATAENG-98 -> what should be added to PR: #DATAENG-98\n\n' +
      'You can add more than one ticket issue key in the PR title or/and description.</i>'
    );
    return;
  }

  message(
    'Ticket(s) related to this PR:\n\n' +
    tasks
      .map(
        ({ taskId }) =>
          `- :link: #${taskId}`
      )
      .join('\n')
  );
};

checkAndUpdateClickupIssues();
