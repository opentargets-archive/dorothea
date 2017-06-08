<template>
  <div class="row justify-between items-center gutter">
    <div class="row items-center gutter">
      <div>
        <a href="http://www.ebi.ac.uk" target="_blank">
          <img src="../assets/ebi_195x60.png" alt="European Bioinformatics Institute" width="195px" height="60px">
        </a>
      </div>
      <div>
        <a href="https://www.targetvalidation.org/" target="_blank">
          <img src="../assets/CTI_OT_Primary_Logo_RGB.svg" alt="Open Targets" width="200px" height="75px">
        </a>
      </div>
    </div>
    <div class="text-right light-paragraph">
      <div>Version {{ version }}</div>
      <!--<div>Copyright © 2017</div>-->
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // eslint-disable-next-line no-undef
      version: VERSION
    }
  }
}
</script>
