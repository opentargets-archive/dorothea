<template>
  <div class="column">
    <div class="width-1of1">
      <div class="card">
        <div class="card-content bg-white text-center">
          Statistical interactions between 127 TFs and 160 <a href="http://www.cell.com/fulltext/S0092-8674(16)30746-2" target="_blank">strong effect pharmacogenomic markers</a>.
        </div>
      </div>
    </div>

    <div class="width-1of1 row gutter">

      <div class="width-1of4 column">
        <dorothea-flow-2-filter></dorothea-flow-2-filter>
        <dorothea-drug-table></dorothea-drug-table>
        <dorothea-gm-table></dorothea-gm-table>
      </div>

      <div class="width-3of4 column">
        <dorothea-interactions-table></dorothea-interactions-table>
        <div class="row gutter" v-if="showPlots">
          <div class="width-1of3">
            <dorothea-box-plot></dorothea-box-plot>
          </div> 
          <div class="width-1of3">
            <dorothea-simple-sample-plot></dorothea-simple-sample-plot>
          </div>
          <div class="width-1of3">
            <dorothea-nested-box-plot></dorothea-nested-box-plot>
          </div>
        </div>
      </div>
    </div>

    
  </div>

</template>

<script>
export default {
  computed: {
    showPlots () {
      return (this.$store.state.route.query.filterOnDrug &&
              this.$store.state.route.query.filterOnGM &&
              this.$store.state.route.query.filterOnCT &&
              this.$store.state.route.query.filterOnTF)
    }
  }
}
</script>

<style>
</style>
