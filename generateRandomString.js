const generateRandomString = function() {
  //generate a random alpha numeric string, 6 characters long
  //toString with a base of 36 will include 1-9 AND a-z
  return (1 + Math.random().toString(36).substring(2, 7));
};

module.exports = { generateRandomString };