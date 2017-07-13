<template>
  <q-layout>
    <dorothea-header slot="header"></dorothea-header>
    <dorothea-navigation slot="navigation"></dorothea-navigation>
    <div id="main-container" class="layout-view bg-light">
      <div class="full-height layout-padding">
        <div class="row justify-center">
          <div class="width-1of1 gt-bg-width-4of5">
            <div class="column">
              <router-view v-if="dataFilesLoaded"></router-view>
              <dorothea-footer></dorothea-footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-layout>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  computed: {
    ...mapGetters(['dataFilesLoaded'])
  }
}
</script>

<style>
div.card div.card-content {
  color: #555;
}
hr {
  height: 2px;
  border: 0;
  background-color: #ccc;
  width: 100%;
  margin: 0;
}

/* for filters */
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
