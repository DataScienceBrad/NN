# Microsoft Power BI visuals plus custom visuals by MAQ Software

The Microsoft Power BI visuals project provides high quality data visualizations that you can use to extend [Power BI](https://powerbi.microsoft.com/).  The project contains over 20 visualization types plus custom visuals by MAQ Software, the framework to run them, and the testing infrastructure that enables you to build high quality visualizations.  The framework provides all the interfaces you need to integrate fully with Power BI's selection, filtering, and other UI experiences.  The code is written in [TypeScript](http://www.typescriptlang.org/) so it's easier to build and debug. Everything compiles down to JavaScript and runs in modern web browsers.  The visuals are built using [D3](http://d3js.org/) but you can use your favorite technology like [WebGL](https://en.wikipedia.org/wiki/WebGL), [Canvas](https://en.wikipedia.org/wiki/Canvas_element), or [SVG](https://en.wikipedia.org/wiki/Scalable_Vector_Graphics). This gives you everything you need to build custom visualizations for Power BI.


# Custom Visuals

### [Circular Gauge](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/Clients/Visuals/visuals/circularGauge.ts)
Illustrate headway toward goals in either a pie or a donut chart format. One color illustrates actual progress and the other displays the target. The percentage shown tracks progress. Text size and ring size are customizable. 
![Circular Gauge](https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Circular%20Gauge/Images/screenshot.png) 

##### Coming soon
We are working on adding an option to show legends and the value in the visual itself. Currently this info can be seen in the tooltip 

### [Linear Gauge](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/Clients/Visuals/visuals/linearGauge.ts)
Create at-a-glance visualization to compare your progress against identified goals and warning zones. By allowing you to include multiple data points, the component provides the ability to illustrate trend details, such as monthly or year-to-date completion rates. The pointer notes targets and the colored bar shows the current progress toward those goals.     
![Linear Gauge](https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Linear%20Gauge/Images/screenshot.png)


### [Brick Chart](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/Clients/Visuals/visuals/Brickchart.ts)
Brick Chart consists of 100 squares that are colored according to the percentage breakdown of your datasets. Hover your mouse over a square to bring up a tooltip. The tooltip indicates which dataset the color represents and the percentage value of that category. An optional legend above the chart identifies which datasets correspond with which colors. You may tailor the legend’s title, size and color. You may also customize the chart’s width and height. 
![Brick Chart](https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Brick%20Chart/Images/screenshot.png)

##### Coming soon
We are working on enabling report filtering on click of brick

### [Trading Chart](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/Clients/Visuals/visuals/stockChart.ts)
Stock Chart displays significant stock price points as colored vertical bars. Low and high price values are represented by grey bars. Open and close price values are shown as either red or green bars, which are superimposed over the low and high values. If a stock’s price dropped the bar will be red, and if the price rose the bar will be green. Prices are listed on the vertical axis and time increments are listed on the horizontal axis. The ranges for prices and time increments are customizable.  
![Stock Chart](https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Trading%20Chart/Images/TradingChart_Screenshot_410_424.png)


### [Bowtie Chart](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/Clients/CustomVisuals/visuals/BowtieChart/BowtieChart.ts)
Bowtie Chart displays categorization of a value by branching out smooth interpolated nodes. The thickness of the branch indicates the weightage of the category. You can display Half Bowtie or Full Bowtie by providing source category or both source and destination categories respectively. Used for displaying the categorization of an aggregated value.     
![Bowtie Chart](https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Bowtie%20Chart/Images/BowtieChart_Screenshot_410_424.png)


### [Horizontal Funnel](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/Clients/CustomVisuals/visuals/horizontalFunnel/HorizontalFunnel.ts)
Horizontal Funnel allows you to visualize a customizable primary measure as colored bars. Use this to display a number of metric types, such as sales stages, time or geographic locations. A second customizable value is displayed beneath the colored bars. This feature provides you the ability to track an additional metric against your primary measure. The component includes the option to create a tool tip, which you may tailor to your specific needs.
![Horizontal Funnel](https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Horizontal%20Funnel/Images/HorizontalFunnel_Screenshot_410_424.png)


### [Ring Chart](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/Clients/CustomVisuals/visuals/donutChart(GMO)/donutChart(GMO).ts)
A doughnut charts represent data as slices, where the size of each slice is determined by the slice value relative to the sum of the values of all slices. Each data series that you plot in a doughnut chart adds a ring to the chart. These rings have different colors for easy representation of the data slices in doughnut chart.
![Donut Chart](https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Ring%20Chart/Images/RingChart_Screenshot_410_424.png)

### [JSON Grid](https://github.com/bandaruabinash/PowerBI-visuals/blob/master/src/Clients/CustomVisuals/visuals/grid/GridNode/src/jsonGrid.js)
Grid allows you to add a paginated grid on the report. It allows you to specify on which column should the grid be sorted by default and in which order. It also allows you to call an API on any column if further processing needs to be done.

![Grid](https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/JSON%20Grid/Images/screenshot.png)

### [Thermometer](https://github.com/bandaruabinash/PowerBI-visuals/blob/master/src/Clients/CustomVisuals/visuals/thermometer/Thermometer/src/visual.ts)
Thermometer is used to represent data in thermometer. It could be a good way to represent data when you have the actual value and the target value (maximum threshold).           
![Thermometer](https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Thermometer/Images/Thermometer_icon_424_410.jpg)

### [Text Wrapper](https://github.com/bandaruabinash/PowerBI-visuals/blob/master/src/Text%20Wrapper/src/visual.ts)
Text Wrapper wrap a static text string (Statement) along with a dynamic text field value which was taken as an input from the dataset. This dynamic field value will update according to the selected filter/slicer keeping the static text intact. The static string needs to be provided by the user which will be appended as “ : <>” after the dynamic field value in the visual resulting the final value in the visual as: “<> : <>”                   
![Text Wrapper](https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Text%20Wrapper/Images/Screenshot.png)

### Lift Chart (Coming soon)
Lift chart is used to show the lift data with respect to ideal data. It is commonly used for prediction models and how different models perform against each other.


# PowerBI Visual Tools (pbiviz) - Installation

Before you can get started you'll need to install the tools. This should only take a few seconds.

## Dependencies

Before you can run (or install) the command line tools you must install NodeJS.

* NodeJS 4.0+ Required (5.0 recommended) - [Download NodeJS](https://nodejs.org)


## Installation
[![Npm Version](https://img.shields.io/npm/v/powerbi-visuals-tools.svg?style=flat)](https://www.npmjs.com/package/powerbi-visuals-tools)
[![Npm Downloads](https://img.shields.io/npm/dm/powerbi-visuals-tools.svg?style=flat)](https://www.npmjs.com/package/powerbi-visuals-tools)  
To install the command line tools simply run the following command

```bash
npm install -g powerbi-visuals-tools
```

To confirm it was installed correctly you can run the command without any paremeters which should display the help screen.

```bash
pbiviz
```

## Server certificate setup

To enable live preview visual assets need to be served on a trusted https server so before you can start you need to install an ssl certificate which will allow visual asssets to load in your web browser. This is a one time setup.

* [How to install the local SSL certificates](https://github.com/Microsoft/PowerBI-visuals/blob/master/tools/CertificateSetup.md) 

## Enable developer visual

To view/test your visual in PowerBI you need to enable the development visual and then you can add it to any report.

* [How to enable the developer visual in PowerBI](https://github.com/Microsoft/PowerBI-visuals/blob/master/tools/DebugVisualSetup.md)

# Running the visuals in this repository 
Select the visual you want to run. Navigate to the root of visual project (the directory containing `pbiviz.json`). Simply run the following commands

```bash
#This will install modules listed in package.json
npm install 

#This will install type definitions listed in typings.json
typings install 

#To run the visual
pbiviz start
```

That's it you are good to go. You can see that the visual is running.

### Copyrights

Copyright (c) 2017 Microsoft and MAQ Software

See the [LICENSE](/LICENSE) file for license rights and limitations (MIT).
