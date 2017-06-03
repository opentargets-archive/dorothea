rm(list = ls())



home = '~/Google Drive/projects/pathway_activities/DoRothEA/'
setwd(home)
source('CODE/project_data_loads.r')
source('CODE/assos/lib.r')
library(reshape2)




## Load data
# annot samples
a_samples = load_clinics_data_gdsc()

# annot drugs
a_drugs = load_drugpops()


# TF activities
slea_results = get(load('RESULTS/Rdata/TF_ES_scores/gdsc/slea_seq_VIPER_GSVAnorm_ssReg.Rdata'))
m_TFactivities = slea_results$NES


# IC50s
m_IC50drugs = load_IC50s()



# TF-drug assos
r_drug_tf = get(load('RESULTS/Rdata/assos_TF_drugs/VIPER_PANCANCER_statTF_seq_GSVAnorm_lm.Rdata'))


# Genomic Markers
m_GM = load_MoBem('PANCAN')


# TF-drug+GM assos
r_drugGM_tf = read.csv('RESULTS/paper_figures/GarciaAlonsoEtAl_TFcancer_table_S7.csv', stringsAsFactors = F)



# Format Genomic makers label
r_drugGM_tf$GenomicMarker_id = r_drugGM_tf$GenomicMarker
load(file = '~/Google Drive/datasets/jsr-gdsc/R_objects/CellLines_Mo_BEMs/cna_annotations.rdata')
rownames(m_GM)[ grep('cna', rownames(m_GM)) ] = CNAannot$cna_pancancer_id[ match(rownames(m_GM)[ grep('cna', rownames(m_GM)) ], CNAannot$MOBEM_pancancer_id) ]
idx = grep('cna', r_drugGM_tf$GenomicMarker_id)
r_drugGM_tf$GenomicMarker_id[ idx ] = CNAannot$cna_pancancer_id[ match(gsub('_\\(', ' \\(', gsub('_cna', ':cna', r_drugGM_tf$GenomicMarker[ idx ])), CNAannot$MODEM_id) ]
r_drugGM_tf$GenomicMarker[ idx ] = CNAannot$cna_display[ match(gsub('_\\(', ' \\(', gsub('_cna', ':cna', r_drugGM_tf$GenomicMarker[ idx ])), CNAannot$MODEM_id) ]



## Intersect data
# Define shared samples
samples = as.character(Reduce(intersect, list(colnames(m_IC50drugs), colnames(m_TFactivities), a_samples$CosmicID)))


## Save files
# annotation files
a_samples = unique(a_samples[ which(a_samples$CosmicID %in% samples) , c(3,1,5:9,17)])
names(a_samples)[3:5] = c('Primary_Site_GDSC1', 'Primary_Site_GDSC2', 'TCGA_label')
write.table(a_samples, file = 'web/a_samples.txt', sep = '\t', quote=F, col.names=T, row.names=F)
write.table(a_drugs[ a_drugs$DRUG_ID %in% r_drug_tf$Drug_id , c(1,3,4,5,6,28)], file = 'web/a_drugs.txt', sep = '\t', quote=F, col.names=T, row.names=F)


# matrixes
m_TFactivities = m_TFactivities[ , samples ]
colnames(m_TFactivities)[1] = paste('TF\t',  colnames(m_TFactivities)[1], sep = '')
write.table(m_TFactivities, file = 'web/m_tf_activities_gdsc.txt', sep = '\t', quote=F, col.names=T, row.names=T)

m_IC50drugs = m_IC50drugs[ , samples]
colnames(m_IC50drugs)[1] = paste('drug_id\t',  colnames(m_IC50drugs)[1], sep = '')
write.table(m_IC50drugs, file = 'web/m_drug_ic50_gdsc.txt', sep = '\t', quote=F, col.names=T, row.names=T)

m_GM = m_GM[ , samples]
colnames(m_GM)[1] = paste('GenomicMarker_id\t',  colnames(m_IC50drugs)[1], sep = '')
write.table(m_GM, file = 'web/m_GM.txt', sep = '\t', quote=F, col.names=T, row.names=T)


# results
names(r_drug_tf)[12:14] = c('effect_size_(reg_coeff)','pval','fdr')
write.table(r_drug_tf[, c(9,3,2,4,12:14)], file = 'web/r_tf_drug_asso_gdsc.txt', sep = '\t', quote=F, col.names=T, row.names=F)
names(r_drugGM_tf)[1] = 'cancer_type'
write.table(r_drugGM_tf, file = 'web/r_tf_drugGM_asso_gdsc.txt', sep = '\t', quote=F, col.names=T, row.names=F)


