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
      <q-select type="list" v-model="selectedDrug" :options="drugs"></q-select>
      <volcano-plot v-show="selectedDrug" v-bind:drug="selectedDrug" v-bind:click-tf-handler="clickTrFaHandler"></volcano-plot>
      <sample-plot v-show="selectedDrug && selectedTf" v-bind:drug="selectedDrug" v-bind:tf="selectedTf"></sample-plot>
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
      if (!store.state.aDrugs) return []
      return store.state.aDrugs.map((drug) => {
        return {
          label: drug.drugName,
          value: drug.drugId
        }
      })
    }
  },
  methods: {
    clickTrFaHandler (d) {
      this.selectedTf = d.transcriptionFactor
    }
  }
}
</script>

<style>
</style>
