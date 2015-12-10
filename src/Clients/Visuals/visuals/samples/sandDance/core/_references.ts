//---- NOTE: this file should be directly in the project folder (NOT under "scripts") ----
//---- NOTE #2: this file does NOT need to be referenced by each *.ts file; it will be implicitly referenced by VS/TSC.

//TODO: check if it to need.

/// <reference path="../../../../../Typedefs/vuePlotCore/vuePlotCore.d.ts" />
/// <reference path="../../../../../Typedefs/three.js/three.d.ts" />
/// <reference path="../../../../../Typedefs/gl-matrix/gl-matrix.d.ts" /> 
/// <reference path="../../../../../Typedefs/hammer/hammer.d.ts" />

/// <reference path="vaas/_references.ts" />

//---- this list of TS files is needed to control the order the files in which the files and processed and loaded ----

/// <reference path="shaders/shadersCache.ts" />

/// <reference path="classes/utils.ts" /> 
/// <reference path="classes/dataChanger.ts" />

/// <reference path="glClasses/cubeMesh.ts" /> 
/// <reference path="glClasses/glAttribute.ts" /> 
/// <reference path="glClasses/glUniform.ts" /> 
/// <reference path="glClasses/glUtils.ts" /> 
/// <reference path="glClasses/hitTestRect.ts" /> 
/// <reference path="glClasses/ray.ts" /> 
/// <reference path="glClasses/transformer.ts" /> 
/// <reference path="glClasses/textureMaker.ts" />


/// <reference path="classes/dataLoader.ts" />
/// <reference path="classes/easeFuncs.ts" />
/// <reference path="classes/traceMgr.ts" />
/// <reference path="classes/wdCompare.ts" />


/// <reference path="classes/appMgr.ts" />

/// <reference path="classes/chartFrameHelper.ts" /> 
/// <reference path="classes/cmdMgr.ts" />
/// <reference path="classes/csvScanner.ts" />
/// <reference path="classes/csv.ts" /> 
/// <reference path="classes/dampener.ts" /> 
/// <reference path="classes/dataFrame.ts" />
/// <reference path="classes/boundBoxMgr.ts" />
/// <reference path="classes/dataMgr.ts" />

/// <reference path="chartTypes/baseGlVis.ts" /> 
/// <reference path="chartTypes/chartUtils.ts" />

/// <reference path="chartTypes/columnCount.ts" />
/// <reference path="chartTypes/barCount.ts" />
/// <reference path="chartTypes/barSum.ts" />
/// <reference path="chartTypes/columnSum.ts" /> 
/// <reference path="chartTypes/densityCircle.ts" />
/// <reference path="chartTypes/densityGrid.ts" />

/// <reference path="chartTypes/densityRandom.ts" /> 
/// <reference path="chartTypes/flatCircle.ts" /> 
/// <reference path="chartTypes/flatGrid.ts" /> 
/// <reference path="chartTypes/flatRandom.ts" /> 
/// <reference path="chartTypes/radial.ts" />
/// <reference path="chartTypes/linePlot.ts" />
/// <reference path="chartTypes/violin.ts" /> 
/// <reference path="chartTypes/scatterPlot.ts" /> 
/// <reference path="chartTypes/scatterplot3d.ts" />
/// <reference path="chartTypes/partyGenPlot.ts" />
/// <reference path="chartTypes/scatterPlot.ts" />
/// <reference path="chartTypes/stacksBin.ts" />

/// <reference path="classes/dataView.ts" /> 
/// <reference path="classes/facetHelper.ts" />
/// <reference path="classes/fileAccess.ts" />
/// <reference path="classes/binHelper.ts" />
/// <reference path="classes/binHelperCat.ts" />
/// <reference path="classes/binHelperNum.ts" />
/// <reference path="classes/preloadMgr.ts" />
/// <reference path="classes/shareMgr.ts" />
/// <reference path="classes/slidingWindow.ts" />
/// <reference path="classes/menuInfo.ts" /> 
/// <reference path="classes/transformMgr.ts" /> 
/// <reference path="classes/vector.ts" /> 
/// <reference path="classes/windowMgr.ts" />
/// <reference path="controls/baseControl.ts" />
/// <reference path="controls/transformWheel.ts" />

/// <reference path="partyGen/bestPoisson.ts" />
/// <reference path="partyGen/choroplethHelper.ts" />
/// <reference path="partyGen/colorPalettes.ts" />
/// <reference path="partyGen/frameOrArray.ts" />
/// <reference path="partyGen/shapeMaker.ts" />
/// <reference path="partyGen/container.ts" />
/// <reference path="partyGen/dataDivider.ts" />
/// <reference path="partyGen/squarifyLayout.ts" />
/// <reference path="partyGen/spaceDivider.ts" />