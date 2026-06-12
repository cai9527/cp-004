import Vue from 'vue'
import App from './App'
import store from './store'
import uView from 'uview-ui'
import ActionButtonBar from './components/action-button-bar/index.vue'

Vue.config.productionTip = false
Vue.prototype.$store = store

Vue.use(uView)
Vue.component('ActionButtonBar', ActionButtonBar)

App.mpType = 'app'

const app = new Vue({
    store,
    ...App
})
app.$mount()
