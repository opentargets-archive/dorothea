// import Vue from 'vue'
import store from '../store'

// intercept api calls, so that a mock api (with static files can be developed)
// and moved out of the client-side code at a future date if necessary

export default function (Vue) {
  Vue.http.interceptors.push((request, next) => {
    const path = request.url.split('api/')[1]
    const params = request.params
    let body

    console.log(request)

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
      default:
        body = []
    }

    next(request.respondWith(body, {
      status: 200,
      statusText: 'OK'
    }))
  })
}
