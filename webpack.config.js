const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      // Reduce file watching
      mode: env.mode || 'development',
    },
    argv
  );

  // Fix routing - ensure index.html is served for all routes
  config.devServer = {
    ...config.devServer,
    historyApiFallback: true,
    hot: true,
  };

  // Use polling instead of file watching to avoid EMFILE errors
  config.watchOptions = {
    ignored: /node_modules/,
    aggregateTimeout: 300,
    poll: 1000, // Poll every 1 second instead of watching files
  };

  return config;
};

