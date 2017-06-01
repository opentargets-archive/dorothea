// === DEFAULT / CUSTOM STYLE ===
// WARNING! always comment out ONE of the two require() calls below.
// 1. use next line to activate CUSTOM STYLE (./src/themes)
require(`./themes/app.${__THEME}.styl`)
// 2. or, use next line to activate DEFAULT QUASAR STYLE
// require(`quasar/dist/quasar.${__THEME}.css`)
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
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import Navigation from './components/Navigation.vue'
import AssociationTable from './components/AssociationTable.vue'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
import store from './store'
import VueScrollTo from 'vue-scrollto'

Vue.use(Quasar) // Install Quasar Framework
Vue.use(VueScrollTo)

Vue.component('volcano-plot', VolcanoPlot)
Vue.component('sample-plot', SamplePlot)
Vue.component('dorothea-header', Header)
Vue.component('dorothea-footer', Footer)
Vue.component('dorothea-navigation', Navigation)
Vue.component('dorothea-association-table', AssociationTable)
Vue.component('icon', Icon)

Quasar.start(() => {
  /* eslint-disable no-new */
  let vm = new Vue({
    el: '#q-app',
    router,
    render: h => h(require('./App')),
    methods: {
      loadAll () {
        Promise.all([
          store.dispatch('loadADrugs'),
          store.dispatch('loadASamples'),
          store.dispatch('loadRTfDrugAssoGdsc'),
          store.dispatch('loadMDrugIc50Gdsc'),
          store.dispatch('loadMTfActivitiesGdsc')
        ]).then(() => {
          store.commit('setLoaded', {
            value: true
          })
        })
      }
    }
  })
  vm.loadAll()
})
