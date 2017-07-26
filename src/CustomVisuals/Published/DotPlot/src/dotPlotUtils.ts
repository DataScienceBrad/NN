/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ''Software''), to deal
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

module powerbi.extensibility.visual {
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

    export module dotPlotUtils {
        export function objectSort(objProperty) {
            let sortOrder = 1;
            if (objProperty[0] === '-') {
                sortOrder = -1;
                objProperty = objProperty.substr(1);
            }

            return function (a, b) {
                let result = (a[objProperty] < b[objProperty]) ? -1 : (a[objProperty] > b[objProperty]) ? 1 : 0;

                return result * sortOrder;
            };
        }

        export function convertToString(str: PrimitiveValue): string {
            if (str || str === 0) {
                return str.toString();
            } else {
                return null;
            }

        }
        export function getDistinctElements(val, i, self) {
            return self.indexOf(val) === i;
        }

        export function returnMax(values: PrimitiveValue[], actualRequired = false): number {
            let max = Math.max.apply(null, values);
            if (actualRequired) {
                return max;
            }
            if (max > 0) {
                max = max * 1.2;
            } else {
                max = max / 1.2;
            }

            return Math.round(max * 100) / 100;
        }

        export function returnMin(values: PrimitiveValue[], actualRequired = false): number {
            let min = Math.min.apply(null, values);
            if (actualRequired) {
                return min;
            }
            if (min < 0) {
                min = min * 1.2;
            } else {
                min = min / 1.2;
            }

            return Math.round(min * 100) / 100;
        }

        export function getColor(d: DotPlotViewModel): string {
            if (d) {
                let legendData = Visual.legendDataPoints.filter(function (legend) {
                    return legend.category == d.categoryColor;
                });

                return legendData.length < 1 ? '#01B8AA' : legendData[0].color;
            } else {
                return '#01B8AA';
            }
        }

        export function getText(d: string): string {
            if (!Visual.catGroupPresent && Visual.xParentPresent) {
                return d.substring(0, d.indexOf('$$$') >= 0 ? d.indexOf('$$$') : 0);
            } else {
                return d.substring(d.indexOf('$$$') >= 0 ? d.indexOf('$$$') + 3 : 0, d.length);
            }
        }

        export function getValue(d: number, yAxisConfig: AxisSettings, format: string): string {
            let primaryFormatterVal = 0;
            if (yAxisConfig.displayUnits === 0) {
                let alternateFormatter = parseInt(d.toString(), 10).toString().length;
                if (alternateFormatter > 9) {
                    primaryFormatterVal = 1e9;
                } else if (alternateFormatter <= 9 && alternateFormatter > 6) {
                    primaryFormatterVal = 1e6;
                } else if (alternateFormatter <= 6 && alternateFormatter > 4) {
                    primaryFormatterVal = 1e3;
                } else {
                    primaryFormatterVal = 10;
                }
            }
            let primaryFormatter = valueFormatter.create({
                format: format,
                value: primaryFormatterVal,
                precision: yAxisConfig.decimalPlaces
            });

            return primaryFormatter.format(d);
        }
    }
}
