import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    aSamples: null,
    aDrugs: null,
    mDrugIc50Gdsc: null,
    mDrugIc50CorrectedGdsc: null,
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
      if (!state.aDrugs) return {}
      return state.aDrugs[drugId]
    },
    drugIndexNamePairs: (state) => () => {
      if (!state.aDrugs) return []
      let keys = Object.keys(state.aDrugs)
      let pairs = keys.map((drugId) => {
        return {
          label: state.aDrugs[drugId].drugName,
          value: state.aDrugs[drugId].drugId
        }
      }).sort((a, b) => {
        if (a.label < b.label) return -1
        if (a.label > b.label) return 1
        return 0
      })
      pairs = [{
        label: 'All',
        value: 'all'
      }, ...pairs]
      return pairs
    },
    tfIndexNamePairs: (state) => () => {
      if (!state.rTfDrugAssoGdsc) return []
      // get unique tfs from this table
      // (ie. they appear in at least one association)
      let tfIdsSet = new Set(state.rTfDrugAssoGdsc.map(d => d.transcriptionFactor))
      let pairs = [...tfIdsSet].sort().map((tfId) => {
        return {
          label: tfId,
          value: tfId
        }
      })
      pairs = [{
        label: 'All',
        value: 'all'
      }, ...pairs]
      return pairs
    },
    volcanoPlotData: (state, getters) => (drugId, tfId) => {
      if (!state.rTfDrugAssoGdsc) return []
      // drugId and tfId can each be either an individual identifier or the word 'all'
      const allDrugs = (drugId === 'all')
      const allTfs = (tfId === 'all')
      let associations = state.rTfDrugAssoGdsc.filter((item) => {
        const filteredForDrug = allDrugs || (item.drugId === drugId)
        const filteredForTf = allTfs || (item.transcriptionFactor === tfId)
        return filteredForDrug && filteredForTf
      })
      let associationsWithSampleCounts = associations.map(item => {
        return {
          ...item,
          sampleCount: 10 // TODO: Fix this (cache?)
          // sampleCount: getters.samplePlotData(item.drugId, item.transcriptionFactor).length
        }
      })
      return associationsWithSampleCounts
    },
    samplePlotData: (state) => (drugId, tfId, correctedIc50) => {
      if (drugId === 'all' || tfId === 'all') return []
      if (!state.mDrugIc50Gdsc || !state.mTfActivitiesGdsc) return []
      let ic50sForDrug = correctedIc50 ? state.mDrugIc50CorrectedGdsc[drugId] : state.mDrugIc50Gdsc[drugId]
      let ActivitiesForTf = state.mTfActivitiesGdsc[tfId]
      let sampleIdsForDrug = Object.keys(ic50sForDrug).map(d => +d)
      let sampleIdsForTf = Object.keys(ActivitiesForTf).map(d => +d)
      let tfSet = new Set(sampleIdsForTf)
      let sampleIds = []
      sampleIdsForDrug.map(sampleId => {
        if (tfSet.has(sampleId)) sampleIds.push(sampleId)
      })
      return sampleIds.map(sampleId => {
        return {
          sampleId: sampleId,
          ic50: ic50sForDrug[sampleId],
          tfActivity: state.mTfActivitiesGdsc[tfId][sampleId],
          sample: state.aSamples[sampleId]
        }
      })
    }
  }
})
