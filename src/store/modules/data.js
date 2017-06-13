import * as d3 from 'd3'
import * as _ from 'lodash'

export default {
  state: {
    aSamples: null,
    aDrugs: null,
    aGM: null,
    mDrugIc50Gdsc: null,
    mGM: null,
    mTfActivitiesGdsc: null,
    rTfDrugAssoGdsc: [],
    rTfDrugGmAssoGdsc: [],
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
    // // API
    // apiF2DrugOptions: (state) => ({gmId, ctId}) => {

    // }

    // FLOW 1
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
      return pairs
    },
    sampleCount: (state) => (drugId, tfId) => {
      if (drugId === 'all' || tfId === 'all') return 0
      let ic50sForDrug = state.mDrugIc50Gdsc[drugId]
      let activitiesForTf = state.mTfActivitiesGdsc[tfId]
      let sampleIdsForDrug = Object.keys(ic50sForDrug) // .map(d => +d)
      let sampleIdsForTf = Object.keys(activitiesForTf) // .map(d => +d)
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
          ...item
          // sampleCount: getters.sampleCount(item.drugId, item.transcriptionFactor)
        }
      })
      return associationsWithSampleCounts
    },
    samplePlotData: (state) => (drugId, tfId) => {
      if (drugId === 'all' || tfId === 'all') return []
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
      return sampleIds.map(sampleId => {
        return {
          sampleId: sampleId,
          ic50: ic50sForDrug[sampleId],
          tfActivity: state.mTfActivitiesGdsc[tfId][sampleId],
          sample: state.aSamples[sampleId]
        }
      })
    },
    sampleSummary: (state, getters) => (drugId, tfId, sampleId) => {
      // return state.aSamples[sampleId]
      return getters.samplePlotData(drugId, tfId).filter(r => r.sampleId === sampleId)[0]
    },
    // FLOW 2
    drugGMPairData: (state) => (tf) => {
      // // // get the unique drug-gm pairs (optionally filtered for a given tf)
      // // return state.rTfDrugGmAssoGdsc.filter(r => (!tf || r.transcriptionFactor === tf))

      // // get all unique drug-tf-gm triplets
      // const setAssociations = new Set(state.rTfDrugGmAssoGdsc.map(r => {
      //   // return {
      //   //   tf: r.transcriptionFactor,
      //   //   drug: r.drugId,
      //   //   gm: r.gm
      //   // }
      //   return r.transcriptionFactor + ':' + r.drugId + ':' + r.gm
      // }))
      // console.log(Array.from(setAssociations).map(str => {
      //   const a = str.split(':')
      //   return {
      //     tf: r.transcriptionFactor,
      //     drug: r.drugId,
      //     gm: r.gm
      //   }
      // })
      // console.log(state.rTfDrugGmAssoGdsc.filter(r => (!tf || r.transcriptionFactor === tf)))
      // // return new Array(setAssociations)

      return state.rTfDrugGmAssoGdsc.filter(r => (!tf || r.transcriptionFactor === tf))
    },
    boxPlotData: (state) => (drugId, gmId, ctId, tfId, nested = false) => {
      if (!state.rTfDrugGmAssoGdsc) {
        console.log('no rTfDrugGmAssoGdsc')
        return {}
      }
      if (!state.mDrugIc50Gdsc) {
        console.log('no mDrugIc50Gdsc')
        return {}
      }
      if (!state.mTfActivitiesGdsc) {
        console.log('no mTfActivitiesGdsc')
        return {}
      }
      if (!state.mGM) {
        console.log('no mGM')
        return {}
      }

      // get samples for drug, tf pair (as in flow 1)
      const ic50sForDrug = state.mDrugIc50Gdsc ? state.mDrugIc50Gdsc['' + drugId] : {}
      const activitiesForTf = state.mTfActivitiesGdsc ? state.mTfActivitiesGdsc[tfId] : {}

      let drugKeys = Object.keys(ic50sForDrug)
      let tfKeys = Object.keys(activitiesForTf)
      let sampleIdsForDrug = (drugKeys.length > 0) ? drugKeys.map(d => +d) : []
      let sampleIdsForTf = (tfKeys.length > 0) ? tfKeys.map(d => +d) : []

      // get the samples for the gmId
      let sampleIdsForGm = state.mGM[gmId]

      let tfSet = new Set(sampleIdsForTf)
      let sampleIds = []
      sampleIdsForDrug.map(sampleId => {
        if (tfSet.has(sampleId)) sampleIds.push(sampleId)
      })

      // filter for mutation
      const wtSampleIds = sampleIds.filter(x => (sampleIdsForGm.indexOf(x) < 0))
      const mutSampleIds = sampleIds.filter(x => (sampleIdsForGm.indexOf(x) >= 0))
      let wt = wtSampleIds.map(sampleId => {
        return {
          sampleId: sampleId,
          ic50: ic50sForDrug[sampleId],
          tfActivity: state.mTfActivitiesGdsc[tfId][sampleId],
          sample: state.aSamples[sampleId]
        }
      })
      let mut = mutSampleIds.map(sampleId => {
        return {
          sampleId: sampleId,
          ic50: ic50sForDrug[sampleId],
          tfActivity: state.mTfActivitiesGdsc[tfId][sampleId],
          sample: state.aSamples[sampleId]
        }
      })

      if (nested) {
        // nested box plots should show three adjacent sub-boxplots for each
        // of wt and mut categories, split at 1, -1 values of tfActivity
        let wtGroups = []
        wtGroups.push(wt.filter(r => r.tfActivity < -1))
        wtGroups.push(wt.filter(r => (r.tfActivity >= -1) && r.tfActivity < 1))
        wtGroups.push(wt.filter(r => r.tfActivity >= 1))
        let mutGroups = []
        mutGroups.push(mut.filter(r => r.tfActivity < -1))
        mutGroups.push(mut.filter(r => (r.tfActivity >= -1) && r.tfActivity < 1))
        mutGroups.push(mut.filter(r => r.tfActivity >= 1))

        wt = wtGroups
        mut = mutGroups
      }

      return {
        wt,
        mut
      }
    },
    flow2TableData: (state) => (drugId, gmId, tfId) => {
      return state.rTfDrugGmAssoGdsc.filter(r => (!drugId || r.drugId === drugId))
                                    .filter(r => (!gmId || r.gmId === gmId))
                                    .filter(r => (!tfId || r.transcriptionFactor === tfId))
    },
    flow2DrugPairs: (state) => (gmId) => {
      // console.log('flow2DrugPairs called with: ' + gmId)
      // get all drug options, as label-value pairs, possibly given a fixed GM
      const filtered = state.rTfDrugGmAssoGdsc.filter(r => (!gmId || r.gmId === gmId))
      const pairs = filtered.map(r => {
        return {
          label: r.drugName,
          value: r.drugId
        }
      })

      const uniquePairs = _.uniqBy(pairs, r => r.value)
      // console.log(state.rTfDrugGmAssoGdsc.length)
      // console.log(filtered.length)
      // console.log(pairs.length)
      // console.log(uniquePairs.length)
      return uniquePairs.sort((a, b) => {
        if (a.label < b.label) return -1
        if (a.label > b.label) return 1
        return 0
      })
    },
    flow2GMPairs: (state) => (drugId) => {
      // get all GM options, as label-value pairs, possibly given a fixed drug
      const filtered = state.rTfDrugGmAssoGdsc.filter(r => (!drugId || r.drugId === drugId))
      const pairs = filtered.map(r => {
        return {
          label: r.gm,
          value: r.gmId
        }
      })
      const uniquePairs = _.uniqBy(pairs, r => r.value)
      return uniquePairs.sort((a, b) => {
        if (a.label < b.label) return -1
        if (a.label > b.label) return 1
        return 0
      })
    },
    flow2TFPairs: (state) => (drugId, gmId) => {
      // get all TF options, as label-value pairs, given a fixed drug and GM
      const filtered = state.rTfDrugGmAssoGdsc.filter(r => (!drugId || r.drugId === drugId))
                                              .filter(r => (!gmId || r.gmId === gmId))
      const pairs = filtered.map(r => {
        return {
          label: r.transcriptionFactor,
          value: r.transcriptionFactor
        }
      })
      const uniquePairs = _.uniqBy(pairs, r => r.value)
      return uniquePairs.sort((a, b) => {
        if (a.label < b.label) return -1
        if (a.label > b.label) return 1
        return 0
      })
    },
    gmTableData: (state) => (gmId) => {
      if (!gmId) return {}
      return state.aGM[gmId]
    }
  },
  actions: {
    loadADrugs ({ commit }) {
      return new Promise((resolve, reject) => {
        d3.tsv('./statics/dorothea-data/a_drugs.txt')
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
        d3.tsv('./statics/dorothea-data/a_samples.txt')
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
    loadAGM ({ commit }) {
      return new Promise((resolve, reject) => {
        d3.tsv('./statics/dorothea-data/a_GM.txt')
          .row(function (r, i) {
            if (i === 0) console.log(r)
            return {
              gm: r.GenomicMarker,
              gmId: r.GenomicMarker_id,
              alterationType: r.alteration_type,
              chromosome: r.chr,
              end: +r.end,
              start: +r.start,
              numGenes: +r.num_genes,
              locus: r.locus
            }
          })
          .get(function (data) {
            // require data
            if (!data) return

            // convert list to object (where gm id is the key)
            let converted = {}
            data.map(el => {
              converted[el.gmId] = el
            })

            commit('setData', {
              name: 'aGM',
              data: converted
            })
            resolve()
          })
      })
    },
    loadRTfDrugAssoGdsc ({ commit }) {
      return new Promise((resolve, reject) => {
        d3.tsv('./statics/dorothea-data/r_tf_drug_asso_gdsc.txt')
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
    loadRTfDrugGmAssoGdsc ({ commit }) {
      return new Promise((resolve, reject) => {
        d3.tsv('./statics/dorothea-data/r_tf_drugGM_asso_gdsc.txt')
          .row(function (r, i) {
            return {
              drugId: +r.Drug_id,
              drugName: r.Drug_name,
              drugTargets: r.Drug_targets,
              gm: r.GenomicMarker,
              gmCoeff: +r.GenomicMarker_coefficient,
              gmId: r.GenomicMarker_id,
              gmTTestPval: +r.GenomicMarker_tTest_pval,
              intLRTestFdr: +r.Int_LRtest_fdr,
              intLRTestPval: +r.Int_LRtest_pval,
              intAic: r.Int_aic === 'TRUE',
              intCoeff: +r.Int_coefficient,
              tfLRTestFdr: +r.TF_LRtest_fdr,
              tfLRTestPval: +r.TF_LRtest_pval,
              tfCoeff: +r.TF_coefficient,
              tfAic: r.TF_aic === 'TRUE',
              transcriptionFactor: r.TF,
              cancerType: r.cancer_type
            }
          })
          .get(function (data) {
            commit('setData', {
              name: 'rTfDrugGmAssoGdsc',
              data: data
            })
            resolve()
          })
      })
    },
    loadMGM ({ commit }) {
      return new Promise((resolve, reject) => {
        d3.tsv('./statics/dorothea-data/m_GM.txt')
          .row(function (r, i) {
            // extract genomic marker id (gmId)
            const gmId = r.GenomicMarker_id

            // filter each row to remove gmId
            const samples = []
            for (let key in r) {
              if (key !== 'GenomicMarker_id' && r[key] === '1') {
                samples.push(+key)
              }
            }

            return {
              gmId,
              samples
            }
          })
          .get(function (data) {
            // // convert list to object (where gmId is the key)
            let converted = {}
            data.map(el => {
              converted[el.gmId] = el.samples
            })

            // save to store
            commit('setData', {
              name: 'mGM',
              data: converted
            })
            resolve()
          })
      })
    },
    loadMDrugIc50Gdsc ({ commit }) {
      return new Promise((resolve, reject) => {
        d3.tsv('./statics/dorothea-data/m_drug_ic50_gdsc.txt')
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
    loadMTfActivitiesGdsc ({ commit }) {
      return new Promise((resolve, reject) => {
        d3.tsv('./statics/dorothea-data/m_tf_activities_gdsc.txt')
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
}
