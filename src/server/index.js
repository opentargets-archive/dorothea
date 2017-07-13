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
      case 'flow-1/drug-autocomplete-options':
        body = store.getters.flow1DrugAutocompleteOptions()
        break
      case 'flow-1/tf-autocomplete-options':
        body = store.getters.flow1TFAutocompleteOptions()
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

      case 'flow-2/drug-autocomplete-options':
        body = store.getters.flow2DrugAutocompleteOptions(params)
        break
      case 'flow-2/gm-autocomplete-options':
        body = store.getters.flow2GMAutocompleteOptions(params)
        break
      case 'flow-2/ct-autocomplete-options':
        body = store.getters.flow2CTAutocompleteOptions(params)
        break
      case 'flow-2/tf-autocomplete-options':
        body = store.getters.flow2TFAutocompleteOptions(params)
        break
      case 'flow-2/effect-plot':
        body = store.getters.effectPlotData(params.drugId, params.gmId, params.ctId, params.tfId)
        break
      case 'flow-2/tfs-bar-plot':
        body = store.getters.flow2TFsBarPlotData()
        break
      case 'flow-2/triplets-bar-plot':
        body = store.getters.flow2TripletsBarPlotData()
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
