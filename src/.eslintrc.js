module.exports = {
  extends: [
    "../.eslintrc.js",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  parserOptions: {
    jsx: true,
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  plugins: ["react", "react-hooks"],
  rules: {
    "react/react-in-jsx-scope": 0,
    "react/prop-types": 0,
  },
  settings: {
    react: {
      version: "16.0",
    },
  },
};
