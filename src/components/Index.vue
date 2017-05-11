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
            <q-select type="list" v-model="selectedDrug" :options="drugs" @input="deselectTrFa"></q-select>
          </div>
        </div>
        <volcano-plot v-show="selectedDrug" :drug="selectedDrug" :selectedTf="selectedTf" :click-tf-handler="clickTrFaHandler"></volcano-plot>
        <sample-plot v-show="selectedDrug && selectedTf" :drug="selectedDrug" :tf="selectedTf"></sample-plot>
      </div>

    </div>
  </q-layout>
</template>

<script>
import store from '../store'

export default {
  data () {
    return {
      selectedDrug: null,
      selectedTf: null
    }
  },
  computed: {
    drugs () {
      return store.getters.drugIndexNamePairs()
    }
  },
  methods: {
    clickTrFaHandler (d) {
      this.selectedTf = d.transcriptionFactor
    },
    deselectTrFa () {
      this.selectedTf = null
    }
  }
}
</script>

<style>
</style>
