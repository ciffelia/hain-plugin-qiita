'use strict';

const [startup, search, execute, renderPreview] = [
  require('./startup.js'),
  require('./search.js'),
  require('./execute.js'),
  require('./renderPreview.js')
];

module.exports = (pluginContext) => {
  return {
    startup: startup(pluginContext),
    search: search(pluginContext),
    execute: execute(pluginContext),
    renderPreview: renderPreview(pluginContext)
  };
};
