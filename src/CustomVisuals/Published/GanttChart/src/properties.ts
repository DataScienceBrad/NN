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

module powerbi.extensibility.visual {

    // tslint:disable-next-line:typedef
    export const ganttProperties = {
        general: {
            groupTasks: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'groupTasks' }
        },
        barColor: {
            defaultColor: <DataViewObjectPropertyIdentifier>{ objectName: 'barColor', propertyName: 'defaultColor' },
            showall: <DataViewObjectPropertyIdentifier>{ objectName: 'barColor', propertyName: 'showall' },
            fillColor: <DataViewObjectPropertyIdentifier>{ objectName: 'barColor', propertyName: 'fillColor' }
        },
        legend: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'show' },
            position: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'position' },
            showTitle: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'showTitle' },
            titleText: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'titleText' },
            labelColor: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'labelColor' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'legend', propertyName: 'fontSize' }
        },
        taskLabels: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'taskLabels', propertyName: 'show' },
            fill: <DataViewObjectPropertyIdentifier>{ objectName: 'taskLabels', propertyName: 'fill' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'taskLabels', propertyName: 'fontSize' },
            fontFamily: <DataViewObjectPropertyIdentifier>{ objectName: 'taskLabels', propertyName: 'fontFamily' },
            width: <DataViewObjectPropertyIdentifier>{ objectName: 'taskLabels', propertyName: 'width' },
            isExpanded: <DataViewObjectPropertyIdentifier>{ objectName: 'taskLabels', propertyName: 'isExpanded' },
            isHierarchy: <DataViewObjectPropertyIdentifier>{ objectName: 'taskLabels', propertyName: 'isHierarchy' }
        },
        columnHeader: {
            fill: <DataViewObjectPropertyIdentifier>{ objectName: 'columnHeader', propertyName: 'fill' },
            fill2: <DataViewObjectPropertyIdentifier>{ objectName: 'columnHeader', propertyName: 'fill2' },
            columnOutline: <DataViewObjectPropertyIdentifier>{ objectName: 'columnHeader', propertyName: 'columnOutline' },
            fontFamily: <DataViewObjectPropertyIdentifier>{ objectName: 'columnHeader', propertyName: 'fontFamily' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'columnHeader', propertyName: 'fontSize' }
        },
        taskResource: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'taskResource', propertyName: 'show' },
            position: <DataViewObjectPropertyIdentifier>{ objectName: 'taskResource', propertyName: 'position' },
            fill: <DataViewObjectPropertyIdentifier>{ objectName: 'taskResource', propertyName: 'fill' },
            fontSize: <DataViewObjectPropertyIdentifier>{ objectName: 'taskResource', propertyName: 'fontSize' },
            fontFamily: <DataViewObjectPropertyIdentifier>{ objectName: 'taskResource', propertyName: 'fontFamily' }
        },
        dateType: {
            type: <DataViewObjectPropertyIdentifier>{ objectName: 'dateType', propertyName: 'type' },
            enableToday: <DataViewObjectPropertyIdentifier>{ objectName: 'dateType', propertyName: 'enableToday' }
        },
        datatype: {
            type: <DataViewObjectPropertyIdentifier>{ objectName: 'datatype', propertyName: 'type' }
        },
        scrollPosition: {
            position: <DataViewObjectPropertyIdentifier>{ objectName: 'scrollPosition', propertyName: 'position' },
            position2: <DataViewObjectPropertyIdentifier>{ objectName: 'scrollPosition', propertyName: 'position2' }
        },
        kpiColumnType: {
            value: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPosition', propertyName: 'value' },
            indicator: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPosition', propertyName: 'indicator' },
            type: <DataViewObjectPropertyIdentifier>{ objectName: 'dataPosition', propertyName: 'type' }
        },
        taskGridlines: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'taskGridlines', propertyName: 'show' },
            fill: <DataViewObjectPropertyIdentifier>{ objectName: 'taskGridlines', propertyName: 'fill' },
            interval: <DataViewObjectPropertyIdentifier>{ objectName: 'taskGridlines', propertyName: 'interval' }
        },
        displayRatio: {
            ratio: <DataViewObjectPropertyIdentifier>{ objectName: 'displayRatio', propertyName: 'ratio' }
        },
        categoryColumnsWidth: {
            width: <DataViewObjectPropertyIdentifier>{ objectName: 'categoryColumnsWidth', propertyName: 'width' },
            categoryLength: <DataViewObjectPropertyIdentifier>{ objectName: 'categoryColumnsWidth', propertyName: 'categoryLength' }
        },
        sortAttributes: {
            sortOrder: <DataViewObjectPropertyIdentifier>{ objectName: 'sortAttributes', propertyName: 'sortOrder' },
            sortLevel: <DataViewObjectPropertyIdentifier>{ objectName: 'sortAttributes', propertyName: 'sortLevel' },
            prevSortedColumn: <DataViewObjectPropertyIdentifier>{ objectName: 'sortAttributes', propertyName: 'prevSortedColumn' }

        }
    };
}
