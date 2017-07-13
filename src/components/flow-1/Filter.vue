<template>
  <dorothea-base-card title="Filter interactions"
                      description="">

    <div slot="card-internals" class="card-content column">

      <div class="group">
        <div class="column">
          <label>
            <q-radio v-model="selectedRouteModel" val="0" @input="selectAllDrugsAndAllTfs"></q-radio>
            No filtering
          </label>
          <label>
            <q-radio v-model="selectedRouteModel" val="1" @input="selectFixADrug"></q-radio>
            Filter by drug
          </label>
          <label>
            <q-radio v-model="selectedRouteModel" val="2" @input="selectFixATf"></q-radio>
            Filter by transcription factor
          </label>
        </div>

      </div>
      <!--<div class="width-1of2">
        <div v-if="filterInteractionsBy === 'drug'">
          <small class="caption">Select a drug:</small>
          <q-select type="list" @input="changeDrug" v-model="drugId" :options="drugOptions"></q-select>
        </div>
        <div v-if="filterInteractionsBy === 'tf'">
          <small class="caption">Select a transcription factor:</small>
          <q-select type="list" @input="changeTF" v-model="tfId" :options="tfOptions"></q-select>
        </div>
      </div>-->

      <div v-if="filterInteractionsBy === 'drug'" class="group multiselect-container">
        <label>Drug</label>
        <div class="multiselect-or-chip row items-center">
          <multiselect v-if="!drugId"
                      v-model="myDrugTerm"
                      placeholder="Select a drug"
                      :options="drugAutocompleteOptions"
                      label="label"
                      track-by="value"
                      :custom-label="drugNameWithSynonym"
                      select-label=""
                      selected-label=""
                      deselect-label=""
                      :reset-after="false"
                      :show-labels="false"
                      :max-height="500"
                      @input="drugOptionChanged">
          
            <template slot="beforeList">
              <div v-if="myDrugTerm" class="before-list bg-primary text-white column">
                <span>{{ myDrugTerm.value }} selected</span>
                <span>Press backspace to deselect</span>
              </div>
            </template>

            <template slot="option" scope="props">
              <div class="option__description column">
                <span class="option__name text-bold">{{ props.option.label }}</span>
                <span class="option__synonym">synonym of {{ props.option.value }}</span>
              </div>
            </template>
          
          </multiselect>
          <small class="token" v-else>{{ drugLabel }}<i class="cursor-pointer" @click="drugOptionChanged">close</i></small>
        </div>
      </div>

      <div v-if="filterInteractionsBy === 'tf'" class="group multiselect-container">
        <label>Transcription factor</label>
        <div class="multiselect-or-chip row items-center">
          <multiselect v-if="!tfId" 
                      v-model="myTFTerm"
                      placeholder="Select a transcription factor"
                      :options="tfAutocompleteOptions"
                      label="label"
                      track-by="value"
                      select-label=""
                      selected-label=""
                      deselect-label=""
                      :reset-after="false"
                      :show-labels="false"
                      :max-height="500"
                      @input="tfOptionChanged">
          
            <template slot="beforeList">
              <div v-if="myTFTerm" class="before-list bg-primary text-white column">
                <span>{{ myTFTerm.value }} selected</span>
                <span>Press backspace to deselect</span>
              </div>
            </template>
          
          </multiselect>
          <small class="token" v-else>{{ tfId }}<i class="cursor-pointer" @click="tfOptionChanged">close</i></small>
        </div>
      </div>

    </div>

  </dorothea-base-card>
</template>

<script>
import router from '../../router'
import { mapGetters, mapActions } from 'vuex'
import Multiselect from 'vue-multiselect'

export default {
  components: { Multiselect },
  data () {
    return {
      selectedRouteModel: this.filterInteractionsByToRadioIndex(), // note this is not used, merely prevents vue errors
      // drugId: +this.$store.state.route.query.filterInteractionsOnDrug, // note this is not used, merely prevents vue errors
      // tfId: this.$store.state.route.query.filterInteractionsOnTF, // note this is not used, merely prevents vue errors
      myDrugTerm: null,
      myTFTerm: null
    }
  },
  computed: {
    dataLoaded () {
      return this.$store.state.data.loaded
    },
    drugId () {
      return +this.$store.state.route.query.filterInteractionsOnDrug
    },
    tfId () {
      return this.$store.state.route.query.filterInteractionsOnTF
    },
    drugNameWithSynonym (option) {
      if (option.label === option.value) return option.label
      return option.label + ' (synonym of ' + option.value + ')'
    },
    drugAutocompleteOptions () {
      return this.$store.state.flow1.drugAutocompleteOptions
    },
    tfAutocompleteOptions () {
      return this.$store.state.flow1.tfAutocompleteOptions
    },
    drugLabel () {
      let label = ''
      if (this.drugAutocompleteOptions && this.drugId) {
        const option = this.drugAutocompleteOptions.filter(r => r.drugId === this.drugId)[0]
        if (option && option.label) label = option.value
      }
      return label
    },
    ...mapGetters('flow1', [
      // 'drugName',
      'filterInteractionsBy'
      // 'drugOptions',
      // 'tfOptions'
    ])
  },
  watch: {
    dataLoaded () {
      // this.updateFlow1DrugOptions()
      this.updateDrugAutocompleteOptions()
      this.updateTFAutocompleteOptions()
      // this.updateFlow1TFOptions()
    }
  },
  methods: {
    ...mapActions('flow1', [
      'selectAllDrugsAndAllTfs',
      'selectFixADrug',
      'selectFixATf',
      'changeDrug',
      'changeTF',
      // 'updateFlow1DrugOptions',
      'updateDrugAutocompleteOptions',
      'updateTFAutocompleteOptions'
      // 'updateFlow1TFOptions'
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
    },
    drugOptionChanged (option) {
      // for use with vue-multiselect
      // console.log(option)
      // deselect
      this.myDrugTerm = null
      let query = {
        filterInteractionsBy: 'drug'
      }
      if (option) {
        query.filterInteractionsOnDrug = option.drugId
      }
      router.push({
        path: '/investigation/1',
        query
      })
    },
    tfOptionChanged (option) {
      // for use with vue-multiselect
      // deselect
      this.myTFTerm = null
      let query = {
        filterInteractionsBy: 'tf'
      }
      if (option) {
        query.filterInteractionsOnTF = option.tfId
      }
      router.push({
        path: '/investigation/1',
        query
      })
    }
  },
  mounted () {
    // this.updateFlow1DrugOptions()
    this.updateDrugAutocompleteOptions()
    this.updateTFAutocompleteOptions()
    // this.updateFlow1TFOptions()
  }
}
</script>
