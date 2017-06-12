<template>
  <div class="card">
    <div class="card-title text-primary bg-white">Filter</div>

    <div class="card-content bg-white">

      <p class="caption">Select a drug-GM pair</p>

      <div class="item">
        <span class="caption">Drug:</span>
        <q-select v-if="!drugId" type="list" @input="selectDrug" v-model="drugIdModel" :options="drugOptions"></q-select>
        <button v-else class="primary" @click="deselectDrug()">
          {{ drugId }}<i class="on-right">close</i>
        </button>
      </div>

      <div class="item">
        <span class="caption">GM:</span>
        <q-select v-if="!gmId" type="list" @input="selectGM" v-model="gmIdModel" :options="gmOptions"></q-select>
        <button v-else class="primary" @click="deselectGM()">
          {{ gmId }}<i class="on-right">close</i>
        </button>
      </div>

    </div>

    <div v-if="drugId && gmId" class="card-content bg-white">
      <p class="caption">Select a TF</p>

      <span class="caption">TF:</span>
      <q-select v-if="!tfId" type="list" @input="selectTF" v-model="tfIdModel" :options="tfOptions"></q-select>
      <button v-else class="primary" @click="deselectTF()">
        {{ tfId }}<i class="on-right">close</i>
      </button>
    </div>

  </div>
</template>

<script>
import store from '../../store'
import router from '../../router'
export default {
  data () {
    return {
      drugIdModel: null, // note this is not used, merely prevents vue errors
      gmIdModel: null, // note this is not used, merely prevents vue errors
      tfIdModel: null // note this is not used, merely prevents vue errors

    }
  },
  computed: {
    dataLoaded () {
      return store.state.data.loaded
    },
    drugId () {
      return +store.state.route.query.filterOnDrug
    },
    gmId () {
      return store.state.route.query.filterOnGM
    },
    ctId () {
      return store.state.route.query.filterOnCT
    },
    tfId () {
      return store.state.route.query.filterOnTF
    },
    drugOptions () {
      return store.state.flow2.drugOptions
    },
    gmOptions () {
      return store.state.flow2.gmOptions
    },
    tfOptions () {
      return store.state.flow2.tfOptions
    }
  },
  watch: {
    drugId: function () {
      this.updateGMOptions()
      this.updateTFOptions()
    },
    gmId: function () {
      this.updateDrugOptions()
      this.updateTFOptions()
    },
    dataLoaded: function () {
      this.updateDrugOptions()
      this.updateGMOptions()
      this.updateTFOptions()
    }
  },
  methods: {
    selectDrug (drugId) {
      let query = {
        filterOnDrug: drugId
      }
      if (this.gmId) query.filterOnGM = this.gmId
      router.push({
        path: '/investigation/2',
        query
      })
    },
    deselectDrug () {
      let query = {}
      if (this.gmId) query.filterOnGM = this.gmId
      router.push({
        path: '/investigation/2',
        query
      })
    },
    selectGM (gmId) {
      let query = {
        filterOnGM: gmId
      }
      if (this.drugId) query.filterOnDrug = this.drugId
      router.push({
        path: '/investigation/2',
        query
      })
    },
    deselectGM () {
      let query = {}
      if (this.drugId) query.filterOnDrug = this.drugId
      router.push({
        path: '/investigation/2',
        query
      })
    },
    selectTF (tfId) {
      let query = {
        filterOnTF: tfId
      }
      if (this.drugId) query.filterOnDrug = this.drugId
      if (this.gmId) query.filterOnGM = this.gmId
      router.push({
        path: '/investigation/2',
        query
      })
    },
    deselectTF () {
      let query = {}
      if (this.drugId) query.filterOnDrug = this.drugId
      if (this.gmId) query.filterOnGM = this.gmId
      router.push({
        path: '/investigation/2',
        query
      })
    },
    updateDrugOptions () {
      store.dispatch('updateDrugOptions', {
        gmId: this.gmId,
        ctId: this.ctId
      })
    },
    updateGMOptions () {
      store.dispatch('updateGMOptions', {
        drugId: this.drugId,
        ctId: this.ctId
      })
    },
    updateTFOptions () {
      store.dispatch('updateTFOptions', {
        drugId: this.drugId,
        gmId: this.gmId,
        ctId: this.ctId
      })
    }
  }
}
</script>
