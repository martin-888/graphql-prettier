/* global it */
const prettier = require('../src').default;
const assert = require('assert');

const duplicatedLeafFieldsTests = [
  [
`query ViewerQuery {
  viewer {
    id
    id
  }
}`,
`query ViewerQuery {
  viewer {
    id
  }
}`,
  ],
  [
`query ViewerQuery {
  viewer {
    id
    id
    node {
      field1
      field1
    }
  }
}`,
`query ViewerQuery {
  viewer {
    id
    node {
      field1
    }
  }
}`,
  ],
  [
`query ViewerQuery {
  viewer {
    id
    ... on Node {
      id
      id
    }
  }
}`,
`query ViewerQuery {
  viewer {
    id
    ... on Node {
      id
    }
  }
}`,
  ],
  [
`query ViewerQuery {
  viewer {
    id
    field1
    id
  }
}`,
`query ViewerQuery {
  viewer {
    id
    field1
  }
}`,
  ],
  [
`query ViewerQuery {
  viewer {
    id
    user1: user(id: 1) {
      id
      id
    }
    user1: user(id: 1) {
      id
      id
    }
  }
}`,
`query ViewerQuery {
  viewer {
    id
    user1: user(id: 1) {
      id
    }
  }
}`,
  ],
];

it('should remove all duplicated leaf fields', () => {
  duplicatedLeafFieldsTests.map(testCase => assert.equal(prettier(testCase[0]), testCase[1]));
});

const mutationTests = [
  [
`mutation Update($input: Input!) {
  viewer {
    id
    id
  }
}`,
`mutation Update($input: Input!) {
  viewer {
    id
  }
}`,
  ],
];

it('should work for mutations', () => {
  mutationTests.map(testCase => assert.equal(prettier(testCase[0]), testCase[1]));
});

const subscriptionTests = [
  [
`subscription Subscribe($viewer: ID!) {
  viewer {
    id
    id
  }
}`,
`subscription Subscribe($viewer: ID!) {
  viewer {
    id
  }
}`,
  ],
];

it('should work for subscriptions', () => {
  subscriptionTests.map(testCase => assert.equal(prettier(testCase[0]), testCase[1]));
});

const multipleOperationsTests = [
  [
`query ViewerQuery {
  viewer {
    id
    id
  }
}
mutation Update($input: Input!) {
  viewer {
    id
    id
  }
}
subscription Subscribe($viewer: ID!) {
  viewer {
    id
    id
  }
}`,
`query ViewerQuery {
  viewer {
    id
  }
}
mutation Update($input: Input!) {
  viewer {
    id
  }
}
subscription Subscribe($viewer: ID!) {
  viewer {
    id
  }
}`,
  ],
];

it('should work for multiple operations in one file', () => {
  multipleOperationsTests.map(testCase => assert.equal(prettier(testCase[0]), testCase[1]));
});

const fragmentsTests = [
  [
`query ViewerQuery {
  viewer {
    id
    id
    ... Fragment1
  }
}
fragment Fragment1 on Viewer {
  id
  id
  field1
  field1
}`,
`query ViewerQuery {
  viewer {
    id
    field1
  }
}`,
  ],
  [
`query ViewerQuery {
  viewer {
    id
    id
    ... Fragment1
    ... Fragment2
  }
}
fragment Fragment1 on Viewer {
  id
  id
  field1
  field1
}
fragment Fragment2 on Viewer {
  id
  id
  field1
  field2
}`,
`query ViewerQuery {
  viewer {
    id
    field1
    field2
  }
}`,
  ],
  [
`query ViewerQuery {
  viewer {
    id
    id
    ... on Viewer {
      id
    }
    ... Fragment1
    node {
      ... Fragment3
    }
    node {
      ... Fragment3
    }
    ... Fragment1
    ... Fragment2
  }
}
fragment Fragment1 on Viewer {
  id
  id
  field1
  field1
}
fragment Fragment2 on Viewer {
  id
  id
  field1
  field2
}
fragment Fragment3 on Node {
  id
  id
  field1
  field1
}`,
`query ViewerQuery {
  viewer {
    id
    ... on Viewer {
      id
    }
    node {
      id
      field1
    }
    field1
    field2
  }
}`,
  ],
];

it('should replace fragments', () => {
  fragmentsTests.map(testCase => assert.equal(prettier(testCase[0]), testCase[1]));
});

const leaveDuplicatedLeafFieldsTests = [
  [
`query ViewerQuery {
  viewer {
    id
    id
  }
}`,
`query ViewerQuery {
  viewer {
    id
    id
  }
}`,
  ],
  [
`query ViewerQuery {
  viewer {
    id
    id
    node {
      field1
      field1
    }
  }
}`,
`query ViewerQuery {
  viewer {
    id
    id
    node {
      field1
      field1
    }
  }
}`,
  ],
  [
`query ViewerQuery {
  viewer {
    id
    ... on Node {
      id
      id
    }
  }
}`,
`query ViewerQuery {
  viewer {
    id
    ... on Node {
      id
      id
    }
  }
}`,
  ],
  [
`query ViewerQuery {
  viewer {
    id
    field1
    ... on Node {
      id
      id
    }
  }
}`,
`query ViewerQuery {
  viewer {
    id
    field1
    ... on Node {
      id
      id
    }
  }
}`,
  ],
  [
`query ViewerQuery {
  viewer {
    id
    id
    node {
      ... Fragment3
    }
    ... Fragment1
    ... Fragment2
  }
}
fragment Fragment1 on Viewer {
  id
  id
  field1
  field1
}
fragment Fragment2 on Viewer {
  id
  id
  field1
  field2
}
fragment Fragment3 on Node {
  id
  id
  field1
  field1
}`,
`query ViewerQuery {
  viewer {
    id
    id
    node {
      id
      id
      field1
      field1
    }
    id
    id
    field1
    field2
    id
    id
    field1
    field1
  }
}`,
  ],
];

it('should not remove duplicated leaf fields when noDuplicates parameter is false', () => {
  leaveDuplicatedLeafFieldsTests.map(testCase => assert.equal(prettier(testCase[0], false), testCase[1]));
});

const notExistingFragmentTest =
`query ViewerQuery {
  viewer {
    id
    id
    ... Fragment1
  }
}`;

it('should throws error when is used unknown fragment', () => {
  assert.throws(() => prettier(notExistingFragmentTest), Error, "Found usage of unknown fragment Fragment1");
});

const brokenQueryTest = [
`query ViewerQuery {
  viewer {
    id
    id
    ... Fragment1`
,
`queryViewerQuery {
  viewer {
    id
    id
  }
}`,
];

it('should throws error when query is not valid', () => {
  brokenQueryTest.map(testCase => assert.throws(() => prettier(testCase), Error));
});
