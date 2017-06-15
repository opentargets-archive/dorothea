import Vue from 'vue'
const apiBase = 'http://localhost:9009/api/'
export default {
  state: {
    drugOptions: [],
    gmOptions: [],
    tfOptions: [],
    boxPlotData: {},
    nestedBoxPlotData: {},
    simpleSamplePlotData: [],
    gmTableData: {},
    drugTableData: {}
  },
  mutations: {
    mUpdateDrugOptions (state, payload) {
      state.drugOptions = payload
    },
    mUpdateGMOptions (state, payload) {
      state.gmOptions = payload
    },
    mUpdateTFOptions (state, payload) {
      state.tfOptions = payload
    },
    mUpdateBoxPlotData (state, payload) {
      state.boxPlotData = payload
    },
    mUpdateNestedBoxPlotData (state, payload) {
      state.nestedBoxPlotData = payload
    },
    mUpdateSimpleSamplePlotData (state, payload) {
      state.simpleSamplePlotData = payload
    },
    mUpdateGMTableData (state, payload) {
      state.gmTableData = payload
    },
    mUpdateDrugTableData (state, payload) {
      state.drugTableData = payload
    }
  },
  actions: {
    updateDrugOptions ({ state, commit }, params) {
      Vue.http.get(apiBase + 'drug-options', {params: params})
        .then(function (response) {
          commit('mUpdateDrugOptions', response.body)
        })
    },
    updateGMOptions ({ state, commit }, params) {
      Vue.http.get(apiBase + 'gm-options', {params: params})
        .then(function (response) {
          commit('mUpdateGMOptions', response.body)
        })
    },
    updateTFOptions ({ state, commit }, params) {
      Vue.http.get(apiBase + 'tf-options', {params: params})
        .then(function (response) {
          commit('mUpdateTFOptions', response.body)
        })
    },
    updateBoxPlotData ({state, commit}, params) {
      if (params.drugId && params.gmId && params.tfId) {
        Vue.http.get(apiBase + 'box-plot', {params: params})
        .then(function (response) {
          commit('mUpdateBoxPlotData', response.body)
        })
      }
      else {
        commit('mUpdateBoxPlotData', {})
      }
    },
    updateNestedBoxPlotData ({state, commit}, params) {
      if (params.drugId && params.gmId && params.tfId) {
        Vue.http.get(apiBase + 'nested-box-plot', {params: params})
          .then(function (response) {
            commit('mUpdateNestedBoxPlotData', response.body)
          })
      }
      else {
        commit('mUpdateNestedBoxPlotData', {})
      }
    },
    updateSimpleSamplePlotData ({state, commit}, params) {
      if (params.drugId && params.gmId && params.tfId) {
        Vue.http.get(apiBase + 'simple-sample-plot', {params: params})
          .then(function (response) {
            commit('mUpdateSimpleSamplePlotData', response.body)
          })
      }
      else {
        commit('mUpdateSimpleSamplePlotData', [])
      }
    },
    updateGMTableData ({state, commit}, params) {
      Vue.http.get(apiBase + 'gm-table', {params: params})
        .then(function (response) {
          commit('mUpdateGMTableData', response.body)
        })
    },
    updateDrugTableData ({state, commit}, params) {
      Vue.http.get(apiBase + 'drug-table', {params: params})
        .then(function (response) {
          commit('mUpdateDrugTableData', response.body)
        })
    }
  }
}
