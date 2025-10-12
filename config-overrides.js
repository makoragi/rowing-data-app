const webpack = require('webpack');

module.exports = function override(config, env) {
    if (config.resolve && config.resolve.fallback !== undefined) {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            buffer: require.resolve('buffer/'),
            process: require.resolve('process/browser'),
        };
    }

    config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
        }),
    ];

    return config;
};
