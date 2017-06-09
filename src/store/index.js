import Vue from 'vue'
import Vuex from 'vuex'

import data from './modules/data'
import flow1 from './modules/flow-1'
import flow2 from './modules/flow-2'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    data,
    flow1,
    flow2
  }
})
