module powerbi.extensibility.visual {

    export class Visual implements IVisual {

        //IVisual host
        private oHost: IVisualHost;

        //Array of selection ids to filter data
        private oSelectionID: any = {};

        //Selection manager to apply filter
        private oSelectionManager: ISelectionManager;

        //Category length from data set
        private iCategoryLength: number;

        //Hierarchy length from data set
        private iHierarchyLength: number;

        //Count to update the visual on first Load
        private bIsFirstLoad: boolean;

        //Start Date title from formatting options
        private static sStartDateCaption: string;

        //End Date title from formatting options
        private static sEndDateCaption: string;

        //Date format given from formattig options
        private static sDateFormat: string;

        //Data array to capture categorical data
        private oDataArray: any = {};

        //Data view from data-set
        private static oDataView: DataView;

        //Number of column name obtained from data views.
        private iDataColumnLength: number;

        //Visual update options to maipulate the visual.
        private oOptions;

        // Index value of Start Date
        private static iStartDateIndex: number;

        // Index value of End Date
        private static iEndDateIndex: number;

        // Index value of Filtering Value
        private static iFilteringValueIndex: number;

        // Start date value from last update
        private static sStartDateLast: string;

        // End date value from last update
        private static sEndDateLast: string;

        // To check if other visual is highlighted 
        public static bOtherVisualHighlighted: boolean;

        // To check if date is selected from date picker
        public static bIsDateSelected: boolean;

        // stores the font color of elements of the visual
        private static iFontColor: Fill;

        // stores the font size of elements of the visual
        private static iFontSize: number;

        /**
        * Creates instance of date picker filter. This method is only called once.
        *
        * @constructor
        * @param {VisualConstructorOptions} options - Contains references to the element that will
        *                                             contain the visual and a reference to the host
        *                                             which contains services.
        */
        constructor(options: VisualConstructorOptions) {

            Visual.bOtherVisualHighlighted = false;
            this.bIsFirstLoad = true;
            this.oHost = options.host;
            this.oSelectionManager = options.host.createSelectionManager();
            //Append date picker to visual
            if (this.oHost.locale === "en-US") {
                Visual.sDateFormat = "mm-dd-yy";
            }
            else {
                Visual.sDateFormat = "dd-mm-yy";
            }
            $(options.element).attr('id', 'mainWindow').attr('overflow', 'auto')
                .append("<div class='col-lg-6 col-md-6 col-xs-6 col-sm-6 datepickerContainer'><div class='myLabel' id='oStartDateLabel'>Start Date</div><input type='text' class='form-control' id='startdatepicker' placeholder = 'Select Start Date'></div>")
                .append("<div class='col-lg-6 col-md-6 col-xs-6 col-sm-6 datepickerContainer'><div class='myLabel' id='oEndDateLabel'>End Date</div><input type='text' class='form-control' id='enddatepicker' placeholder = 'Select End Date'></div>");

        }

