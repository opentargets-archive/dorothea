import Vue from 'vue'
const apiBase = 'http://localhost:9009/api/'
export default {
  state: {
    drugOptions: [],
    tfOptions: [],
    sampleOptions: [],
    volcanoPlotData: [],
    samplePlotData: [],
    interactionTableData: {},
    sampleTableData: {}
  },
  mutations: {
    mUpdateFlow1DrugOptions (state, payload) {
      state.drugOptions = payload
    },
    mUpdateFlow1TFOptions (state, payload) {
      state.tfOptions = payload
    },
    mUpdateVolcanoPlotData (state, payload) {
      state.volcanoPlotData = payload
    },
    mUpdateSamplePlotData (state, payload) {
      state.samplePlotData = payload
    },
    mUpdateInteractionTableData (state, payload) {
      state.interactionTableData = payload
    },
    mUpdateSampleTableData (state, payload) {
      state.sampleTableData = payload
    },
    mUpdateSampleOptions (state, payload) {
      state.sampleOptions = payload
    }
  },
  actions: {
    updateSampleOptions ({ state, commit }, params) {
      Vue.http.get(apiBase + 'flow-1/sample-options', {params: params})
        .then(function (response) {
          commit('mUpdateSampleOptions', response.body)
        })
    },
    updateFlow1DrugOptions ({ state, commit }, params) {
      Vue.http.get(apiBase + 'flow-1/drug-options', {params: params})
        .then(function (response) {
          commit('mUpdateFlow1DrugOptions', response.body)
        })
    },
    updateFlow1TFOptions ({ state, commit }, params) {
      Vue.http.get(apiBase + 'flow-1/tf-options', {params: params})
        .then(function (response) {
          commit('mUpdateFlow1TFOptions', response.body)
        })
    },
    updateVolcanoPlotData ({state, commit}, params) {
      if (params.drugId && params.tfId) {
        Vue.http.get(apiBase + 'flow-1/volcano-plot', {params: params})
        .then(function (response) {
          commit('mUpdateVolcanoPlotData', response.body)
        })
      }
      else {
        commit('mUpdateVolcanoPlotData', [])
      }
    },
    updateSamplePlotData ({state, commit}, params) {
      if (params.drugId && params.tfId) {
        Vue.http.get(apiBase + 'flow-1/sample-plot', {params: params})
        .then(function (response) {
          commit('mUpdateSamplePlotData', response.body)
        })
      }
      else {
        commit('mUpdateSamplePlotData', [])
      }
    },
    updateInteractionTableData ({state, commit}, params) {
      Vue.http.get(apiBase + 'flow-1/interaction-table', {params: params})
        .then(function (response) {
          commit('mUpdateInteractionTableData', response.body)
        })
    },
    updateSampleTableData ({state, commit}, params) {
      Vue.http.get(apiBase + 'flow-1/sample-table', {params: params})
        .then(function (response) {
          commit('mUpdateSampleTableData', response.body)
        })
    }
  }
}
