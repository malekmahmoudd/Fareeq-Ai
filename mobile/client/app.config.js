// The subpath applies only to the separate Safari export, never native builds.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.FAREEQ_WEB_BASE_PATH ? { baseUrl: process.env.FAREEQ_WEB_BASE_PATH } : {}),
  },
});