        /**
        * Updates the state of the visual. Every sequential databinding and resize will call update.
        *
        * @function
        * @param {VisualUpdateOptions} options - Contains references to the size of the container
        *                                        and the dataView which contains all the data
        *                                        the visual had queried.
        */
        public update(options: VisualUpdateOptions) {

            //sMinDateFromStart -   Minimum start date from start dates data set.
            //sMinDateFromEnd   -   Minimum start date from end dates data set.
            //sMaxDateFromStart -   Maximum end date from end dates data set.
            //sMaxDateFromEnd   -   Maximum end date from start dates data set.
            //sFormattedMonth   -   Formatted month string
            //sFormattedDate    -   Formatted date string
            var sMinDateFromStart, sMinDateFromEnd, sMaxDateFromStart, sMaxDateFromEnd, sFormattedMonth, sFormattedDate, sDateFormat: string;

            // oMinStartDate    -   Minimum start date from start dates in date format
            // oMaxEndDate      -   Maximum end date from end dates in date format
            // oTempDate        -   Temporary variable to process dates
            var oMinStartDate, oMaxEndDate, oTempDate: Date;
            // oStartDateValue  - to store the category data of start date
            // oEndDateValue  - to store the category data of end date
            var oStartDateValue, oEndDateValue;
            // iCounter   - counter to iterate through the values
            var iCounter: number;
            // bIsDateHierarchy -   Check whether data is in hierarchy or without hierarchy.
            var bIsDateHierarchy: boolean;
            //Loads jQuery UI Date Picker
            function callBackFun() {

                $("#enddatepicker").datepicker({
                    changeYear: true,
                    changeMonth: true,
                    dateFormat: sDateFormat,
                    minDate: sMinDateFromStart,
                    maxDate: sMaxDateFromStart,
                });

                $("#startdatepicker").datepicker({
                    changeYear: true,
                    changeMonth: true,
                    dateFormat: sDateFormat,
                    minDate: sMinDateFromStart,
                    maxDate: sMaxDateFromStart,
                });
                $("#startdatepicker").datepicker("option", "dateFormat", sDateFormat)
                    .datepicker("option", "minDate", sMinDateFromStart)
                    .datepicker("option", "maxDate", sMaxDateFromStart);

                // if there is some value from last update retain that value else put the minimum date from the data set
                if (Visual.sStartDateLast) {
                    $("#startdatepicker").datepicker('setDate', Visual.sStartDateLast);
                }
                else {
                    $("#startdatepicker").datepicker('setDate', sMinDateFromStart);
                }
                $("#enddatepicker").datepicker("option", "dateFormat", sDateFormat)
                    .datepicker("option", "minDate", sMinDateFromStart)
                    .datepicker("option", "maxDate", sMaxDateFromStart);

                // if there is some value from last update retain that value else put the maximum date from the data set
                if (Visual.sEndDateLast) {
                    $("#enddatepicker").datepicker('setDate', Visual.sEndDateLast);
                }
                else {
                    $("#enddatepicker").datepicker('setDate', sMaxDateFromEnd);
                }
                $("head").append("<link rel='stylesheet' type='text/css' href='https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css'>");
            }

            //Return if data is not received or the length of categories is not as required
            if (options.dataViews.length === 0 || !options.dataViews[0].categorical || !(options.dataViews[0].categorical.categories.length != 3 || options.dataViews[0].categorical.categories.length != 9)) {
                Visual.diplayDataAlert(0);
                return;
            }
            //if the above condition is false remove the textToDisplay element
            Visual.removeDataAlert();

            $('.visual-sandbox').css('overflow', 'auto');
            $('#mainWindow').css('overflow', 'auto');
            $('#mainWindow').css('min-width', '260px');

            if (options.viewport.width <= 260) {
                options.viewport.width = 260;
            }

            // if window is resized, hide the date pickers
            if (options.type === 4) {
                $('#startdatepicker').datepicker('hide');
                $('#enddatepicker').datepicker('hide');
            }
            // Storing options.dataViews[0] in oDataView
            Visual.oDataView = options.dataViews[0];
            //Resetting alternate visual check
            Visual.bOtherVisualHighlighted = false;
            //Get title from date formatting options
            Visual.sStartDateCaption = getValue(Visual.oDataView, "startDateCaption", "");

            //Get title from date formatting options
            Visual.sEndDateCaption = getValue(Visual.oDataView, "endDateCaption", "");

            //Get date format from date formatting options
            Visual.sDateFormat = getValue(Visual.oDataView, "dateFormat", Visual.sDateFormat);
            sDateFormat = Visual.sDateFormat;

            Visual.iFontColor = Visual.getFill(Visual.oDataView, 'fontColor');
            $('#oStartDateLabel').css('color', <string>Visual.iFontColor);
            $('#oEndDateLabel').css('color', <string>Visual.iFontColor);

            // The font size of containers. We are normalizing it to be 12 at max as height is not changeable
            Visual.iFontSize = Number(getValue(Visual.oDataView, 'fontSize', ""));
            Visual.iFontSize = (16 * Visual.iFontSize) / 40;
            $('#oStartDateLabel').css('font-size', Visual.iFontSize + "px");
            $('#oEndDateLabel').css('font-size', Visual.iFontSize + "px");

            document.getElementById("oStartDateLabel").innerHTML = Visual.sStartDateCaption;
            document.getElementById("oEndDateLabel").innerHTML = Visual.sEndDateCaption;

            //Get options from visual update options.
            this.oOptions = options;

            // iIndex - iterator for column index assignment
            var iIndex: number;

            //Get number of columns from data set
            this.iDataColumnLength = Visual.oDataView.categorical.categories.length;

            // initially we keep the indexes as -1 so that the value can be changed when column is selected
            Visual.iStartDateIndex = -1;
            Visual.iEndDateIndex = -1;
            Visual.iFilteringValueIndex = -1;

            // assigning default values to iStartDateIndex, iEndDateIndex and iFilteringValueIndex
            for (iIndex = 0; iIndex < this.iDataColumnLength; iIndex++) {
                if (Visual.iStartDateIndex === -1) {
                    if (Visual.hasRole(options.dataViews[0].categorical.categories[iIndex].source, "startDate")) {
                        Visual.iStartDateIndex = iIndex;
                        oStartDateValue = options.dataViews[0].categorical.categories[Visual.iStartDateIndex];
                    }
                }
                else if (Visual.iEndDateIndex === -1) {
                    if (Visual.hasRole(options.dataViews[0].categorical.categories[iIndex].source, "endDate")) {
                        Visual.iEndDateIndex = iIndex;
                        oEndDateValue = options.dataViews[0].categorical.categories[Visual.iEndDateIndex];
                    }
                }
                else if (Visual.iFilteringValueIndex === -1) {
                    if (options.dataViews[0].categorical.categories[iIndex].source.roles["filteringValue"]) {
                        Visual.iFilteringValueIndex = iIndex;
                    }
                }
            }
            // checking if only date type columns are selected be in hierarchy or not for start date and end date
            if (Visual.iStartDateIndex !== -1 && Visual.iEndDateIndex !== -1 && Visual.iFilteringValueIndex !== -1) {
                if (!(oStartDateValue.source.displayName === "Year") || !(oEndDateValue.source.displayName === "Year")) {
                    for (iCounter = 0; iCounter < oStartDateValue.values.length; iCounter++) {
                        if (!(oStartDateValue.values[iCounter] == null) && !(oEndDateValue.values[iCounter] == null)) {
                            if (!(oStartDateValue.values[iCounter] instanceof Date) || !(oEndDateValue.values[iCounter] instanceof Date)) {
                                Visual.diplayDataAlert(1);
                                return;
                            }
                        }
                    }
                }
            }


            //if the above condition is false remove the textToDisplay element
            Visual.removeDataAlert();


            //Check if the data received is in hierarchy or without hierarchy
            if (Visual.oDataView.categorical.categories[Visual.iStartDateIndex].source.displayName != "Year") {

                //Check if start and end dates with at least one category is obtained from data set.
                if (this.iDataColumnLength < 3) {
                    Visual.diplayDataAlert(0);
                    return;
                }
                else {
                    // if the above condition is false and textToDisplay element is present remove it and proceed further
                    Visual.removeDataAlert();
                    //Intitalize iHierarchyLength in case where date is without hierarchy(2 Columns for Start Date and End Date).
                    this.iHierarchyLength = 2;

                    //Initialize bIsDateHierarchy in case where the data is given without hierarchy.
                    bIsDateHierarchy = false;
                }
            }
            else {
                if (this.iDataColumnLength < 9) {
                    Visual.diplayDataAlert(0);
                    return;
                }
                else {
                    // if the above condition is false and textToDisplay element is present remove it and proceed further
                    Visual.removeDataAlert();
                    // Initialize hierarchy length for start and end dates
                    this.iHierarchyLength = 8;

                    //Initialize bIsDateHierarchy in case where the data is given with hierarchy.
                    bIsDateHierarchy = true;
                }

            }

            //Initialize category length
            this.iCategoryLength = Visual.oDataView.categorical.categories[0].values.length;

            // Clear out any previous selection ids
            this.oSelectionID = {};

            this.oDataArray = [];

            //Capture categorical data and generate selection ids
            this.generateSelectionID();

            //Calculate minimum date from start dates
            sMinDateFromStart = getMinMaxDate(this.oDataArray, true, bIsDateHierarchy, false);
            if (Visual.bOtherVisualHighlighted) {
                return;
            }
            //Calculate minimum date from end dates
            sMinDateFromEnd = getMinMaxDate(this.oDataArray, false, bIsDateHierarchy, false);
            if (Visual.bOtherVisualHighlighted) {
                return;
            }
            if (new Date(sMinDateFromEnd) < new Date(sMinDateFromStart)) {
                sMinDateFromStart = sMinDateFromEnd;
            }
            sMinDateFromStart = Visual.changeFormatDDMMYYYY(sMinDateFromStart);

            //Change the date format from DD-MM-YYYY to the format specified in formatting options
            sMinDateFromStart = this.changeMinMaxDateFormat(sMinDateFromStart, sDateFormat);

            //Calculate maximum date from end dates
            sMaxDateFromStart = getMinMaxDate(this.oDataArray, false, bIsDateHierarchy, true);
            if (Visual.bOtherVisualHighlighted) {
                return;
            }
            //Calculate maximum date from start dates
            sMaxDateFromEnd = getMinMaxDate(this.oDataArray, true, bIsDateHierarchy, true);
            if (Visual.bOtherVisualHighlighted) {
                return;
            }
            if (new Date(sMaxDateFromEnd) > new Date(sMaxDateFromStart)) {
                sMaxDateFromStart = sMaxDateFromEnd;
            }
            sMaxDateFromStart = Visual.changeFormatDDMMYYYY(sMaxDateFromStart);

            //Change the date format from DD-MM-YYYY to the format specified in formatting options
            sMaxDateFromStart = this.changeMinMaxDateFormat(sMaxDateFromStart, sDateFormat);

            loadJQueryUI(callBackFun);

            // call change event of date picker only if it is first load or some date is selected from date picker
            if (this.bIsFirstLoad || Visual.bIsDateSelected) {
                $("#startdatepicker").change();
                $("#enddatepicker").change();
            }

            this.bIsFirstLoad = false;
            Visual.bIsDateSelected = false;

            $("#enddatepicker").change(function (ev) {

                //Handle click event of date picker
                this.datePickerClick();

            }.bind(this));

            $("#startdatepicker").change(function (ev) {

                //Handle click event of date picker
                this.datePickerClick();

            }.bind(this));

        }

