// === DEFAULT / CUSTOM STYLE ===
// WARNING! always comment out ONE of the two require() calls below.
// 1. use next line to activate CUSTOM STYLE (./src/themes)
// require(`./themes/app.${__THEME}.styl`)
// 2. or, use next line to activate DEFAULT QUASAR STYLE
require(`quasar/dist/quasar.${__THEME}.css`)
// ==============================
// Custom charts
require(`../node_modules/volcano-plot/index.scss`)
require(`../node_modules/sample-plot/index.scss`)
// ==============================

import Vue from 'vue'
import Quasar from 'quasar'
import router from './router'
import VolcanoPlot from './components/VolcanoPlot.vue'
import SamplePlot from './components/SamplePlot.vue'

Vue.use(Quasar) // Install Quasar Framework

Vue.component('volcano-plot', VolcanoPlot)
Vue.component('sample-plot', SamplePlot)

Quasar.start(() => {
  /* eslint-disable no-new */
  new Vue({
    el: '#q-app',
    router,
    render: h => h(require('./App'))
  })
})
