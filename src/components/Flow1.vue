<template>
  <div class="layout-view">
    <div class="layout-padding bg-light">
      <div class="column lg-width-4of5 bg-width-4of5">
        <div class="row lt-bg-column justify-center gutter">
          <div class="gt-md-width-1of2">
            <div class="card">
              <div class="card-title text-primary bg-white">Drug Selection</div>
              <div class="card-content bg-white">
                <span>Please select a drug.</span>
                <q-select type="list" @input="changeSelectedDrug" v-model="selectedDrug" :options="drugs"></q-select>
              </div>
            </div>
          </div>
          <div class="gt-md-width-1of2">
            <div class="card">
              <div class="card-title text-primary bg-white">Transcription Factor Selection</div>
              <div class="card-content bg-white">
                <span>Please select a transcription factor.</span>
                <q-select type="list" @input="changeSelectedTf" v-model="selectedTf" :options="tfs"></q-select>
              </div>
            </div>
          </div>
        </div>
        <div class="column justify-center gutter">
          <div class="lg-width-4of5">
            <div class="auto">
              <volcano-plot :selectedDrug="selectedDrug" :selectedTf="selectedTf" :click-association-handler="clickAssociationHandler"></volcano-plot>
            </div>
          </div>
          <div v-if="showSamplePlot" class="lg-width-4of5">
            <div class="auto">
              <sample-plot :drug="selectedDrug" :tf="selectedTf"></sample-plot>
            </div>
          </div>
        </div>
        <hr>
        <div class="row justify-start items-center gutter">
          <div>
            <a href="http://www.ebi.ac.uk" target="_blank">
              <img src="../assets/ebi_195x60.png" alt="European Bioinformatics Institute" width="195px" height="60px">
            </a>
          </div>
          <div>
            <a href="https://www.targetvalidation.org/" target="_blank">
              <img src="../assets/CTI_OT_Primary_Logo_RGB.svg" alt="Open Targets" width="200px" height="75px">
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import store from '../store'
import router from '../router'

export default {
  props: ['passedSelectedDrug', 'passedSelectedTf'],
  data () {
    return {
      selectedDrug: this.passedSelectedDrug ? this.passedSelectedDrug : 'all',
      selectedTf: this.passedSelectedTf ? this.passedSelectedTf : 'all'
    }
  },
  computed: {
    drugs () {
      return store.getters.drugIndexNamePairs()
    },
    tfs () {
      return store.getters.tfIndexNamePairs()
    },
    showSamplePlot () {
      return (this.selectedDrug !== 'all') && (this.selectedTf !== 'all')
    }
  },
  methods: {
    clickAssociationHandler (d) {
      this.selectedDrug = d.drugId
      this.selectedTf = d.transcriptionFactor
    },
    changeSelectedDrug (newDrugId) {
      let newQuery = {...this.$route.query}
      newQuery.drug = newDrugId
      router.push({
        path: '/investigation/1',
        query: newQuery
      })
    },
    changeSelectedTf (newTfId) {
      let newQuery = {...this.$route.query}
      newQuery.tf = newTfId
      router.push({
        path: '/investigation/1',
        query: newQuery
      })
    }
  }
}
</script>

<style>
.toolbar-title span {
  font-size: 0.8em;
}
</style>