        /**
        * Chage date format from YYYY-MM-DD to DD-MM-YYYY
        *
        * @function
        * @param {string} sDate - Date given in YYYY-MM-DD format
        */
        private static changeFormatDDMMYYYY(sDate: string) {
            let sForamttedDate = sDate.substr(8, 2) + "-" + sDate.substr(5, 2) + "-" + sDate.substr(0, 4);
            return sForamttedDate;
        }

        /**
         * Check if dataView has a given role
         * @param column The dataView headers
         * @param name The role to find
         */
        private static hasRole(column: DataViewMetadataColumn, name: string) {
            const roles = column.roles;
            return roles && roles[name];
        }

        /* method to clear all selection ids when destroy is called 
        */
        public destroy(): void {
            this.oSelectionID = {};
            //this.oSelectionManager.clear();
        }

        /* method to display basic requirements if the selection of columns is not appropriate
        * @param {number} iRequirementType - if it is 1 means the data type of columns is not appropriate and if it is anything else it means not all fields are selected
        */
        public static diplayDataAlert(iRequirementType: number) {
            // remove textToDisplay element if it exists
            Visual.removeDataAlert();
            $('#mainWindow').append('<p id = "textToDisplay"></p>');
            if (iRequirementType === 1) {
                document.getElementById('textToDisplay').innerHTML = `Please select date type column for 'Start date' and 'End date. Both should either be in heirarchy or not in heirarchy'`;
            }
            else {
                document.getElementById('textToDisplay').innerHTML = `Please select 'Start date', 'End date' and 'Filtering value'`;
            }
        }

