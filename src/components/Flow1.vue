<template>
  <div class="row gutter">

    <div class="width-1of4">

      <div class="card">
        <div class="card-title text-primary bg-white">Query</div>
          <div class="card-content bg-white row">
            <div class="width-1of2">
              <div class="column group">
                <label>
                  <q-radio v-model="selectedRoute" val="0" @input="selectAllDrugsAndAllTfs"></q-radio>
                  No filtering
                </label>
                <label>
                  <q-radio v-model="selectedRoute" val="1" @input="selectFixADrug"></q-radio>
                  Filter by drug
                </label>
                <label>
                  <q-radio v-model="selectedRoute" val="2" @input="selectFixATf"></q-radio>
                  Filter by transcription factor
                </label>
              </div>
            </div>
            <div class="width-1of2">
              <div v-if="showSelectDrug">
                <p class="caption">Select a drug:</p>
                <q-select type="list" @input="changeSelectedDrug" v-model="selectedDrug" :options="drugs"></q-select>
              </div>
              <div v-if="showSelectTf">
                <p class="caption">Select a transcription factor:</p>
                <q-select type="list" @input="changeSelectedTf" v-model="selectedTf" :options="tfs"></q-select>
              </div>
            </div>
          </div>
        </div>
  
      </div>

      <div class="width-3of4">
        <div class="column">
          <div class="row gutter">
            <div class="width-2of3">
              <volcano-plot :route="route" :selectedDrug="selectedDrug" :selectedTf="selectedTf" :click-association-handler="clickAssociationHandler"></volcano-plot>
            </div>
            <div class="width-1of3">
              <dorothea-association-table v-if="showSamplePlot" :association="associationSummary"></dorothea-association-table>
            </div>
          </div>

          <div class="row gutter">
            <div class="width-2of3">
              <sample-plot v-if="showSamplePlot" :drug="clicked.drug" :tf="clicked.tf"></sample-plot>
            </div>
            <!--<div class="width-1of3">
              <dorothea-sample-table :sample="sampleSummary"></dorothea-sample-table>
            </div>-->
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import store from '../store'
import router from '../router'
// import VueScrollTo from 'vue-scrollto'

export default {
  props: ['route', 'selected', 'click'],
  data () {
    return {
      // load defaults from the route params
      selectedDrug: this.selected.drug,
      selectedTf: this.selected.tf,
      selectedRoute: this.route,
      clicked: {
        drug: this.click.drug,
        tf: this.click.tf
      }
    }
  },
  computed: {
    drugs () {
      return store.getters.drugIndexNamePairs()
    },
    tfs () {
      return store.getters.tfIndexNamePairs()
    },
    showSamplePlot () {
      return (this.clicked.drug) && (this.clicked.tf)
    },
    showSelectDrug () {
      return (this.selectedRoute === 1)
    },
    showSelectTf () {
      return (this.selectedRoute === 2)
    },
    associationSummary: function () {
      return store.getters.volcanoPlotData(this.clicked.drug, this.clicked.tf)[0]
    }
  },
  methods: {
    clickAssociationHandler (d) {
      // update the clicked drug, tf pair
      this.clicked.drug = d.drugId
      this.clicked.tf = d.transcriptionFactor

      // * update the query params
      let newQuery = {...this.$route.query}
      newQuery.clickedDrug = d.drugId
      newQuery.clickedTf = d.transcriptionFactor
      router.push({
        path: '/investigation/1',
        query: newQuery
      })

      // // scroll to the sample
      // VueScrollTo.scrollTo('#sampleplot', 3000, {
      //   container: '#main-container'
      // })
    },
    changeSelectedDrug (newDrugId) {
      // (route 1 only)
      // on changing the selected drug:
      // * any clicked association should be forgotten
      // * the query params should be updated
      this.resetClicked()
      router.push({
        path: '/investigation/1',
        query: {
          route: this.$route.query.route,
          selectedDrug: newDrugId
        }
      })
    },
    changeSelectedTf (newTfId) {
      // (route 2 only)
      // on changing the selected tf:
      // * any clicked association should be forgotten
      // * the query params should be updated
      this.resetClicked()
      router.push({
        path: '/investigation/1',
        query: {
          route: this.$route.query.route,
          selectedTf: newTfId
        }
      })
    },
    selectAllDrugsAndAllTfs () {
      // switch to route 0:
      // * any clicked association should be forgotten
      // * selectedDrug, selectedTf should be reset to all
      // * the query params should be updated
      this.resetClicked()
      this.selectedRoute = 0
      this.selectedDrug = 'all'
      this.selectedTf = 'all'
      router.push({
        path: '/investigation/1',
        query: {
          route: 0
        }
      })
    },
    selectFixADrug () {
      // switch to route 1:
      // * any clicked association should be forgotten
      // * selectedDrug should be the first in the dropdown
      // * selectedTf should be reset to all
      // * the query params should be updated
      this.resetClicked()
      this.selectedRoute = 1
      this.selectedDrug = this.drugs[0].value
      this.selectedTf = 'all'
      router.push({
        path: '/investigation/1',
        query: {
          route: 1
        }
      })
    },
    selectFixATf () {
      // switch to route 2:
      // * any clicked association should be forgotten
      // * selectedDrug should be reset to all
      // * selectedTf should be the first in the dropdown
      // * the query params should be updated
      this.resetClicked()
      this.selectedRoute = 2
      this.selectedDrug = 'all'
      this.selectedTf = this.tfs[0].value
      router.push({
        path: '/investigation/1',
        query: {
          route: 2
        }
      })
    },
    resetClicked () {
      // forget what was clicked
      this.clicked.drug = null
      this.clicked.tf = null
    }
  }
}
</script>

<style>
.toolbar-title span {
  font-size: 0.8em;
}
</style>
