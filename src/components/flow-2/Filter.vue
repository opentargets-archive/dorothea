<template>
  <dorothea-base-card :title="'Filter'"
                      :description="'Interactions can be filtered by drug, genomic marker, cancer type and transcription factor.'">

    <div slot="card-internals" class="card-content bg-white">

      <div class="row justify-center items-center item">
        <small class="width-1of3">Drug:</small>
        <div class="width-2of3">
          <q-select v-if="!drugId" type="list" @input="selectDrug" v-model="drugIdModel" :options="drugOptions"></q-select>
          <small class="token" v-else>{{ drugLabel }}<i class="cursor-pointer" @click="deselectDrug()">close</i></small>
        </div>
      </div>

      <div class="row justify-center items-center item">
        <small class="width-1of3">Genomic Marker:</small>
        <div class="width-2of3">
          <q-select v-if="!gmId" type="list" @input="selectGM" v-model="gmIdModel" :options="gmOptions"></q-select>
          <small class="token" v-else>{{ gmLabel }}<i class="cursor-pointer" @click="deselectGM()">close</i></small>
        </div>
      </div>

      <div v-if="drugId && gmId" class="row justify-center items-center item">
        <small class="width-1of3">Transcription Factor:</small>
        <div class="width-2of3">
          <q-select v-if="!tfId" type="list" @input="selectTF" v-model="tfIdModel" :options="tfOptions"></q-select>
          <small class="token" v-else>{{ tfId }}<i class="cursor-pointer" @click="deselectTF()">close</i></small>
        </div>
      </div>

    </div>

  </dorothea-base-card>
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
    },
    drugLabel () {
      let label = ''
      if (this.drugOptions && this.drugId) {
        const pair = this.drugOptions.filter(r => r.value === this.drugId)[0]
        if (pair && pair.label) label = pair.label
      }
      return label
    },
    gmLabel () {
      let label = ''
      if (this.gmOptions && this.gmId) {
        const pair = this.gmOptions.filter(r => r.value === this.gmId)[0]
        if (pair && pair.label) label = pair.label
      }
      return label
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

<style>
.item {
  height: 32px;
}
.item > .item-content {
  padding: 8px 0;
  font-size: 80%;
}
.token {
  font-size: 80%;
}
</style>
