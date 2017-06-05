<template>
  <q-layout>
    <dorothea-header slot="header"></dorothea-header>
    <dorothea-navigation slot="navigation"></dorothea-navigation>
    <div id="main-container" class="layout-view bg-light">
      <div class="full-height layout-padding">
        <div class="row justify-center">
          <div class="width-1of1 gt-md-width-4of5">
            <div class="column">
              <router-view></router-view>
              <dorothea-footer></dorothea-footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-layout>
</template>
