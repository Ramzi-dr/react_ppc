module.exports = {
  apps: [
    {
      name: "frontend",
      script: "npm",
      args: "run preview",   // serve built files
      env: {
        NODE_ENV: "production",
        PORT: 80,
      },
    },
  ],
};




// module.exports = {
//   apps: [
//     {
//       name: "frontend",
//       script: "node_modules/vite/bin/vite.js",
//       args: "--host",
//       cwd: "/home/peoplecounting/code/frontend",
//       interpreter: "node",
//       watch: ["src", "vite.config.js"],
//       env: {
//         NODE_ENV: "development",
//       },
//       node_args: "--max-old-space-size=1024",
//       max_memory_restart: "800M"
//     },
//   ],
// };

