// import Vue from 'vue'
import store from '../store'

// intercept api calls, so that a mock api (with static files can be developed)
// and moved out of the client-side code at a future date if necessary

export default function (Vue) {
  Vue.http.interceptors.push((request, next) => {
    const path = request.url.split('api/')[1]
    const params = request.params
    let body

    switch (path) {
      case 'flow-1/sample-options':
        body = store.getters.sampleOptions()
        break
      case 'flow-1/drug-options':
        body = store.getters.flow1DrugOptions()
        break
      case 'flow-1/tf-options':
        body = store.getters.flow1TFOptions()
        break
      case 'flow-1/volcano-plot':
        body = store.getters.volcanoPlotData(params.drugId, params.tfId)
        break
      case 'flow-1/sample-plot':
        body = store.getters.samplePlotData(params.drugId, params.tfId)
        break
      case 'flow-1/interaction-table':
        body = store.getters.interactionTableData(params.drugId, params.tfId)
        break
      case 'flow-1/sample-table':
        body = store.getters.sampleSummary(params.drugId, params.tfId, params.sampleId)
        break
      case 'flow-1/drugs-bar-plot':
        body = store.getters.drugsBarPlotData()
        break
      case 'flow-1/tfs-bar-plot':
        body = store.getters.tfsBarPlotData()
        break

      case 'flow-2/drug-options':
        body = store.getters.flow2DrugPairs(params.gmId)
        break
      case 'flow-2/drug-autocomplete-options':
        body = store.getters.flow2DrugAutocompleteOptions(params)
        break
      case 'flow-2/gm-options':
        body = store.getters.flow2GMPairs(params.drugId)
        break
      case 'flow-2/ct-options':
        body = store.getters.flow2CTPairs(params.drugId, params.gmId)
        break
      case 'flow-2/tf-options':
        body = store.getters.flow2TFPairs(params.drugId, params.gmId)
        break
      // case 'flow-2/box-plot':
      //   body = store.getters.boxPlotData(params.drugId, params.gmId, params.ctId, params.tfId)
      //   break
      // case 'flow-2/nested-box-plot':
      //   body = store.getters.boxPlotData(params.drugId, params.gmId, params.ctId, params.tfId, true)
      //   break
      // case 'flow-2/simple-sample-plot':
      //   // TODO: this should take into account the gmId and ctId too
      //   // ie. will need a store.getters.simpleSamplePlotData method
      //   body = store.getters.samplePlotData(params.drugId, params.tfId)
      //   break
      case 'flow-2/effect-plot':
        body = store.getters.effectPlotData(params.drugId, params.gmId, params.ctId, params.tfId)
        break
      case 'flow-2/gm-table':
        body = store.getters.gmTableData(params.gmId)
        break
      case 'flow-2/drug-table':
        body = store.getters.drugTableData(params.drugId)
        break
      default:
        body = []
    }

    next(request.respondWith(body, {
      status: 200,
      statusText: 'OK'
    }))
  })
}