        //method to check if basic requirements are displayed remove it
        public static removeDataAlert() {
            $('#textToDisplay').remove();
        }

        public applyFiltering(oStartDate: Date, oEndDate: Date, bIsHierarchy: boolean) {
            if (this.iDataColumnLength < 3 || this.iDataColumnLength < 9) {
                Visual.diplayDataAlert(0);
                return;
            }
            else {
                Visual.removeDataAlert();
                if (Visual.bIsDateSelected) {
                    this.filterData(bIsHierarchy, oStartDate, oEndDate);
                }
                else {
                    return;
                }
            }
        }

        public datePickerClick() {

            var sStartDate, sEndDate;

            // click event is called so make bIsDateSelected true
            Visual.bIsDateSelected = true;
            //Return if data is not received
            if (this.oOptions.dataViews.length === 0) {
                Visual.diplayDataAlert(0);
                return;
            }
            // if above condition is false remove textToDisplay element if present
            Visual.removeDataAlert();

            //Fetch start and end date
            if (document.getElementById("startdatepicker") != null && document.getElementById("enddatepicker") != null) {
                sStartDate = document.getElementById("startdatepicker")["value"];
                sEndDate = document.getElementById("enddatepicker")["value"];
            }



            // store the selected dates in a global variable to retain the values in next update
            Visual.sStartDateLast = sStartDate;
            Visual.sEndDateLast = sEndDate;

            // Change date format of date picker to acceptable date format in Date constructor
            sStartDate = this.changeDateFormat(sStartDate, Visual.sDateFormat);
            sEndDate = this.changeDateFormat(sEndDate, Visual.sDateFormat);

            //Remove previous selection
            this.oSelectionManager.clear();

            var oStartDate = new Date(sStartDate);
            oStartDate.setHours(0, 0, 0, 0);
            var oEndDate = new Date(sEndDate);
            oEndDate.setHours(0, 0, 0, 0);

            this.iCategoryLength = Visual.oDataView.categorical.categories[0].values.length;
            if (oStartDate <= oEndDate) {
                //Apply filtering to data with date hierarchy only if date is selected on click event of datepicker
                if (Visual.oDataView.categorical.categories[0].source.displayName !== "Year") {
                    this.applyFiltering(oStartDate, oEndDate, false);
                }
                else {
                    this.applyFiltering(oStartDate, oEndDate, true);
                }
            }
        }

