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
        <volcano-plot v-show="selectedDrug" :selectedDrug="selectedDrug" :selectedTf="selectedTf" :click-association-handler="clickAssociationHandler"></volcano-plot>
        <sample-plot v-show="(selectedDrug !== 'all') && (selectedTf !== 'all')" :drug="selectedDrug" :tf="selectedTf"></sample-plot>
      </div>

    </div>
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
