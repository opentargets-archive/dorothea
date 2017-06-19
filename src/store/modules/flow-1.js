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
    // linked to route query
    filterInteractionsBy: null,
    filterInteractionsOnDrug: null,
    filterInteractionsOnTF: null,

    drugOptions: [],
    tfOptions: [],
    sampleOptions: [],
    volcanoPlotData: [],
    samplePlotData: [],
    interactionTableData: {},
    sampleTableData: {}
  },
  getters: {
    drugOptions: (state) => () => state.drugOptions,
    tfOptions: (state) => () => state.tfOptions,
    sampleOptions: (state) => () => state.sampleOptions,
    volcanoPlotData: (state) => () => state.volcanoPlotData,
    samplePlotData: (state) => () => state.samplePlotData,
    interactionTableData: (state) => () => state.interactionTableData,
    sampleTableData: (state) => () => state.sampleTableData
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
    changeTF (tfId) {
      return updateRoute({
        filterInteractionsBy: 'tf',
        filterInteractionsOnTF: tfId
      })
    },
    updateSampleOptions ({ state, commit }, params) {
      return Vue.http.get(apiBase + 'flow-1/sample-options', {params: params})
        .then(function (response) {
          commit('mUpdateSampleOptions', response.body)
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
