<template>
  <div class="column">
    <div class="row gutter wrap">
      <div class="width-1of1">
        <div class="card">
          <div class="card-content bg-white text-center">
            Single TF-drug statistical interactions between 127 TFs and 265 compound across ~1,000 cancer cell lines.
          </div>
        </div>
      </div>
    </div>
    <h5>Results summary</h5>
    <div class="row gutter">
      <div class="width-1of2">
        <dorothea-drugs-bar-plot :plot-data="drugsBarPlotData"></dorothea-drugs-bar-plot>
      </div>
      <div class="width-1of2">
        <dorothea-tfs-bar-plot :plot-data="tfsBarPlotData"></dorothea-tfs-bar-plot>
      </div>
    </div>
    
    <hr>
    <h5>Results search</h5>
    <div class="row gutter">
      <div class="column width-1of3">
        <dorothea-flow-1-filter></dorothea-flow-1-filter>
        <dorothea-association-table v-if="showInteractionDetail"
                                    :drug-id="selectedInteractionDrug"
                                    :table-data="interactionTableData">
        </dorothea-association-table>
      </div>
      <div class="width-2of3">
        <volcano-plot></volcano-plot>
      </div>
    </div>

    <div v-if="showInteractionDetail">
      <hr>
      <h5>Interaction between {{ drugName }} and {{ selectedInteractionTF }}</h5>
      <div class="row gutter">
        <div class="column width-1of3">
          <dorothea-sample-plot-filter :color-scale="colorScale">
          </dorothea-sample-plot-filter>
          <dorothea-sample-table v-if="showSampleDetail">
          </dorothea-sample-table>
        </div>
        <div class="column width-2of3">
          <sample-plot :color-scale="colorScale"></sample-plot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as d3 from 'd3'

export default {
  data () {
    return {
      colorScale: d3.scaleOrdinal(d3.schemeCategory20)
    }
  },
  computed: {
    showInteractionDetail () {
      return (this.selectedInteractionDrug &&
              this.selectedInteractionTF)
    },
    showSampleDetail () {
      return (this.showInteractionDetail &&
              this.selectedSample)
    },
    ...mapGetters('flow1', [
      'drugName',
      'selectedInteractionDrug',
      'selectedInteractionTF',
      'selectedSample',
      'drugsBarPlotData',
      'tfsBarPlotData',
      'dataLoaded',
      'interactionTableData'
    ])
  },
  methods: {
    ...mapActions('flow1', [
      'updateDrugsBarPlotData',
      'updateTFsBarPlotData',
      'updateInteractionTableData'
    ]),
    onDataLoad () {
      this.updateDrugsBarPlotData({})
      this.updateTFsBarPlotData({})
      this.updateInteractionTableData()
    },
    onSelectedDrugChange () {
      this.updateInteractionTableData()
    },
    onSelectedTFChange () {
      this.updateInteractionTableData()
    }
  },
  mounted () {
    this.onDataLoad()
  },
  watch: {
    dataLoaded: 'onDataLoad',
    selectedInteractionDrug: 'onSelectedDrugChange',
    selectedInteractionTF: 'onSelectedTFChange'
  }
}
</script>

<style>
.toolbar-title span {
  font-size: 0.8em;
}
</style>
