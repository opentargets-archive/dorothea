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
    drugIndexNamePairs: (state) => () => {
      if (!state.aDrugs) return []
      return state.aDrugs.map((drug) => {
        return {
          label: drug.drugName,
          value: drug.drugId
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
      let sampleIds = Object.keys(ic50sForDrug).map(d => +d)
      return sampleIds.map(sampleId => {
        return {
          ic50: state.mDrugIc50Gdsc[drugId][sampleId],
          tfActivity: state.mTfActivitiesGdsc[tfId][sampleId]
        // sampleSummary: state.aSamples[sampleId]
        }
      })
    }
  }
})
