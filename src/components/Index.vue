<template>
  <q-layout>
    <div slot="header" class="toolbar">
      <q-toolbar-title :padding="0">
        DoRothEA v2
      </q-toolbar-title>
    </div>

    <!--
      Replace following "div" with
      "<router-view class="layout-view">" component
      if using subRoutes
    -->
    <div class="layout-view">
      <div class="layout-padding">
        
        <!--start new layout-->
        <!--<div class="column">
          <div class="row lt-bg-column justify-center gutter">
            <div class="bg-width-1of2 lg-width-2of5">
              <div class="card">
                <div class="card-title bg-primary text-white">Drug Selection</div>
                <div class="card-content">
                  <span>Please select a drug.</span>
                  <q-select type="list" v-model="selectedDrug" :options="drugs"></q-select>
                </div>
              </div>
            </div>
            
            <div class="bg-width-1of2 lg-width-2of5">
              <div class="card">
                <div class="card-title bg-primary text-white">Transcription Factor Selection</div>
                <div class="card-content">
                  <span>Please select a transcription factor.</span>
                  <q-select type="list" v-model="selectedTf" :options="tfs"></q-select>
                </div>
              </div>
            </div>
          </div>
          <div class="row lt-bg-column justify-center gutter">
            <div class="lt-bg-auto bg-width-1of2 lg-width-2of5 column">
              <div class="auto">
                <volcano-plot class="auto" :selectedDrug="selectedDrug" :selectedTf="selectedTf" :click-association-handler="clickAssociationHandler"></volcano-plot>
              </div>
            </div>
            <div v-if="showSamplePlot" class="lt-bg-auto bg-width-1of2 lg-width-2of5">
              <div class="auto">
                <sample-plot class="auto" :drug="selectedDrug" :tf="selectedTf"></sample-plot>
              </div>
            </div>
          </div>
        </div>-->
        <!--end new layout-->


        <div class="row">

          <div class="card">
            <div class="card-title bg-primary text-white">Drug Selection</div>
            <div class="card-content">
              <span>Please select a drug.</span>
              <q-select type="list" v-model="selectedDrug" :options="drugs"></q-select>
            </div>
          </div>
          <div class="card">
            <div class="card-title bg-primary text-white">Transcription Factor Selection</div>
            <div class="card-content">
              <span>Please select a transcription factor.</span>
              <q-select type="list" v-model="selectedTf" :options="tfs"></q-select>
            </div>
          </div>
          
        </div>
        <volcano-plot :selectedDrug="selectedDrug" :selectedTf="selectedTf" :click-association-handler="clickAssociationHandler"></volcano-plot>
        <sample-plot v-if="showSamplePlot" :drug="selectedDrug" :tf="selectedTf"></sample-plot>
      </div>

      </div>
    </div>

    <!--<div slot="footer" class="toolbar">
      Hello, this is the footer
    </div>-->

  </q-layout>
</template>

<script>
import store from '../store'

export default {
  data () {
    return {
      selectedDrug: 'all',
      selectedTf: 'all'
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
    }
  }
}
</script>

<style>
</style>
