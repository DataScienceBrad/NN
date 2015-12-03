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

/// <reference path="../_references.ts"/>

module powerbi.visuals.sampleDataViews {
    import DataViewTransform = powerbi.data.DataViewTransform;

    export class AirplaneData extends SampleDataViews implements ISampleDataViewsMethods {

        public name: string = "AirplaneData";
        public displayName: string = "Airplane data";

        public visuals: string[] = ['groupedImageSlicer'];

        private airplaneTypes: string[] = ["Boeing 787", "Airbus A380", "Boeing 787", "Airbus A380", "Boeing 787"];
        private tailNumbers: string[] = ["9V-ABC", "9V-EFG", "9V-HIJ", "9V-KLM", "9V-NOP"];
        private states: string[] = ["Immediate", "Preventative", "Immediate", "Immediate", "Preventative"];
        private scores: number[] = [0.9, 0.5, 0.1, 0.7, 0.8];
        private imageURLs: string[] = [
            "https://storage.googleapis.com/powerbi/airplaneB.png",
            "https://storage.googleapis.com/powerbi/airplaneB.png",
            "https://storage.googleapis.com/powerbi/airplaneB.png",
            "https://storage.googleapis.com/powerbi/airplaneB.png",
            "https://storage.googleapis.com/powerbi/airplaneB.png"
        ];

        public getDataViews(): DataView[] {

            let fieldExpr = powerbi.data.SQExprBuilder.fieldExpr({ column: { schema: 's', entity: "table1", name: "Airplane Type" } });

            let categoryIdentities = this.airplaneTypes.map(function(value) {
                let expr = powerbi.data.SQExprBuilder.equal(fieldExpr, powerbi.data.SQExprBuilder.text(value));
                return powerbi.data.createDataViewScopeIdentity(expr);
            });
        
            // Metadata, describes the data columns, and provides the visual with hints
            // so it can decide how to best represent the data
            let dataViewMetadata: powerbi.DataViewMetadata = {
                columns: [
                    {
                        displayName: 'Airplane Type',
                        queryName: 'Airplane Type',
                        roles: {
                            'Airplane Type': true
                        },
                        type: powerbi.ValueType.fromDescriptor({ text: true })
                    },
                    {
                        displayName: 'Tale Number',
                        queryName: 'Tale Number',
                        roles: {
                            'Tale Number': true
                        },
                        type: powerbi.ValueType.fromDescriptor({ text: true })
                    },
                    {
                        displayName: 'State',
                        queryName: 'State',
                        roles: {
                            'State': true
                        },
                        type: powerbi.ValueType.fromDescriptor({ text: true })
                    },
                    {
                        displayName: 'Icon URL',
                        format: "g",
                        queryName: 'Icon URL',
                        roles: {
                            'Icon URL': true
                        },
                        type: powerbi.ValueType.fromDescriptor({ text: true })
                    },
                    {
                        displayName: 'Severity Score',
                        format: "g",
                        isMeasure: true,
                        queryName: 'Severity Score',
                        roles: { 
                            'Severity Score': true 
                        },
                        type: powerbi.ValueType.fromDescriptor({ numeric: true }),
                        objects: { dataPoint: { fill: { solid: { color: 'purple' } } } },
                    },
                ],
                objects: {
                    general: {
                        columns: 1
                    }
                }
            };
            
            let tailFieldExpr = powerbi.data.SQExprBuilder.fieldExpr({ column: { schema: 's', entity: "Tale Number", name: "Tale Number" } });
            let tailIdentities = this.imageURLs.map(function(value) {
                let expr = powerbi.data.SQExprBuilder.equal(tailFieldExpr, powerbi.data.SQExprBuilder.text(value));
                return powerbi.data.createDataViewScopeIdentity(expr);
            });
            
            let stateFieldExpr = powerbi.data.SQExprBuilder.fieldExpr({ column: { schema: 's', entity: "State", name: "State" } });
            let stateIdentities = this.imageURLs.map(function(value) {
                let expr = powerbi.data.SQExprBuilder.equal(stateFieldExpr, powerbi.data.SQExprBuilder.text(value));
                return powerbi.data.createDataViewScopeIdentity(expr);
            });
            
            let imageFieldExpr = powerbi.data.SQExprBuilder.fieldExpr({ column: { schema: 's', entity: "Icon URL", name: "Icon URL" } });
            let imageIdentities = this.imageURLs.map(function(value) {
                let expr = powerbi.data.SQExprBuilder.equal(imageFieldExpr, powerbi.data.SQExprBuilder.text(value));
                return powerbi.data.createDataViewScopeIdentity(expr);
            });
            
            
            let columns: DataViewValueColumn[] = [];            
            
            let airplaneGroups: string[] = _.keys(_.groupBy(this.airplaneTypes));
            for (let i = 0; i < airplaneGroups.length; i++) {
                let scores: number[] = [];

                for (let k = 0; k < this.airplaneTypes.length; k++) {
                    if (airplaneGroups[i] === this.airplaneTypes[k]) {
                        scores[k] = this.scores[k];
                    } else {
                        scores[k] = null;
                    }
                }

                let source = dataViewMetadata.columns[0];
                source.groupName = airplaneGroups[i];
                columns.push({
                    source: source,
                    identity: categoryIdentities[i],
                    values: scores
                });
            }

            let dataValues: DataViewValueColumns = DataViewTransform.createValueColumns(columns, [fieldExpr], dataViewMetadata.columns[0]);
            
            return [{
                metadata: dataViewMetadata,
                categorical: {
                    categories: [
                        {
                            source: dataViewMetadata.columns[1],
                            values: this.tailNumbers,
                            identity: tailIdentities,
                        },
                        {
                            source: dataViewMetadata.columns[2],
                            values: this.states,
                            identity: stateIdentities,
                        },
                        {
                            source: dataViewMetadata.columns[3],
                            values: this.imageURLs,
                            identity: imageIdentities,
                        }
                    ],
                    values: dataValues
                }
            }];
        }

        public randomize(): void {
        }        
    }
}
