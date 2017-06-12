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
      <dorothea-box-plot></dorothea-box-plot>
      <dorothea-nested-box-plot></dorothea-nested-box-plot>
    </div>

    <!--<div class="width-3of4">
      <div class="column">
        <div class="row">
          <div class="card">
            <div class="card-title text-primary bg-white">Interactions Table</div>
            <div class="card-content bg-white">
              <q-data-table :data="tableData" :config="tableConfig" :columns="tableCols"></q-data-table>
            </div>
          </div>
        </div>

        <div v-if="selectedDrug && selectedGM && selectedTF" class="row gutter">
          <div class="width-1of2">
            <box-plot v-if="loaded" :drug="selectedDrug" :tf="selectedTF" :gm="selectedGM" :pval="plot1Pval" :coeff="plot1Coeff"></box-plot>
          </div>
          <div class="width-1of2">
            <nested-box-plot v-if="loaded" :drug="selectedDrug" :tf="selectedTF" :gm="selectedGM" :pval="plot3Pval" :coeff="plot3Coeff"></nested-box-plot>
          </div>
        </div>

      </div>
    </div>-->

  </div>
</template>

<script>
import store from '../store'
export default {
  data () {
    return {
      selectedDrug: null,
      selectedGM: null,
      selectedTF: null,
      selectedCancerType: null,
      tableConfig: {
        rowHeight: '25px',
        pagination: {
          rowsPerPage: 10,
          options: [10, 25]
        }
      },
      tableCols: [
        {
          label: 'Drug',
          field: 'drugName',
          width: '60px',
          sort: true
        },
        {
          label: 'Genetic Marker',
          field: 'gmId',
          width: '60px',
          sort: true
        },
        {
          label: 'TF',
          field: 'transcriptionFactor',
          width: '60px',
          sort: true
        },
        {
          label: 'Cancer Type',
          field: 'cancerType',
          width: '80px',
          sort: true
        }
      ]
    }
  },
  computed: {
    loaded () {
      return store.state.loaded
    },
    tableData () {
      // TODO: Need to add cancer-type filter
      return store.getters.flow2TableData(this.selectedDrug, this.selectedGM, this.selectedTF)
    },
    drugSummary () {
      return store.getters.drugSummary(this.selectedDrug)
    },
    plot1Pval () {
      // TODO: Ensure there is only one row / write specific getter
      return this.tableData[0].gmTTestPval
    },
    plot1Coeff () {
      return this.tableData[0].gmCoeff
    },
    plot3Pval () {
      return this.tableData[0].intLRTestPval
    },
    plot3Coeff () {
      return this.tableData[0].intCoeff
    }
  }
}
</script>

<style>
</style>
