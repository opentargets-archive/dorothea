import * as d3 from 'd3'
import * as _ from 'lodash'

export default {
  state: {
    aSamples: null,
    aDrugs: null,
    aGM: null,
    aTF: null,
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
    dataFilesLoaded: (state) => () => state.loaded,

    // FLOW 1
    flow1DrugAutocompleteOptions: (state, getters) => () => {
      if (!state.aDrugs) return []
      let options = []
      const drugIds = Object.keys(state.aDrugs)
      drugIds.map((drugId) => {
        const r = state.aDrugs[drugId]
        // add synonyms
        const synonymStr = state.aDrugs[r.drugId].synonyms
        const synonyms = synonymStr.split(', ')

        if (synonymStr) {
          synonyms.map(s => {
            options.push({
              value: r.drugName,
              label: s,
              drugId: r.drugId,
              secondLabel: '(synonym of ' + r.drugName + ')'
            })
          })
        }
        // if the main name is not in list of synonyms, add it
        if (!synonymStr || synonyms.indexOf(r.drugName) < 0) {
          options.push({
            value: r.drugName,
            label: r.drugName,
            drugId: r.drugId
          })
        }
      })
      return options
    },
    flow1TFAutocompleteOptions: (state) => () => {
      if (!state.rTfDrugAssoGdsc) return []
      // get unique tfs from this table
      // (ie. they appear in at least one association)
      const tfs = _.uniq(state.rTfDrugAssoGdsc.map(d => d.transcriptionFactor))
      const options = tfs.sort().map(tfId => ({
        value: tfId,
        label: tfId,
        tfId
      }))
      return options
    },
    sampleOptions: (state) => () => {
      // get the filter options for the sample plot
      const sampleIds = Object.keys(state.aSamples)
      const gdscDesc1s = sampleIds.map(id => state.aSamples[id].gdscDesc1)
      const uniqueGdscDesc1s = _.uniq(gdscDesc1s)
      return uniqueGdscDesc1s.sort()
    },
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
          ...state.aSamples[sampleId]
        }
      })
    },
    drugsBarPlotData: (state) => () => {
      if (!state.mTfActivitiesGdsc) return []

      // return drugs sorted by interaction count
      let interactionCountsByDrug = {}
      Object.keys(state.aDrugs).map(drugId => {
        interactionCountsByDrug[drugId] = {
          drugId,
          drugName: state.aDrugs[drugId].drugName,
          count: 0
        }
      })

      // walk through significant interactions
      state.rTfDrugAssoGdsc
      .filter(r => (r.fdr < 0.05))
      .map(r => {
        interactionCountsByDrug[r.drugId].count += 1
      })
      let interactionCountsByDrugList = Object.keys(state.aDrugs).map(drugId => {
        return interactionCountsByDrug[drugId]
      })

      // sort
      interactionCountsByDrugList.sort((a, b) => b.count - a.count)

      return interactionCountsByDrugList
    },
    sampleSummary: (state, getters) => (drugId, tfId, sampleId) => {
      return getters.samplePlotData(drugId, tfId).filter(r => r.sampleId === sampleId)[0]
    },
    interactionTableData: (state, getters) => (drugId, tfId) => {
      let d = getters.volcanoPlotData(drugId, tfId)[0]
      d = d || {}
      return d
    },
    tfsBarPlotData: (state) => () => {
      if (!state.mTfActivitiesGdsc) return []

      // return tfs sorted by interaction count
      let interactionCountsByTF = {}

      // create counters
      const tfs = Object.keys(state.mTfActivitiesGdsc)
      tfs.map(tfId => {
        interactionCountsByTF[tfId] = {
          tfId,
          count: 0
        }
      })

      // walk through significant interactions
      state.rTfDrugAssoGdsc
      .filter(r => (r.fdr < 0.05))
      .map(r => {
        interactionCountsByTF[r.transcriptionFactor].count += 1
      })
      let interactionCountsByTFList = tfs.map(tfId => {
        return interactionCountsByTF[tfId]
      })

      // sort
      interactionCountsByTFList.sort((a, b) => b.count - a.count)

      return interactionCountsByTFList
    },

    // FLOW 2
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
    effectPlotData: (state) => (drugId, gmId, ctId, tfId) => {
      // should return points with wt/mut annotation

      // catches
      if (drugId === 'all' || tfId === 'all') return []
      if (!state.mDrugIc50Gdsc || !state.mTfActivitiesGdsc) return []

      // get the ic50/activity values (dict with sample ids as keys)
      const ic50sForDrug = state.mDrugIc50Gdsc[drugId]
      const activitiesForTf = state.mTfActivitiesGdsc[tfId]

      // get the sample ids derived from the drug/tf
      const sampleIdsForDrug = Object.keys(ic50sForDrug).map(d => +d)
      const sampleIdsForTf = Object.keys(activitiesForTf).map(d => +d)

      // get the intersection of sample ids
      let tfSet = new Set(sampleIdsForTf)
      let sampleIds = []
      sampleIdsForDrug.map(sampleId => {
        if (tfSet.has(sampleId)) sampleIds.push(sampleId)
      })

      // get the sample ids representing mutants for the given gm
      const sampleIdsForGm = state.mGM[gmId]

      // construct plot data
      let plotData = sampleIds.map(sampleId => {
        return {
          sampleId: sampleId,
          ic50: ic50sForDrug[sampleId],
          tfActivity: state.mTfActivitiesGdsc[tfId][sampleId],
          ...state.aSamples[sampleId],
          mut: (sampleIdsForGm.indexOf(sampleId) >= 0)
        }
      })

      // filter out based on cancer type
      plotData = plotData.filter(d => {
        if (ctId === 'PANCAN') {
          return true
        }
        else {
          return d.tcgaLabel === ctId
        }
      })

      return plotData
    },
    flow2TFsBarPlotData: (state) => () => {
      if (!state.mTfActivitiesGdsc) return []

      // get tfs sorted by interaction count
      let interactionCountsByTF = {}

      // create counters
      const tfs = Object.keys(state.mTfActivitiesGdsc)
      tfs.map(tfId => {
        interactionCountsByTF[tfId] = {
          tfId,
          count: 0
        }
      })

      // walk through significant interactions
      state.rTfDrugGmAssoGdsc
      .filter(r => (r.intLRTestFdr < 0.05))
      .map(r => {
        interactionCountsByTF[r.transcriptionFactor].count += 1
      })
      let interactionCountsByTFList = tfs.map(tfId => {
        return interactionCountsByTF[tfId]
      })

      // sort
      interactionCountsByTFList.sort((a, b) => b.count - a.count)

      return interactionCountsByTFList
    },
    flow2TripletsBarPlotData: (state) => () => {
      // get interactions (grouped by drug, gm and ct), count by tf
      let keys = {}
      state.rTfDrugGmAssoGdsc
      .filter(r => (r.intLRTestFdr < 0.05))
      .map(r => {
        const key = r.drugName + ' - ' + r.gmId + ' - ' + r.cancerType
        if (!keys[key]) {
          keys[key] = {
            key: key,
            drugName: r.drugName,
            drugId: r.drugId,
            gm: r.gm,
            gmId: r.gmId,
            ctId: r.cancerType,
            count: 0
          }
        }
        keys[key].count += 1
      })

      // convert to list
      let countsAsList = Object.values(keys)

      // sort
      countsAsList.sort((a, b) => b.count - a.count)

      return countsAsList
    },
    flow2TableData: (state) => (drugId, gmId, ctId, tfId) => {
      return state.rTfDrugGmAssoGdsc.filter(r => (!drugId || r.drugId === drugId))
                                    .filter(r => (!gmId || r.gmId === gmId))
                                    .filter(r => (!ctId || r.cancerType === ctId))
                                    .filter(r => (!tfId || r.transcriptionFactor === tfId))
    },
    flow2DrugAutocompleteOptions: (state) => (p) => {
      // get all the drug options for drug autocompletion
      const options = []
      const interactions = state.rTfDrugGmAssoGdsc.filter(r => (!p.gmId || r.gmId === p.gmId))
                                                  .filter(r => (!p.ctId || r.cancerType === p.ctId))
      const drugs = _.uniqBy(interactions, d => d.drugId)
      drugs.map(r => {
        // add synonyms
        const synonymStr = state.aDrugs[r.drugId].synonyms
        const synonyms = synonymStr.split(', ')
        // console.log(synonyms)
        if (synonymStr) {
          synonyms.map(s => {
            options.push({
              value: r.drugName,
              label: s,
              drugId: r.drugId,
              secondLabel: '(synonym of ' + r.drugName + ')'
              // stamp: r.drugName
            })
          })
        }
        // if the main name is not in list of synonyms, add it
        if (!synonymStr || synonyms.indexOf(r.drugName) < 0) {
          options.push({
            value: r.drugName,
            label: r.drugName,
            drugId: r.drugId
            // info: state.aDrugs[r.drugId]
          })
        }
      })
      // console.log(options)
      return options
    },
    flow2GMAutocompleteOptions: (state) => (p) => {
      // get all the gm options for gm autocompletion
      const interactions = state.rTfDrugGmAssoGdsc.filter(r => (!p.drugId || r.drugId === p.drugId))
                                                  .filter(r => (!p.ctId || r.cancerType === p.ctId))
      const gms = _.uniqBy(interactions, d => d.gmId)
      return gms.map(r => ({
        value: r.gm,
        label: r.gm,
        gmId: r.gmId
      }))
    },
    flow2CTAutocompleteOptions: (state) => (p) => {
      // get all the ct options for ct autocompletion
      const interactions = state.rTfDrugGmAssoGdsc.filter(r => (!p.drugId || r.drugId === p.drugId))
                                                  .filter(r => (!p.gmId || r.gmId === p.gmId))
      const cts = _.uniqBy(interactions, d => d.cancerType)
      return cts.map(r => ({
        value: r.cancerType,
        label: r.cancerType,
        ctId: r.cancerType
      }))
    },
    flow2TFAutocompleteOptions: (state) => (p) => {
      // get all the tf options for tf autocompletion
      const interactions = state.rTfDrugGmAssoGdsc.filter(r => (!p.drugId || r.drugId === p.drugId))
                                                  .filter(r => (!p.gmId || r.gmId === p.gmId))
                                                  .filter(r => (!p.ctId || r.cancerType === p.ctId))
      const tfs = _.uniqBy(interactions, d => d.transcriptionFactor)
      return tfs.map(r => ({
        value: r.transcriptionFactor,
        label: r.transcriptionFactor,
        tfId: r.transcriptionFactor
      }))
    },
    gmTableData: (state) => (gmId) => {
      if (!gmId) return {}
      return state.aGM[gmId]
    },
    drugTableData: (state) => (drugId) => {
      if (!drugId) return {}
      return state.aDrugs[drugId]
    },
    tfDescription: (state) => (tfId) => {
      // TODO: use an api call to retrieve this or return with tfId
      // as part of interaction data
      if (!state.aTF) return ''
      return state.aTF[tfId]
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
              comment: r.Comment,
              mmr: r.MMR,
              screenMedium: r.Screen_Medium,
              tcgaLabel: r['TCGA_label']
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
    loadATF ({ commit }) {
      return new Promise((resolve, reject) => {
        d3.tsv('./statics/dorothea-data/a_TF.txt')
          .row(function (r, i) {
            return {
              tfId: r.TF,
              tfName: r.TF_name
            }
          })
          .get(function (data) {
            // require data
            if (!data) return

            // convert list to object (where tf id is the key)
            let converted = {}
            data.map(el => {
              converted[el.tfId] = el.tfName
            })

            commit('setData', {
              name: 'aTF',
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
