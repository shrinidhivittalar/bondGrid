const { composePlugins, withNx } = require('@nx/next');
const path = require('path');

const nextConfig = {
  nx: {},
  outputFileTracingRoot: path.join(__dirname, '../..'),
  turbopack: {
    root: path.join(__dirname, '../..'),
  },
};

module.exports = composePlugins(withNx)(nextConfig);
