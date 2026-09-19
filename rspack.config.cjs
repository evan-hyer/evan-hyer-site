const path = require('node:path');
const { createRequire } = require('node:module');
const rspack = require('@rspack/core');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/rspack');
const name = process.env.APP || 'shell';
const root = __dirname;
const dir = path.join(root, name === 'shell' ? 'apps/shell' : 'slices/' + name);
const appRequire = createRequire(path.join(dir, 'package.json'));
const pkg = appRequire('./package.json');
const port = { shell: 3000, profile: 3001, projects: 3002, insights: 3003 }[
  name
];
const isReact = name !== 'insights';
const scope = name === 'projects' ? 'react18' : 'default';
const shared = {};
const alias = {
  '@site/ui': path.join(root, 'packages/ui/src/index.tsx'),
  '@site/contract': path.join(root, 'packages/contract/src/index.ts'),
};
if (isReact) {
  for (const dep of [
    'react',
    'react-dom',
    'react-dom/client',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
  ]) {
    const version =
      pkg.dependencies[dep.startsWith('react-dom') ? 'react-dom' : 'react'];
    alias[dep + '$'] = appRequire.resolve(dep);
    shared[dep] = {
      singleton: true,
      requiredVersion: version,
      version,
      shareScope: scope,
      import: appRequire.resolve(dep),
    };
  }
}
module.exports = (_, argv) => ({
  context: dir,
  mode: argv.mode || 'development',
  entry: './src/index.ts',
  output: {
    path: path.join(dir, 'dist'),
    publicPath: 'auto',
    uniqueName: 'eh_' + name,
    filename: '[name].[contenthash].js',
    clean: true,
  },
  resolve: { extensions: ['.tsx', '.ts', '.js'], alias },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: { syntax: 'typescript', tsx: true },
              transform: { react: { runtime: 'automatic' } },
            },
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: { plugins: { '@tailwindcss/postcss': {} } },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new rspack.DefinePlugin({
      __DEV__: JSON.stringify(argv.mode !== 'production'),
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'false',
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
    }),
    new rspack.HtmlRspackPlugin({
      template: path.join(root, 'scripts/index.html'),
      publicPath: '/',
      title: 'Evan Hyer' + (name === 'shell' ? '' : ' — ' + name),
    }),
    new rspack.CopyRspackPlugin({
      patterns: [
        { from: path.join(dir, 'public'), to: '.' },
        {
          from: path.join(root, 'packages/tokens/favicon.svg'),
          to: 'favicon.svg',
        },
      ],
    }),
    new ModuleFederationPlugin({
      name: 'eh_' + name,
      filename: 'remoteEntry.js',
      manifest: true,
      dts: false,
      shareStrategy: 'loaded-first',
      shareScope: scope,
      exposes:
        name === 'shell'
          ? {}
          : { './mount': './src/mount.ts' + (isReact ? 'x' : '') },
      shared,
    }),
  ],
  devServer: {
    host: '127.0.0.1',
    allowedHosts: ['localhost', '127.0.0.1'],
    port,
    hot: false,
    liveReload: true,
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    static: { directory: path.join(dir, 'public') },
    client: { overlay: false },
  },
  devtool:
    argv.mode === 'production' ? 'source-map' : 'cheap-module-source-map',
  optimization: { minimize: argv.mode === 'production' },
});
