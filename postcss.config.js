module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-url': {},
    'postcss-pxtorem': {
      rootValue: 32,
      propList: ['*'],
      selectorBlackList: ['ignore', 'tab-bar', 'uni-']
    }
  }
}
