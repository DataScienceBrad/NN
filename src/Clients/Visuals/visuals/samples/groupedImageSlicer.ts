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

/// <reference path="../../_references.ts"/>

module powerbi.visuals.samples {

    import ClassAndSelector = jsCommon.CssConstants.ClassAndSelector;
    import createClassAndSelector = jsCommon.CssConstants.createClassAndSelector;
    
    import SelectionManager = utility.SelectionManager;

    import PixelConverter = jsCommon.PixelConverter;

    module Orientation {
        export var HORIZONTAL: string = 'Horizontal';
        export var VERTICAL: string = 'Vertical';

        export var type: IEnumType = createEnumType([
            { value: HORIZONTAL, displayName: HORIZONTAL },
            { value: VERTICAL, displayName: VERTICAL }
        ]);
    }

    // TODO: Generate these from above, defining twice just introduces potential for error
    export var groupedImageSlicerProps = {
   /*     general: {
            orientation: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'orientation' },
            columns: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'columns' },
            rows: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'rows' },
            showDisabled: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'showDisabled' },
            multiselect: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'multiselect' },
        },*/
        header: {
            show: <DataViewObjectPropertyIdentifier>{ objectName: 'header', propertyName: 'show' },
            title: <DataViewObjectPropertyIdentifier>{ objectName: 'header', propertyName: 'title' },
            fontColor: <DataViewObjectPropertyIdentifier>{ objectName: 'header', propertyName: 'fontColor' },
            background: <DataViewObjectPropertyIdentifier>{ objectName: 'header', propertyName: 'background' },
            outline: <DataViewObjectPropertyIdentifier>{ objectName: 'header', propertyName: 'outline' },
            textSize: <DataViewObjectPropertyIdentifier>{ objectName: 'header', propertyName: 'textSize' },
            outlineColor: <DataViewObjectPropertyIdentifier>{ objectName: 'header', propertyName: 'outlineColor' },
            outlineWeight: <DataViewObjectPropertyIdentifier>{ objectName: 'header', propertyName: 'outlineWeight' }
        },
        rows: {
            fontColor: <DataViewObjectPropertyIdentifier>{ objectName: 'rows', propertyName: 'fontColor' },
            textSize: <DataViewObjectPropertyIdentifier>{ objectName: 'rows', propertyName: 'textSize' },
            height: <DataViewObjectPropertyIdentifier>{ objectName: 'rows', propertyName: 'height' },
            width: <DataViewObjectPropertyIdentifier>{ objectName: 'rows', propertyName: 'width' },
            background: <DataViewObjectPropertyIdentifier>{ objectName: 'rows', propertyName: 'background' },
            selectedColor: <DataViewObjectPropertyIdentifier>{ objectName: 'rows', propertyName: 'selectedColor' },
            unselectedColor: <DataViewObjectPropertyIdentifier>{ objectName: 'rows', propertyName: 'unselectedColor' },
            disabledColor: <DataViewObjectPropertyIdentifier>{ objectName: 'rows', propertyName: 'disabledColor' },
            outline: <DataViewObjectPropertyIdentifier>{ objectName: 'rows', propertyName: 'outline' },
            outlineColor: <DataViewObjectPropertyIdentifier>{ objectName: 'rows', propertyName: 'outlineColor' },
            outlineWeight: <DataViewObjectPropertyIdentifier>{ objectName: 'rows', propertyName: 'outlineWeight' },

        },
        images: {
            imageSplit: <DataViewObjectPropertyIdentifier>{ objectName: 'images', propertyName: 'imageSplit' },
            stretchImage: <DataViewObjectPropertyIdentifier>{ objectName: 'images', propertyName: 'stretchImage' },
            bottomImage: <DataViewObjectPropertyIdentifier>{ objectName: 'images', propertyName: 'bottomImage' },
        },
        selectedPropertyIdentifier: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'selected' },
        filterPropertyIdentifier: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'filter' },
        formatString: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'formatString' },

    };

    export interface GroupedImageSlicerConstructorOptions {
        behavior?: GroupedImageSlicerWebBehavior;
    }

    export interface GroupedImageSlicerData {
        categorySourceName: string;
        formatString: string;
        settings: GroupedImageSlicerSettings;
        hasSelectionOverride?: boolean;
        groups: GroupedImageSlicerDataGroup[];
    }

    export interface GroupedImageSlicerDataGroup {
        dataPoints: GroupedImageSlicerDataPoint[];
        group: DataViewValueColumnGroup;
    }

    export interface GroupedImageSlicerDataPoint extends SelectableDataPoint {
        category?: string;
        value?: number;
        imageURL?: string;
        state?: string;

        mouseOver?: boolean;
        mouseOut?: boolean;
        isSelectAllDataPoint?: boolean;
        selectable?: boolean;
    }

    export interface GroupedImageSlicerSettings {
    /*    general: {
            orientation: string;
            columns: number;
            rows: number;
            multiselect: boolean;
            showDisabled: string;
        };*/
        margin: IMargin;
        header: {
            borderBottomWidth: number;
            show: boolean;
            outline: string;
            fontColor: string;
            background: string;
            textSize: number;
            outlineColor: string;
            outlineWeight: number;
            title: string;
        };
        headerText: {
            marginLeft: number;
            marginTop: number;
        };
        slicerText: {
            textSize: number;
            height: number;
            width: number;
            fontColor: string;
            hoverColor: string;
            selectedColor: string;
            unselectedColor: string;
            disabledColor: string;
            marginLeft: number;
            outline: string;
            background: string;
            outlineColor: string;
            outlineWeight: number;
        };
        slicerItemContainer: {
            marginTop: number;
            marginLeft: number;
        };
        images: {
            imageSplit: number;
            stretchImage: boolean;
            bottomImage: boolean;
        };
    }

    export class GroupedImageSlicer implements IVisual {
                
        public static RoleNames = {
            AirplaneType: 'Airplane Type',
            Category: 'Tale Number',
            State: 'State',
            Values: 'Severity Score',
            Image: 'Icon URL',
        };
        
        public static capabilities: VisualCapabilities = {
            dataRoles: [
                {
                    name: GroupedImageSlicer.RoleNames.AirplaneType,
                    kind: VisualDataRoleKind.Grouping,
                    displayName: GroupedImageSlicer.RoleNames.AirplaneType,
                },
                {
                    name: GroupedImageSlicer.RoleNames.Category,
                    kind: VisualDataRoleKind.Grouping,
                    displayName: GroupedImageSlicer.RoleNames.Category,
                },
                {
                    name: GroupedImageSlicer.RoleNames.State,
                    kind: VisualDataRoleKind.Grouping,
                    displayName: GroupedImageSlicer.RoleNames.State,
                },
                {
                    name: GroupedImageSlicer.RoleNames.Values,
                    kind: VisualDataRoleKind.Measure,
                    displayName: GroupedImageSlicer.RoleNames.Values,
                },
                {
                    name: GroupedImageSlicer.RoleNames.Image,
                    kind: VisualDataRoleKind.Grouping,
                    displayName: GroupedImageSlicer.RoleNames.Image,
                },

            ],
            objects: {
            /*    general: {
                    displayName: data.createDisplayNameGetter('Visual_General'),
                    properties: {
                        orientation: {
                            displayName: 'Orientation',
                            type: { enumeration: Orientation.type }
                        },
                        columns: {
                            displayName: 'Columns',
                            type: { numeric: true }
                        },
                        rows: {
                            displayName: 'Rows',
                            type: { numeric: true }
                        },
                        showDisabled: {
                            displayName: 'Show Disabled',
                            type: { enumeration: GroupedImageSlicerShowDisabled.type }
                        },
                        multiselect: {
                            displayName: 'Multiple selection',
                            type: { bool: true }
                        },
                        selected: {
                            type: { bool: true }
                        },
                        filter: {
                            type: { filter: {} },
                            rule: {
                                output: {
                                    property: 'selected',
                                    selector: [GroupedImageSlicer.RoleNames.Category],
                                }
                            }
                        },
                        formatString: {
                            type: { formatting: { formatString: true } },
                        },

                    },
                },*/
                header: {
                    displayName: data.createDisplayNameGetter('Visual_Header'),
                    properties: {
                        show: {
                            displayName: data.createDisplayNameGetter('Visual_Show'),
                            type: { bool: true }
                        },
                        title: {
                            displayName: 'Title',
                            type: { text: true }
                        },
                        fontColor: {
                            displayName: data.createDisplayNameGetter('Visual_FontColor'),
                            type: { fill: { solid: { color: true } } }
                        },
                        background: {
                            displayName: data.createDisplayNameGetter('Visual_Background'),
                            type: { fill: { solid: { color: true } } }
                        },
                        outline: {
                            displayName: data.createDisplayNameGetter('Visual_Outline'),
                            type: { formatting: { outline: true } }
                        },
                        textSize: {
                            displayName: data.createDisplayNameGetter('Visual_TextSize'),
                            type: { numeric: true }
                        },
                        outlineColor: {
                            displayName: data.createDisplayNameGetter('Visual_outlineColor'),
                            type: { fill: { solid: { color: true } } }
                        },
                        outlineWeight: {
                            displayName: data.createDisplayNameGetter('Visual_outlineWeight'),
                            type: { numeric: true }
                        }
                    }
                },
                rows: {
                    displayName: 'Chiclets',
                    properties: {
                        fontColor: {
                            displayName: 'Text color',
                            type: { fill: { solid: { color: true } } }
                        },
                        textSize: {
                            displayName: data.createDisplayNameGetter('Visual_TextSize'),
                            type: { numeric: true }
                        },
                        height: {
                            displayName: 'Height',
                            type: { numeric: true }
                        },
                        width: {
                            displayName: 'Width',
                            type: { numeric: true }
                        },
                        selectedColor: {
                            displayName: 'Selected Color',
                            type: { fill: { solid: { color: true } } }
                        },
                        unselectedColor: {
                            displayName: 'Unselected Color',
                            type: { fill: { solid: { color: true } } }
                        },
                        disabledColor: {
                            displayName: 'Disabled Color',
                            type: { fill: { solid: { color: true } } }
                        },
                        background: {
                            displayName: data.createDisplayNameGetter('Visual_Background'),
                            type: { fill: { solid: { color: true } } }
                        },
                        outline: {
                            displayName: data.createDisplayNameGetter('Visual_Outline'),
                            type: { formatting: { outline: true } }
                        },
                        outlineColor: {
                            displayName: data.createDisplayNameGetter('Visual_outlineColor'),
                            type: { fill: { solid: { color: true } } }
                        },
                        outlineWeight: {
                            displayName: data.createDisplayNameGetter('Visual_outlineWeight'),
                            type: { numeric: true }
                        },

                    }
                },
                images: {
                    displayName: 'Images',
                    properties: {
                        imageSplit: {
                            displayName: 'Image Split',
                            type: { numeric: true }
                        },
                        stretchImage: {
                            displayName: 'Stretch image',
                            type: { bool: true }
                        },
                        bottomImage: {
                            displayName: 'Bottom image',
                            type: { bool: true }
                        },
                    }
                },
            },
            dataViewMappings: [{
                conditions: [
                    {  'Airplane Type':  { min: 0, max: 1 },
                      'Tale Number':    { max: 1 },
                      'State':          { min: 0, max: 1 },
                      'Severity Score': { min: 0, max: 1 },
                      'Icon URL':       { min: 0, max: 1 }
                     }],
                categorical: {
                    categories: {
                        for: { in: GroupedImageSlicer.RoleNames.Category },
                        dataReductionAlgorithm: { top: {} }
                    },
                    values: {
                        group: {
                            by: GroupedImageSlicer.RoleNames.AirplaneType,
                            select: [
                                { bind: { to: GroupedImageSlicer.RoleNames.State } },
                                { bind: { to: GroupedImageSlicer.RoleNames.Values } },
                                { bind: { to: GroupedImageSlicer.RoleNames.Image } },
                            ],
                            dataReductionAlgorithm: { top: {} }
                        }
                    },
                    includeEmptyGroups: true
                }
            }],
            supportsHighlight: true,
            sorting: {
                default: {
                },
            },
            drilldown: {
                roles: [GroupedImageSlicer.RoleNames.Category]
            },
            suppressDefaultTitle: true,
        };

        private element: JQuery;
        private currentViewport: IViewport;
        private dataView: DataView;
        //private slicerHeader: D3.Selection;
        //private slicerBody: D3.Selection;
        //private tableView: ITableView;
        
        private slicerContainer: D3.Selection;
        
        private data: GroupedImageSlicerData;
        private settings: GroupedImageSlicerSettings;
        private interactivityService: IInteractivityService;
        private behavior: GroupedImageSlicerWebBehavior;
        private hostServices: IVisualHostServices;
        
        private selectionManager: SelectionManager;
        
        //private waitingForData: boolean;
        /*private textProperties: TextProperties = {
            'fontFamily': 'wf_segoe-ui_normal, helvetica, arial, sans-serif',
            'fontSize': '14px',
        };*/
        
        private static SelectorContainer: ClassAndSelector = createClassAndSelector('groupedImageSlicer');
        private static SelectorGroup: ClassAndSelector = createClassAndSelector('groupedImageSlicerGroup');
   
        private static SelectorHeader: ClassAndSelector = createClassAndSelector('groupedImageSlicerHeader');
        private static SelectorHeaderText: ClassAndSelector = createClassAndSelector('groupedImageSlicerHeaderText');
        
        private static SelectorRow: ClassAndSelector = createClassAndSelector('groupedImageSlicerRow');
        private static SelectorCell: ClassAndSelector = createClassAndSelector('groupedImageSlicerCell');
        
        private static SelectorImage: ClassAndSelector = createClassAndSelector('groupedImageSlicerImage');
        private static SelectorText: ClassAndSelector = createClassAndSelector('groupedImageSlicerText');
                
        private static SelectorSelected: ClassAndSelector = createClassAndSelector('selected');
                
        private static StateRed: ClassAndSelector = createClassAndSelector('red');
        private static StateOrange: ClassAndSelector = createClassAndSelector('orange');
        private static StateYellow: ClassAndSelector = createClassAndSelector('yellow');
        private static StateGray: ClassAndSelector = createClassAndSelector('gray');
        private static StateWhite: ClassAndSelector = createClassAndSelector('white');
        
                        
        private static StateValues = {
            Immediate: "Immediate",
            Preventative: "Preventative",
            Required: "Required",
            InMaintenance: "InMaintenance",
            OnGround: "OnGround",
        };        
        
        private static StateColors = [            
            {
                state: GroupedImageSlicer.StateValues.Immediate,
                color: GroupedImageSlicer.StateRed,
            },            
            {
                state: GroupedImageSlicer.StateValues.Preventative,
                color: GroupedImageSlicer.StateOrange,
            },            
            {
                state: GroupedImageSlicer.StateValues.Required,
                color: GroupedImageSlicer.StateYellow,
            },            
            {
                state: GroupedImageSlicer.StateValues.InMaintenance,
                color: GroupedImageSlicer.StateGray,
            },            
            {
                state: GroupedImageSlicer.StateValues.OnGround,
                color: GroupedImageSlicer.StateWhite,
            },
        ];
        
        /*
        private static SelectorHeader:     ClassAndSelector = createClassAndSelector('groupedImageSlicerHeader');
        private static SelectorHeaderText: ClassAndSelector = createClassAndSelector('groupedImageSlicerHeaderText');
        
        //private static ItemContainer: ClassAndSelector = createClassAndSelector('slicerItemContainer');
        //private static HeaderText: ClassAndSelector = createClassAndSelector('headerText');
        private static LabelText: ClassAndSelector = createClassAndSelector('slicerText');
        private static Input: ClassAndSelector = createClassAndSelector('slicerCheckbox');
        private static Clear: ClassAndSelector = createClassAndSelector('clear');
        private static Body: ClassAndSelector = createClassAndSelector('slicerBody');
        */

        public static DefaultStyleProperties(): GroupedImageSlicerSettings {
            return {
              /*  general: {
                    orientation: Orientation.VERTICAL,
                    columns: 0,
                    rows: 1,
                    multiselect: false,
                    showDisabled: GroupedImageSlicerShowDisabled.INPLACE
                },*/
                margin: {
                    top: 50,
                    bottom: 50,
                    right: 50,
                    left: 50
                },
                header: {
                    borderBottomWidth: 1,
                    show: true,
                    outline: 'BottomOnly',
                    fontColor: '#a6a6a6',
                    background: '#ffffff',
                    textSize: 10,
                    outlineColor: '#a6a6a6',
                    outlineWeight: 1,
                    title: '',
                },
                headerText: {
                    marginLeft: 8,
                    marginTop: 0
                },
                slicerText: {
                    textSize: 10,
                    height: 0,
                    width: 0,
                    fontColor: '#666666',
                    hoverColor: '#212121',
                    selectedColor: '#BDD7EE',
                    unselectedColor: '#ffffff',
                    disabledColor: 'grey',
                    marginLeft: 8,
                    outline: 'Frame',
                    background: '#ffffff',
                    outlineColor: '#000000',
                    outlineWeight: 1,

                },
                slicerItemContainer: {
                    // The margin is assigned in the less file. This is needed for the height calculations.
                    marginTop: 5,
                    marginLeft: 0,
                },
                images: {
                    imageSplit: 50,
                    stretchImage: false,
                    bottomImage: false
                }
            };
        }

        constructor(options?: GroupedImageSlicerConstructorOptions) {
            if (options) {
                if (options.behavior) {
                    this.behavior = options.behavior;
                }
            }
            if (!this.behavior) {
                this.behavior = new GroupedImageSlicerWebBehavior();
            }

        }
        
        
        private static parseSettings(dataView: DataView): GroupedImageSlicerSettings {
            var defaultSettings = GroupedImageSlicer.DefaultStyleProperties();
            var objects = dataView.metadata.objects;
            if (objects) {
                /*defaultSettings.general.orientation = DataViewObjects.getValue<string>(objects, groupedImageSlicerProps.general.orientation, defaultSettings.general.orientation);
                defaultSettings.general.columns = DataViewObjects.getValue<number>(objects, groupedImageSlicerProps.general.columns, defaultSettings.general.columns);
                defaultSettings.general.rows = DataViewObjects.getValue<number>(objects, groupedImageSlicerProps.general.rows, defaultSettings.general.rows);
                defaultSettings.general.multiselect = DataViewObjects.getValue<boolean>(objects, groupedImageSlicerProps.general.multiselect, defaultSettings.general.multiselect);
                defaultSettings.general.showDisabled = DataViewObjects.getValue<string>(objects, groupedImageSlicerProps.general.showDisabled, defaultSettings.general.showDisabled);
                */
                defaultSettings.header.show = DataViewObjects.getValue<boolean>(objects, groupedImageSlicerProps.header.show, defaultSettings.header.show);
                defaultSettings.header.title = DataViewObjects.getValue<string>(objects, groupedImageSlicerProps.header.title, defaultSettings.header.title);
                defaultSettings.header.fontColor = DataViewObjects.getFillColor(objects, groupedImageSlicerProps.header.fontColor, defaultSettings.header.fontColor);
                defaultSettings.header.background = DataViewObjects.getFillColor(objects, groupedImageSlicerProps.header.background, defaultSettings.header.background);
                defaultSettings.header.textSize = DataViewObjects.getValue<number>(objects, groupedImageSlicerProps.header.textSize, defaultSettings.header.textSize);
                defaultSettings.header.outline = DataViewObjects.getValue<string>(objects, groupedImageSlicerProps.header.outline, defaultSettings.header.outline);
                defaultSettings.header.outlineColor = DataViewObjects.getFillColor(objects, groupedImageSlicerProps.header.outlineColor, defaultSettings.header.outlineColor);
                defaultSettings.header.outlineWeight = DataViewObjects.getValue<number>(objects, groupedImageSlicerProps.header.outlineWeight, defaultSettings.header.outlineWeight);

                defaultSettings.slicerText.textSize = DataViewObjects.getValue<number>(objects, groupedImageSlicerProps.rows.textSize, defaultSettings.slicerText.textSize);
                defaultSettings.slicerText.height = DataViewObjects.getValue<number>(objects, groupedImageSlicerProps.rows.height, defaultSettings.slicerText.height);
                defaultSettings.slicerText.width = DataViewObjects.getValue<number>(objects, groupedImageSlicerProps.rows.width, defaultSettings.slicerText.width);
                defaultSettings.slicerText.selectedColor = DataViewObjects.getFillColor(objects, groupedImageSlicerProps.rows.selectedColor, defaultSettings.slicerText.selectedColor);
                defaultSettings.slicerText.unselectedColor = DataViewObjects.getFillColor(objects, groupedImageSlicerProps.rows.unselectedColor, defaultSettings.slicerText.unselectedColor);
                defaultSettings.slicerText.disabledColor = DataViewObjects.getFillColor(objects, groupedImageSlicerProps.rows.disabledColor, defaultSettings.slicerText.disabledColor);
                defaultSettings.slicerText.background = DataViewObjects.getFillColor(objects, groupedImageSlicerProps.rows.background, defaultSettings.slicerText.background);
                defaultSettings.slicerText.fontColor = DataViewObjects.getFillColor(objects, groupedImageSlicerProps.rows.fontColor, defaultSettings.slicerText.fontColor);
                defaultSettings.slicerText.outline = DataViewObjects.getValue<string>(objects, groupedImageSlicerProps.rows.outline, defaultSettings.slicerText.outline);
                defaultSettings.slicerText.outlineColor = DataViewObjects.getFillColor(objects, groupedImageSlicerProps.rows.outlineColor, defaultSettings.slicerText.outlineColor);
                defaultSettings.slicerText.outlineWeight = DataViewObjects.getValue<number>(objects, groupedImageSlicerProps.rows.outlineWeight, defaultSettings.slicerText.outlineWeight);

                defaultSettings.images.imageSplit = DataViewObjects.getValue<number>(objects, groupedImageSlicerProps.images.imageSplit, defaultSettings.images.imageSplit);
                defaultSettings.images.stretchImage = DataViewObjects.getValue<boolean>(objects, groupedImageSlicerProps.images.stretchImage, defaultSettings.images.stretchImage);
                defaultSettings.images.bottomImage = DataViewObjects.getValue<boolean>(objects, groupedImageSlicerProps.images.bottomImage, defaultSettings.images.bottomImage);
            }

            return defaultSettings;
        }

        private static parseValues(categories: DataViewCategoryColumn[], roleName: string): any[] {
            for (var i = 0; i < categories.length; i++) {
                if (categories[i].source.roles && categories[i].source.roles[roleName]) {
                    return categories[i].values;
                }
            }
            return [];
        }

        private static getCategoryIndex(categories: DataViewCategoryColumn[], roleName: string): number {
            for (var i = 0; i < categories.length; i++) {
                if (categories[i].source.roles && categories[i].source.roles[roleName]) {
                    return i;
                }
            }
            return -1;
        }        
        
        
        public static converter(dataView: DataView, interactivityService: IInteractivityService): GroupedImageSlicerData {
            if (!dataView ||
                !dataView.categorical ||
                !dataView.categorical.categories ||
                !dataView.categorical.categories[0] ||
                !dataView.categorical.categories[0].values ||
                !(dataView.categorical.categories[0].values.length > 0) ||
                !dataView.categorical.values) {
                return;
            }
                
            var dataViewCategorical = dataView.categorical;
            var dataViewCategories = dataViewCategorical.categories;
            /*
            if (dataViewCategorical.categories && dataViewCategorical.categories.length > 0) {
             
                this.category = dataViewCategorical.categories[airplaneTypeIndex];
                this.categoryIdentities = this.category.identity;
                this.categoryValues = this.category.values;
                this.categoryColumnRef = this.category.identityFields;
                this.categoryFormatString = valueFormatter.getFormatString(this.category.source, groupedImageSlicerProps.formatString);
            }
            */
            
            var airplaneTypeIndex = GroupedImageSlicer.getCategoryIndex(dataViewCategories, GroupedImageSlicer.RoleNames.Category);
            var category = dataViewCategorical.categories[airplaneTypeIndex];            
            
            var categoryValues: string[] = GroupedImageSlicer.parseValues(dataViewCategories, GroupedImageSlicer.RoleNames.Category);
            var imageValues: string[] = GroupedImageSlicer.parseValues(dataViewCategories, GroupedImageSlicer.RoleNames.Image);
            var stateValues: string[] = GroupedImageSlicer.parseValues(dataViewCategories, GroupedImageSlicer.RoleNames.State);
            
            if (!category ||
               !categoryValues.length ||
               !imageValues.length ||
                !stateValues.length) {
                return;
            }
            
            var grouped = dataViewCategorical.values.grouped();
            
            
            if (!category ||
               !categoryValues.length ||
                !imageValues.length ||
                !grouped.length ||
                !stateValues.length) {
                return;
            }
            var slicerGroups: GroupedImageSlicerDataGroup[] = [];
            
            for (var groupedIndex = 0; groupedIndex < grouped.length; groupedIndex++) {
                var dataGroup: GroupedImageSlicerDataGroup = {
                    group: grouped[groupedIndex],
                    dataPoints: []
                };
                
                var groupValues: number[] = grouped[groupedIndex].values[0].values;
                
                
                for (var categoryIndex = 0; categoryIndex < groupValues.length; categoryIndex++) {
                    var categoryIdentity: DataViewScopeIdentity = category.identity ? category.identity[categoryIndex] : null;
                    var categoryIsSelected: boolean = isCategoryColumnSelected(groupedImageSlicerProps.selectedPropertyIdentifier, category, categoryIndex);
                    var selectable: boolean = true;

                    var value: number = groupValues[categoryIndex];

                    if (!value) {
                        continue;
                    }

                    var categoryLabel: string = categoryValues[categoryIndex]; 
                    var imageURL: string = imageValues[categoryIndex]; 
                    var state: string = stateValues[categoryIndex]; 

                    dataGroup.dataPoints.push({
                        category: categoryLabel,
                        imageURL: imageURL,
                        value: value,
                        state: state,
                        
                        identity: SelectionId.createWithId(categoryIdentity),
                        selected: categoryIsSelected,
                        selectable: selectable
                    });
                }
                
                _.sortBy(dataGroup.dataPoints, item => item.value);

                slicerGroups.push(dataGroup);
            }
            
            //console.log('slicerGroups', slicerGroups);  
   
            var settings = GroupedImageSlicer.parseSettings(dataView);

            var slicerData: GroupedImageSlicerData = {
                categorySourceName: category.source.displayName,
                formatString: valueFormatter.getFormatString(category.source, groupedImageSlicerProps.formatString),
                settings: settings,
                groups: slicerGroups,
            };

            return slicerData;
        }

        public init(options: VisualInitOptions): void {
            this.element = options.element;
            this.currentViewport = options.viewport;
            if (this.behavior) {
                this.interactivityService = createInteractivityService(options.host);
            }
            this.hostServices = options.host;
            this.selectionManager = new SelectionManager({ hostServices: options.host });
            this.settings = GroupedImageSlicer.DefaultStyleProperties();

            this.initContainer();
        }

        public onDataChanged(options: VisualDataChangedOptions): void {
            //console.log('onDataChanged');
            
            if (!options.dataViews || !options.dataViews[0]) {
                return;
            }

            var dataView,
                dataViews = options.dataViews;

            //var existingDataView = this.dataView;
            if (dataViews && dataViews.length > 0) {
                dataView = this.dataView = dataViews[0];
            }

            if (!dataView ||
                !dataView.categorical ||
                !dataView.categorical.values ||
                !dataView.categorical.values[0] ||
                !dataView.categorical.values[0].values) {
                return;
            }
            /*
            var resetScrollbarPosition = false;
            // Null check is needed here. If we don't check for null, selecting a value on loadMore event will evaluate the below condition to true and resets the scrollbar
            if (options.operationKind !== undefined) {
                resetScrollbarPosition = options.operationKind !== VisualDataChangeOperationKind.Append
                    && !DataViewAnalysis.hasSameCategoryIdentity(existingDataView, this.dataView);
            }
            */
            this.updateInternal();
            //this.waitingForData = false;
        }

        public update(options: VisualUpdateOptions) {
            //console.log('update');
            
            if (!options ||
                !options.dataViews ||
                !options.dataViews[0] ||
                !options.viewport) {
                return;
            }

            //var existingDataView = this.dataView;
            this.dataView = options.dataViews[0];
/*
            var resetScrollbarPosition = true;
            if (existingDataView) {
                resetScrollbarPosition = !DataViewAnalysis.hasSameCategoryIdentity(existingDataView, this.dataView);
            }

            if (options.viewport.height === this.currentViewport.height
                && options.viewport.width === this.currentViewport.width) {
                this.waitingForData = false;
            }
            else {
                this.currentViewport = options.viewport;
            }
*/
            this.updateInternal();
        }

        public onResizing(finalViewport: IViewport): void {
            //onsole.log('onResizing');
            this.currentViewport = finalViewport;
            this.updateInternal();
        }

   
        private updateInternal() {
            //this.updateSlicerBodyDimensions();
            //console.log('updateInternal');

            var data = this.data = GroupedImageSlicer.converter(this.dataView, this.interactivityService);
            if (!data) {
                this.clear();
                return;
            }

            this.render();
        }
        
        private clear() {
            this.slicerContainer.selectAll("*").remove();
        }
    
        private initContainer() {
            //var settings = this.settings;
            //var slicerBodyViewport = this.getSlicerBodyViewport(this.currentViewport);
            this.slicerContainer = d3.select(this.element.get(0))
                .append('div')
                .classed(GroupedImageSlicer.SelectorContainer.class, true);

            //console.log(slicerBodyViewport, this.slicerContainer);
        }

        public render(): void {
            var groups = this.data.groups;
            var sm: SelectionManager = this.selectionManager;

            var groupSelection = this.slicerContainer.selectAll(GroupedImageSlicer.SelectorGroup.selector)
                .data(groups)
                .enter()
                .append('div')
                .classed(GroupedImageSlicer.SelectorGroup.class, true);
           
             groupSelection.on('click', (d) => {
                 sm.clear();
                 d3.select(GroupedImageSlicer.SelectorSelected.selector).classed(GroupedImageSlicer.SelectorSelected.class, false);
                 d3.event.stopPropagation();
             });  
            //console.log(groupSelection);
            
            this.drawHeader(groupSelection);
            this.drawGroup(groupSelection);
        }       

        private drawHeader(groupSelection: D3.Selection): void {
            var settings: GroupedImageSlicerSettings = this.settings;

            var headerSelection: D3.Selection = groupSelection
                .append("div")
                .classed(GroupedImageSlicer.SelectorHeader.class, true)
                .style({
                    'border-style': this.getBorderStyle(settings.header.outline),
                    'border-color': settings.header.outlineColor,
                    'border-width': this.getBorderWidth(settings.header.outline, settings.header.outlineWeight),
                    'color': settings.header.fontColor,
                    'background-color': settings.header.background,
                    'font-size': PixelConverter.fromPoint(settings.header.textSize),
                });

            var headerTextSelection: D3.Selection = headerSelection
                .append('div')
                .classed(GroupedImageSlicer.SelectorHeaderText.class, true)
                .style({
                    'margin-left': PixelConverter.toString(settings.headerText.marginLeft),
                    'margin-top': PixelConverter.toString(settings.headerText.marginTop),
                    /*'border-style': this.getBorderStyle(settings.header.outline),
                    'border-color': settings.header.outlineColor,
                    'border-width': this.getBorderWidth(settings.header.outline, settings.header.outlineWeight),*/
                    'font-size': PixelConverter.fromPoint(settings.header.textSize),
                });                    
 
            headerTextSelection.text((d) => {
                return d.group.name;
            });           
        }  

        private drawGroup(groupSelection: D3.Selection): void {
            //var settings: GroupedImageSlicerSettings = this.settings;

            var rowSelection: D3.Selection = groupSelection
                .append("div")
                .classed(GroupedImageSlicer.SelectorRow.class, true);

            var cellSelection: D3.Selection = rowSelection.selectAll(GroupedImageSlicer.SelectorCell.selector)
                .data(d => d.dataPoints)
                .enter()
                .append('div')
                .classed(GroupedImageSlicer.SelectorCell.class, true);

            this.drawCells(cellSelection);
        }
        
        
        private drawCells(cellSelection: D3.Selection): void {
            var settings: GroupedImageSlicerSettings = this.settings;
            var sm: SelectionManager = this.selectionManager;
 
            cellSelection   
                .style({
                    'color': settings.slicerText.fontColor,
                    'border-style': this.getBorderStyle(settings.slicerText.outline),
                    //'border-color': settings.slicerText.outlineColor,
                    //'border-width': this.getBorderWidth(settings.slicerText.outline, settings.slicerText.outlineWeight),
                    'font-size': PixelConverter.fromPoint(settings.slicerText.textSize),
                });

            for (var i = 0; i < GroupedImageSlicer.StateColors.length; i++) {
                cellSelection.classed(GroupedImageSlicer.StateColors[i].color.class, (d: GroupedImageSlicerDataPoint) => {
                    return d.state === GroupedImageSlicer.StateColors[i].state;
                });
            }

            cellSelection
                .append("div")
                .classed(GroupedImageSlicer.SelectorImage.class, true)
                .style('background-image', (d: GroupedImageSlicerDataPoint) => {
                    //console.log('imageURL', d.imageURL);
                    return d.imageURL ? `url(${d.imageURL})` : '';
                });

            cellSelection
                .append("div")
                .classed(GroupedImageSlicer.SelectorText.class, true)
                .text((d: GroupedImageSlicerDataPoint) => d.category);      

            cellSelection
                .on('click', function (d: GroupedImageSlicerDataPoint) {
                    sm.select(d.identity).then(ids => {
                        cellSelection.classed(GroupedImageSlicer.SelectorSelected.class, false);
                        if (ids.length > 0) {
                            d3.select(this).classed(GroupedImageSlicer.SelectorSelected.class, true);
                            
                            /*
                            selection.style('fill-opacity', AreaRangeChart.DimmedFillOpacity);
                            d3.select(this).transition()
                                .duration(duration)
                                .style('fill-opacity', AreaRangeChart.FillOpacity);*/
                            //console.log('selected', ids);
                        } else {
                            //console.log('npn selected');
                        }
                    });
                    d3.event.stopPropagation();
                });            
        }                        
      
       /*

            var rowUpdate = (rowSelection: D3.Selection) => {
                var settings = this.settings;
                var data = this.slicerData;
                if (data && settings) {
                    //this.slicerBody.classed('slicerBody-horizontal', settings.general.orientation === Orientation.HORIZONTAL);

                    var slicerText = rowSelection.selectAll(GroupedImageSlicer.LabelText.selector);

                    var formatString = data.formatString;
                    slicerText.text((d: GroupedImageSlicerDataPoint) => valueFormatter.format(d.category, formatString));

                    var slicerImg = rowSelection.selectAll('.slicer-img-wrapper');
                    slicerImg
                        .style('height', settings.images.imageSplit + '%')
                        .classed('hidden', (d: GroupedImageSlicerDataPoint) => {
                            if (!(d.imageURL)) {
                                return true;
                            }
                            if (settings.images.imageSplit < 10) {
                                return true;
                            }
                        })
                        .style('display', (d: GroupedImageSlicerDataPoint) => (d.imageURL) ? 'flex' : 'none')
                        .classed('stretchImage', settings.images.stretchImage)
                        .classed('bottomImage', settings.images.bottomImage)
                        .style('background-image', (d: GroupedImageSlicerDataPoint) => {
                            console.log('imageURL', d.imageURL);
                            return d.imageURL ? `url(${d.imageURL})` : '';
                        });

                    rowSelection.selectAll('.slicer-text-wrapper')
                        .style('height', (d: GroupedImageSlicerDataPoint) => {
                            //console.log(arguments);
                            return d.imageURL ? (100 - settings.images.imageSplit) + '%' : '100%';
                        })
                        .classed('hidden', (d: GroupedImageSlicerDataPoint) => {
                            if (settings.images.imageSplit > 90) {
                                return true;
                            }
                        });

                    rowSelection.selectAll('.slicerItemContainer').style({
                        'color': settings.slicerText.fontColor,
                        'border-style': this.getBorderStyle(settings.slicerText.outline),
                        'border-color': settings.slicerText.outlineColor,
                        'border-width': this.getBorderWidth(settings.slicerText.outline, settings.slicerText.outlineWeight),
                        'font-size': PixelConverter.fromPoint(settings.slicerText.textSize),
                    });
                    rowSelection.style('display', (d: GroupedImageSlicerDataPoint) => (d.selectable || settings.general.showDisabled !== GroupedImageSlicerShowDisabled.HIDE) ? 'inline-block' : 'none');
                    this.slicerBody.style('background-color', settings.slicerText.background);
                    
                    if (this.interactivityService && this.slicerBody) {
                        var slicerBody = this.slicerBody.attr('width', this.currentViewport.width);
                        var slicerItemContainers = slicerBody.selectAll(GroupedImageSlicer.ItemContainer.selector);
                        var slicerItemLabels = slicerBody.selectAll(GroupedImageSlicer.LabelText.selector);
                        var slicerItemInputs = slicerBody.selectAll(GroupedImageSlicer.Input.selector);
                        var slicerClear = this.slicerHeader.select(GroupedImageSlicer.Clear.selector);

                        var behaviorOptions: GroupedImageSlicerBehaviorOptions = {
                            dataPoints: data.slicerDataPoints,
                            slicerItemContainers: slicerItemContainers,
                            slicerItemLabels: slicerItemLabels,
                            slicerItemInputs: slicerItemInputs,
                            slicerClear: slicerClear,
                            interactivityService: this.interactivityService,
                            slicerSettings: data.slicerSettings,
                        };

                        this.interactivityService.bind(data.slicerDataPoints, this.behavior, behaviorOptions, {
                            overrideSelectionFromData: true,
                            hasSelectionOverride: data.hasSelectionOverride
                        });
                        this.behavior.styleSlicerInputs(rowSelection.select(GroupedImageSlicer.ItemContainer.selector),
                            this.interactivityService.hasSelection());
                    }
                    else {
                        this.behavior.styleSlicerInputs(rowSelection.select(GroupedImageSlicer.ItemContainer.selector), false);
                    }
                }
            };


            }          */
        
   /*
        private onLoadMoreData(): void {
            
            if (!this.waitingForData && this.dataView.metadata && this.dataView.metadata.segment) {
                this.hostServices.loadMoreData();
                this.waitingForData = true;
            }
        }

        private getSlicerBodyViewport(currentViewport: IViewport): IViewport {
            var settings = this.settings;
            var headerHeight = (settings.header.show) ? this.getHeaderHeight() : 0;
            var slicerBodyHeight = currentViewport.height - (headerHeight + settings.header.borderBottomWidth);
            return {
                height: slicerBodyHeight,
                width: currentViewport.width
            };
        }
/*
        private updateSlicerBodyDimensions(): void {
            var slicerViewport = this.getSlicerBodyViewport(this.currentViewport);
            this.slicerBody
                .style({
                    'height': PixelConverter.toString(slicerViewport.height),
                    'width': '100%',
                });
        }

        private getTextProperties(textSize: number): TextProperties {
            this.textProperties.fontSize = PixelConverter.fromPoint(textSize);
            return this.textProperties;
        }

       private getHeaderHeight(): number {
            return TextMeasurementService.estimateSvgTextHeight(
                this.getTextProperties(this.settings.header.textSize)
            );
        }

        private getRowHeight(): number {
            var textSettings = this.settings.slicerText;
            return textSettings.height !== 0 ? textSettings.height : TextMeasurementService.estimateSvgTextHeight(
                this.getTextProperties(textSettings.textSize)
            );
        }
*/
        private getBorderStyle(outlineElement: string): string {
            return outlineElement === '0px' ? 'none' : 'solid';
        }

        private getBorderWidth(outlineElement: string, outlineWeight: number): string {
            switch (outlineElement) {
                case 'None':
                    return '0px';
                case 'BottomOnly':
                    return '0px 0px ' + outlineWeight + 'px 0px';
                case 'TopOnly':
                    return outlineWeight + 'px 0px 0px 0px';
                case 'TopBottom':
                    return outlineWeight + 'px 0px ' + outlineWeight + 'px 0px';
                case 'LeftRight':
                    return '0px ' + outlineWeight + 'px 0px ' + outlineWeight + 'px';
                case 'Frame':
                    return outlineWeight + 'px';
                default:
                    return outlineElement.replace("1", outlineWeight.toString());
            }
        }
        
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
            var data = this.data;
            if (!data) {
                return;
            }

            var objectName = options.objectName;
            switch (objectName) {
                case 'rows':
                    //return this.enumerateRows(data);
                case 'header':
                    //return this.enumerateHeader(data);
                case 'general':
                    //return this.enumerateGeneral(data);
                    break;
                case 'images':
                    //return this.enumerateImages(data);
            }
        }
