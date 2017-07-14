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
require(`../node_modules/bar-plot/index.scss`)
require(`../node_modules/effect-plot/index.scss`)

// multiselect
require(`../node_modules/vue-multiselect/dist/vue-multiselect.min.css`)
// ==============================

// general 3rd party
import Vue from 'vue'
import Quasar from 'quasar'
import VueResource from 'vue-resource'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
import { sync } from 'vuex-router-sync'
import VueScrollTo from 'vue-scrollto'

// layout related
import BaseCard from './components/layout/BaseCard.vue'
import FilterCard from './components/layout/FilterCard.vue'
import PlotCard from './components/layout/PlotCard.vue'
import TableCard from './components/layout/TableCard.vue'

// common
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import Navigation from './components/Navigation.vue'

// flow-1
import DrugsBarPlot from './components/flow-1/DrugsBarPlot.vue'
import TFsBarPlot from './components/flow-1/TFsBarPlot.vue'
import Flow1Filter from './components/flow-1/Filter.vue'
import VolcanoPlot from './components/flow-1/VolcanoPlot.vue'
import SamplePlot from './components/flow-1/SamplePlot.vue'
import SamplePlotFilter from './components/flow-1/SamplePlotFilter.vue'
import AssociationTable from './components/flow-1/InteractionTable.vue'
import SampleTable from './components/flow-1/SampleTable.vue'

// flow-2
import TripletsBarPlot from './components/flow-2/TripletsBarPlot.vue'
import Flow2Filter from './components/flow-2/Filter.vue'
import InteractionsTable from './components/flow-2/InteractionsTable.vue'
import EffectPlot from './components/flow-2/EffectPlot.vue'
import DrugTable from './components/flow-2/DrugTable.vue'
import GMTable from './components/flow-2/GMTable.vue'
import CTTable from './components/flow-2/CTTable.vue'
import TFTable from './components/flow-2/TFTable.vue'

// non-components
import store from './store'
import useMockBackend from './server'
import router from './router'

// general
Vue.use(Quasar) // Install Quasar Framework
Vue.use(VueScrollTo)
Vue.use(VueResource)

// use http interceptors
useMockBackend(Vue)

// 3rd party
Vue.component('icon', Icon)

// layout related
Vue.component('dorothea-base-card', BaseCard)
Vue.component('dorothea-filter-card', FilterCard)
Vue.component('dorothea-plot-card', PlotCard)
Vue.component('dorothea-table-card', TableCard)

// common
Vue.component('dorothea-header', Header)
Vue.component('dorothea-footer', Footer)
Vue.component('dorothea-navigation', Navigation)

// flow-1
Vue.component('dorothea-drugs-bar-plot', DrugsBarPlot)
Vue.component('dorothea-tfs-bar-plot', TFsBarPlot)
Vue.component('dorothea-flow-1-filter', Flow1Filter)
Vue.component('volcano-plot', VolcanoPlot)
Vue.component('sample-plot', SamplePlot)
Vue.component('dorothea-sample-plot-filter', SamplePlotFilter)
Vue.component('dorothea-association-table', AssociationTable)
Vue.component('dorothea-sample-table', SampleTable)

// flow-2
Vue.component('dorothea-triplets-bar-plot', TripletsBarPlot)
Vue.component('dorothea-interactions-table', InteractionsTable)
Vue.component('dorothea-flow-2-filter', Flow2Filter)
Vue.component('dorothea-effect-plot', EffectPlot)
Vue.component('dorothea-drug-table', DrugTable)
Vue.component('dorothea-gm-table', GMTable)
Vue.component('dorothea-ct-table', CTTable)
Vue.component('dorothea-tf-table', TFTable)

// vuex-router-sync (route params available within vuex)
sync(store, router)

Quasar.start(() => {
  /* eslint-disable no-new */
  let vm = new Vue({
    el: '#q-app',
    router,
    render: h => h(require('./App')),
    store,
    methods: {
      loadAll () {
        Promise.all([
          store.dispatch('loadADrugs'),
          store.dispatch('loadASamples'),
          store.dispatch('loadAGM'),
          store.dispatch('loadATF'),
          store.dispatch('loadMDrugIc50Gdsc'),
          store.dispatch('loadRTfDrugGmAssoGdsc'),
          store.dispatch('loadRTfDrugAssoGdsc'),
          store.dispatch('loadMTfActivitiesGdsc'),
          store.dispatch('loadMGM')
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
