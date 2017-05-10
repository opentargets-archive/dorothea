<template>
  <!-- Don't drop "q-app" class -->
  <div id="q-app">
    <router-view></router-view>
  </div>
</template>

<script>
/*
 * Root component
 */
import * as d3 from 'd3'
import store from './store'

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

    store.commit('setData', {
      name: 'aDrugs',
      data: converted
    })
  })

d3.tsv('./statics/data/a_samples.txt')
  .row(function (r, i) {
    return {
      cosmicId: +r.CosmicID,
      analysisSetName: r['Analysis.Set.Name'],
      gdscDesc1: r.gdsc_desc_1,
      studyAbbreviation: r['Study.Abbreviation'],
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

    store.commit('setData', {
      name: 'aSamples',
      data: converted
    })
  })

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
    store.commit('setData', {
      name: 'rTfDrugAssoGdsc',
      data: data
    })
  })

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
    store.commit('setData', {
      name: 'mDrugIc50Gdsc',
      data: converted
    })
  })

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
    store.commit('setData', {
      name: 'mTfActivitiesGdsc',
      data: converted
    })
  })

export default {}
</script>

<style></style>
