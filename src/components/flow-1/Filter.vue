<template>
  <dorothea-base-card title="Volcano Plot Filter"
                      description="Interactions can be filtered by drug or transcription factor.">

    <div slot="card-internals" class="card-content column">

      <div class="width-1of2">
        <div class="column group">
          <label class="no-margin">
            <q-radio v-model="selectedRouteModel" val="0" @input="selectAllDrugsAndAllTfs"></q-radio>
            No filtering
          </label>
          <label class="no-margin">
            <q-radio v-model="selectedRouteModel" val="1" @input="selectFixADrug"></q-radio>
            Filter by drug
          </label>
          <label class="no-margin">
            <q-radio v-model="selectedRouteModel" val="2" @input="selectFixATf"></q-radio>
            Filter by transcription factor
          </label>
        </div>
      </div>
      <div class="width-1of2">
        <div v-if="filterInteractionsBy === 'drug'">
          <small class="caption">Select a drug:</small>
          <q-select type="list" @input="changeDrug" v-model="drugId" :options="drugOptions"></q-select>
        </div>
        <div v-if="filterInteractionsBy === 'tf'">
          <small class="caption">Select a transcription factor:</small>
          <q-select type="list" @input="changeTF" v-model="tfId" :options="tfOptions"></q-select>
        </div>
      </div>

    </div>

  </dorothea-base-card>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  data () {
    return {
      selectedRouteModel: this.filterInteractionsByToRadioIndex(), // note this is not used, merely prevents vue errors
      drugId: +this.$store.state.route.query.filterInteractionsOnDrug, // note this is not used, merely prevents vue errors
      tfId: this.$store.state.route.query.filterInteractionsOnTF // note this is not used, merely prevents vue errors
    }
  },
  computed: {
    dataLoaded () {
      return this.$store.state.data.loaded
    },
    filterInteractionsBy () {
      return this.$store.state.route.query.filterInteractionsBy
    },
    drugOptions () {
      return this.$store.state.flow1.drugOptions
    },
    tfOptions () {
      return this.$store.state.flow1.tfOptions
    },
    drugLabel () {
      let label = ''
      if (this.drugOptions && this.drugId) {
        const pair = this.drugOptions.filter(r => r.value === this.drugId)[0]
        if (pair && pair.label) label = pair.label
      }
      return label
    }
  },
  watch: {
    dataLoaded () {
      this.updateFlow1DrugOptions()
      this.updateFlow1TFOptions()
    }
  },
  methods: {
    ...mapActions('flow1', [
      'selectAllDrugsAndAllTfs',
      'selectFixADrug',
      'selectFixATf',
      'changeDrug',
      'changeTF',
      'updateFlow1DrugOptions',
      'updateFlow1TFOptions'
    ]),
    filterInteractionsByToRadioIndex () {
      const filterBy = this.$store.state.route.query.filterInteractionsBy
      if (filterBy === 'drug') {
        return 1
      }
      else if (filterBy === 'tf') {
        return 2
      }
      else {
        return 0
      }
    }
  },
  mounted () {
    this.updateFlow1DrugOptions()
    this.updateFlow1TFOptions()
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
</style>
