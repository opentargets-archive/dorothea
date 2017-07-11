<template>
  <dorothea-table-card title="Selected cancer type"
                       description="">

    <thead slot="thead">
      <tr>
        <th>Cancer Type</th>
        <th>{{ ctId }}</th>
      </tr>
    </thead>
    <tbody slot="tbody">
      <tr>
        <td>Long Name</td>
        <td>{{ longNames[ctId] }}</td>
      </tr>
    </tbody>

  </dorothea-table-card>
</template>

<script>
import { mapGetters } from 'vuex'
const longNames = {
  PANCAN: 'Pan-Cancer',
  ALL: 'Acute lymphoblastic leukemia',
  LAML: 'Acute myeloid leukemia',
  ACC: 'Adrenocortical carcinoma',
  BLCA: 'Bladder urothelial carcinoma',
  LGG: 'Brain lower grade glioma',
  BRCA: 'Breast invasive carcinoma',
  CESC: 'Cervical squamous cell carcinoma and endocervical adenocarcinoma',
  CLL: 'Chronic lymphocytic leukemia',
  LCML: 'Chronic myelogenous leukemia',
  COREAD: 'Colon and rectum adenocarcinoa (COAD/READ) ( COREAD )',
  ESCA: 'Esophageal carcinoma',
  GBM: 'Glioblastoma multiforme',
  HNSC: 'Head and neck squamous cell carcinoma',
  KIRC: 'Kidney renal clear cell carcinoma',
  LIHC: 'Liver hepatocellular carcinoma',
  LUAD: 'Lung adenocarcinoma',
  LUSC: 'Lung squamous cell carcinoma',
  DLBC: 'Lymphoid neoplasm diffuse large B-cell lymphoma',
  MB: 'Medulloblastoma',
  MESO: 'Mesothelioma',
  MM: 'Multiple myeloma',
  NB: 'Neuroblastoma',
  OV: 'Ovarian serous cystadenocarcinoma',
  PAAD: 'Pancreatic adenocarcinoma',
  PRAD: 'Prostate adenocarcinoma',
  SKCM: 'Skin cutaneous melanoma',
  SCLC: 'Small cell lung cancer',
  STAD: 'Stomach adenocarcinoma',
  THCA: 'Thyroid carcinoma',
  UCEC: 'Uterine corpus endometrial carcinoma'
}

export default {
  data () {
    return {
      longNames
    }
  },
  computed: {
    ...mapGetters('flow2', ['ctId'])
  }
}
</script>
