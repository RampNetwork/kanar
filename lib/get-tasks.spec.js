const getTasks = require('./get-tasks.js');

const correctSources = [
  [
    "This PR closes #BUNNNY-1",
    [
      { taskId: "BUNNNY-1", isCustom: true }
    ]
  ],
  [
    "This PR closes #86bwmzcyf",
    [
      { taskId: "86bwmzcyf", isCustom: false }
    ]
  ],
  [
    "This PR closes #86bwmzcyf but it's in the middle of the text",
    [
      { taskId: "86bwmzcyf", isCustom: false }
    ]
  ],
  [
    "This PR closes #CORE-123 and is related to #20jt35r",
    [
      { taskId: "CORE-123", isCustom: true },
      { taskId: "20jt35r", isCustom: false }
    ]
  ],
  [
    "This PR closes #SRE-12345 and is related to #86bwmzcyf",
    [
      { taskId: "SRE-12345", isCustom: true },
      { taskId: "86bwmzcyf", isCustom: false }
    ]
  ]
];

const incorrectSources = [
  "This PR has too short regular ticket reference #20jt",
  "This PR has too short custom ticket reference #C-123",
  "There is no # in this ticket reference CORE-123",
];

const emptySource = "A PR without ticket references";

describe('getTasks', () => {
  it.each(correctSources)('extracts ticket references', (source, expectedTaskObjects) => {
    expect(getTasks(source)).toEqual(expectedTaskObjects);
  });

  it.each(incorrectSources)('should return empty list when ticket references that do not match the format', (source) => {
    expect(getTasks(source)).toEqual([]);
  });

  it('should return empty list for PRs with no ticket references', () => {
    expect(getTasks(emptySource)).toEqual([]);
  });
});
