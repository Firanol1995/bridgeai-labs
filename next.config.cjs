// next.config.cjs
const path = require('path');

module.exports = {
  reactStrictMode: true,
  // Example using __dirname safely
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
};