import Vue from 'vue'
import Vuex from 'vuex'
import * as d3 from 'd3'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    aSamples: null,
    aDrugs: null,
    mDrugIc50Gdsc: null,
    mDrugIc50CorrectedGdsc: null,
    mTfActivitiesGdsc: null,
    rTfDrugAssoGdsc: [],
    loaded: false
  },
  mutations: {
    setData (state, payload) {
      state[payload.name] = payload.data
    },
    setLoaded (state, payload) {
      state.loaded = payload.value
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
    sampleCount: (state) => (drugId, tfId, correctedIc50) => {
      if (drugId === 'all' || tfId === 'all') return 0
      let ic50sForDrug = correctedIc50 ? state.mDrugIc50CorrectedGdsc[drugId] : state.mDrugIc50Gdsc[drugId]
      let activitiesForTf = state.mTfActivitiesGdsc[tfId]
      let sampleIdsForDrug = Object.keys(ic50sForDrug).map(d => +d)
      let sampleIdsForTf = Object.keys(activitiesForTf).map(d => +d)
      let tfSet = new Set(sampleIdsForTf)
      let sampleIds = []
      sampleIdsForDrug.map(sampleId => {
        if (tfSet.has(sampleId)) sampleIds.push(sampleId)
      })
      return sampleIds.length
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
          sampleCount: getters.sampleCount(item.drugId, item.transcriptionFactor)
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
  },
  actions: {
    loadADrugs ({ commit }) {
      return new Promise((resolve, reject) => {
        d3.tsv('./statics/data/a_drugs.txt')
          .row(function (r, i) {
            return {
              drugId: +r.DRUG_ID,
              drugName: r.DRUG_NAME,
              synonyms: r.SYNONYMS,
              brandName: r.BRAND_NAME,
              putativeTarget: r.PUTATIVE_TARGET,
              drugType: r.DRUG_TYPE
            }
          })
          .get(function (data) {
            // require data
            if (!data) return

            // convert list to object (where sample id is the key)
            let converted = {}
            data.map(el => {
              converted[el.drugId] = el
            })

            commit('setData', {
              name: 'aDrugs',
              data: converted
            })
            resolve()
          })
      })
    },
    loadASamples ({ commit }) {
      return new Promise((resolve, reject) => {
        d3.tsv('./statics/data/a_samples.txt')
          .row(function (r, i) {
            return {
              cosmicId: +r.CosmicID,
              analysisSetName: r['Cell.line.name'],
              gdscDesc1: r.Primary_Site_GDSC1,
              gdscDesc2: r.Primary_Site_GDSC2,
              studyAbbreviation: r['TCGA_label'],
              comment: r.Comment,
              mmr: r.MMR,
              screenMedium: r.Screen_Medium
            }
          })
          .get(function (data) {
            // require data
            if (!data) return

            // convert list to object (where sample id is the key)
            let converted = {}
            data.map(el => {
              converted[el.cosmicId] = el
            })

            commit('setData', {
              name: 'aSamples',
              data: converted
            })
            resolve()
          })
      })
    },
    loadRTfDrugAssoGdsc ({ commit }) {
      return new Promise((resolve, reject) => {
        d3.tsv('./statics/data/r_tf_drug_asso_gdsc.txt')
          .row(function (r) {
            return {
              drugId: +r.Drug_id,
              drugName: r.Drug_name,
              drugTargets: r.Drug_targets,
              transcriptionFactor: r.TF,
              effectSize: +r['effect_size_(reg_coeff)'],
              fdr: +r.fdr,
              pval: +r.pval
            }
          })
          .get(function (data) {
            commit('setData', {
              name: 'rTfDrugAssoGdsc',
              data: data
            })
            resolve()
          })
      })
    },
    loadMDrugIc50Gdsc ({ commit }) {
      return new Promise((resolve, reject) => {
        d3.tsv('./statics/data/m_drug_ic50_gdsc.txt')
          .row(function (r, i) {
            // extract drug id
            const drugId = +r.drug_id

            // filter each row to remove NA values
            const responses = {}
            for (let key in r) {
              if (r[key] !== 'NA' && key !== 'drug_id') {
                responses[key] = +r[key]
              }
            }

            return {
              drugId,
              responses
            }
          })
          .get(function (data) {
            // require data
            if (!data) return

            // convert list to object (where drug id is the key)
            let converted = {}
            data.map(el => {
              converted[el.drugId] = el.responses
            })

            // save to store
            commit('setData', {
              name: 'mDrugIc50Gdsc',
              data: converted
            })
            resolve()
          })
      })
    },
    loadMDrugIc50CorrectedGdsc ({ commit }) {
      return new Promise((resolve, reject) => {
        d3.tsv('./statics/data/m_drug_ic50corrected_gdsc.txt')
          .row(function (r, i) {
            // extract drug id
            const drugId = +r.drug_id

            // filter each row to remove NA values
            const responses = {}
            for (let key in r) {
              if (r[key] !== 'NA' && key !== 'drug_id') {
                responses[key] = +r[key]
              }
            }

            return {
              drugId,
              responses
            }
          })
          .get(function (data) {
            // require data
            if (!data) return

            // convert list to object (where drug id is the key)
            let converted = {}
            data.map(el => {
              converted[el.drugId] = el.responses
            })

            // save to store
            commit('setData', {
              name: 'mDrugIc50CorrectedGdsc',
              data: converted
            })
            resolve()
          })
      })
    },
    loadMTfActivitiesGdsc ({ commit }) {
      return new Promise((resolve, reject) => {
        d3.tsv('./statics/data/m_tf_activities_gdsc.txt')
          .row(function (r, i) {
            // extract transcription factor id
            const tfId = r.TF

            // filter each row to remove tfId
            const responses = {}
            for (let key in r) {
              if (key !== 'TF') {
                responses[key] = +r[key]
              }
            }

            return {
              tfId,
              responses
            }
          })
          .get(function (data) {
            // require data
            if (!data) return

            // convert list to object (where drug id is the key)
            let converted = {}
            data.map(el => {
              converted[el.tfId] = el.responses
            })

            // save to store
            commit('setData', {
              name: 'mTfActivitiesGdsc',
              data: converted
            })
            resolve()
          })
      })
    }
  }
})
