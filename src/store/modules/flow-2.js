import Vue from 'vue'
import router from '../../router'
const apiBase = 'http://localhost:9009/api/'

function updateRoute (query) {
  return new Promise((resolve, reject) => {
    router.push({
      path: '/investigation/2',
      query
    })
    resolve()
  })
}

export default {
  namespaced: true,
  state: {
    drugAutocompleteOptions: [],
    gmAutocompleteOptions: [],
    ctAutocompleteOptions: [],
    tfAutocompleteOptions: [],
    effectPlotData: [],
    gmTableData: {},
    drugTableData: {},
    tfsBarPlotData: [],
    tripletsBarPlotData: []
  },
  getters: {
    // data module (ideally server-side)
    dataLoaded: (state, getters, rootState) => rootState.data.loaded,

    // route module (synced to url)
    drugId: (state, getters, rootState) => +rootState.route.query.filterOnDrug,
    gmId: (state, getters, rootState) => rootState.route.query.filterOnGM,
    ctId: (state, getters, rootState) => rootState.route.query.filterOnCT,
    tfId: (state, getters, rootState) => rootState.route.query.filterOnTF,

    // local
    drugAutocompleteOptions: (state) => state.drugAutocompleteOptions,
    gmAutocompleteOptions: (state) => state.gmAutocompleteOptions,
    ctAutocompleteOptions: (state) => state.ctAutocompleteOptions,
    tfAutocompleteOptions: (state) => state.tfAutocompleteOptions,
    effectPlotData: (state) => state.effectPlotData,
    tfsBarPlotData: (state) => state.tfsBarPlotData,
    tripletsBarPlotData: (state) => state.tripletsBarPlotData,
    gmTableData: (state) => state.gmTableData,
    drugTableData: (state) => () => state.drugTableData,
    drugName: (state, getters, rootState) => {
      const drugId = getters.drugId
      const drugAutocompleteOptions = getters.drugAutocompleteOptions
      let label = ''
      if (drugAutocompleteOptions && drugId) {
        const option = drugAutocompleteOptions.filter(r => r.drugId === drugId)[0]
        if (option && option.label) label = option.value
      }
      return label
    },
    gmName: (state, getters, rootState) => {
      const gmId = getters.gmId
      const gmAutocompleteOptions = getters.gmAutocompleteOptions
      let label = ''
      if (gmAutocompleteOptions && gmId) {
        const option = gmAutocompleteOptions.filter(r => r.gmId === gmId)[0]
        if (option && option.label) label = option.value
      }
      return label
    },
    interaction: (state, getters, rootState, rootGetters) => {
      const drugId = +rootState.route.query.filterOnDrug
      const gmId = rootState.route.query.filterOnGM
      const ctId = rootState.route.query.filterOnCT
      const tfId = rootState.route.query.filterOnTF

      // TODO: Use an api call
      const rows = rootGetters.flow2TableData(drugId, gmId, ctId, tfId)
      // TODO: assert there is ONLY one
      if (rows.length === 1) {
        return rows[0]
      }
      else if (rows.length === 0) {
        return {}
      }
      else {
        console.log('WARNING: more than one interaction')
        return {}
      }
    }
  },
  mutations: {
    mUpdateDrugAutocompleteOptions (state, payload) {
      state.drugAutocompleteOptions = payload
    },
    mUpdateGMAutocompleteOptions (state, payload) {
      state.gmAutocompleteOptions = payload
    },
    mUpdateCTAutocompleteOptions (state, payload) {
      state.ctAutocompleteOptions = payload
    },
    mUpdateTFAutocompleteOptions (state, payload) {
      state.tfAutocompleteOptions = payload
    },
    mUpdateEffectPlotData (state, payload) {
      state.effectPlotData = payload
    },
    mUpdateTFsBarPlotData (state, payload) {
      state.tfsBarPlotData = payload
    },
    mUpdateTripletsBarPlotData (state, payload) {
      state.tripletsBarPlotData = payload
    },
    mUpdateGMTableData (state, payload) {
      state.gmTableData = payload
    },
    mUpdateDrugTableData (state, payload) {
      state.drugTableData = payload
    }
  },
  actions: {
    updateDrugAutocompleteOptions ({ state, commit }, params) {
      Vue.http.get(apiBase + 'flow-2/drug-autocomplete-options', {params: params})
        .then(function (response) {
          commit('mUpdateDrugAutocompleteOptions', response.body)
        })
    },
    updateGMAutocompleteOptions ({ state, commit }, params) {
      Vue.http.get(apiBase + 'flow-2/gm-autocomplete-options', {params: params})
        .then(function (response) {
          commit('mUpdateGMAutocompleteOptions', response.body)
        })
    },
    updateCTAutocompleteOptions ({ state, commit }, params) {
      Vue.http.get(apiBase + 'flow-2/ct-autocomplete-options', {params: params})
        .then(function (response) {
          commit('mUpdateCTAutocompleteOptions', response.body)
        })
    },
    updateTFAutocompleteOptions ({ state, commit }, params) {
      Vue.http.get(apiBase + 'flow-2/tf-autocomplete-options', {params: params})
        .then(function (response) {
          commit('mUpdateTFAutocompleteOptions', response.body)
        })
    },
    updateEffectPlotData ({state, commit}, params) {
      if (params.drugId && params.gmId && params.ctId && params.tfId) {
        Vue.http.get(apiBase + 'flow-2/effect-plot', {params: params})
          .then(function (response) {
            commit('mUpdateEffectPlotData', response.body)
          })
      }
      else {
        commit('mUpdateEffectPlotData', [])
      }
    },
    updateTFsBarPlotData ({state, commit}, params) {
      Vue.http.get(apiBase + 'flow-2/tfs-bar-plot')
        .then(function (response) {
          commit('mUpdateTFsBarPlotData', response.body)
        })
    },
    updateTripletsBarPlotData ({state, commit}, params) {
      Vue.http.get(apiBase + 'flow-2/triplets-bar-plot')
        .then(function (response) {
          commit('mUpdateTripletsBarPlotData', response.body)
        })
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
    },
    selectInteractionRow (context, row) {
      return updateRoute({
        filterOnDrug: row.drugId,
        filterOnGM: row.gmId,
        filterOnCT: row.cancerType,
        filterOnTF: row.transcriptionFactor
      })
    }
  }
}