        /**
        * Generates selection ids for applying cross filtering on data.
        *
        * @function
        */
        public generateSelectionID() {
            var iCategoryCount, iHierarchyCounter: number;

            //Capture categorical data and create selection ids
            for (iCategoryCount = 0; iCategoryCount < this.iCategoryLength; iCategoryCount++) {
                this.oDataArray[iCategoryCount] = [];
                for (iHierarchyCounter = 0; iHierarchyCounter < this.iHierarchyLength; iHierarchyCounter++) {
                    if (Visual.oDataView.categorical.categories[iHierarchyCounter].values[iCategoryCount] && Visual.oDataView.categorical.categories[iHierarchyCounter].values[iCategoryCount] !== null) {
                        this.oDataArray[iCategoryCount][iHierarchyCounter] = Visual.oDataView.categorical.categories[iHierarchyCounter].values[iCategoryCount];
                    }
                }

                //Create selection ids for every row of data
                this.oSelectionID[iCategoryCount] = this.oHost.createSelectionIdBuilder()
                    .withCategory(Visual.oDataView.categorical.categories[iHierarchyCounter], iCategoryCount)
                    .createSelectionId();
            }
        }

        /**
        * Enumerates through the objects defined in the capabilities and adds the properties to the format pane
        *
        * @function
        * @param {EnumerateVisualObjectInstancesOptions} options - Map of defined objects
        */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {

            let oObjectName = options.objectName;
            let oObjectEnumeration: VisualObjectInstance[] = [];
            var dataView = Visual.oDataView;
            switch (options.objectName) {
                case "datePicker":
                    var oContainers: VisualObjectInstance = {
                        objectName: "datePicker",
                        displayName: "datePicker",
                        selector: null,
                        properties: {
                            startDateCaption: getValue(dataView, "startDateCaption", ""),
                            endDateCaption: getValue(dataView, "endDateCaption", ""),
                            dateFormat: getValue(dataView, "dateFormat", Visual.sDateFormat),
                            fontSize: getValue(dataView, "fontSize", ""),
                            fontColor: Visual.getFill(dataView, "fontColor")
                        }
                    };

                    oObjectEnumeration.push(oContainers);
                    break;
            }
            return oObjectEnumeration;
        }

        /*
        * method to get the color of font or background whichever is needed
        * @param {DataView} oDataView - contains the DataView of options
        * @param {string} sKey - name of property whose value is needed
        */
        private static getFill(oDataView: DataView, sKey: string): Fill {
            if (oDataView) {
                var oFormatOptions = oDataView.metadata.objects;
                if (oFormatOptions) {
                    // return appropriate value as per the formatting options selected
                    var oConfiguration = oFormatOptions['datePicker'];
                    if (oConfiguration) {
                        var oFill = <Fill>oConfiguration[sKey];
                        if (oFill)
                            return oFill.solid.color;
                    }
                }
            }
            // if no value is choosen set default values
            if ('fontColor' === sKey) {
                return "#043c74";
            }
        }

