import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    aSamples: null,
    aDrugs: null,
    mDrugIc50Gdsc: null,
    mTfActivitiesGdsc: null,
    rTfDrugAssoGdsc: []
  },
  mutations: {
    setData (state, payload) {
      state[payload.name] = payload.data
    }
  },
  getters: {
    resultsForDrug: (state) => (drugId) => {
      return state.rTfDrugAssoGdsc.filter((item) => item.drugId === drugId)
    },
    sampleResponsesForDrug: (state) => (drugId) => {
      return state.mDrugIc50Gdsc[drugId]
    },
    drugSummary: (state) => (drugId) => {
      return state.aDrugs[drugId]
    },
    drugIndexNamePairs: (state) => () => {
      if (!state.aDrugs) return []
      let keys = Object.keys(state.aDrugs)
      return keys.map((drugId) => {
        return {
          label: state.aDrugs[drugId].drugName,
          value: state.aDrugs[drugId].drugId
        }
      })
    },
    volcanoPlotData: (state, getters) => (drugId) => {
      if (!state.rTfDrugAssoGdsc) return []

      // get drug-transcription factor links (x/y coords)
      let tfDrugAssociations = state.rTfDrugAssoGdsc.filter((item) => item.drugId === drugId)

      // get number of samples (r coord)
      let tfDrugAssociationsWithSampleCount = tfDrugAssociations.map(item => {
        return {
          ...item,
          sampleCount: getters.samplePlotData(drugId, item.transcriptionFactor).length
        }
      })
      return tfDrugAssociationsWithSampleCount
    },
    samplePlotData: (state) => (drugId, tfId) => {
      if (!state.mDrugIc50Gdsc || !state.mTfActivitiesGdsc) return []
      let ic50sForDrug = state.mDrugIc50Gdsc[drugId]
      let ActivitiesForTf = state.mTfActivitiesGdsc[tfId]
      let sampleIdsForDrug = Object.keys(ic50sForDrug).map(d => +d)
      let sampleIdsForTf = Object.keys(ActivitiesForTf).map(d => +d)
      let tfSet = new Set(sampleIdsForTf)
      let sampleIds = []
      sampleIdsForDrug.map(sampleId => {
        if (tfSet.has(sampleId)) sampleIds.push(sampleId)
      })

      // console.log('TF: ' + tfId + ', drugCount: ' + sampleIdsForDrug.length + ', tfCount: ' + sampleIdsForTf.length + ', intersectionCount: ' + sampleIds.length)
      return sampleIds.map(sampleId => {
        return {
          sampleId: sampleId,
          ic50: state.mDrugIc50Gdsc[drugId][sampleId],
          tfActivity: state.mTfActivitiesGdsc[tfId][sampleId],
          sample: state.aSamples[sampleId]
        }
      })
    }
  }
})
