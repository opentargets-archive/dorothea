import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    aSamples: null,
    aDrugs: null,
    mDrugIc50Gdsc: null,
    mTfActivitiesGdsc: null,
    rTfDrugAssoGdsc: null
  },
  mutations: {
    setData (state, payload) {
      state[payload.name] = payload.data
    }
  }
})
