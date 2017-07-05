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
    drugOptions: [],
    tfOptions: [],
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
    drugOptions: (state) => state.drugOptions,
    tfOptions: (state) => state.tfOptions,
    sampleOptions: (state) => () => state.sampleOptions,
    volcanoPlotData: (state) => () => state.volcanoPlotData,
    samplePlotData: (state) => () => state.samplePlotData,
    interactionTableData: (state) => state.interactionTableData,
    sampleTableData: (state) => () => state.sampleTableData,
    drugsBarPlotData: (state) => state.drugsBarPlotData,
    tfsBarPlotData: (state) => state.tfsBarPlotData,
    drugName: (state, getters, rootState) => {
      const selectedInteractionDrug = +rootState.route.query.selectedInteractionDrug
      let drugName = ''
      if (selectedInteractionDrug) {
        state.drugOptions.map(d => {
          if (d.value === selectedInteractionDrug) {
            drugName = d.label
          }
        })
      }
      return drugName
    }
  },
  mutations: {
    setFilterInteractionsBy (state, value) {
      state.filterInteractionsBy = value
    },
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
    changeDrug (context, drugId) {
      return updateRoute({
        filterInteractionsBy: 'drug',
        filterInteractionsOnDrug: drugId
      })
    },
    changeTF (context, tfId) {
      return updateRoute({
        filterInteractionsBy: 'tf',
        filterInteractionsOnTF: tfId
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
    updateFlow1DrugOptions ({ state, commit, rootState }, params) {
      return Vue.http.get(apiBase + 'flow-1/drug-options', {params: params})
        .then(function (response) {
          commit('mUpdateFlow1DrugOptions', response.body)
        })
    },
    updateFlow1TFOptions ({ state, commit }, params) {
      return Vue.http.get(apiBase + 'flow-1/tf-options', {params: params})
        .then(function (response) {
          commit('mUpdateFlow1TFOptions', response.body)
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
      console.log('updateInteractionTableData called')
      const params = {
        drugId: getters.selectedInteractionDrug,
        tfId: getters.selectedInteractionTF
      }

      console.log(params)
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
