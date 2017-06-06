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

        </div>
        <div class="card-content bg-white">
          <q-data-table :data="tableData" :config="tableConfig" :columns="tableCols"></q-data-table>
        </div>
      </div>
    </div>

    <div v-if="selectedDrug && selectedGM && selectedTF" class="row gutter">
      <div class="width-1of2">
        <box-plot v-if="loaded" :drug="selectedDrug" :tf="selectedTF" :gm="selectedGM"></box-plot>
      </div>
      <div class="width-1of2">
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
    drugs () {
      return store.getters.flow2DrugPairs(this.selectedGM)
    },
    gms () {
      return store.getters.flow2GMPairs(this.selectedDrug)
    },
    tfs () {
      return store.getters.flow2TFPairs(this.selectedDrug, this.selectedGM)
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
