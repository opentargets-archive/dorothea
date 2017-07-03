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
        <dorothea-drugs-bar-plot></dorothea-drugs-bar-plot>
      </div>
      <div class="width-1of2">
        <dorothea-tfs-bar-plot></dorothea-tfs-bar-plot>
      </div>
    </div>
    
    <hr>
    <h5>Results search</h5>
    <div class="row gutter">
      <div class="column width-1of3">
        <dorothea-flow-1-filter></dorothea-flow-1-filter>
        <dorothea-association-table v-if="showInteractionDetail"></dorothea-association-table>
      </div>
      <div class="width-2of3">
        <volcano-plot></volcano-plot>
      </div>
    </div>

    <div v-if="showInteractionDetail">
      <hr>
      <h5>Interaction between {{ drugName() }} and {{ selectedInteractionTF }}</h5>
      <div class="row gutter">
        <div class="column width-1of3">
          <dorothea-sample-plot-filter></dorothea-sample-plot-filter>
          <dorothea-sample-table v-if="showSampleDetail"></dorothea-sample-table>
        </div>
        <div class="column width-2of3">
          <sample-plot></sample-plot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
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
      'selectedSample'
    ])
  }
}
</script>

<style>
.toolbar-title span {
  font-size: 0.8em;
}
hr {
  height: 2px;
  border: 0;
  background-color: #ccc;
  width: 100%;
  margin: 0;
}
</style>
