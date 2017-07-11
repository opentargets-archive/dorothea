<template>
  <dorothea-table-card title="Selected transcription factor"
                       description="">

    <thead slot="thead">
      <tr>
        <th>Transcription Factor</th>
        <th>{{ tfId }}</th>
      </tr>
    </thead>
    <!--<tbody slot="tbody">
      <tr>
        <td>Long Name</td>
        <td>{{ longNames[ctId] }}</td>
      </tr>
    </tbody>-->

  </dorothea-table-card>
</template>

<script>
// export default {}
// import Vue from 'vue'
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('flow2', ['tfId'])
  }
}
//   mounted () {
//     const otBestHitSearch = 'http://api.targetvalidation.org/api/latest/private/besthitsearch'
//     const params = {
//       q: this.tfId
//     }
//     const headers = {
//       'Content-Type': 'application/json'
//     }
//     Vue.http.get(otBestHitSearch, {
//       params: params,
//       headers: headers
//     })
//     .then(function (response) {
//       console.log(response)
//       // console.log(response.request.headers)
//       console.log(response.text())
//       // commit('mUpdateCTOptions', response.body)
//     })
//   }
// }
</script>
