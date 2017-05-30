rm(list = ls())



home = '~/Google Drive/projects/pathway_activities/DoRothEA/'
setwd(home)
source('CODE/project_data_loads.r')
source('CODE/assos/lib.r')
library(reshape2)


## Load data
# annot samples
sannot = load_clinics_data_gdsc()

# annot drugs
dannot = load_drugpops()

# TF activities
slea_results = get(load('RESULTS/Rdata/TF_ES_scores/gdsc/slea_seq_VIPER_GSVAnorm_ssReg.Rdata'))
tf_activities = slea_results$NES


# IC50 and correct
ic50 = load_IC50s()
colnames(ic50)[1] = paste('drug_id\t',  colnames(ic50)[1], sep = '')
# ic50_corrected_l = apply(ic50, 1, function(Y)  IC50_gdscANOVA(X = slea_results$NES[1, ], Y = Y, covariates.annot = sannot, lm = T, Ycor = T)$Yres )
# ic50_corrected_df = melt(ic50_corrected_l)
# ic50_corrected_df$sample_id = unlist(sapply(ic50_corrected_l, names))
# ic50_corrected = acast(ic50_corrected_df, L1~sample_id, fill = NA)
# ic50_corrected = ic50_corrected[ rownames(ic50), intersect(colnames(ic50), colnames(ic50_corrected)) ]
# ic50 = ic50[, intersect(colnames(ic50), colnames(ic50_corrected)) ]
# all(which(is.na(ic50)) == which(is.na(ic50_corrected)))


# correct TF activities
tf_activities_corrected = t(apply(tf_activities, 1, function(X)  IC50_gdscANOVA(X = X, Y = ic50[1,], covariates.annot = sannot, lm = T, Ycor = T)$Xres ))
tf_activities_corrected = tf_activities_corrected[ rownames(tf_activities), intersect(colnames(tf_activities), colnames(tf_activities_corrected)) ]
tf_activities = tf_activities[, intersect(colnames(tf_activities), colnames(tf_activities_corrected)) ]
all(which(is.na(tf_activities)) == which(is.na(tf_activities_corrected)))





# TF assos
load('RESULTS/Rdata/assos_TF_drugs/VIPER_PANCANCER_statTF_seq_GSVAnorm_lm.Rdata')



## Intersect data
# Define shared samples
samples = as.character(Reduce(intersect, list(colnames(ic50), colnames(tf_activities), sannot$CosmicID)))


## Save files
sannot = unique(sannot[ which(sannot$CosmicID %in% samples) , c(3,1,5:9,17)])
names(sannot)[3:5] = c('Primary_Site_GDSC1', 'Primary_Site_GDSC2', 'TCGA_label')
write.table(sannot, file = 'web/a_samples.txt', sep = '\t', quote=F, col.names=T, row.names=F)
write.table(dannot[ dannot$DRUG_ID %in% TF_drug_associations$Drug_id , c(1,3,4,5,6,28)], file = 'web/a_drugs.txt', sep = '\t', quote=F, col.names=T, row.names=F)
colnames(tf_activities)[1] = paste('TF\t',  colnames(tf_activities)[1], sep = '')
write.table(tf_activities, file = 'web/m_tf_activities_gdsc.txt', sep = '\t', quote=F, col.names=T, row.names=T)
write.table(ic50[, samples], file = 'web/m_drug_ic50_gdsc.txt', sep = '\t', quote=F, col.names=T, row.names=T)
# write.table(ic50_corrected[, samples], file = 'web/m_drug_ic50corrected_gdsc.txt', sep = '\t', quote=F, col.names=T, row.names=T)
names(TF_drug_associations)[12:14] = c('effect_size_(reg_coeff)','pval','fdr')
write.table(TF_drug_associations[, c(9,3,2,4,12:14)], file = 'web/r_tf_drug_asso_gdsc.txt', sep = '\t', quote=F, col.names=T, row.names=F)


