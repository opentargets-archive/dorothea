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

      <!--<hr/>
      OLD
      <div class="row justify-center items-center item">
        <small class="width-1of3">Drug:</small>
        <div class="width-2of3">
          <q-select v-if="!drugId" type="list" @input="selectDrug" v-model="drugIdModel" :options="drugOptions"></q-select>
          <small class="token" v-else>{{ drugLabel }}<i class="cursor-pointer" @click="deselectDrug()">close</i></small>
        </div>
      </div>

      <div class="column">
        <q-autocomplete v-if="!drugSelected" v-model="drugTerm" :static-data="staticData" :min-characters="-1" :max-results="10" @selected="selectDrugTerm">
          <input v-model="drugTerm" class="full-width" placeholder="Type a drug name" />
        </q-autocomplete>
        <small v-else class="token">{{ drugSelected.value }}<i class="cursor-pointer" @click="deselectDrugTerm()">close</i></small>
      </div>

      <div class="row justify-center items-center item">
        <small class="width-1of3">Genomic Marker:</small>
        <div class="width-2of3">
          <q-select v-if="!gmId" type="list" @input="selectGM" v-model="gmIdModel" :options="gmOptions"></q-select>
          <small class="token" v-else>{{ gmLabel }}<i class="cursor-pointer" @click="deselectGM()">close</i></small>
        </div>
      </div>

      <div class="row justify-center items-center item">
        <small class="width-1of3">Cancer Type:</small>
        <div class="width-2of3">
          <q-select v-if="!ctId" type="list" @input="selectCT" v-model="ctIdModel" :options="ctOptions"></q-select>
          <small class="token" v-else>{{ ctId }}<i class="cursor-pointer" @click="deselectCT()">close</i></small>
        </div>
      </div>

      <div v-if="drugId && gmId" class="row justify-center items-center item">
        <small class="width-1of3">Transcription Factor:</small>
        <div class="width-2of3">
          <q-select v-if="!tfId" type="list" @input="selectTF" v-model="tfIdModel" :options="tfOptions"></q-select>
          <small class="token" v-else>{{ tfId }}<i class="cursor-pointer" @click="deselectTF()">close</i></small>
        </div>
      </div>

      <button class="capitalize tertiary small clear outline" @click="clickClearAllHandler">Clear All</button>-->

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
      drugTerm: '',
      myDrugTerm: null,
      // myDrugTerm: this.drugId,
      myGMTerm: null,
      myCTTerm: null,
      myTFTerm: null,
      drugSelected: null,
      drugIdModel: null, // note this is not used, merely prevents vue errors
      gmIdModel: null, // note this is not used, merely prevents vue errors
      ctIdModel: null, // note this is not used, merely prevents vue errors
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
    gmOptions () {
      return store.state.flow2.gmOptions
    },
    ctOptions () {
      return store.state.flow2.ctOptions
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
      this.updateGMOptions()
      this.updateGMAutocompleteOptions()
      this.updateCTOptions()
      this.updateCTAutocompleteOptions()
      this.updateTFOptions()
      this.updateTFAutocompleteOptions()
    },
    gmId: function () {
      this.updateDrugOptions()
      this.updateDrugAutocompleteOptions()
      this.updateCTOptions()
      this.updateCTAutocompleteOptions()
      this.updateTFOptions()
      this.updateTFAutocompleteOptions()
    },
    ctId: function () {
      this.updateDrugOptions()
      this.updateDrugAutocompleteOptions()
      this.updateGMOptions()
      this.updateGMAutocompleteOptions()
      this.updateTFOptions()
      this.updateTFAutocompleteOptions()
    },
    dataLoaded: function () {
      this.updateDrugOptions()
      this.updateDrugAutocompleteOptions()
      this.updateGMOptions()
      this.updateGMAutocompleteOptions()
      this.updateCTOptions()
      this.updateCTAutocompleteOptions()
      this.updateTFOptions()
      this.updateTFAutocompleteOptions()
    }
  },
  methods: {
    selectDrug (drugId) {
      let query = {
        filterOnDrug: drugId
      }
      if (this.gmId) query.filterOnGM = this.gmId
      if (this.ctId) query.filterOnCT = this.ctId
      router.push({
        path: '/investigation/2',
        query
      })
    },
    deselectDrug () {
      let query = {}
      if (this.gmId) query.filterOnGM = this.gmId
      if (this.ctId) query.filterOnCT = this.ctId
      router.push({
        path: '/investigation/2',
        query
      })
    },
    selectDrugTerm (item) {
      this.drugSelected = item
    },
    deselectDrugTerm () {
      this.drugTerm = ''
      this.drugSelected = null
    },
    drugOptionChanged (option) {
      // for use with vue-multiselect
      // console.log(option)
      // deselect
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
      // for use with vue-multiselect
      // console.log(option)
      // deselect
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
      // for use with vue-multiselect
      // console.log(option)
      // deselect
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
      // for use with vue-multiselect
      // console.log(option)
      // deselect
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
    selectGM (gmId) {
      let query = {
        filterOnGM: gmId
      }
      if (this.drugId) query.filterOnDrug = this.drugId
      if (this.ctId) query.filterOnCT = this.ctId
      router.push({
        path: '/investigation/2',
        query
      })
    },
    deselectGM () {
      let query = {}
      if (this.drugId) query.filterOnDrug = this.drugId
      if (this.ctId) query.filterOnCT = this.ctId
      router.push({
        path: '/investigation/2',
        query
      })
    },
    selectCT (ctId) {
      let query = {
        filterOnCT: ctId
      }
      if (this.drugId) query.filterOnDrug = this.drugId
      if (this.gmId) query.filterOnGM = this.gmId
      router.push({
        path: '/investigation/2',
        query
      })
    },
    deselectCT () {
      let query = {}
      if (this.drugId) query.filterOnDrug = this.drugId
      if (this.gmId) query.filterOnGM = this.gmId
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
      if (this.ctId) query.filterOnCT = this.ctId
      router.push({
        path: '/investigation/2',
        query
      })
    },
    deselectTF () {
      let query = {}
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
    updateDrugOptions () {
      store.dispatch('flow2/updateDrugOptions', {
        gmId: this.gmId,
        ctId: this.ctId
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
    updateGMOptions () {
      store.dispatch('flow2/updateGMOptions', {
        drugId: this.drugId,
        ctId: this.ctId
      })
    },
    updateCTOptions () {
      store.dispatch('flow2/updateCTOptions', {
        drugId: this.drugId,
        gmId: this.gmId
      })
    },
    updateTFOptions () {
      store.dispatch('flow2/updateTFOptions', {
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
    this.updateDrugOptions()
    this.updateDrugAutocompleteOptions()
    this.updateGMOptions()
    this.updateGMAutocompleteOptions()
    this.updateCTOptions()
    this.updateCTAutocompleteOptions()
    this.updateTFOptions()
    this.updateTFAutocompleteOptions()
  }
}
</script>

<style>
.item, .item.two-lines {
  height: 32px;
}
.item > .item-content, .item.two-lines > .item-content {
  padding: 8px 0;
  font-size: 80%;
}
.token {
  font-size: 80%;
}


.multiselect-container {
  padding-top: 5px;
  padding-bottom: 5px;
}

.multiselect {
  margin-top: 0px;
}
.multiselect__tags {
  border: none;
  padding-left: 0px;
  padding-top: 0px;
  input {
    font-size: 80%;
  }
}
.multiselect__option {
  padding: 4px 4px;
  min-height: 10px;
  font-size: 80%;
}
.multiselect__input {
  border-radius: 0;
  font-size: 80%;
  padding: 0px;
}
.multiselect__option--highlight {
  background: #B7E9F3;
  color: #555;
}

div.card {
  overflow: visible;
}
.before-list {
  padding: 4px;
  font-size: 80%;
  font-weight: bold;
}

.multiselect-or-chip {
  height: 40px;
  margin-top: 0px;
}
</style>