        //Performs filtering on data without hierarchy based on generated selection ids.
        public filterData(bIsDateHierarchy: boolean, oStartDate: Date, oEndDate: Date) {

            //sCheckDate1 - Start date obtained from data set
            //sCheckDate2 - End date obtained from data set
            var sCheckDate1, sCheckDate2: string;

            //oCheckDate1 - Start date from data set in date format
            //oCheckDate2 - End date from data set in date format
            var oCheckDate1, oCheckDate2: Date;

            //Looping variable for counting purpose
            var iCategoryCount;

            //Check whether start and end dates are in range.
            var bIsStartDateValid, bIsEndDateValid;

            //Apply filtering to data without date hierarchy
            for (iCategoryCount = 0; iCategoryCount < this.iCategoryLength; iCategoryCount++) {
                if (bIsDateHierarchy) {
                    if (this.oDataArray[iCategoryCount][0] === undefined && this.oDataArray[iCategoryCount][4] === undefined && !this.bIsFirstLoad) {
                        continue;
                    }
                }
                else {
                    if (this.oDataArray[iCategoryCount][0] === undefined && this.oDataArray[iCategoryCount][1] === undefined && !this.bIsFirstLoad) {
                        continue;
                    }
                }

                oCheckDate1 = null;
                oCheckDate2 = null;

                //Initialize check dates in case of date with hierarchy
                if (bIsDateHierarchy) {
                    if (this.oDataArray[iCategoryCount][0] !== undefined) {
                        sCheckDate1 = this.oDataArray[iCategoryCount][2] + " " + this.oDataArray[iCategoryCount][3] + " " + this.oDataArray[iCategoryCount][0];
                        oCheckDate1 = new Date(sCheckDate1);
                    }

                    if (this.oDataArray[iCategoryCount][4] !== undefined) {
                        sCheckDate2 = this.oDataArray[iCategoryCount][6] + " " + this.oDataArray[iCategoryCount][7] + " " + this.oDataArray[iCategoryCount][4];
                        oCheckDate2 = new Date(sCheckDate2);
                    }
                }
                else {

                    if (this.oDataArray[iCategoryCount][0] !== undefined) {
                        oCheckDate1 = new Date(this.oDataArray[iCategoryCount][0]);
                    }

                    if (this.oDataArray[iCategoryCount][1] !== undefined) {
                        oCheckDate2 = new Date(this.oDataArray[iCategoryCount][1]);
                    }
                }

                //Check whether start date is in specified range.
                if (oCheckDate1 !== null) {
                    oCheckDate1.setHours(0, 0, 0, 0);
                    bIsStartDateValid = (oCheckDate1 >= oStartDate && oCheckDate1 <= oEndDate);
                }

                //Check whether end date is in specified range.
                if (oCheckDate2 !== null) {
                    oCheckDate2.setHours(0, 0, 0, 0);
                    bIsEndDateValid = (oCheckDate2 >= oStartDate && oCheckDate2 <= oEndDate);
                }
                //Apply filter on data
                if ((oCheckDate1 && oCheckDate2 && bIsStartDateValid && bIsEndDateValid) || ((!(oCheckDate1 && oCheckDate2)) && ((oCheckDate1 && bIsStartDateValid) || (oCheckDate2 && bIsEndDateValid)))) {
                    this.oSelectionManager.select(this.oSelectionID[iCategoryCount], true).then((ids: ISelectionId[]) => { });
                }
            }

        }

        /**
        * Changes date format from DD-MM-YYYY to user specified format.
        *
        * @function
        * @param {string} sDate - Date given in DD-MM-YYYY format
        * @param {string} sFormat - Date Format specified by user
        */
        public changeMinMaxDateFormat(sDate: string, sFormat: string): string {

            var sJoinDelimiter: string;
            var sResult: string;
            var iDate, iMonth, iYear: number;
            sJoinDelimiter = "-";
            iDate = parseInt(sDate.substr(0, 2));
            iMonth = parseInt(sDate.substr(3, 2));
            iYear = parseInt(sDate.substr(6, 4));

            //Check if month is preceded by date or date is preceded by month.
            if (sFormat.indexOf("d") < sFormat.indexOf("m")) {
                if (sFormat.indexOf("dd") !== -1) {
                    //Convert date in double digit as specified by user
                    sResult = appendZero(iDate);
                }
                else {
                    sResult = iDate + "";
                }
                if (sFormat.indexOf("mm") !== -1) {
                    //Convert month in double digit as specified by user
                    sResult += sJoinDelimiter + appendZero(iMonth);
                }
                else {
                    sResult += sJoinDelimiter + iMonth;
                }
            }
            else {

                //Convert month in double digit as specified by user
                if (sFormat.indexOf("mm") !== -1) {
                    sResult = appendZero(iMonth);
                }
                else {
                    sResult = iMonth + "";
                }

                //Convert date in double digit as specified by user
                if (sFormat.indexOf("dd") !== -1) {
                    //date in double digit
                    sResult += sJoinDelimiter + appendZero(iDate);
                }
                else {
                    sResult += sJoinDelimiter + iDate;
                }
            }
            sResult += sJoinDelimiter + iYear;

            return sResult;
        }

