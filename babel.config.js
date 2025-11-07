// babel.config.js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'], // (ou qualquer preset que você já usa)
  plugins: [
    [
      "module:react-native-dotenv", {
        "moduleName": "@env",
        "path": ".env",
        "allowUndefined": true
      }
    ]
  ]
};