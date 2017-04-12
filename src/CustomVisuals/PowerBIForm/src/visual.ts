/*
 *  Power BI Visual CLI
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
    class SelectListItem{
        public option: string;
        public value: string;

        constructor(option: string, value: string){
            this.option = option;
            this.value = value;
        }
    }

    /**
     * Interface for BarCharts viewmodel.
     *
     * @interface
     * @property {BarChartDataPoint[]} dataPoints - Set of data points the visual will render.
     * @property {number} dataMax                 - Maximum data value in the set of data points.
     */
    interface BarChartViewModel {
        dataPoints: BarChartDataPoint[]; 
    };

    /**
     * Interface for BarChart data points.
     *
     * @interface
     * @property {number} value             - Data value for point.
     * @property {string} category          - Corresponding category of data value.
     * @property {string} color             - Color corresponding to data point.
     * @property {ISelectionId} selectionId - Id assigned to data point for cross filtering
     *                                        and visual interaction.
     */
    interface BarChartDataPoint {
        value: string;
        category: string;
    };

    /**
     * Interface for BarChart settings.
     *
     * @interface
     * @property {{show:boolean}} enableAxis - Object property that allows axis to be enabled.
     */
    interface BarChartSettings {
        enableAxis: {
            show: boolean;
        };
    }

    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): BarChartViewModel {
        let dataViews = options.dataViews;
        let viewModel: BarChartViewModel = {
            dataPoints: []
        };

        //debugger;   

        if (!dataViews
            || !dataViews[0]
            || !dataViews[0].categorical
            || !dataViews[0].categorical.categories
            || !dataViews[0].categorical.categories[0].source
            || !dataViews[0].categorical.categories[1].source
            )
            return viewModel;

        //debugger;
        let categorical = dataViews[0].categorical;
        let category = categorical.categories[0];
        let category1 = categorical.categories[1];

        let barChartDataPoints: BarChartDataPoint[] = [];
        let dataMax: number;

        let colorPalette: IColorPalette = host.colorPalette;
        let objects = dataViews[0].metadata.objects;
    
        for (let i = 0, len = Math.max(category.values.length); i < len; i++) {

            barChartDataPoints.push({
                category: category.values[i] + '',
                value: category1.values[i] + ''
            });
        }

        return {
            dataPoints: barChartDataPoints
        };
    }

    export class Visual implements IVisual {
        private target: HTMLElement;
        private formControlLabelClass: string;
        private formControlInputClass: string;
        private formBtnClass: string;
        private selectListOptions: SelectListItem[];
        private fileOutputHolder: Blob;
        private host: IVisualHost;
        
        
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.target = options.element;
            this.formControlLabelClass = "col-sm-6 col-md-6 col-xs-12";
            this.formControlInputClass = "col-sm-6 col-md-6 col-xs-12 form-control";
            this.formBtnClass = "btn btn-default btn-success";
            this.selectListOptions = new Array<SelectListItem>();
            
            let divContainer = document.createElement("div");
            divContainer.setAttribute("class","container");
            divContainer.setAttribute("id","container");
            
            let wrapperDiv = this.createFormElementWrapperDiv("divChannel9User");
            wrapperDiv.appendChild(this.createLabel("lblChannel9User", this.formControlLabelClass, "Please enter your Channel 9 User account (If you have one)"));
            wrapperDiv.appendChild(this.createInputBox("txtChannel9User", this.formControlInputClass, "txtChannel9User"));
            divContainer.appendChild(wrapperDiv);
            

            this.selectListOptions.push(new SelectListItem("", ""));
            this.selectListOptions.push(new SelectListItem("Low (not Urgent, would like a response in a few days)", "3"));
            this.selectListOptions.push(new SelectListItem("Medium (Blocking work in some way, not a public facing issue)", "2"));
            this.selectListOptions.push(new SelectListItem("High (Blocking a time sensitive event, like a product announcment or impacts public experience)", "1"));

            wrapperDiv = this.createFormElementWrapperDiv("dropDownPriority");
            wrapperDiv.appendChild(this.createLabel("lblPriority", this.formControlLabelClass, "Please Select a Priority"));
            wrapperDiv.appendChild(this.createDropDown("selPriority", this.formControlInputClass, "selPriority", this.selectListOptions));
            divContainer.appendChild(wrapperDiv);
            
            this.selectListOptions = [];

            wrapperDiv = this.createFormElementWrapperDiv("dropDownReason");
            wrapperDiv.appendChild(this.createLabel("lblPriority", this.formControlLabelClass, "Please select the reason for your request from the list below"));
            wrapperDiv.appendChild(this.createDropDown("selReason", this.formControlInputClass, "selReason", this.selectListOptions));
            divContainer.appendChild(wrapperDiv);
            
            wrapperDiv = this.createFormElementWrapperDiv("divReasonSelection");
            wrapperDiv.appendChild(this.createLabel("lblReasonSelection", "col-sm-12 col-md-12 col-xs-12", "For reasons 3, 4, 5, 6, and 7 we will need the URL for the item you are discussing. If it is not yet public please provide the URL to the admin edit page."));
            divContainer.appendChild(wrapperDiv);

            wrapperDiv = this.createFormElementWrapperDiv("divProvideURL");
            wrapperDiv.appendChild(this.createLabel("lblProvideURL", this.formControlLabelClass, "Please provide the url (if applicable)"));
            wrapperDiv.appendChild(this.createInputBox("txtProvideURL", this.formControlInputClass, "txtProvideURL"));
            divContainer.appendChild(wrapperDiv);
            
            wrapperDiv = this.createFormElementWrapperDiv("divDescription");
            wrapperDiv.appendChild(this.createLabel("lblDescription", this.formControlLabelClass, "Please enter a detailed description of the issue with as much detail as possible."));
            wrapperDiv.appendChild(this.createTextArea("txtDescription", this.formControlInputClass, "txtDescription"));
            divContainer.appendChild(wrapperDiv);
            
            wrapperDiv = this.createFormElementWrapperDiv("divScreenShot");
            wrapperDiv.appendChild(this.createLabel("lblScreenshot", this.formControlLabelClass, "Please upload any screenshots you may have (5MB Limit)"));
            wrapperDiv.appendChild(this.createInputBox("fileScreenshot", this.formControlInputClass, "fileScreenshot", "file"));
            wrapperDiv.addEventListener('change', this.handleFileInput, false);
            divContainer.appendChild(wrapperDiv);
            
            wrapperDiv = this.createFormElementWrapperDiv("divSubmit");
            wrapperDiv.appendChild(this.createLabel("lblBlank", this.formControlLabelClass, ""));
            wrapperDiv.appendChild(this.createInputBox("btnSubmit", this.formBtnClass, "btnSubmit", "submit"));
            divContainer.appendChild(wrapperDiv);

            wrapperDiv = this.createFormElementWrapperDiv("divLabel");
            wrapperDiv.appendChild(this.createLabel("lblBlank1", this.formControlLabelClass, ""));
            wrapperDiv.appendChild(this.createLabel("lblMessage", this.formControlLabelClass, ""));
            divContainer.appendChild(wrapperDiv);

            this.target.appendChild(divContainer);

            let btn = document.getElementById("btnSubmit");
            var thisObj = this;
            btn.addEventListener("click", function(){
                var txtChannel9User: string = ( <HTMLInputElement> document.getElementById("txtChannel9User")).value;
                var selPriority: string = $("#selPriority option:selected").text();
                var selReason: string = $("#selReason option:selected").text();
                var txtProvideURL: string = ( <HTMLInputElement> document.getElementById("txtProvideURL")).value;
                var txtDescription: string = ( <HTMLTextAreaElement> document.getElementById("txtDescription")).value;
                var files = ( <HTMLInputElement> document.getElementById("fileScreenshot")).files;
                var varFileReader = new FileReader();
                
               if (files.length>0 && selPriority != "" && selReason != "" && txtDescription != "" && txtChannel9User != "" && txtProvideURL != ""){
                    var fileCnt = files.length, i, screenShot;
                    for (i = 0; i < fileCnt; i++) {
                        var binary, length, bytes;
                        varFileReader.onerror = function(){
                            thisObj.errorHandler(event);
                        }
                        varFileReader.onloadstart = function(e) {
                            console.log("File Reading started!!!");
                        };
                        varFileReader.onload = function () {
                            binary = "";
                            bytes = new Uint8Array(varFileReader.result);
                            length = bytes.byteLength;
                            for (i = 0; i < length; i = i + 1) {
                                binary += String.fromCharCode(bytes[i]);
                            }
                            //console.log(window.btoa(binary));
                            screenShot = window.btoa(binary);
                            console.log(screenShot);
                            console.log("File Reading done!!!");

                            var finalJSON = {
                                "txtChannel9User"   : txtChannel9User,
                                "selPriority"       : selPriority,
                                "selReason"         : selReason,
                                "txtProvideURL"     : txtProvideURL,
                                "txtDescription"    : txtDescription,
                                "ScreenShot"        : screenShot
                            };

                            //Ajax Call
                            console.log(finalJSON);
                            jQuery.ajax({
                                url: "<URL For Service>",
                                contentType: "application/json",
                                data: JSON.stringify(finalJSON),
                                method: "POST",
                                success: function(result){
                                    ( <HTMLLabelElement> document.getElementById("lblMessage")).innerText = result.message;
                                    ( <HTMLInputElement> document.getElementById("txtChannel9User")).value = "";
                                    ( <HTMLSelectElement> document.getElementById("selPriority")).value = "";
                                    ( <HTMLSelectElement> document.getElementById("selReason")).value = "";
                                    ( <HTMLInputElement> document.getElementById("txtProvideURL")).value = "";
                                    ( <HTMLTextAreaElement> document.getElementById("txtDescription")).value = "";
                                    ( <HTMLInputElement> document.getElementById("fileScreenshot")).value = "";
                                    setTimeout(function(){ ( <HTMLLabelElement> document.getElementById("lblMessage")).innerText = ""; }, 3000);
                                }
                            });
                        }
                        varFileReader.readAsArrayBuffer(files[i]);
                        console.log(files[i].name);                        
                    }                    
                }else {
                    ( <HTMLLabelElement> document.getElementById("lblMessage")).innerText = "Please fill out all fields.";
                    setTimeout(function(){ ( <HTMLLabelElement> document.getElementById("lblMessage")).innerText = ""; }, 3000);
                    console.log("Please fill out all mandatory fields.");
                }
            });


        }

        public update(options: VisualUpdateOptions){
            var $ = jQuery;
            let viewModel: BarChartViewModel = visualTransform(options, this.host);
            //debugger;
            console.log(viewModel);
            
            this.selectListOptions = [];

            $("#dropDownPriority option").remove();
            $("#dropDownReason option").remove();
            //debugger;
            var list = [];
            for (var i=0; i<viewModel.dataPoints.length; i++) {
                if (list.indexOf(viewModel.dataPoints[i].category) < 0)
                list.push(viewModel.dataPoints[i].category);
            }

            this.selectListOptions.push(new SelectListItem("", ""));
            for (var i=0; i<list.length; i++) {
                if (this.selectListOptions.indexOf(new SelectListItem(list[i], i.toString())) < 0)
                this.selectListOptions.push(new SelectListItem(list[i], i.toString()));
            }

            this.selectListOptions.forEach(element => {
                    let eachOption = document.createElement("option");
                    eachOption.setAttribute("value",element.value);
                    eachOption.innerText = element.option;
                    //debugger;
                    $("#dropDownPriority select").append(eachOption);
                });
            
            $("#dropDownPriority select").change(function(){
                $("#dropDownReason option").remove();
                var selectListOptions = [];
                //debugger;
                var selectedPriority = $("#selPriority option:selected").text();
                for (var i=0; i<viewModel.dataPoints.length; i++) {
                    if (viewModel.dataPoints[i].category === selectedPriority)
                    selectListOptions.push(new SelectListItem(viewModel.dataPoints[i].value, i.toString()));
                }

                selectListOptions.forEach(element => {
                        let eachOption = document.createElement("option");
                        eachOption.setAttribute("value",element.value);
                        eachOption.innerText = element.option;
                        $("#dropDownReason select").append(eachOption);
                    });
            });
        }


        //Handeling the file input
        public handleFileInput(evt): void{
            var reader = new FileReader();
            var thisObj = this;
            reader.onerror = function(){
                thisObj.errorHandler(event);
            }
            reader.onloadstart = function(e) {
                console.log("File Reading started!!!");
            };
            reader.onload = function(e) {
              console.log("File Reading done!!!");
              console.log(reader.result);
              thisObj.fileOutputHolder = evt.target.files[0];
            }
            reader.readAsArrayBuffer(evt.target.files[0]);
        }

        public errorHandler(evt): void {
            switch(evt.target.error.code) {
                case evt.target.error.NOT_FOUND_ERR:
                  console.log('File Not Found!');
                  break;
                case evt.target.error.NOT_READABLE_ERR:
                  console.log('File is not readable');
                  break;
                case evt.target.error.ABORT_ERR:
                  break; // noop
                default:
                  console.log('An error occurred reading this file.');
            };
        }


        public createFormElementWrapperDiv(Id): HTMLElement{
            let FormElementWrapperDiv = document.createElement("div");
            FormElementWrapperDiv.setAttribute("class","form-group col-sm-12 col-xs-12");
            FormElementWrapperDiv.setAttribute("id", Id)
            return FormElementWrapperDiv;
        }

        public createInputBox(id: string, className: string, name: string, type?: string): HTMLElement{
            var inputType = "";
            if (type===null||type===undefined) {
                inputType="text";
            } else {
                inputType = type;
            }
            let inputBox = document.createElement("input");
            inputBox.setAttribute("class", className);
            inputBox.setAttribute("name", name);
            inputBox.setAttribute("id", id);
            inputBox.setAttribute("value", "");
            inputBox.setAttribute("type", inputType);
            if(type=="submit"){
                inputBox.setAttribute("value", "Submit Form");
            }
            return inputBox;
        }

        public createTextArea(id: string, className: string, name: string): HTMLElement{
            let inputBox = document.createElement("textarea");
            inputBox.setAttribute("class", className);
            inputBox.setAttribute("name", name);
            inputBox.setAttribute("id", id);
            inputBox.setAttribute("rows", "5");
            return inputBox;
        }

        public createDropDown(id: string, className: string, name: string, optionsList: SelectListItem[]): HTMLElement{
            let selectBox = document.createElement("select");
            selectBox.setAttribute("class", className);
            selectBox.setAttribute("name", name);
            selectBox.setAttribute("id", id);
            if(optionsList.length>0){
                optionsList.forEach(element => {
                    let eachOption = document.createElement("option");
                    eachOption.setAttribute("value",element.value);
                    eachOption.innerText = element.option;
                    selectBox.appendChild(eachOption);
                });
            }
            return selectBox;
        }

        public createLabel(id: string, className: string, text: string): HTMLElement{
            let label = document.createElement("label");
            label.setAttribute("class",className);
            label.setAttribute("id",id);
            label.innerText = text;
            return label;
        }
    }
}