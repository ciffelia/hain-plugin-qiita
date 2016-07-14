'use strict';

module.exports = (pluginContext) => (id, payload) => {
  const shell = pluginContext.shell;
  const app = pluginContext.app;

  if(payload) {
    if (payload.openUrl) {
      shell.openExternal(payload.openUrl);
    } else if(payload.command) {
      app.setQuery(payload.command);
    }
  }
};
