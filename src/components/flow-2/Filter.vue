<template>
  <dorothea-base-card title="Filter interactions"
                      description="">

    <div slot="card-internals" class="card-content bg-white">
      <div class="group multiselect-container">
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

      <div class="group multiselect-container">
        <label>Genomic marker</label>
        <div class="multiselect-or-chip row items-center">
          <multiselect v-if="!gmId"
                      v-model="myGMTerm"
                      placeholder="Select a genomic marker"
                      :options="gmAutocompleteOptions"
                      label="label"
                      track-by="value"
                      select-label=""
                      selected-label=""
                      deselect-label=""
                      :reset-after="false"
                      :show-labels="false"
                      :max-height="500"
                      @input="gmOptionChanged">
          
            <template slot="beforeList">
              <div v-if="myGMTerm" class="before-list bg-primary text-white column">
                <span>{{ myGMTerm.value }} selected</span>
                <span>Press backspace to deselect</span>
              </div>
            </template>
          
          </multiselect>
          <small class="token" v-else>{{ gmLabel }}<i class="cursor-pointer" @click="gmOptionChanged">close</i></small>
        </div>
      </div>

      <div class="group multiselect-container">
        <label>Cancer type</label>
        <div class="multiselect-or-chip row items-center">
          <multiselect v-if="!ctId"
                      v-model="myCTTerm"
                      placeholder="Select a cancer type"
                      :options="ctAutocompleteOptions"
                      label="label"
                      track-by="value"
                      select-label=""
                      selected-label=""
                      deselect-label=""
                      :reset-after="false"
                      :show-labels="false"
                      :max-height="500"
                      @input="ctOptionChanged">
          
            <template slot="beforeList">
              <div v-if="myCTTerm" class="before-list bg-primary text-white column">
                <span>{{ myCTTerm.value }} selected</span>
                <span>Press backspace to deselect</span>
              </div>
            </template>
          
          </multiselect>
          <small class="token" v-else>{{ ctId }}<i class="cursor-pointer" @click="ctOptionChanged">close</i></small>
        </div>
      </div>

      <div class="group multiselect-container">
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

      <div class="group">
        <button class="capitalize primary small clear outline" @click="clickClearAllHandler">Clear All</button>
      </div>
    </div>

  </dorothea-base-card>
</template>

<script>
import store from '../../store'
import router from '../../router'
import Multiselect from 'vue-multiselect'
export default {
  components: { Multiselect },
  data () {
    return {
      myDrugTerm: null,
      myGMTerm: null,
      myCTTerm: null,
      myTFTerm: null
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
    drugAutocompleteOptions () {
      return store.state.flow2.drugAutocompleteOptions
    },
    gmAutocompleteOptions () {
      return store.state.flow2.gmAutocompleteOptions
    },
    ctAutocompleteOptions () {
      return store.state.flow2.ctAutocompleteOptions
    },
    tfAutocompleteOptions () {
      return store.state.flow2.tfAutocompleteOptions
    },
    drugLabel () {
      let label = ''
      if (this.drugAutocompleteOptions && this.drugId) {
        const option = this.drugAutocompleteOptions.filter(r => r.drugId === this.drugId)[0]
        if (option && option.label) label = option.value
      }
      return label
    },
    gmLabel () {
      let label = ''
      if (this.gmAutocompleteOptions && this.gmId) {
        const option = this.gmAutocompleteOptions.filter(r => r.gmId === this.gmId)[0]
        if (option && option.label) label = option.value
      }
      return label
    },
    staticData () {
      return {
        field: 'label',
        list: this.drugAutocompleteOptions
      }
    }
  },
  watch: {
    drugId: function () {
      this.updateGMAutocompleteOptions()
      this.updateCTAutocompleteOptions()
      this.updateTFAutocompleteOptions()
    },
    gmId: function () {
      this.updateDrugAutocompleteOptions()
      this.updateCTAutocompleteOptions()
      this.updateTFAutocompleteOptions()
    },
    ctId: function () {
      this.updateDrugAutocompleteOptions()
      this.updateGMAutocompleteOptions()
      this.updateTFAutocompleteOptions()
    },
    dataLoaded: function () {
      this.updateDrugAutocompleteOptions()
      this.updateGMAutocompleteOptions()
      this.updateCTAutocompleteOptions()
      this.updateTFAutocompleteOptions()
    }
  },
  methods: {
    drugOptionChanged (option) {
      this.myDrugTerm = null
      let query = {}
      if (option) {
        query.filterOnDrug = option.drugId
      }
      if (this.gmId) query.filterOnGM = this.gmId
      if (this.ctId) query.filterOnCT = this.ctId
      router.push({
        path: '/investigation/2',
        query
      })
    },
    gmOptionChanged (option) {
      this.myGMTerm = null
      let query = {}
      if (option) {
        query.filterOnGM = option.gmId
      }
      if (this.drugId) query.filterOnDrug = this.drugId
      if (this.ctId) query.filterOnCT = this.ctId
      router.push({
        path: '/investigation/2',
        query
      })
    },
    ctOptionChanged (option) {
      this.myCTTerm = null
      let query = {}
      if (option) {
        query.filterOnCT = option.ctId
      }
      if (this.drugId) query.filterOnDrug = this.drugId
      if (this.gmId) query.filterOnGM = this.gmId
      router.push({
        path: '/investigation/2',
        query
      })
    },
    tfOptionChanged (option) {
      this.myTFTerm = null
      let query = {}
      if (option) {
        query.filterOnTF = option.tfId
      }
      if (this.drugId) query.filterOnDrug = this.drugId
      if (this.gmId) query.filterOnGM = this.gmId
      if (this.ctId) query.filterOnCT = this.ctId
      router.push({
        path: '/investigation/2',
        query
      })
    },
    clickClearAllHandler () {
      router.push({
        path: '/investigation/2',
        query: {}
      })
    },
    updateDrugAutocompleteOptions () {
      store.dispatch('flow2/updateDrugAutocompleteOptions', {
        gmId: this.gmId,
        ctId: this.ctId
      })
    },
    updateGMAutocompleteOptions () {
      store.dispatch('flow2/updateGMAutocompleteOptions', {
        drugId: this.drugId,
        ctId: this.ctId
      })
    },
    updateCTAutocompleteOptions () {
      store.dispatch('flow2/updateCTAutocompleteOptions', {
        drugId: this.drugId,
        gmId: this.gmId
      })
    },
    updateTFAutocompleteOptions () {
      store.dispatch('flow2/updateTFAutocompleteOptions', {
        drugId: this.drugId,
        gmId: this.gmId,
        ctId: this.ctId
      })
    },
    drugNameWithSynonym (option) {
      if (option.label === option.value) return option.label
      return option.label + ' (synonym of ' + option.value + ')'
    }
  },
  mounted () {
    this.updateDrugAutocompleteOptions()
    this.updateGMAutocompleteOptions()
    this.updateCTAutocompleteOptions()
    this.updateTFAutocompleteOptions()
  }
}
</script>
