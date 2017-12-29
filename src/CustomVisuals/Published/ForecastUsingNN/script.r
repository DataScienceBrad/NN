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

############### Library Declarations ###############
####################################################
#setting localization and language
Sys.setlocale("LC_ALL","English")
#graphics libraries
libraryRequireInstall("plotly")
#forecast libraries
libraryRequireInstall("forecast")

set.seed (100)
###############################
tryCatch({
###############################
#forecast settings
forecastUnits<-10

if(exists("settings_units") && settings_units > 0)
{
    forecastUnits<-settings_units
}

decayRate<-0.009
if(exists("settings_decay") && settings_decay <= 1 && settings_decay >= 0)
{
    decayRate<-settings_decay
}
maxitr<-500
if(exists("settings_maxitr") && settings_maxitr > 0)
{
    maxitr<-settings_maxitr
}

hnodes<-20
if(exists("settings_size") && settings_size >0)
{
    hnodes<-settings_size
}

epochs<-20
if(exists("settings_epochs") && settings_epochs >0)
{
    epochs<-settings_epochs
}

confIntervals<- FALSE
if(exists("settings_confInterval"))
{
    confIntervals<-settings_confInterval
}

confLevels<- 0.80
if(exists("settings_confLevel") && settings_confLevel >= 0 && settings_confLevel <= 1)
{
    confLevels<-settings_confLevel
}

######################################
###########plot settings

title<-''
if(exists("plotSettings_title"))
{
    title<-plotSettings_title
}

plotColor<-"#FFFFFF"
if(exists("plotSettings_plotColor"))
{
    plotColor<-plotSettings_plotColor
}

forecastLineCol<-"#F2C80F"
if(exists("plotSettings_fline"))
{
    forecastLineCol<-plotSettings_fline
}

historyLineCol<-"#01B8AA"
if(exists("plotSettings_hline"))
{
    historyLineCol<-plotSettings_hline
}

forecastLineText<-"predicted"
if(exists("plotSettings_flineText"))
{
    forecastLineText<-plotSettings_flineText
}

historyLineText<-"observed"
if(exists("plotSettings_hlineText"))
{
    historyLineText<-plotSettings_hlineText
}

confCol<-"Gray95"
if(exists("plotSettings_confCol"))
{
    confCol<-plotSettings_confCol
}

ConfText<-"Confidence"
if(exists("plotSettings_confText"))
{
    ConfText<-plotSettings_confText
}
###############################
######### x axis settings######

xTitle<-'X'
if(exists("xaxisSettings_xTitle"))
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
if(exists("xaxisSettings_xGridWidth") && xaxisSettings_xGridWidth < 5 && xaxisSettings_xGridWidth > 0)
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
if(exists("xaxisSettings_xAxisBaseLineWidth") && xaxisSettings_xAxisBaseLineWidth < 11 && xaxisSettings_xAxisBaseLineWidth > 0)
{
    xAxisBaseLineWidth<-xaxisSettings_xAxisBaseLineWidth
}

##############################
######y axis settings ########

yTitle<-'Y'
if(exists("yaxisSettings_yTitle"))
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
if(exists("yaxisSettings_yGridWidth") && yaxisSettings_yGridWidth < 5 && yaxisSettings_yGridWidth > 0)
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
if(exists("yaxisSettings_yAxisBaseLineWidth") && yaxisSettings_yAxisBaseLineWidth < 11 && yaxisSettings_yAxisBaseLineWidth > 0)
{
    yAxisBaseLineWidth<-yaxisSettings_yAxisBaseLineWidth
}

#################################
###############################
###############################
#prepare dataset

feature<-data.frame(Value)
tSeries<-data.frame(Category)
tsStart<-tSeries[1,]
rows<-NROW(tSeries)
tsEnd<-tSeries[rows,]
tsSeries<-0
h<-forecastUnits
##creating list of plot settings#############

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



##############initiating try catch###############

tryCatch({
#form a time series
tsSeries<-ts(data=feature, end = tsEnd, start=tsStart, frequency = 1)
#initating procedure to coerce non date time data into series

pretsSeries<-data.frame(Category,Value)
                        colnames(pretsSeries)<-c("seriesStamps","dataValues")
                        x<-(pretsSeries$seriesStamps)

                        tsSeries<-structure(list(y=c(pretsSeries$dataValues), date=c(x)))

## arguments can be passed to nnet()
fit <- nnetar(tsSeries$y, lambda=0.5)
if(exists('settings_parameterSettings') && (settings_parameterSettings == 'Manual'))
{
fit <- nnetar(tsSeries$y, decay=decayRate, maxit=maxitr, repeats = epochs, size=hnodes, lambda=0.5)
}

#creating sequence
forecastedDates <- seq((tsSeries$date[length(tsSeries$date)]),
                  by=(tsSeries$date[length(tsSeries$date)] - tsSeries$date[length(tsSeries$date)-1]), len=h+1)

forecastedDates<-forecastedDates[-1]
forecastedValues<-forecast(fit,h,PI=confIntervals, level=confLevels)

segStartx<-tsSeries$date[NROW(tsSeries$date)]
segEndx<-forecastedDates[1]
segStarty<-tsSeries$y[NROW(tsSeries$y)]
segEndy<-forecastedValues$mean[1]


###############################
###############################
# plotting for confidence intervals
if(confIntervals==TRUE)
{
    ribX<-c(segStartx,segEndx)
    ribYmin<-c(segStarty, forecastedValues$lower[1])
    ribYmax<-c(segStarty, forecastedValues$upper[1])

    ribbonFrame<-data.frame(forecastedDates,forecastedValues$lower,forecastedValues$upper)
    colnames(ribbonFrame)<-c("xValues","yMin","yMax")
    
plotOutput <- plot_ly() %>%
  add_lines(x = (tsSeries$date), y = tsSeries$y,
            color = I(historyLineCol), 
            name = historyLineText 
            ) %>% 
            add_ribbons(x = ribX, ymin = ribYmin, ymax = ribYmax,color = I(confCol), name = ConfText)%>%
  add_ribbons(x = ribbonFrame$xValues, ymin = ribbonFrame$yMin, ymax = ribbonFrame$yMax, color = I(confCol), name = ConfText)%>%
  add_segments(x = segStartx, xend = segEndx, y = segStarty, yend = segEndy, showlegend = FALSE, color = I(forecastLineCol)) %>%
  add_lines(x = forecastedDates, y = forecastedValues$mean, color = I(forecastLineCol), name = forecastLineText)%>%
  layout(title = title,
         xaxis = xAesthetics, 
         yaxis = yAesthetics,
         margin = list(l = 50,
                       r=0,
                       t=50,
                       b=50),
         plot_bgcolor=plotColor,
         showlegend = FALSE
  )
}
else
{
#plotting without confidence intervals
plotOutput <- plot_ly() %>%
  add_lines(x = (tsSeries$date), y = tsSeries$y,
            color = I(historyLineCol), 
            name = historyLineText 
            ) %>% 

           add_segments(x = segStartx, xend = segEndx, y = segStarty, yend = segEndy, showlegend = FALSE, color = I(forecastLineCol)) %>%
  add_lines(x = forecastedDates, y = forecastedValues$mean, color = I(forecastLineCol), name = forecastLineText)%>%
  layout(title = title,
         xaxis = xAesthetics, 
         yaxis = yAesthetics,
         margin = list(l = 50,
                       r=0,
                       t=50,
                       b=50),
         plot_bgcolor=plotColor,
         showlegend = FALSE
  )
}



#rendering plot to visual device
internalSaveWidget(config(plotOutput, collaborate = FALSE, displaylogo=FALSE), 'out.html');
quit()

},
error=function(e)
{

 tryCatch({
     #initiating date time extraction
                        pretsSeries<-data.frame(Category,Value)
                        colnames(pretsSeries)<-c("seriesStamps","dataValues")
                        x<-as.POSIXct(pretsSeries$seriesStamps)

                        tsSeries<-structure(list(y=c(pretsSeries$dataValues), date=c(x)))


## arguments can be passed to nnet()
fit <- nnetar(tsSeries$y, lambda=0.5)
if(exists('settings_parameterSettings') && (settings_parameterSettings == 'Manual'))
{
fit <- nnetar(tsSeries$y, decay=decayRate, maxit=maxitr, repeats = epochs, size=hnodes, lambda=0.5)
}
#creating date time series for forecast length
forecastedDates <- seq(as.POSIXct(tsSeries$date[length(tsSeries$date)]),
                  by=(tsSeries$date[length(tsSeries$date)] - tsSeries$date[length(tsSeries$date)-1]), len=h+1)

                  forecastedDates<-forecastedDates[-1]

forecastedValues<-forecast(fit,h,PI=confIntervals, level=confLevels)

segStartx<-tsSeries$date[NROW(tsSeries$date)]
segEndx<-forecastedDates[1]
segStarty<-tsSeries$y[NROW(tsSeries$y)]
segEndy<-forecastedValues$mean[1]


###############################
###############################

#plotting with confidence intervals
if(confIntervals==TRUE)
{

    ribX<-c(segStartx,segEndx)
    ribYmin<-c(segStarty, forecastedValues$lower[1])
    ribYmax<-c(segStarty, forecastedValues$upper[1])

    ribbonFrame<-data.frame(forecastedDates,forecastedValues$lower,forecastedValues$upper)
    colnames(ribbonFrame)<-c("xValues","yMin","yMax")

plotOutput <- plot_ly() %>%
  add_lines(x = (tsSeries$date), y = tsSeries$y,
            color = I(historyLineCol), 
            name = historyLineText 
            ) %>% 
            add_ribbons(x = ribX, ymin = ribYmin, ymax = ribYmax,color = I(confCol), name = ConfText)%>%
  add_ribbons(x = ribbonFrame$xValues, ymin = ribbonFrame$yMin, ymax = ribbonFrame$yMax, color = I(confCol), name = ConfText)%>%
   add_segments(x = segStartx, xend = segEndx, y = segStarty, yend = segEndy, showlegend = FALSE, color = I(forecastLineCol)) %>%
  add_lines(x = forecastedDates, y = forecastedValues$mean, color = I(forecastLineCol), name = forecastLineText)%>%
  layout(title = title,
         xaxis = xAesthetics, 
         yaxis = yAesthetics,
         margin = list(l = 50,
                       r=0,
                       t=50,
                       b=50),
         plot_bgcolor=plotColor,
         showlegend = FALSE
  )
}
else
{
    #plotting without confidence intervals
plotOutput <- plot_ly() %>%
  add_lines(x = (tsSeries$date), y = tsSeries$y,
            color = I(historyLineCol), 
            name = historyLineText 
            ) %>% 

  add_segments(x = segStartx, xend = segEndx, y = segStarty, yend = segEndy, showlegend = FALSE, color = I(forecastLineCol)) %>%
  add_lines(x = forecastedDates, y = forecastedValues$mean, color = I(forecastLineCol), name = forecastLineText)%>%
  layout(title = title,
         xaxis = xAesthetics, 
         yaxis = yAesthetics,
         margin = list(l = 50,
                       r=0,
                       t=50,
                       b=50),
         plot_bgcolor=plotColor,
         showlegend = FALSE
  )
}




###############################
###############################
#rendering plot to visual device
internalSaveWidget(config(plotOutput, collaborate = FALSE, displaylogo=FALSE), 'out.html');
quit()

 },
error=function(e)
{
    #catching errors for date time instances
xAesthetics <- list(
     title = sprintf("%s Please enter suitable date time",e),
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
     plotOutput <- plot_ly() %>%
     layout(title = '',
                     xaxis = xAesthetics, 
                     yaxis = yAesthetics)
     internalSaveWidget(plotOutput, 'out.html');
     quit()
})
     
})

},
error=function(e)
{
    #catching error for invalid parameters and anything else
xAesthetics <- list(
     title = sprintf("%s Please use suitable values for input data and parameter",e),
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
     plotOutput <- plot_ly() %>%
     layout(title = '',
                     xaxis = xAesthetics, 
                     yaxis = yAesthetics)
     internalSaveWidget(plotOutput, 'out.html');
     quit()
}
)