/*
        private enumerateHeader(data: GroupedImageSlicerData): VisualObjectInstance[] {
            var slicerSettings = this.settings;
            return [{
                selector: null,
                objectName: 'header',
                properties: {
                    show: slicerSettings.header.show,
                    title: slicerSettings.header.title,
                    fontColor: slicerSettings.header.fontColor,
                    background: slicerSettings.header.background,
                    textSize: slicerSettings.header.textSize,
                    outline: slicerSettings.header.outline,
                    outlineColor: slicerSettings.header.outlineColor,
                    outlineWeight: slicerSettings.header.outlineWeight
                }
            }];
        }

        private enumerateRows(data: GroupedImageSlicerData): VisualObjectInstance[] {
            var slicerSettings = this.settings;
            return [{
                selector: null,
                objectName: 'rows',
                properties: {
                    textSize: slicerSettings.slicerText.textSize,
                    height: slicerSettings.slicerText.height,
                    width: slicerSettings.slicerText.width,
                    background: slicerSettings.slicerText.background,
                    selectedColor: slicerSettings.slicerText.selectedColor,
                    unselectedColor: slicerSettings.slicerText.unselectedColor,
                    disabledColor: slicerSettings.slicerText.disabledColor,
                    outline: slicerSettings.slicerText.outline,
                    outlineColor: slicerSettings.slicerText.outlineColor,
                    outlineWeight: slicerSettings.slicerText.outlineWeight,
                    fontColor: slicerSettings.slicerText.fontColor,
                }
            }];
        }
/*
        private enumerateGeneral(data: GroupedImageSlicerData): VisualObjectInstance[] {
            var slicerSettings = this.settings;

            return [{
                selector: null,
                objectName: 'general',
                properties: {
                    orientation: slicerSettings.general.orientation,
                    columns: slicerSettings.general.columns,
                    rows: slicerSettings.general.rows,
                    showDisabled: slicerSettings.general.showDisabled,
                    multiselect: slicerSettings.general.multiselect,
                }
            }];
        }

        private enumerateImages(data: GroupedImageSlicerData): VisualObjectInstance[] {
            var slicerSettings = this.settings;
            return [{
                selector: null,
                objectName: 'images',
                properties: {
                    imageSplit: slicerSettings.images.imageSplit,
                    stretchImage: slicerSettings.images.stretchImage,
                    bottomImage: slicerSettings.images.bottomImage,
                }
            }];
        }*/
    }

    export interface GroupedImageSlicerBehaviorOptions {
        slicerItemContainers: D3.Selection;
        slicerItemLabels: D3.Selection;
        slicerItemInputs: D3.Selection;
        slicerClear: D3.Selection;
        dataPoints: GroupedImageSlicerDataPoint[];
        interactivityService: IInteractivityService;
        slicerSettings: GroupedImageSlicerSettings;
    }

    export class GroupedImageSlicerWebBehavior implements IInteractiveBehavior {
        private slicers: D3.Selection;
        private slicerItemLabels: D3.Selection;
        private slicerItemInputs: D3.Selection;
        private dataPoints: GroupedImageSlicerDataPoint[];
        private interactivityService: IInteractivityService;
        private slicerSettings: GroupedImageSlicerSettings;

        public bindEvents(options: GroupedImageSlicerBehaviorOptions, selectionHandler: ISelectionHandler): void {
            var filterPropertyId = groupedImageSlicerProps.filterPropertyIdentifier;
            var slicers = this.slicers = options.slicerItemContainers;
            this.slicerItemLabels = options.slicerItemLabels;
            this.slicerItemInputs = options.slicerItemInputs;
            var slicerClear = options.slicerClear;
            this.dataPoints = options.dataPoints;
            this.interactivityService = options.interactivityService;
            this.slicerSettings = options.slicerSettings;

            slicers.on("mouseover", (d: GroupedImageSlicerDataPoint) => {
                if (d.selectable) {
                    d.mouseOver = true;
                    d.mouseOut = false;
                    this.renderMouseover();
                }
            });

            slicers.on("mouseout", (d: GroupedImageSlicerDataPoint) => {
                if (d.selectable) {
                    d.mouseOver = false;
                    d.mouseOut = true;
                    this.renderMouseover();
                }
            });

            slicers.on("click", (d: GroupedImageSlicerDataPoint, index) => {
                if (d.selectable) {
                    //var settings = this.slicerSettings;
                    d3.event.preventDefault();
                    /*
                    if (d3.event.altKey && settings.general.multiselect) {
                        var selectedIndexes = jQuery.map(this.dataPoints, function(d, index) { if (d.selected) return index; });
                        var selIndex = selectedIndexes.length > 0 ? (selectedIndexes[selectedIndexes.length - 1]) : 0;
                        if (selIndex > index) {
                            var temp = index;
                            index = selIndex;
                            selIndex = temp;
                        }
                        selectionHandler.handleClearSelection();
                        var i;
                        for (i = selIndex; i <= index; i++) {
                            selectionHandler.handleSelection(this.dataPoints[i], true);
                        }
                    }
                    else if (d3.event.ctrlKey && settings.general.multiselect) {
                        selectionHandler.handleSelection(d, true);
                    }
                    else {
                        selectionHandler.handleSelection(d, false);
                    }
                    selectionHandler.persistSelectionFilter(filterPropertyId);
                    */
                }
            });

            slicerClear.on("click", (d: SelectableDataPoint) => {
                selectionHandler.handleClearSelection();
                selectionHandler.persistSelectionFilter(filterPropertyId);
            });
        }

        public renderSelection(hasSelection: boolean): void {
            if (!hasSelection && !this.interactivityService.isSelectionModeInverted()) {
                this.slicers.style('background', this.slicerSettings.slicerText.unselectedColor);
            }
            else {
                this.styleSlicerInputs(this.slicers, hasSelection);
            }
        }

        private renderMouseover(): void {
            this.slicerItemLabels.style({
                'color': (d: GroupedImageSlicerDataPoint) => {
                    if (d.mouseOver)
                        return this.slicerSettings.slicerText.hoverColor;

                    if (d.mouseOut) {
                        if (d.selected)
                            return this.slicerSettings.slicerText.fontColor;
                        else
                            return this.slicerSettings.slicerText.fontColor;
                    }
                }
            });
        }

        public styleSlicerInputs(slicers: D3.Selection, hasSelection: boolean) {
            var settings = this.slicerSettings;
            slicers.each(function(d: GroupedImageSlicerDataPoint) {
                d3.select(this).style({
                    'background': d.selectable ? (d.selected ? settings.slicerText.selectedColor : settings.slicerText.unselectedColor)
                        : settings.slicerText.disabledColor
                });
                d3.select(this).classed('slicerItem-disabled', !d.selectable);
            });
        }
    }
}