        /**
        * Chage date format of date picker to acceptable date format in Date constructor.
        *
        * @function
        * @param {string} sDate - Date given in DD-MM-YYYY format
        * @param {string} sFormat - Date Format specified by user
        */
        public changeDateFormat(sDate: string, sFormat: string): string {

            var iDateIndex, iMonthIndex, iYearIndex, iDate, iMonth, iYear: number;
            var sResult: string;
            var sMonthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];

            var iIndexOfD, iIndexOfM, iIndexOfYY;

            iIndexOfD = sFormat.indexOf("d");
            iIndexOfM = sFormat.indexOf("m");
            iIndexOfYY = sFormat.indexOf("yy");

            if (iIndexOfD === -1 && iIndexOfM === -1 && iIndexOfYY === -1) {
                return null;
            }

            if (iIndexOfD !== -1) {
                if (iIndexOfM !== -1) {
                    if (iIndexOfYY !== -1) {

                        if (iIndexOfD < iIndexOfM) {
                            //Obtained format d/m/yy or dd/m/yy or dd/m/yy or dd/mm/yy
                            iDateIndex = 0;

                            if (sDate.charAt(iDateIndex + 1) !== ' ' && sDate.charAt(iDateIndex + 1) !== '/' && sDate.charAt(iDateIndex + 1) !== '-') {
                                iDate = parseInt(sDate.substr(iDateIndex, 2));
                                iMonthIndex = iDateIndex + 3;
                            } else {
                                iDate = parseInt(sDate.substr(iDateIndex, 1));
                                iMonthIndex = iDateIndex + 2;
                            }

                            if (sDate.charAt(iMonthIndex + 1) !== ' ' && sDate.charAt(iMonthIndex + 1) !== '/' && sDate.charAt(iMonthIndex + 1) !== '-') {
                                iMonth = parseInt(sDate.substr(iMonthIndex, 2));
                                iYearIndex = iMonthIndex + 3;
                            } else {
                                iMonth = parseInt(sDate.substr(iMonthIndex, 1));
                                iYearIndex = iMonthIndex + 2;
                            }

                            iYear = parseInt(sDate.substr(iYearIndex, 4));

                            sResult = sMonthNames[iMonth - 1] + " " + iDate + " " + iYear;
                        }
                        else {
                            //obtained format m/d/yy or m/dd/yy or mm/d/yy or mm/dd/yy
                            iMonthIndex = 0;
                            if (sDate.charAt(iMonthIndex + 1) !== ' ' && sDate.charAt(iMonthIndex + 1) !== '/' && sDate.charAt(iMonthIndex + 1) !== '-') {
                                iMonth = parseInt(sDate.substr(iMonthIndex, 2));
                                iDateIndex = iMonthIndex + 3;
                            } else {
                                iMonth = parseInt(sDate.substr(iMonthIndex, 1));
                                iDateIndex = iMonthIndex + 2;
                            }

                            if (sDate.charAt(iDateIndex + 1) !== ' ' && sDate.charAt(iDateIndex + 1) !== '/' && sDate.charAt(iDateIndex + 1) !== '-') {
                                iDate = parseInt(sDate.substr(iDateIndex, 2));
                                iYearIndex = iDateIndex + 3;
                            } else {
                                iDate = parseInt(sDate.substr(iDateIndex, 1));
                                iYearIndex = iDateIndex + 2;
                            }

                            iYear = parseInt(sDate.substr(iYearIndex, 4));

                            sResult = sMonthNames[iMonth - 1] + " " + iDate + " " + iYear;
                        }
                    }
                }
            }

