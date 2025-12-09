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

  // Fix MIME type errors for assets
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];
  
  // Add rule to handle null/undefined buffers gracefully
  config.module.rules.push({
    test: /\.(png|jpe?g|gif|svg|webp|ico)$/i,
    type: 'asset/resource',
    generator: {
      filename: 'static/media/[name].[hash][ext]',
    },
  });

  // Handle null buffers in asset processing
  config.resolve = config.resolve || {};
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    path: false,
  };

  return config;
};

