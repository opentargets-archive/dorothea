<template>
  <div class="column gutter">

    <div class="row">
      <div class="card">
        <div class="card-content bg-white">
          <div v-if="!selectedDrug">
            <p class="caption">Select a drug:</p>
            <q-select type="list" @input="changeSelectedDrug" v-model="selectedDrug" :options="drugs"></q-select>
          </div>
          <div v-else>            
            <button class="primary" @click="deselectDrug()">
              {{ selectedDrug }}<i class="on-right">close</i>
            </button>
          </div>

          <div v-if="!selectedGM">
            <p class="caption">Select a GM:</p>
            <q-select type="list" @input="changeSelectedGM" v-model="selectedGM" :options="gms"></q-select>
          </div>
          <div v-else>
            <button class="primary" @click="deselectGM()">
              {{ selectedGM }}<i class="on-right">close</i>
            </button>
          </div>

          <div v-if="selectedDrug && selectedGM && !selectedTF">
            <p class="caption">Select a TF:</p>
            <q-select type="list" @input="changeSelectedTF" v-model="selectedTF" :options="tfs"></q-select>
          </div>
          <div v-else-if="selectedDrug && selectedGM && selectedTF">
            <button class="primary" @click="deselectTF()">
              {{ selectedTF }}<i class="on-right">close</i>
            </button>
          </div>

          <!--<div>
            <p class="caption">Select a GM:</p>
            <q-select type="list" @input="changeSelectedGM" v-model="selectedGM" :options="gms"></q-select>
          </div>-->

          

          <!--<div>
            <v-client-table :data="tableData" :columns="columns" :options="options"></v-client-table>
          </div>-->
        </div>
        <div class="card-content bg-white">
          <q-data-table :data="tableData" :config="tableConfig" :columns="tableCols"></q-data-table>
        </div>
      </div>
    </div>

    <!--<div class="card">
      <div class="card-title text-primary bg-white">Query</div>
        <div class="card-content bg-white row">
          <div>
            <p class="caption">Select a drug:</p>
            <q-select type="list" @input="changeSelectedDrug" v-model="selectedDrug" :options="drugs"></q-select>
          </div>
        </div>
      </div>
    </div>-->

    <div v-if="selectedDrug && selectedGM && selectedTF" class="row gutter">
      <div class="width-1of2">
        <!--<box-plot v-if="loaded" :drug="'277'" :tf="'E2F4'" :gm="'ATRX_mut'"></box-plot>-->
        <box-plot v-if="loaded" :drug="selectedDrug" :tf="selectedTF" :gm="selectedGM"></box-plot>
      </div>
      <div class="width-1of2">
        <!--<nested-box-plot v-if="loaded" :drug="'277'" :tf="'E2F4'" :gm="'ATRX_mut'"></nested-box-plot>-->
        <nested-box-plot v-if="loaded" :drug="selectedDrug" :tf="selectedTF" :gm="selectedGM"></nested-box-plot>
      </div>
    </div>
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
      columns: ['drugName', 'drugId'],
      options: {
        filterByColumn: true,
        listColumns: {
          drugName: [
            {id: 1, text: 'Dog'},
            {id: 2, text: 'Cat'}
          ]
        }
      },
      tableConfig: {
        rowHeight: '25px',
        pagination: {
          rowsPerPage: 10,
          options: [10, 25]
        }
        // selection: 'single'
      },
      tableCols: [
        {
          label: 'Drug',
          field: 'drugName',
          width: '60px',
          sort: true,
          filter: true
        },
        {
          label: 'Genetic Marker',
          field: 'gmId',
          width: '60px',
          sort: true,
          filter: true
        },
        {
          label: 'TF',
          field: 'transcriptionFactor',
          width: '60px',
          sort: true,
          filter: true
        },
        {
          label: 'Cancer Type',
          field: 'cancerType',
          width: '80px',
          sort: true,
          filter: true
        }
      ]
    }
  },
  computed: {
    loaded () {
      return store.state.loaded
    },
    drugs () {
      return store.getters.flow2DrugPairs(this.selectedGM)
    },
    gms () {
      return store.getters.flow2GMPairs(this.selectedDrug)
    },
    tfs () {
      return store.getters.flow2TFPairs(this.selectedDrug, this.selectedGM)
    },
    // drugSummary: function () {
    //   let summary = store.getters.drugSummary(this.drug)
    //   if (!summary) summary = {}
    //   return summary
    // },
    drugGmPairs () {
      return store.getters.drugGMPairData()
    },
    tableData () {
      return store.getters.flow2TableData(this.selectedDrug, this.selectedGM, this.selectedTF)
    }
  },
  methods: {
    changeSelectedDrug () {

    },
    changeSelectedGM () {

    },
    changeSelectedTF () {

    },
    deselectDrug () {
      this.selectedDrug = null
      this.selectedTF = null
    },
    deselectGM () {
      this.selectedGM = null
      this.selectedTF = null
    },
    deselectTF () {
      this.selectedTF = null
    }
  }
}
</script>

<style>
</style>
