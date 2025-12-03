// process-eng-app/src/version.js

// REACT_APP_* comes from env
export const webFrontendVersion =
  process.env.REACT_APP_CALIBRIX_WEB_FRONTEND_VERSION ||
  process.env.npm_package_version || // works in dev
  '0.0.0';
