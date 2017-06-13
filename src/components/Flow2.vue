<template>
  <div class="row gutter wrap">

    <div class="width-1of1">
      <div class="card">
        <div class="card-content bg-white text-center">
          Statistical interactions between 127 TFs and 160 <a href="http://www.cell.com/fulltext/S0092-8674(16)30746-2" target="_blank">strong effect pharmacogenomic markers</a>.
        </div>
      </div>
    </div>

    <div class="width-1of4">
      <dorothea-flow-2-filter></dorothea-flow-2-filter>
    </div>

    <div class="width-3of4">
      <dorothea-interactions-table></dorothea-interactions-table>
    </div>

    <div class="width-3of4 column">
      <div class="row gutter">
        <div class="width-1of2">
          <dorothea-box-plot></dorothea-box-plot>
        </div>
        <div class="width-1of2">
          <dorothea-nested-box-plot></dorothea-nested-box-plot>
        </div>
      </div>
      <div class="row gutter">
        <div class="width-1of2">
          <dorothea-simple-sample-plot></dorothea-simple-sample-plot>
        </div>
        <div class="width-1of2">
          <dorothea-gm-table></dorothea-gm-table>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  // computed: {
  //   plot1Pval () {
  //     // TODO: Ensure there is only one row / write specific getter
  //     return this.tableData[0].gmTTestPval
  //   },
  //   plot1Coeff () {
  //     return this.tableData[0].gmCoeff
  //   },
  //   plot3Pval () {
  //     return this.tableData[0].intLRTestPval
  //   },
  //   plot3Coeff () {
  //     return this.tableData[0].intCoeff
  //   }
  // }
}
</script>

<style>
</style>
