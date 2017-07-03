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
    <div class="row gutter">
      <div class="width-1of2">
        <dorothea-bar-plot></dorothea-bar-plot>
      </div>
      <!--<div class="width-1of2">
        <dorothea-bar-plot></dorothea-bar-plot>
      </div>-->
    </div>
    <div class="row gutter">
      <div class="width-1of4">
        <dorothea-flow-1-filter></dorothea-flow-1-filter>
      </div>
      <div class="width-1of2">
        <volcano-plot></volcano-plot>
      </div>
      <div class="width-1of4">
        <dorothea-association-table v-if="showInteractionDetail"></dorothea-association-table>
      </div>
    </div>
    <div class="row gutter">
      <div class="width-1of4">
        <dorothea-sample-plot-filter v-if="showInteractionDetail"></dorothea-sample-plot-filter>
      </div>
      <div class="width-1of2">
        <sample-plot v-if="showInteractionDetail"></sample-plot>
      </div>
      <div class="width-1of4">
        <dorothea-sample-table v-if="showSampleDetail"></dorothea-sample-table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    showInteractionDetail () {
      return (this.$store.state.route.query.selectedInteractionDrug &&
              this.$store.state.route.query.selectedInteractionTF)
    },
    showSampleDetail () {
      return (this.showInteractionDetail &&
              this.$store.state.route.query.selectedSample)
    }
  }
}
</script>

<style>
.toolbar-title span {
  font-size: 0.8em;
}
</style>
