import Vue from 'vue'
import router from '../../router'
const apiBase = 'http://localhost:9009/api/'

function updateRoute (query) {
  return new Promise((resolve, reject) => {
    router.push({
      path: '/investigation/1',
      query
    })
    resolve()
  })
}

export default {
  namespaced: true,
  state: {
    drugAutocompleteOptions: [],
    tfAutocompleteOptions: [],
    sampleOptions: [],
    volcanoPlotData: [],
    samplePlotData: [],
    interactionTableData: {},
    sampleTableData: {},
    drugsBarPlotData: [],
    tfsBarPlotData: []
  },
  getters: {
    // data module (ideally server-side)
    dataLoaded: (state, getters, rootState) => rootState.data.loaded,

    // route module (synced to url)
    filterInteractionsBy: (state, getters, rootState) => rootState.route.query.filterInteractionsBy,
    filterInteractionsOnDrug: (state, getters, rootState) => +rootState.route.query.filterInteractionsOnDrug,
    filterInteractionsOnTF: (state, getters, rootState) => rootState.route.query.filterInteractionsOnTF,
    selectedInteractionDrug: (state, getters, rootState) => +rootState.route.query.selectedInteractionDrug,
    selectedInteractionTF: (state, getters, rootState) => rootState.route.query.selectedInteractionTF,
    selectedSample: (state, getters, rootState) => rootState.route.query.selectedSample,

    // local
    drugAutocompleteOptions: (state) => state.drugAutocompleteOptions,
    tfAutocompleteOptions: (state) => state.tfAutocompleteOptions,
    sampleOptions: (state) => state.sampleOptions,
    volcanoPlotData: (state) => () => state.volcanoPlotData,
    samplePlotData: (state) => () => state.samplePlotData,
    interactionTableData: (state) => state.interactionTableData,
    sampleTableData: (state) => () => state.sampleTableData,
    drugsBarPlotData: (state) => state.drugsBarPlotData,
    tfsBarPlotData: (state) => state.tfsBarPlotData,
    drugName: (state, getters, rootState) => {
      const drugId = getters.selectedInteractionDrug || getters.filterInteractionsOnDrug
      const drugAutocompleteOptions = getters.drugAutocompleteOptions
      let label = ''
      if (drugAutocompleteOptions && drugId) {
        const option = drugAutocompleteOptions.filter(r => r.drugId === drugId)[0]
        if (option && option.label) label = option.value
      }
      return label
    },
    filterInteractionsByToRadioIndex: (state, getters) => {
      const filterBy = getters.filterInteractionsBy
      if (filterBy === 'drug') {
        return 1
      }
      else if (filterBy === 'tf') {
        return 2
      }
      else {
        return 0
      }
    }
  },
  mutations: {
    setFilterInteractionsBy (state, value) {
      state.filterInteractionsBy = value
    },
    mUpdateFlow1DrugAutocompleteOptions (state, payload) {
      state.drugAutocompleteOptions = payload
    },
    mUpdateFlow1TFAutocompleteOptions (state, payload) {
      state.tfAutocompleteOptions = payload
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
    },
    mUpdateDrugsBarPlotData (state, payload) {
      state.drugsBarPlotData = payload
    },
    mUpdateTFsBarPlotData (state, payload) {
      state.tfsBarPlotData = payload
    }
  },
  actions: {
    setFilterInteractionsBy ({ commit }, value) {
      commit('setFilterInteractionsBy', value)
    },
    selectAllDrugsAndAllTfs () {
      return updateRoute({})
    },
    selectFixADrug () {
      return updateRoute({
        filterInteractionsBy: 'drug'
      })
    },
    selectFixATf () {
      return updateRoute({
        filterInteractionsBy: 'tf'
      })
    },
    changeSampleTypes ({ rootState }, sampleTypes) {
      return updateRoute({
        ...rootState.route.query,
        filterSamplesOnTypes: sampleTypes
      })
    },
    updateSampleOptions ({ state, commit }, params) {
      return Vue.http.get(apiBase + 'flow-1/sample-options', {params: params})
        .then(function (response) {
          commit('mUpdateSampleOptions', response.body)
          return response.body
        })
    },
    updateDrugAutocompleteOptions ({ state, commit }, params) {
      Vue.http.get(apiBase + 'flow-1/drug-autocomplete-options', {params: params})
        .then(function (response) {
          commit('mUpdateFlow1DrugAutocompleteOptions', response.body)
        })
    },
    updateTFAutocompleteOptions ({ state, commit }, params) {
      Vue.http.get(apiBase + 'flow-1/tf-autocomplete-options', {params: params})
        .then(function (response) {
          commit('mUpdateFlow1TFAutocompleteOptions', response.body)
        })
    },
    updateVolcanoPlotData ({state, commit}, params) {
      return new Promise((resolve, reject) => {
        if (params.drugId && params.tfId) {
          Vue.http.get(apiBase + 'flow-1/volcano-plot', {params: params})
          .then(function (response) {
            commit('mUpdateVolcanoPlotData', response.body)
            resolve()
          })
        }
        else {
          commit('mUpdateVolcanoPlotData', [])
          resolve()
        }
      })
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
    updateInteractionTableData ({state, commit, getters}) {
      const params = {
        drugId: getters.selectedInteractionDrug,
        tfId: getters.selectedInteractionTF
      }
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
    },
    updateDrugsBarPlotData ({state, commit}, params) {
      Vue.http.get(apiBase + 'flow-1/drugs-bar-plot')
        .then(function (response) {
          commit('mUpdateDrugsBarPlotData', response.body)
        })
    },
    updateTFsBarPlotData ({state, commit}, params) {
      Vue.http.get(apiBase + 'flow-1/tfs-bar-plot')
        .then(function (response) {
          commit('mUpdateTFsBarPlotData', response.body)
        })
    }
  }
}
