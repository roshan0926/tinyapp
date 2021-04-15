const assert = require('chai').assert;

const { findUserbyEmail, urlsForUser } = require('../helpers');

const testUsers = {
  'aaa': {
    id: 'aaa',
    email: 'roshan@nasseri.com',
    password: 'secret-password'
  },
  'bbb': {
    id: 'bbb',
    email: 'sophie@wang.com',
    password: 'more-secret-password'
  }
};
//test for emails
describe('#findUserbyEmail', () => {
  it('should return a user with a valid email', () => {
    const user = findUserbyEmail('sophie@wang.com', testUsers);
    assert.equal(user, testUsers.bbb);
  });

  it('should return undefined when looking for a non-existent email', () => {
    const user = findUserbyEmail('not@aRealEmail.com', testUsers);
    assert.equal(user, undefined);
  });
});

//test for weather only specific links are dispaled depending on the user
const testUrls = {
  'abcd': { longURL: 'http://www.google.com', userID: 'roshan' },
  'xywz': { longURL: 'http://www.yahoo.com', userID: 'sophie' },
  'efjk': { longURL: 'http://www.bing.com', userID: 'roshan' }
};
describe('#urlsForUser', () => {
  it('should return the correct urls for a valid user', () => {
    const userUrls = urlsForUser('roshan', testUrls);
    console.log('...', userUrls)
    const expectedResult = {
      'abcd': { longURL: 'http://www.google.com'},
      'efjk': { longURL: 'http://www.bing.com'}
    };
    assert.deepEqual(userUrls, expectedResult);
  });

  it('should return an empty object if the user does not exist', () => {
    const userUrls = urlsForUser('crystal', testUrls);
    assert.deepEqual(userUrls, {});
  });
});


//generateRandomString is also a helper function but does not require