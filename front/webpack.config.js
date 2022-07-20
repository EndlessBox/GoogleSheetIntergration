const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const autoprefixer = require("autoprefixer");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

let outputPath = path.resolve("./public");
let publicPath = "/";
let DotEnv;

const mode = process.env.NODE_ENV || "production";

console.log({
  outputPath,
  publicPath,
  mode: mode,
});

module.exports = {
  stats: {
    children: false,
  },
  mode,
  devServer: {
    contentBase: path.join(__dirname, "public"),
    port: 9002,
    disableHostCheck: true,
    historyApiFallback: true,
    publicPath,
    clientLogLevel: "silent",
    noInfo: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
      "Access-Control-Allow-Origin": "*",
    },
  },
  entry: {
    "app-js": "./src/ts/index.tsx",
  },
  output: {
    path: outputPath,
    filename: "js/[name].js",
    chunkFilename: "js/[name].bundle.js",
    publicPath,
  },
  resolve: {
    fallback: {
      fs: "empty",
      module: "empty",
    },
    extensions: [".js", ".ts", ".tsx", ".mjs"],
  },
  devtool: mode === "development" ? "eval" : "source-map",
  module: {
    rules: [
      {
        test: /\.(ts|tsx|jsx|js)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: [
            "@babel/preset-react",
            "@babel/preset-env",
            "@babel/preset-typescript",
          ],
          plugins: [
            "relay",
            "@babel/plugin-proposal-optional-chaining",
            "@babel/plugin-syntax-dynamic-import",
            "@babel/plugin-proposal-class-properties",
            "@babel/plugin-transform-runtime",
            "@babel/plugin-proposal-export-default-from",
          ],
        },
      },
      {
        test: /\.(scss|css)$/,
        use: ([
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 5,
              modules:{
                localIdentName: mode !== 'development' ? '[hash:base64:5]' : '[name]__[local]--[hash:base64:5]',
                mode: "global"
              }
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions:{
                parser: "postcss-scss",
                plugins: () => {
                  return [
                    autoprefixer({ browsers: 'last 2 versions' }),
                  ]
                }
              }
            },
          },
          {
            loader: "sass-loader",
            options: {},
          },
        ]),
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
      },
      {
        test: /(\.txt|\.html)$/,
        use: "raw-loader",
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|otf|woff|woff2|ico)$/,
        use: {
          loader: "file-loader",
          options: {
            outputPath: "assets",
          },
        },
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        "dashboard-vendor": {
          name: "dashboard-vendor",
          chunks: "initial",
          enforce: true,
          test(module) {
            return /\/node_modules/.test(module.resource);
          },
        },
      },
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
    autoprefixer,
    new webpack.DefinePlugin({
      'setImmediate': 'undefined',
    }),
    new CopyPlugin({
      patterns:[
        { from: "./logo.png", to: "logo.png" },
      ]
    }),
    mode === 'development' ?
    (
      DotEnv = require('dotenv-webpack'),
      new DotEnv()
    ) : (
      new webpack.EnvironmentPlugin(["ApiURL", "BugsnagKey", "ApiKey", "ClientId"])
    ),
    new HtmlWebpackPlugin({
      title: "Lightfunnels",
      template: "index.ejs",
      chunks: ["app-js", "app-css", "dashboard-vendor"],
      templateParameters: {
        production: mode === "production",
      }
    })
  ],
};
