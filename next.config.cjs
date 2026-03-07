// next.config.cjs
const path = require('path');

module.exports = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  // Example using __dirname safely
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
};