module.exports = {
  apps: [
    {
      name: "frontend",
      script: "node_modules/vite/bin/vite.js",
      args: "--host",
      cwd: "/home/peoplecounting/code/frontend",
      interpreter: "node",
      watch: ["src", "vite.config.js"],
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
