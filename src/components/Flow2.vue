<template>
  <div>
    <div v-if="dataLoaded" class="column">
      <div class="width-1of1">
        <div class="card">
          <div class="card-content bg-white text-center">
            Statistical interactions between 127 TFs and 160 <a href="http://www.cell.com/fulltext/S0092-8674(16)30746-2" target="_blank">strong effect pharmacogenomic markers</a>.
          </div>
        </div>
      </div>

      <h5>Results summary</h5>
      <div class="row gutter">
        <div class="width-1of2">
          <dorothea-triplets-bar-plot :plot-data="tripletsBarPlotData"></dorothea-triplets-bar-plot>
        </div>
        <div class="width-1of2">
          <dorothea-tfs-bar-plot :plot-data="tfsBarPlotData"></dorothea-tfs-bar-plot>
        </div>
      </div>
      
      <hr>
      <h5>Results search</h5>
      <div class="row gutter">
        <div class="width-1of4 column">
          <dorothea-flow-2-filter></dorothea-flow-2-filter>
        </div>

        <div class="width-3of4 column">
          <dorothea-interactions-table></dorothea-interactions-table>
        </div>
      </div>

      <div v-if="showPlots">
        <hr>
        <h5>Interaction between {{ drugName }}, {{ gmId }}, {{ ctId }} and {{ tfId }}</h5>
        <div class="row gutter" v-if="showPlots">
          <div class="width-1of4 column">
            <dorothea-drug-table v-if="showDrugSummary"></dorothea-drug-table>
            <dorothea-gm-table v-if="showGMSummary"></dorothea-gm-table>
            <dorothea-ct-table v-if="showCTSummary"></dorothea-ct-table>
            <dorothea-tf-table v-if="tfId"></dorothea-tf-table>
          </div>
          <div class="width-3of4">
            <dorothea-effect-plot></dorothea-effect-plot>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="column justify-center items-center spinner-container">
      <spinner name="grid" color="#555" :size="100"></spinner>
      <h5>Loading data files...</h5>
    </div>
  </div>
  

</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters('flow2', [
      'drugId', 'gmId', 'ctId', 'tfId', 'drugName',
      'dataLoaded',
      'tfsBarPlotData',
      'tripletsBarPlotData'
    ]),
    showPlots () {
      return (this.drugId &&
              this.gmId &&
              this.ctId &&
              this.tfId)
    },
    showGMSummary () {
      return this.gmId
    },
    showDrugSummary () {
      return this.drugId
    },
    showCTSummary () {
      return this.ctId
    }
  },
  methods: {
    ...mapActions('flow2', [
      'updateTFsBarPlotData',
      'updateTripletsBarPlotData'
    ]),
    onDataLoad () {
      this.updateTripletsBarPlotData({})
      this.updateTFsBarPlotData({})
    }
  },
  mounted () {
    this.onDataLoad()
  },
  watch: {
    dataLoaded: 'onDataLoad'
  }
}
</script>

<style>
</style>
