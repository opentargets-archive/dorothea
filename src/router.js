import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

function load (component) {
  return () => System.import(`components/${component}.vue`)
}

export default new VueRouter({
  /*
   * NOTE! VueRouter "history" mode DOESN'T works for Cordova builds,
   * it is only to be used only for websites.
   *
   * If you decide to go with "history" mode, please also open /config/index.js
   * and set "build.publicPath" to something other than an empty string.
   * Example: '/' instead of current ''
   *
   * If switching back to default "hash" mode, don't forget to set the
   * build publicPath back to '' so Cordova builds work again.
   */

  routes: [
    {
      path: '/',
      component: load('Index'),
      children: [
        {
          path: '',
          component: load('Home')
        },
        {
          path: 'investigation/1',
          component: load('Flow1'),
          props: (route) => {
            // default
            let r = 0
            let selected = {
              drug: 'all',
              tf: 'all'
            }
            let clicked = {
              drug: null,
              tf: null
            }

            // override from route params
            if (route.query.route) r = route.query.route
            if (route.query.selectedDrug) selected.drug = parseInt(route.query.selectedDrug)
            if (route.query.selectedTf) selected.tf = route.query.selectedTf
            if (route.query.clickedDrug) clicked.drug = parseInt(route.query.clickedDrug)
            if (route.query.clickedTf) clicked.tf = route.query.clickedTf

            return {
              route: r,
              selected,
              click: clicked
            }
          }
        },
        {
          path: 'investigation/2',
          component: load('Flow2')
        },
        {
          path: 'glossary',
          component: load('Glossary')
        }
      ]
    }, // Default with query
    {
      path: '*',
      component: load('Error404')
    } // Not found
  ]
})