            return sResult;
        }
    }

    /**
    * Gets property value for a particular object.
    *
    * @function
    * @param {DataViewObjects} dataView - Map of defined objects.
    * @param {string} sKey              - Name of desired property.
    * @param {string} sFormat           - Format based on locale.
    */
    export function getValue(dataView: DataView, sKey: string, sFormat: string): string {
        if (dataView) {

            var oFormatOptions = dataView.metadata.objects;
            if (oFormatOptions) {
                var oContainers = oFormatOptions["datePicker"];
                if (oContainers) {
                    var sValue = <string>oContainers[sKey];
                    if (sValue && sValue !== null && sValue.toString().length !== 0) {
                        return sValue;
                    }
                }
            }
        }
        switch (sKey) {
            case "startDateCaption":
                return "Start Date";
            case "endDateCaption":
                return "End Date";
            case "fontSize":
                return "30";
            default:
                if (sFormat) {
                    return "mm-dd-yy";
                }
                else {
                    return sFormat;
                }
        }
    }

    /**
    * Appends zero to given number which is further used for date processing.
    * @function
    * @param {number} iNumber - Number to which zero will be appended.
    */
    export function appendZero(iNumber: number): string {
        var sResult: string;
        sResult = ("0" + iNumber).slice(-2)
        return sResult;
    }

    /**
    * Finds mimimum and maximum dates from given data array.
    *
    * @function
    * @param {any} oDataArray - Data values obtained form categories.
    * @param {boolean} bIsStartDate - Boolean value which determines whether it is start date or end date.
    * @param {boolean} bIsDateHierarchy - Boolean value which determines whether dates are in hierarchy.
    * @param {boolean} bFindMax - Boolean value which determines whether th find mimimum or maximum date.
    */
    export function getMinMaxDate(oDataArray: any, bIsStartDate: boolean, bIsDateHierarchy: boolean, bFindMax: boolean): string {
        var iStartIndex, iDataArrayCounter, iMonth, iDate, iIndex, iCounter: number;
        var oResultEndDate, oTempDate: Date;
        var sFormattedMonth, sFormattedDate, sResultDateString: string;
        var oDateValueArray = [];

        iStartIndex = 0;

        if (bIsDateHierarchy) {
            if (bIsStartDate) {
                iIndex = 0;
            }
            else {
                iIndex = 4;
            }
        }
        else {
            if (bIsStartDate) {
                iIndex = 0;
            }
            else {
                iIndex = 1;
            }
        }

        // handle the scenario when some other visual is highlighted and there is no data for either start date or end date
        for (iCounter = 0; iCounter < oDataArray.length; iCounter++) {
            if (oDataArray[iCounter].length !== 0) {
                if (!oDataArray[iCounter][iIndex]) {
                    Visual.bOtherVisualHighlighted = true;
                }
                else {
                    Visual.bOtherVisualHighlighted = false;
                    break;
                }
            }
            else {
                Visual.bOtherVisualHighlighted = false;
            }
        }
        if (Visual.bOtherVisualHighlighted) {
            return;
        }

        // if above condition is false then remove any textToDisplay element
        Visual.removeDataAlert();
        //Find first not null element.
        while (oDataArray[iStartIndex].length === 0 || !oDataArray[iStartIndex][iIndex] || oDataArray[iStartIndex][iIndex] === null) {
            iStartIndex++;
        }

        //Initialize result variable with first not null element for comparison.
        if (iStartIndex < oDataArray.length) {
            if (bIsDateHierarchy) {
                oResultEndDate = new Date(oDataArray[iStartIndex][iIndex + 2] + " " + oDataArray[iStartIndex][iIndex + 3] + " " + oDataArray[iStartIndex][iIndex]);
            }
            else {
                oResultEndDate = new Date(oDataArray[iStartIndex][iIndex]);
            }

            iStartIndex++;
        }

        //Find minimum or maximum date from given array

        for (iDataArrayCounter = iStartIndex; iDataArrayCounter < oDataArray.length; iDataArrayCounter++) {
            if (oDataArray[iDataArrayCounter][iIndex]) {
                if (bIsDateHierarchy) {
                    oTempDate = new Date(oDataArray[iDataArrayCounter][iIndex + 2] + " " + oDataArray[iDataArrayCounter][iIndex + 3] + " " + oDataArray[iDataArrayCounter][iIndex]);
                }
                else {
                    oTempDate = new Date(oDataArray[iDataArrayCounter][iIndex]);
                }

                if (bFindMax) {
                    if (oTempDate > oResultEndDate) {
                        oResultEndDate = oTempDate;
                    }
                }
                else {
                    if (oTempDate < oResultEndDate) {
                        oResultEndDate = oTempDate;
                    }
                }

            }
        }

        //Convert date to string format
        var iMonth = oResultEndDate.getMonth() + 1;
        var iDate = oResultEndDate.getDate();
        sFormattedMonth = appendZero(iMonth);
        sFormattedDate = appendZero(iDate);
        sResultDateString = oResultEndDate.getFullYear() + "-" + sFormattedMonth + "-" + sFormattedDate;

        return sResultDateString;
    }

}