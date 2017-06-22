import Vue from 'vue'
const apiBase = 'http://localhost:9009/api/'
export default {
  state: {
    drugOptions: [],
    gmOptions: [],
    ctOptions: [],
    tfOptions: [],
    boxPlotData: {},
    nestedBoxPlotData: {},
    simpleSamplePlotData: [],
    gmTableData: {},
    drugTableData: {}
  },
  getters: {
    drugName: (state, getters, rootState) => () => {
      const drugId = +rootState.route.query.filterOnDrug
      let drugName = ''
      if (drugId) {
        state.drugOptions.map(d => {
          if (d.value === drugId) {
            drugName = d.label
          }
        })
      }
      return drugName
    },
    gmName: (state, getters, rootState) => {
      const gmId = rootState.route.query.filterOnGM
      let gmName = ''
      if (gmId) {
        state.gmOptions.map(d => {
          if (d.value === gmId) {
            gmName = d.label
          }
        })
      }
      return gmName
    },
    interaction: (state, getters, rootState) => {
      const drugId = +rootState.route.query.filterOnDrug
      const gmId = rootState.route.query.filterOnGM
      const ctId = rootState.route.query.filterOnCT
      const tfId = rootState.route.query.filterOnTF

      // TODO: Need to add cancer-type filter
      // TODO: Use an api call
      const rows = getters.flow2TableData(drugId, gmId, ctId, tfId)
      // TODO: assert there is ONLY one
      if (rows.length === 1) {
        return rows[0]
      }
      else if (rows.length === 0) {
        return {}
      }
      else {
        console.log('WARNING: more than one interaction')
      }
    }
  },
  mutations: {
    mUpdateDrugOptions (state, payload) {
      state.drugOptions = payload
    },
    mUpdateGMOptions (state, payload) {
      state.gmOptions = payload
    },
    mUpdateCTOptions (state, payload) {
      state.ctOptions = payload
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
      Vue.http.get(apiBase + 'flow-2/drug-options', {params: params})
        .then(function (response) {
          commit('mUpdateDrugOptions', response.body)
        })
    },
    updateGMOptions ({ state, commit }, params) {
      Vue.http.get(apiBase + 'flow-2/gm-options', {params: params})
        .then(function (response) {
          commit('mUpdateGMOptions', response.body)
        })
    },
    updateCTOptions ({ state, commit }, params) {
      Vue.http.get(apiBase + 'flow-2/ct-options', {params: params})
        .then(function (response) {
          commit('mUpdateCTOptions', response.body)
        })
    },
    updateTFOptions ({ state, commit }, params) {
      Vue.http.get(apiBase + 'flow-2/tf-options', {params: params})
        .then(function (response) {
          commit('mUpdateTFOptions', response.body)
        })
    },
    updateBoxPlotData ({state, commit}, params) {
      if (params.drugId && params.gmId && params.ctId && params.tfId) {
        Vue.http.get(apiBase + 'flow-2/box-plot', {params: params})
        .then(function (response) {
          commit('mUpdateBoxPlotData', response.body)
        })
      }
      else {
        commit('mUpdateBoxPlotData', {})
      }
    },
    updateNestedBoxPlotData ({state, commit}, params) {
      if (params.drugId && params.gmId && params.ctId && params.tfId) {
        Vue.http.get(apiBase + 'flow-2/nested-box-plot', {params: params})
          .then(function (response) {
            commit('mUpdateNestedBoxPlotData', response.body)
          })
      }
      else {
        commit('mUpdateNestedBoxPlotData', {})
      }
    },
    updateSimpleSamplePlotData ({state, commit}, params) {
      if (params.drugId && params.gmId && params.ctId && params.tfId) {
        Vue.http.get(apiBase + 'flow-2/simple-sample-plot', {params: params})
          .then(function (response) {
            commit('mUpdateSimpleSamplePlotData', response.body)
          })
      }
      else {
        commit('mUpdateSimpleSamplePlotData', [])
      }
    },
    updateGMTableData ({state, commit}, params) {
      Vue.http.get(apiBase + 'flow-2/gm-table', {params: params})
        .then(function (response) {
          commit('mUpdateGMTableData', response.body)
        })
    },
    updateDrugTableData ({state, commit}, params) {
      Vue.http.get(apiBase + 'flow-2/drug-table', {params: params})
        .then(function (response) {
          commit('mUpdateDrugTableData', response.body)
        })
    }
  }
}
