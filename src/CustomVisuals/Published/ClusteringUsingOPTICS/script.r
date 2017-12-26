# Copyright (c) MAQ Software.  All rights reserved.

# Third Party Programs. This software enables you to obtain software applications from other sources. 
# Those applications are offered and distributed by third parties under their own license terms.
# MAQ Software is not developing, distributing or licensing those applications to you, but instead, 
# as a convenience, enables you to use this software to obtain those applications directly from 
# the application providers.
# By using the software, you acknowledge and agree that you are obtaining the applications directly
# from the third party providers and under separate license terms, and that it is your responsibility to locate, 
# understand and comply with those license terms.
# Microsoft grants you no license rights for third-party software or applications that is obtained using this software.

#
# WARNINGS:   
#
# CREATION DATE: 06/12/2017
#
# LAST UPDATE: --/--/---
#
# VERSION: 3.0.0
#
# R VERSION TESTED: 3.4.2
# 
# AUTHOR: MAQ Software

source('./r_files/flatten_HTML.r')
# graphics libraries
libraryRequireInstall("ggplot2");
libraryRequireInstall("plotly");
#clustering libraries
libraryRequireInstall("dbscan");


############################################

#optics clustering
version<-packageVersion("dbscan")

tryCatch({
epsilon<-1
if(exists("clusterSettings_epsilon") && clusterSettings_epsilon > 1)
{
  epsilon<-clusterSettings_epsilon
}

minptsClust<-10
if(exists("clusterSettings_minptsClust") && clusterSettings_minptsClust > 1)
{
  minptsClust<-clusterSettings_minptsClust
}

steepThres<-0.08
if(exists("clusterSettings_steepThres") && clusterSettings_steepThres > 0 && clusterSettings_steepThres < 1)
{
  steepThres<-clusterSettings_steepThres
}

steepThres <- as.numeric(steepThres) 
####################################################
plotColor<-"#FFFFFF"
if(exists("plotSettings_plotColor"))
{
  plotColor<-plotSettings_plotColor
}
###############################

##################################################
xdataFrame<-data.frame(Value1)
ydataFrame<-data.frame(Value2)

### x axis settings######

xTitle <- names(xdataFrame)[1]
if(exists("xaxisSettings_xTitle") && xaxisSettings_xTitle!= '')
{
    xTitle<-xaxisSettings_xTitle
}

xZeroline<-TRUE
if(exists("xaxisSettings_xZeroline"))
{
    xZeroline<-xaxisSettings_xZeroline
}

xLabels<-TRUE
if(exists("xaxisSettings_xLabels"))
{
    xLabels<-xaxisSettings_xLabels
}

xGrid<-TRUE
if(exists("xaxisSettings_xGrid"))
{
    xGrid<-xaxisSettings_xGrid
}

xGridCol<-"#BFC4C5"
if(exists("xaxisSettings_xGridCol"))
{
    xGridCol<-xaxisSettings_xGridCol
}

xGridWidth<-0.1
if(exists("xaxisSettings_xGridWidth") && xaxisSettings_xGridWidth <= 5 && xaxisSettings_xGridWidth > 0)
{
    xGridWidth<-xaxisSettings_xGridWidth
}

xAxisBaseLine<-TRUE
if(exists("xaxisSettings_xAxisBaseLine"))
{
    xAxisBaseLine<-xaxisSettings_xAxisBaseLine
}

xAxisBaseLineCol<-"#000000"
if(exists("xaxisSettings_xAxisBaseLineCol"))
{
    xAxisBaseLineCol<-xaxisSettings_xAxisBaseLineCol
}

xAxisBaseLineWidth<-4
if(exists("xaxisSettings_xAxisBaseLineWidth") && xaxisSettings_xAxisBaseLineWidth <= 11 && xaxisSettings_xAxisBaseLineWidth > 0)
{
    xAxisBaseLineWidth<-xaxisSettings_xAxisBaseLineWidth
}

##############################
####y axis settings ########

yTitle <- names(ydataFrame)[1]
if(exists("yaxisSettings_yTitle") && yaxisSettings_yTitle!='')
{
    yTitle<-yaxisSettings_yTitle
}

yZeroline<-TRUE
if(exists("yaxisSettings_yZeroline"))
{
    yZeroline<-yaxisSettings_yZeroline
}

yLabels<-TRUE
if(exists("yaxisSettings_yLabels"))
{
    yLabels<-yaxisSettings_yLabels
}

yGrid<-TRUE
if(exists("yaxisSettings_yGrid"))
{
    yGrid<-yaxisSettings_yGrid
}

yGridCol<-"#BFC4C5"
if(exists("yaxisSettings_yGridCol"))
{
    yGridCol<-yaxisSettings_yGridCol
}

yGridWidth<-0.1
if(exists("yaxisSettings_yGridWidth") && yaxisSettings_yGridWidth <= 5 && yaxisSettings_yGridWidth > 0)
{
    yGridWidth<-yaxisSettings_yGridWidth
}

yAxisBaseLine<-TRUE
if(exists("yaxisSettings_yAxisBaseLine"))
{
    yAxisBaseLine<-yaxisSettings_yAxisBaseLine
}

yAxisBaseLineCol<-"#000000"
if(exists("yaxisSettings_yAxisBaseLineCol"))
{
    yAxisBaseLineCol<-yaxisSettings_yAxisBaseLineCol
}

yAxisBaseLineWidth<-4
if(exists("yaxisSettings_yAxisBaseLineWidth") && yaxisSettings_yAxisBaseLineWidth <= 11 && yaxisSettings_yAxisBaseLineWidth > 0)
{
    yAxisBaseLineWidth<-yaxisSettings_yAxisBaseLineWidth
}

############################################################
############################################################
###################plot setting lists#############

xAesthetics <- list(
  title = xTitle,
  zeroline = xZeroline,
  showticklabels = xLabels,
  showgrid = xGrid,
  gridcolor = toRGB(xGridCol),
  gridwidth = xGridWidth,
  showline = xAxisBaseLine,
  linecolor=toRGB(xAxisBaseLineCol),
  linewidth=xAxisBaseLineWidth
)
yAesthetics <- list(
  title = yTitle,
  zeroline = yZeroline,
  showticklabels = yLabels,
  showgrid = yGrid,
  gridcolor = toRGB(yGridCol),
  gridwidth = yGridWidth,
  showline = yAxisBaseLine,
  linecolor=toRGB(yAxisBaseLineCol),
  linewidth=yAxisBaseLineWidth
)


############################################################
############################################################
############################################################
###################methods to handle missing values and tooltips#########

getmode <- function(v) {
  uniqv <- unique(v)
  uniqv[which.max(tabulate(match(v, uniqv)))]
}

getTooltips<- function(){
  xInfo1<-Value1[1]
  yInfo1<-Value2[1]
  colnames(xInfo1)<-c("X")
  colnames(yInfo1)<-c("Y")
  xInfo1<-data.frame(xInfo1)
  yInfo1<-data.frame(yInfo1)
  if(exists("Tooltip"))
  {
    tooltip1<-Tooltip
    x <- cbind(
      x = finalXvector,
      y = finalYvector,
      tooltip=tooltip1,
      xInfo=xInfo1,
      yInfo=yInfo1
    )
  }
  else{
    x <- cbind(
      x = finalXvector,
      y = finalYvector,
      xInfo=xInfo1,
      yInfo=yInfo1
    )
  }

  return (x)
}

###############################################################
#handle missing values and generalize different formats of data

nColumnsY<-NCOL(ydataFrame)
nColumnsX<-NCOL(xdataFrame)
nRowsY<-NROW(ydataFrame)
nRowsX<-NROW(xdataFrame)

ynumericCheck<-sapply(ydataFrame, is.numeric)
xnumericCheck<-sapply(xdataFrame, is.numeric)

for(iCounter in 1:nColumnsY)
{
  if(ynumericCheck[iCounter]==FALSE)
  {
    modeValue <- getmode(ydataFrame[,iCounter])
    for(jCounter in 1:nRowsY)
    {
      if(is.na(ydataFrame[jCounter,iCounter]))
      {
        ydataFrame[jCounter,iCounter]<-modeValue
      }
    }
    uniqueLevels<-levels(ydataFrame[,iCounter])
    levels(ydataFrame[,iCounter])<-1:NROW(uniqueLevels)
    ydataFrame[,iCounter] <- as.numeric(as.character(ydataFrame[,iCounter]))
  }
  
  if(ynumericCheck[iCounter]==TRUE)
  {
    meanValue <- mean(ydataFrame[,iCounter], trim =0 , na.rm=TRUE)
    for(jCounter in 1:nRowsY)
    {
      if(is.na(ydataFrame[jCounter,iCounter]))
      {
        ydataFrame[jCounter,iCounter]<-meanValue
      }
    }
  }
}


for(iCounter in 1:nColumnsX)
{
  if(xnumericCheck[iCounter]==FALSE)
  {
    xModeValue <- getmode(xdataFrame[,iCounter])
    for(jCounter in 1:nRowsX)
    {
      if(is.na(xdataFrame[jCounter,iCounter]))
      {
        xdataFrame[jCounter,iCounter]<-xModeValue
      }
    }
    uniqueLevels<-levels(xdataFrame[,iCounter])
    levels(xdataFrame[,iCounter])<-1:NROW(uniqueLevels)
    xdataFrame[,iCounter] <- as.numeric(as.character(xdataFrame[,iCounter]))
  }
  
  if(xnumericCheck[iCounter]==TRUE)
  {
    xMeanValue <- mean(xdataFrame[,iCounter], trim =0 , na.rm=TRUE)
    for(jCounter in 1:nRowsX)
    {
      if(is.na(xdataFrame[jCounter,iCounter]))
      {
        xdataFrame[jCounter,iCounter]<-xMeanValue
      }
    }
  }
}

############################################################
############################################################
############################################################
###################data Scaling#############################

if (exists("clusterSettings_scaling") && clusterSettings_scaling) {
  
  scaledYdata<-scale(ydataFrame)
  scaledXdata<-scale(xdataFrame)

} else {
    maxYData<-max(ydataFrame)
    maxXData<-max(xdataFrame)
    maxXYData<-max(c(maxYData, maxXData))
    
    epsilon<-epsilon * ((maxXYData * 5) / 100)

    scaledYdata<-ydataFrame
    scaledXdata<-xdataFrame
}

scaledYdata<-data.frame(scaledYdata)
scaledXdata<-data.frame(scaledXdata)

############################################################
############################################################
############################################################
###PCA for dimensions both axis in case dimensions are >2###

if(NCOL(scaledYdata)>1)
{
  yVectorPCA<-prcomp(t(scaledYdata))
  yVectorPCA<-yVectorPCA$rotation
  yVectorPCA<-data.frame(yVectorPCA)
  yVectorPCA<-yVectorPCA[1]
}
if(NCOL(scaledXdata)>1)
{
  xVectorPCA<-prcomp(t(scaledXdata))
  xVectorPCA<-xVectorPCA$rotation
  xVectorPCA<-data.frame(xVectorPCA)
  xVectorPCA<-xVectorPCA[1]
}

############################################################
############################################################
############################################################
#################data binding###############################
if(NCOL(scaledYdata)>1)
{
finalYvector<-yVectorPCA
}
if(NCOL(scaledXdata)>1)
{
finalXvector<-xVectorPCA
}
if(NCOL(scaledYdata)==1)
{
  finalYvector<-scaledYdata
}
if(NCOL(scaledXdata)==1)
{
  finalXvector<-scaledXdata
}

colnames(finalYvector)<-c("y")
colnames(finalXvector)<-c("x")

#Data binding
x <- cbind(
    x = finalXvector,
    y = finalYvector
)

############################################################
############################################################
############################################################
#########clustering and plotting implementations############

# generating color palette for clusters by using Power BI Colors
colPalette<-c("#DFBFDF","#3599B8","#A66999","#FE9666","#8AD4EB","#F2C80F","#FD625E","#01B8AA")

############################################################
if(version<1){
  # handling for older libraries (used in Power BI app sevice)
res <- optics(x, eps = epsilon, minPts = minptsClust)
res <- opticsXi(res, xi = steepThres)
############################################################
}
else{
  # handling for newer libraries (Power BI desktop)
  res <- optics(x, eps = epsilon, minPts = minptsClust)
  res <- extractXi(res, xi = steepThres)
}

########## Function for hull plot ############
cl<-res
col<-colPalette
cex = 0.5
hull_lwd = 1
hull_lty = 1
solid = TRUE
alpha = .2
main = "OPTICS"
  
### extract clustering (keep hierarchical xICSXi structure)
if(is(cl, "xics") || "clusters_xi" %in% names(cl)) {
  clusters_xi <- cl$clusters_xi
  cl_order <- cl$order
} else clusters_xi <- NULL
  
if(is.list(cl)) cl <- cl$cluster
if(!is.numeric(cl)) stop("Could not get any cluster assigned as per the values and parameters entered.")
  
if(is.null(col)) col <- palette()
if(max(cl)+1L > length(col)) warning("Not enough colors to display clusters. Some colors may get reused.")
  
if(is.null(hull_lwd) || is.na(hull_lwd) || hull_lwd == 0) {
  hull_lwd <- 1
  border <- NA
}
  
if(is(cl, "xics") || "clusters_xi" %in% names(cl)) {
  ## this is necessary for larger datasets: Ensure largest is plotted first
  clusters_xi <- clusters_xi[order(-(clusters_xi$end-clusters_xi$start)),] # Order by size (descending)
  ci_order <- clusters_xi$cluster_id
} else { ci_order <- 1:max(cl) }
  
pointCol<-col[cl%%length(col) +1L]
p<-ggplot()
    
col_poly <- adjustcolor(col)
border <- col
  
for(i in 1:length(ci_order)) {
    
### use all the points for xICSXi's hierarchical structure
  if(is.null(clusters_xi)) {
    d <- x[cl==i,]
  } 
  else { 
    d <- x[cl_order[clusters_xi$start[i] : clusters_xi$end[i]],] 
  }
    
    ch <- chull(d)
    ch <- c(ch, ch[1])
    
    polyCol<-col_poly[ci_order[i] %% length(col_poly) +1L]
    borderCol<-border[ci_order[i] %% length(col_poly) +1L]
    
      
     p<-p+geom_polygon(data=d[ch,], aes(x=x, y=y), fill= polyCol, colour=borderCol, alpha=0.2)
      
}
x<-getTooltips()
if(exists("Tooltip")){
  p<-p+geom_point(data = x, aes(x =x,y = y, xTooltip =X, yTooltip=Y, userTooltip=Tooltip), colour = pointCol)
  p<-ggplotly(p, tooltip=c('xTooltip','yTooltip','userTooltip'))%>%
  layout(title = '',
         xaxis = xAesthetics, 
         yaxis = yAesthetics,
         margin = list(l = 50,
                       r=0,
                       t=50,
                       b=50),
         plot_bgcolor=plotColor
  )
}
else{
  p<-p+geom_point(data = x, aes(x =x,y = y, xTooltip =X, yTooltip=Y), colour = pointCol)
  p<-ggplotly(p, tooltip=c('xTooltip','yTooltip'))%>%
  layout(title = '',
         xaxis = xAesthetics, 
         yaxis = yAesthetics,
         margin = list(l = 50,
                       r=0,
                       t=50,
                       b=50),
         plot_bgcolor=plotColor
  )
}

############################################################

#printing the plot on visual device
internalSaveWidget(config(p, collaborate = FALSE, displaylogo=FALSE), 'out.html');
quit()
},
error=function(e)
{
  #catching error and displaying message
  xAesthetics <- list(
     title = sprintf("Invalid parametric values/essential fields missing. %s",e),
     zeroline = FALSE,
     showline = FALSE,
     showticklabels = FALSE,
     showgrid = FALSE
     )
     yAesthetics <- list(
     title = "",
     zeroline = FALSE,
     showline = FALSE,
     showticklabels = FALSE,
     showgrid = FALSE
     )
     p <- plot_ly() %>%
     layout(title = '',
                     xaxis = xAesthetics, 
                     yaxis = yAesthetics)
     internalSaveWidget(p, 'out.html');
     quit()
}
)