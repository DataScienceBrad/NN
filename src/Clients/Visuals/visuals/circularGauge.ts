/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved. 
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *   
 *  The above copyright notice and this permission notice shall be included in 
 *  all copies or substantial portions of the Software.
 *   
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

/* Please make sure that this path is correct */
/// <reference path="../_references.ts"/>

module powerbi.visuals {
    //Model
    
    export interface ProgressIndicatorValues {
        actual: number;
        target: number;
        actualColor: string;
        targetColor: string;
        isPie: boolean;
        enableCustomFont: boolean;
        toolTipInfo: TooltipDataItem[];
    }
        
    //object variable which we used in customized color and text through UI options
    export var progressIndicatorProps = {
        general: {
            ActualFillColor: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'ActualFillColor' },
            ComparisonFillColor: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'ComparisonFillColor' },
        },
        custom: {
            show: { objectName: 'custom', propertyName: 'show' },
        },
        labels: {
            color: { objectName: 'labels', propertyName: 'color' },
            labelPrecision: { objectName: 'labels', propertyName: 'labelPrecision' },
        },
        customFontSize: {
            show: { objectName: 'customFontSize', propertyName: 'show' },
            fontSize: { objectName: 'customFontSize', propertyName: 'fontSize' },
        }
    };
    
    //Visual
    export class circularGauge implements IVisual {
        //Variables 
        private svg: D3.Selection;
        private percentage: string;
        public canvas: D3.Selection;
        public group: D3.Selection;
        public groupInner: D3.Selection;
        public group1: D3.Selection;
        public dataView: DataView;
        public data: ProgressIndicatorValues;
        private cardFormatSetting: CardFormatSetting;
        private container: D3.Selection;

        public getDefaultFormatSettings(): CardFormatSetting {
            return {
                showTitle: true,
                textSize: null,
                labelSettings: this.getDefaultLabelSettings(true, 'black', 0),
                wordWrap: false,
            };
        }

        public getDefaultLabelSettings(show, labelColor, labelPrecision) {
            var defaultLabelPrecision = 0;
            var defaultLabelColor = "#777777";
            if (show === void 0) { show = false; }
            var fontSize = 20;

            return {
                show: show,
                precision: labelPrecision || defaultLabelPrecision,
                labelColor: labelColor || defaultLabelColor,
                fontSize: fontSize,
            };
        }

        public static getDefaultData(): ProgressIndicatorValues {
            return {
                actual: 40,
                target: 100,
                actualColor: 'grey',
                targetColor: 'green',
                isPie: false,
                enableCustomFont: false,
                toolTipInfo: [],
            };
        }   	              	

        //One time setup
        //First time it will be called and made the structure of your visual
        public init(options: VisualInitOptions): void {
            this.svg = d3.select(options.element.get(0)).append('svg');
            this.container = this.svg.append('g');

            this.group = this.container.append('g');
            this.group.append('path').attr('id', 'a123');
            this.groupInner = this.container.append('g');
            this.groupInner.append('path').attr('id', 'a1234');
           	this.groupInner.append('text');
            this.group1 = this.container.append('g');
            this.group1.append('text');
        }
        
        //Convert the dataview into its view model
        //All the variable will be populated with the value we have passed
        public static converter(dataView: DataView): ProgressIndicatorValues {

            var data: ProgressIndicatorValues = circularGauge.getDefaultData();

            var values = dataView.categorical.values;

            if (dataView.categorical) {

                if (dataView.metadata && dataView.table.rows[0].length == 2) {
                    if (dataView.metadata.columns[0].roles['ActualValue']) {
                        data.actual = dataView.table.rows[0][0];
                        data.target = dataView.table.rows[0][1];
                    }
                    else {
                        data.actual = dataView.table.rows[0][1];
                        data.target = dataView.table.rows[0][0];
                    }
                }
            }

            return data;//Data object we are returning here to the update function
        }	

        //Drawing the visual	   
        public update(options: VisualUpdateOptions) {
            var dataView = this.dataView = options.dataViews[0];
            var data2 = this.data = circularGauge.converter(dataView); //calling Converter function			
            
            var data = data2.actual;
            var max = data2.target;
            var viewport = options.viewport;
            var height = viewport.height;
            var width = viewport.width;


            this.cardFormatSetting = this.getDefaultFormatSettings();
            var labelSettings = null;

            var objects = this.dataView.metadata.objects;
            if (objects) {
                labelSettings = this.cardFormatSetting.labelSettings;

                labelSettings.labelColor = DataViewObjects.getFillColor(objects, cardProps.labels.color, labelSettings.labelColor);
                labelSettings.precision = DataViewObjects.getValue(objects, cardProps.labels.labelPrecision, labelSettings.precision);

                // The precision can't go below 0
                if (labelSettings.precision != null) {
                    this.cardFormatSetting.labelSettings.precision = (labelSettings.precision >= 0) ? labelSettings.precision : 0;
                }
                this.data.actualColor = DataViewObjects.getFillColor(objects, progressIndicatorProps.general.ActualFillColor, this.data.actualColor);
                this.data.targetColor = DataViewObjects.getFillColor(objects, progressIndicatorProps.general.ComparisonFillColor, this.data.targetColor);
                this.data.isPie = DataViewObjects.getValue(objects, progressIndicatorProps.custom.show, this.data.isPie);
                this.cardFormatSetting.labelSettings.fontSize = DataViewObjects.getValue(objects, progressIndicatorProps.customFontSize.fontSize, this.cardFormatSetting.labelSettings.fontSize);
                this.data.enableCustomFont = DataViewObjects.getValue(objects, progressIndicatorProps.customFontSize.show, false);
            }                       
            
            //this.data.enableCustomFont = true;
            console.log(this.data.enableCustomFont);
            var percentCompleted = (data / max);

            var outerRadius = ((width / 2) < (height / 2)) ? (width / 2) : (height / 2);
            outerRadius = outerRadius - 10;

            percentCompleted = (percentCompleted > 1) ? 1 : ((percentCompleted < 0) ? 0 : percentCompleted);
            this.cardFormatSetting.labelSettings.precision = this.cardFormatSetting.labelSettings.precision < 4 ? this.cardFormatSetting.labelSettings.precision : 4;
            var percentage = (percentCompleted * 100).toFixed(this.cardFormatSetting.labelSettings.precision);
            var fontSize = (this.data.enableCustomFont) ? this.cardFormatSetting.labelSettings.fontSize : (outerRadius / 6);

            var textProperties: powerbi.TextProperties = {
                text: percentage + '%',
                fontFamily: "sans-serif",
                fontSize: fontSize + 'pt'
            };
            var textWidth = powerbi.TextMeasurementService.measureSvgTextWidth(textProperties);
            var textHeight = powerbi.TextMeasurementService.measureSvgTextHeight(textProperties);


            this.svg.attr('width', width)
                .attr('height', height);

            outerRadius = ((((width / 2) - (textWidth / 2)) < ((height / 2) - (textHeight / 2)) ? ((width / 2) - (textWidth / 2)) : ((height / 2) - (textHeight / 2))));
            outerRadius = outerRadius - 30;
            var innerRadius = (outerRadius * 0.9);

            console.log(outerRadius);
            if (this.data.isPie) {
                innerRadius = 0;
            }

            console.log('started');
            console.log(height);
            console.log(width);
            console.log(textHeight);
            console.log(textWidth);
            console.log(outerRadius);

            var arc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius)
                .startAngle(0)
                .endAngle(2 * Math.PI);

            var arc1 = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius)
                .startAngle(0)
                .endAngle(2 * Math.PI * percentCompleted);


            this.group.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
            this.groupInner.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

            this.group.select('#a123')
                .attr('d', arc)
                .attr('fill', this.data.actualColor);

            this.groupInner.select('#a1234')
                .attr('d', arc1)
                .attr('fill', this.data.targetColor);


            if (this.data.enableCustomFont) {
                this.group1
                    .attr('transform', 'translate(' + width / 2 + ',' + ((height / 2) + (fontSize / 2)) + ')');
            } else {
                this.group1
                    .attr('transform', 'translate(' + width / 2 + ',' + ((height / 2) + 3) + ')');
            }

            if (!this.data.isPie || (data == max) || data == 0) {
                this.group1.select("text")
                    .attr('text-anchor', 'middle')
                    .attr('font-size', fontSize + 'pt')
                    .text(percentage + "%")
                    .attr('fill', this.cardFormatSetting.labelSettings.labelColor);
                this.groupInner.select("text")
                    .text('');
            } else {
                var c = arc1.centroid(2 * Math.PI),
                    x = c[0],
                    y = c[1],
                    // pythagorean theorem for hypotenuse
                    h = Math.sqrt(x * x + y * y);

                var y1;
                if (percentCompleted > 0.5)
                    y1 = (((y / h) * outerRadius) + textHeight);
                else
                    y1 = ((y / h) * outerRadius);

                this.groupInner
                    .select("text")
                    .attr('x', ((x / h) * outerRadius))
                    .attr('y', y1)
                    .attr("text-anchor", "start")
                    .attr('font-size', fontSize + 'pt')
                    .text(percentage + "%")
                    .attr('fill', this.cardFormatSetting.labelSettings.labelColor);
                this.group1.select("text")
                    .text('');
            }

            this.data.toolTipInfo[1] = {
                displayName: 'Actual',
                value: this.data.actual + ''
            }
            this.data.toolTipInfo[0] = {
                displayName: 'Target',
                value: this.data.target + ''
            }
            this.data.toolTipInfo[2] = {
                displayName: 'Percentage Remaining',
                value: (100 - parseFloat(percentage)) + '%'
            }
            TooltipManager.addTooltip(this.container, (tooltipEvent: TooltipEvent) => this.data.toolTipInfo, false);//Adding visual tips            	
        }       

        //Free up resources variable which we have declared initially for just better performance
        // TODO
       
       
        // Make visual properties available in the property pane in Power BI
        // values which we can customized from property pane in Power BI                
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var enumeration = new ObjectEnumerationBuilder();
            if (!this.data)
                this.data = circularGauge.getDefaultData();
            if (!this.cardFormatSetting)
                this.cardFormatSetting = this.getDefaultFormatSettings();

            var formatSettings = this.cardFormatSetting;

            switch (options.objectName) {
                case 'general':
                    enumeration.pushInstance({
                        objectName: 'general',
                        displayName: 'General',
                        selector: null,
                        properties: {
                            ActualFillColor: this.data.actualColor,
                            ComparisonFillColor: this.data.targetColor,
                        }
                    });
                    break;
                case 'custom':
                    enumeration.pushInstance({
                        objectName: 'custom',
                        displayName: 'Custom',
                        selector: null,
                        properties: {
                            show: this.data.isPie,

                        }
                    });
                    break;
                case 'customFontSize':
                    enumeration.pushInstance({
                        objectName: 'customFontSize',
                        displayName: 'Custom Font',
                        selector: null,
                        properties: {
                            show: this.data.enableCustomFont,
                            fontSize: this.cardFormatSetting.labelSettings.fontSize,
                        }
                    });
                    break;
                case 'labels':
                    var labelSettingOptions: VisualDataLabelsSettingsOptions;
                    labelSettingOptions = {
                        enumeration: enumeration,
                        dataLabelsSettings: formatSettings.labelSettings,
                        show: true,
                        precision: true,                        
                        //enableCustomFontSize : true,
                    };
                    dataLabelUtils.enumerateDataLabels(labelSettingOptions);
                    break;
            }

            return enumeration.complete();
        }                                         
	           
        //Capabilities what this visualization can do
        public static capabilities: VisualCapabilities = {
            dataRoles: [
                {
                    name: 'ActualValue',// This will be the name of role and we can find element in an object with the role
                    kind: VisualDataRoleKind.Measure,//Type of value
                    displayName: 'Actual Value',// it will display as measure header name
                },
                {
                    name: 'TargetValue',
                    kind: VisualDataRoleKind.Measure,
                    displayName: 'Target Value',
                }
            ],
            objects: {
                general: {
                    displayName: data.createDisplayNameGetter('Visual_General'),
                    properties: {
                        ActualFillColor: {
                            displayName: 'Main Color',
                            type: { fill: { solid: { color: true } } }
                        },
                        ComparisonFillColor: {
                            displayName: 'Comparison Color',
                            type: { fill: { solid: { color: true } } }
                        },
                    },
                },
                custom: {
                    displayName: "Pie Chart",
                    properties: {
                        show: {
                            displayName: data.createDisplayNameGetter('Visual_Show'),
                            type: { bool: true }
                        }
                    }
                },
                customFontSize: {
                    displayName: "Custom Font",
                    properties: {
                        show: {
                            displayName: data.createDisplayNameGetter('Visual_Show'),
                            type: { bool: true }
                        },
                        fontSize: {
                            displayName: data.createDisplayNameGetter('Visual_TextSize'),
                            type: { formatting: { fontSize: true } }
                        },
                    }
                },
                labels: {
                    displayName: powerbi.data.createDisplayNameGetter('Visual_DataPointLabel'),
                    properties: {
                        color: {
                            displayName: powerbi.data.createDisplayNameGetter('Visual_LabelsFill'),
                            type: { fill: { solid: { color: true } } }
                        },
                        labelPrecision: {
                            displayName: powerbi.data.createDisplayNameGetter('Visual_Precision'),
                            type: { numeric: true }
                        },

                    },
                }
            },
            dataViewMappings: [{
                conditions: [
                    { 'ActualValue': { max: 1 }, 'TargetValue': { max: 1 } },//Maximum no. of values we can provide
                ],
                categorical: {
                    values: {
                        select: [
                            { bind: { to: 'ActualValue' } },
                            { bind: { to: 'TargetValue' } }
                        ]
                    },
                },
            }],
            suppressDefaultTitle: false,
        };
    }
}