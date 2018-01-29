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
# AUTHOR: MAQ Softwaqre

source('./r_files/flatten_HTML.r')

############### Library Declarations ###############
## Plotting libraries 
libraryRequireInstall("ggplot2");
libraryRequireInstall("plotly");
## Datastream parsing library
libraryRequireInstall("magrittr");
## HTML function and output facilitator libraries
libraryRequireInstall("htmlwidgets");
libraryRequireInstall("XML");
####################################################

################### Actual code ####################

##Error handeling
tryCatch({

##Defining properties
upColor = '#00ba38'
if(exists("SlopeColor_upColor")){
    upColor = SlopeColor_upColor
}
downColor = '#f8766d'
if(exists("SlopeColor_downColor")){
    downColor = SlopeColor_downColor
}
neutralColor = '#F2C80F'
if(exists("SlopeColor_neutralColor")){
    neutralColor = SlopeColor_neutralColor
}
intercept1Title<-colnames(measure[1])
if(exists("intercept_intercept1Title") && intercept_intercept1Title != ''){
    intercept1Title = intercept_intercept1Title
}
intercept2Title<-colnames(measure[2])
if(exists("intercept_intercept2Title") && intercept_intercept2Title != ''){
    intercept2Title = intercept_intercept2Title
}
intercept1Color = 'black'
if(exists("intercept_intercept1Color")){
    intercept1Color = intercept_intercept1Color
}
intercept2Color = 'black'
if(exists("intercept_intercept2Color")){
    intercept2Color = intercept_intercept2Color
}
yTitle = 'Trend'
if(exists("yAxis_yTitle") && yAxis_yTitle != ''){
    yTitle = yAxis_yTitle
}
yGrid = FALSE
if(exists("yAxis_yGrid")){
    yGrid = yAxis_yGrid
}
yGridCol = "Gray50"
if(exists("yAxis_yGridCol")){
    yGridCol = yAxis_yGridCol
}


#Prepare data
categoryName = c(category)
value1 = c(measure[1])
value2 = c(measure[2])
df = data.frame(categoryName,value1,value2)
colnames(df) <- c("categoryName", "value1", "value2")
left_label <- paste(df$categoryName, df$value1,sep=", ")
right_label <- paste(df$categoryName, df$value2,sep=", ")
df$class <- ifelse((df$value2 - df$value1) < 0, "Down", (ifelse((df$value2 - df$value1) == 0, "Neutral", "Up")))
x<-geom_segment(aes(text =paste(df$categoryName), x=1, xend=2, y=value1, yend=value2, col=class), size=.75, show.legend=F)

#Plot
plotOutput <- ggplot(df) + x + 
                  geom_vline(xintercept=1, linetype="dashed", size=.1, color=I(intercept1Color)) + 
                  geom_vline(xintercept=2, linetype="dashed", size=.1, color=I(intercept2Color)) +
                  scale_color_manual(labels = c("Up", "Down", "Neutral"), 
                                     values = c("Up"=upColor, "Down"=downColor, "Neutral"=neutralColor)) +  # color of lines
                  labs(x="", y=yTitle) +  # Axis labels
                  xlim(.5, 2.5) + ylim(0,(1.1*(max(df$value1, df$value2))))  # X and Y axis limits

#Add texts
plotOutput <- plotOutput + geom_text(label=left_label, y=df$value1, x=rep(.78, NROW(df)), hjust=-0.1, size=3.5)
plotOutput <- plotOutput + geom_text(label=right_label, y=df$value2, x=rep(2.22, NROW(df)), hjust=-0.1, size=3.5)
plotOutput <- plotOutput + geom_text(label=intercept1Title, x=.78, y=1.1*(max(df$value1, df$value2)), hjust=1.2, size=5)  # title
plotOutput <- plotOutput + geom_text(label=intercept2Title, x=2.22, y=1.1*(max(df$value1, df$value2)), hjust=-0.1, size=5)  # title

#Minify theme
plotOutput <- plotOutput + theme(panel.background = element_blank())
plotOutput <- plotOutput + theme(axis.ticks = element_blank())
plotOutput <- plotOutput + theme(axis.text.x = element_blank())
plotOutput <- plotOutput + theme(panel.border = element_blank())

if(yGrid==TRUE)
{
plotOutput <- plotOutput + theme(panel.grid.major.y = element_line(colour = I(yGridCol), size=0.25))
plotOutput <- plotOutput + theme(panel.grid.minor.y = element_line(colour = I(yGridCol), size=0.25))
}

############# Create and save widget ###############
plotOutput = ggplotly(plotOutput, tooltip=NULL);

disabledButtonsList <- list('hoverCompareCartesian')
plotOutput$x$config$modeBarButtonsToRemove = disabledButtonsList

internalSaveWidget(config(plotOutput, collaborate = FALSE, displaylogo=FALSE), 'out.html');
######################################################
},
error = function(e) {


         xLayout <- list(
     title = sprintf("Please provide correct input data"),
     zeroline = FALSE,
     showline = FALSE,
     showticklabels = FALSE,
     showgrid = FALSE
     )
     yLayout <- list(
     title = "",
     zeroline = FALSE,
     showline = FALSE,
     showticklabels = FALSE,
     showgrid = FALSE
     )
     plotOutput <- plot_ly() %>%
     layout(title = '',
                     xaxis = xLayout, 
                     yaxis = yLayout)
     internalSaveWidget(plotOutput, 'out.html');
     quit()

}
)