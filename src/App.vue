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
      drugId: r.DRUG_ID,
      drugName: r.DRUG_NAME,
      synonyms: r.SYNONYMS,
      brandName: r.BRAND_NAME,
      putativeTarget: r.PUTATIVE_TARGET,
      drugType: r.DRUG_TYPE
    }
  })
  .get(function (data) {
    console.log(data)
    store.commit('setData', {
      name: 'aDrugs',
      data: data
    })
  })

d3.tsv('./statics/data/a_samples.txt')
  .row(function (r, i) {
    return {
      cosmicId: r.CosmicID,
      analysisSetName: r['Analysis.Set.Name'],
      gdscDesc1: r.gdsc_desc_1,
      studyAbbreviation: r['Study.Abbreviation'],
      comment: r.Comment,
      mmr: r.MMR,
      screenMedium: r.Screen_Medium
    }
  })
  .get(function (data) {
    store.commit('setData', {
      name: 'aSamples',
      data: data
    })
  })

d3.tsv('./statics/data/r_tf_drug_asso_gdsc.txt')
  .row(function (r) {
    return {
      drugId: r.Drug_id,
      drugName: r.Drug_name,
      drugTargets: r.Drug_targets,
      transcriptionFactor: r.TF,
      effectSize: r['effect_size_(reg_coeff)'],
      fdr: r.fdr,
      pval: r.pval
    }
  })
  .get(function (data) {
    store.commit('setData', {
      name: 'rTfActivitiesGdsc',
      data: data
    })
  })

export default {}
</script>

<style></style>
