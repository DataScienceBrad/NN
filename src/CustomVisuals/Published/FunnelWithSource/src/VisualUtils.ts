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
    import ValueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

    export module VisualUtils {
        // tslint:disable-next-line:no-any
        export function objectSort(objProperty: any): any {
            let sortOrder: number = 1;
            if (objProperty[0] === '-') {
                sortOrder = -1;
                objProperty = objProperty.substr(1);
            }

            // tslint:disable-next-line:no-any
            return function (a: any, b: any): number {
                const result: number = (a[objProperty] < b[objProperty]) ? -1 : (a[objProperty] > b[objProperty]) ? 1 : 0;

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
        // tslint:disable-next-line:no-any
        export function getDistinctElements(val: any, i: any, self: any): boolean {
            return self.indexOf(val) === i;
        }

        export function returnMax(values: PrimitiveValue[], actualRequired: boolean = false): number {
            let max: number = Math.max.apply(null, values);
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

        export function returnMin(values: PrimitiveValue[], actualRequired: boolean = false): number {
            let min: number = Math.min.apply(null, values);
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

        export function getFormattedData(
            dataValue: number, format: string,
            displayUnits: number, decimalPlaces: number, maxValue: number): string {
            let formattedValue: string = '';
            let formatterVal: number = displayUnits;

            if (displayUnits === 0) {
                const alternateFormatter: number = parseInt(maxValue.toString(), 10).toString().length;
                if (alternateFormatter > 9) {
                    formatterVal = 1e9;
                } else if (alternateFormatter <= 9 && alternateFormatter > 6) {
                    formatterVal = 1e6;
                } else if (alternateFormatter <= 6 && alternateFormatter > 4) {
                    formatterVal = 1e3;
                } else {
                    formatterVal = 10;
                }
            }

            const formatter: utils.formatting.IValueFormatter = ValueFormatter.create({
                format: format,
                value: formatterVal,
                precision: decimalPlaces
            });
            formattedValue = formatter.format(dataValue);

            return formattedValue;
        }
    }
}
