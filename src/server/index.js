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
      case 'drug-options':
        body = store.getters.flow2DrugPairs(params.gmId)
        break
      case 'gm-options':
        body = store.getters.flow2GMPairs(params.drugId)
        break
      case 'tf-options':
        body = store.getters.flow2TFPairs(params.drugId, params.gmId)
        break
      case 'box-plot':
        body = store.getters.boxPlotData(params.drugId, params.gmId, params.ctId, params.tfId)
        break
      case 'nested-box-plot':
        body = store.getters.boxPlotData(params.drugId, params.gmId, params.ctId, params.tfId, true)
        break
      case 'simple-sample-plot':
        // TODO: this should take into account the gmId and ctId too
        // ie. will need a store.getters.simpleSamplePlotData method
        body = store.getters.samplePlotData(params.drugId, params.tfId)
        break
      case 'gm-table':
        body = store.getters.gmTableData(params.gmId)
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
