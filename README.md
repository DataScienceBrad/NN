# Microsoft Power BI visuals plus custom visuals by MAQ Software

The Microsoft Power BI visuals project provides high quality data visualizations that you can use to extend [Power BI](https://powerbi.microsoft.com/).  The project contains over 20 visualization types plus custom visuals by MAQ Software, the framework to run them, and the testing infrastructure that enables you to build high quality visualizations.  The framework provides all the interfaces you need to integrate fully with Power BI's selection, filtering, and other UI experiences.  The code is written in [TypeScript](http://www.typescriptlang.org/) so it's easier to build and debug. Everything compiles down to JavaScript and runs in modern web browsers.  The visuals are built using [D3](http://d3js.org/) but you can use your favorite technology like [WebGL](https://en.wikipedia.org/wiki/WebGL), [Canvas](https://en.wikipedia.org/wiki/Canvas_element), or [SVG](https://en.wikipedia.org/wiki/Scalable_Vector_Graphics). This gives you everything you need to build custom visualizations for Power BI.


# Custom Visuals

<br />
<br />

| [Circular Gauge](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/CustomVisuals/Published/CircularGauge/src/visual.ts)   |       [Linear Gauge](https://github.com/maqsoftware/PowerBI-visuals/blob/master/https://en.wikipedia.org/wiki/WebGLsrc/CustomVisuals/Published/LinearGauge/src/visual.ts)     |   [Brick Chart](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/CustomVisuals/Published/BrickChart/src/visual.ts)  |
|----------|---------|------|
|IIllustrate headway toward goals in <br />either a pie or a donut chart <br />format. One color illustrates <br />actual progress and the other <br />displays the target. The <br />percentage shown tracks progress. <br />Text size and ring size are <br />customizable. <br /><br /><br /><br /><br /><br /><br /><br /> <img src="https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Published/Circular%20Gauge/Images/screenshot.png" alt="Circular Gauge" height="268" width="268"> <br /><br /> Coming soon<br />We are working on adding an <br />option to show legends and <br />the value in the visual itself. <br />Currently this info can be <br />seen in the tooltip. | Create at-a-glance visualization <br />to compare your progress against <br />identified goals and warning <br />zones. By allowing you to include <br />multiple data points, the <br />component provides the ability to <br />illustrate trend details, such as <br />monthly or year-to-date completion <br />rates. The pointer notes targets <br />and the colored bar shows the <br />current progress toward those <br />goals. <br /><br/><br/><br /><br /><br /><br /><img src="https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Published/Linear%20Gauge/Images/screenshot.png" alt="Linear Gauge" height="268" width="268"><br /><br /><br /><br /><br /> | Brick Chart consists of 100 <br />squares that are colored according <br />to the percentage breakdown of <br />your datasets. Hover your mouse <br />over a square to bring up a <br />tooltip. The tooltip indicates <br />which dataset the color represents <br />and the percentage value of that <br />category. An optional legend above <br />the chart identifies which <br />datasets correspond with which <br />colors. You may tailor the <br />legend’s title, size and color. <br />You may also customize the chart’s <br />width and height. <br /><br /> <img src="https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Published/Brick%20Chart/Images/screenshot.png" alt="Brick Chart" height="268" width="268"> <br />Coming soon<br />We are working on enabling <br/>report filtering on click <br />of brick.<br /><br /><br /> |


<br />
<br />


| [Trading Chart](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/CustomVisuals/Published/TradingChart/src/visual.ts)   |      [Bowtie Chart](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/CustomVisuals/Published/BowtieChart/src/visual.ts)     |  [Horizontal Funnel](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/CustomVisuals/Published/HorizontalFunnel/src/visual.ts) |
|----------|------------|------|
| Stock Chart displays significant <br />stock price points as colored <br />vertical bars. Low and high price <br />values are represented by grey <br />bars. Open and close price values <br />are shown as either red or green <br />bars, which are superimposed over <br />the low and high values. If a <br />stock’s price dropped the bar will <br />be red, and if the price rose the <br />bar will be green. Prices are <br />listed on the vertical axis and <br />time increments are listed on the <br />horizontal axis. The ranges for <br />prices and time increments are <br />customizable. <br /> <img src="https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Published/Trading%20Chart/Images/TradingChart_Screenshot_410_424.png" alt="Stock Chart" height="268" width="268">  | Bowtie Chart displays <br />categorization of a value by <br />branching out smooth interpolated <br />nodes. The thickness of the branch <br />indicates the weightage of the <br />category. You can display Half <br />Bowtie or Full Bowtie by providing <br />source category or both source and <br />destination categories <br />respectively. Used for displaying <br />the categorization of an <br />aggregated value. <br /><br /><br /><br /><br /> <img src="https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Published/Bowtie%20Chart/Images/BowtieChart_Screenshot_410_424.png" alt="Bowtie Chart" height="268" width="268"> |Horizontal Funnel allows you to <br />visualize a customizable primary <br />measure as colored bars. Use this <br />to display a number of metric <br />types, such as sales stages, time <br />or geographic locations. A second <br />customizable value is displayed <br />beneath the colored bars. This <br />feature provides you the ability <br />to track an additional metric <br />against your primary measure. The <br />component includes the option to <br />create a tool tip, which you may <br />tailor to your specific needs. <br /> <br /><br /><img src="https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Published/Horizontal%20Funnel/Images/HorizontalFunnel_Screenshot_410_424.png" alt="Horizontal Funnel" height="268" width="268"> |

<br />
<br />

| [Ring Chart](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/CustomVisuals/Published/RingChart/src/visual.ts)   |      [JSON Grid](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/CustomVisuals/Published/JSONGrid/src/visual.ts)     |  [Thermometer](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/CustomVisuals/Published/Thermometer/src/visual.ts) |
|----------|------------|------|
| A doughnut charts represent data <br />as slices, where the size of each <br />slice is determined by the slice <br />value relative to the sum of the <br />values of all slices. Each data <br />series that you plot in a doughnut <br />chart adds a ring to the chart. <br />These rings have different colors <br />for easy representation of the <br />data slices in doughnut chart. <br /><br /><img src="https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Published/Ring%20Chart/Images/RingChart_Screenshot_410_424.png" alt="Donut Chart" height="268" width="268"> | Grid allows you to add a paginated <br />grid on the report. It allows you <br />to specify on which column should <br />the grid be sorted by default and <br />in which order. It also allows you <br />to call an API on any column if <br />further processing needs to be <br />done. <br /><br /><br /><br /> <img src="https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Published/JSON%20Grid/Images/screenshot.png" alt="Grid" height="268" width="268"> | Thermometer is used to represent <br />data in thermometer. It could be a <br />good way to represent data when <br />you have the actual value and the <br />target value (maximum threshold). <br /><br /><br /><br /><br /><br /><br /><img src="https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Published/Thermometer/Images/Thermometer_icon_424_410.jpg" alt="Thermometer" height="268" width="268"> |


<br />
<br />

| [Text Wrapper](https://github.com/bandaruabinash/PowerBI-visuals/blob/master/src/Text%20Wrapper/src/visual.ts) |     [KPI Column](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/CustomVisuals/Published/KPIColumn/src/barChart.ts)     |    [KPI Grid](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/CustomVisuals/Published/KPIGrid/src/visual.ts)  |
|--------|------------|------|
| Text Wrapper wrap a static text <br />string (Statement) along with a <br />dynamic text field value which was <br />taken as an input from the <br />dataset. This dynamic field value <br />will update according to the <br />selected filter/slicer keeping the <br />static text intact. The static <br />string needs to be provided by the <br />user which will be appended as “ : <br /><>” after the dynamic field value <br />in the visual resulting the final <br />value in the visual as: “<> : <>” <br /><br /><br /><br /><br /><img src="https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Published/Text%20Wrapper/Images/Screenshot.png" alt="Text wrapper" height="268" width="268"> |  KPI Column is a column chart <br />where each column will behave <br />as an indicator when compared <br />with a line. Column color <br />updates dynamically based on <br />the difference in column height <br />and their respective target <br />line value. Adding common <br />threshold value exists for all <br />columns. For upcoming values, the <br />same target line can be used <br />for forecasting and column will be <br />displayed in separate manner <br />(in translucent color) to show <br />them as forecasted values.<br /><br /><br /><img src="https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Published/KPIColumn/Images/512%20x%20384%20KPI%20Column.png" alt="KPI Column" height="268" width="268"> | KPI Grid displays data in <br />hierarchical order, with options <br />to separate categories and <br />illustrate trends with arrows. <br />You can use arrows to illustrate <br />KPI trends over time, <br />such as year-to-year or <br />quarter-to-quarter. You <br />specify the time periods, <br />making it easy to gauge performance <br />according to internal deadlines <br />and benchmarks.<br /><br /><br /><br /><br /><br /><img src="https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Published/KPIGrid/Images/KPIGrid_512x384.png" alt="KPI Grid" height="268" width="268"> |

<br />
<br />

| [Journey Chart](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/CustomVisuals/Published/JourneyChart/src/visual.ts)   |     [Dynamic Tooltip](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/CustomVisuals/Published/DynamicTooltip/src/visual.ts)      |   [Rotating Tile](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/CustomVisuals/Published/RotatingTile/src/visual.ts)  |
|----------|------------|------|
| Journey Chart transforms dense <br />statistical data into clear networks <br />of categories and relationships. <br />In this intuitive graph, <br />nodes represent categories and <br />vertices represent relationships <br />between categories. The bigger <br />the node or vertex, the <br />larger the value. You can use <br />the visual for numerous scenarios <br />like explaining a process’ flow, <br />uncovering underlying patterns, <br />highlighting subcategories stemming <br />from a single source, showing the <br />connectedness of key categories.<br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><img src="https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Published/JourneyChart/Images/JourneyGraph_512x384.png" alt="Journey Chart" height="268" width="268"> | Attach dynamic tooltips to <br />add insight to a visual. <br />Increase your audience’s understanding <br />of your data by adding <br />dynamic tooltips to your visuals. <br />Most tooltips display static <br />information or images. With <br />Dynamic Tooltip, you can display <br />data fetched from a data source. <br />This function allows you the <br />freedom to create a tooltip that does <br />not require constant adjustment. <br />When your data changes, the <br />tooltip changes too. It’s as <br />easy as that. Dynamic Tooltip <br />also works well with static <br />statements. If you would just like <br />to add some helpful information <br />for your audience, simply enter <br />your text into the display field.<br /><br /><br /><br /><img src="https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Published/Dynamic%20Tooltip/Images/Popover_424x410%20copy%203-8.png" alt="Dynamic Tooltip" height="268" width="268"> | Rotating tile is useful when <br />multiple metrics are required <br />to be displayed but in less <br />real estate space on report.<br />Thus saving space for other <br />important charts. This visual <br />basically is a tile which will <br />display one KPI values at a time <br />and then flip to display other. <br />Each flip can have a new <br />KPI value based on number <br />of KPIs that needs to be <br />displayed. The tile can be <br />rotated either on horizontal <br />axis or vertical axis. For <br />better visibility, end user <br />can set the timer for the <br />tile for flip delay. Additionally <br />this visual has option for <br />providing 3D effect as well <br />which provide additional <br />rotational effect to the tile.<br /><br /><br /><img src="https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Published/Rotating%20Tile/Images/512x384.png" alt="Rotating Tile" height="268" width="268"> |
  

| [Rotating Chart](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/CustomVisuals/Published/RotatingChart/src/barChart.ts)   |     [Quadrant Chart](https://github.com/maqsoftware/PowerBI-visuals/blob/master/src/CustomVisuals/Published/QuadrantChart/src/visual.ts)      |   Lift Chart (Coming soon)  |
|----------|------------|------|
|Automatically flipping chart <br />with a set frequency to <br />display different KPIs in each <br />flip. This is a horizontal bar <br />chart which rotates on the <br />horizontal axis to showcase <br />multiple KPIs with each flip <br />or rotation. It is useful <br />when multiple KPIs or <br />metrics sliced by categories <br />are to be displayed, but in <br />less real estate space on <br />report thus saving space on <br />the report or dashboard. <br />Each flip can have a <br />new value based on the <br />number of KPIs that <br/>need to be displayed. For <br />better visibility and to <br />ensure end user can go <br />through the visual data <br />conveniently, timer can be set <br />for the visual for the flip/<br />rotation delay.<br /><img src="https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Published/Rotating%20Chart/Images/512x284.png" alt="Rotating Chart" height="268" width="268">  | Quadrant chart represents data <br />in separate quadrants to show <br />distribution of data and items <br />that share common traits.<br />Quadrant chart is a <br />bubble chart with a background <br />that is divided into four <br />equal sections. This visual is <br />useful for plotting data <br />that contains three measures <br />using an X-axis, a Y-axis, <br />and a bubble size that <br />represents the value of the <br />third measure.<br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><img src="https://github.com/maqsoftware/PowerBI-visuals/blob/master/documents/Published/Quadrant%20chart/Images/Quadrant%20Chart-%20512%20by%20384.png" alt="Quadrant Chart" height="268" width="268"><br />  | Lift chart is used to <br />show the lift data with <br />respect to ideal data. <br />It is commonly used for <br />prediction models and how <br />different models perform <br />against each other.<br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /> |

<br />
<br />

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
