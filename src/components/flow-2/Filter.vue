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

    </div>

  </div>
</template>

<script>
import store from '../../store'
import router from '../../router'
export default {
  data () {
    return {
      drugIdModel: null // note this is not used, merely prevents vue errors
    }
  },
  computed: {
    drugId () {
      return store.state.route.query.filterOnDrug
    },
    // drugName () {
    //   // TODO: show the drug name in the chip (not the id)
    //   if (this.drugId)
    // }
    drugOptions () {
      return store.getters.flow2DrugPairs(this.selectedGM)
    }
  },
  methods: {
    selectDrug (drugId) {
      console.log(drugId)
      router.push({
        path: '/investigation/2',
        query: {
          filterOnDrug: drugId
        }
      })
    },
    deselectDrug () {
      router.push({
        path: '/investigation/2',
        query: {}
      })
    }
  }
}
</script>
