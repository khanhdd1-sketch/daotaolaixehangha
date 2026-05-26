/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: "server",
      testEnvironment: "node",
      rootDir: "<rootDir>/server",
      testMatch: ["<rootDir>/tests/**/*.test.js"],
      setupFiles: ["<rootDir>/tests/setup.js"]
    },
    {
      displayName: "client",
      testEnvironment: "node",
      testMatch: ["<rootDir>/client/tests/**/*.test.js"],
      transform: {
        "^.+\\.js$": [
          "babel-jest",
          {
            presets: [["@babel/preset-env", { modules: "commonjs" }]]
          }
        ]
      }
    }
  ]
};
