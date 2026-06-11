const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: ['uview-ui'],
  devServer: {
    port: 8080,
    host: '0.0.0.0',
    allowedHosts: 'all'
  },
  pluginOptions: {
    uni: {
      compilerVersion: 3
    }
  }
})
