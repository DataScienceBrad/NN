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

    interface li_interface {
        name: string,
        isExpanded: boolean,
        children: li_interface[]
    }

    export class Visual implements IVisual {
        private target: HTMLElement;
        public dataView: DataView;
        public li_obj: li_interface[] = [];

        constructor(options: VisualConstructorOptions) {
            this.target = options.element;
        }

        public update(options: VisualUpdateOptions) {
            
            if (!options.dataViews)
                return;
            if (0 === options.dataViews.length)
                return;

            //Create a <div> which will include all other <ul> and <li> elements created to display hierarchy 
            var div = document.createElement("div");
            div.setAttribute("id","main_div");
            div.style.width = options.viewport.width.toString()+"px";
            div.style.height = options.viewport.height.toString()+"px";

            this.dataView = options.dataViews[0];

            let data = options.dataViews[0].categorical,
                levels = data.categories.length,
                base = data.categories[0].values,
                datasize = base.length,
                base_sorted = Object.create(base);

            base_sorted = base_sorted.sort();
            
            var base_list = [];

            if (datasize > 0) {
                base_list[0] = base_sorted[0];
            }

            var iCounter = 1, cnt = 1;
            while (iCounter < datasize) {
                if (base_sorted[iCounter] != base_sorted[iCounter - 1]) {
                    base_list[cnt] = base_sorted[iCounter];
                    cnt++;
                }
                iCounter++;
            }

            //Base List items
            var li = [],
                bFlag = true;    //Variable that checks if the already existing objects are same as the new ones to be created 

            if (this.li_obj.length != cnt) {
                bFlag = false;
            }

            //Iterate thorugh base list and keep finding children
            for (var n = 0; n < cnt; n++) {

                if (bFlag && ((typeof this.li_obj[n] === 'undefined') || (typeof this.li_obj[n] !== 'undefined' && this.li_obj[n].name != base_list[n])))
                    bFlag = false;

                if (!bFlag) {//Only if the old objects and new objects to be created are different, create the new object
                    if(!base_list[n])
                        break;
                    this.li_obj[n] = {
                        name: base_list[n],
                        isExpanded: false,
                        children: []
                    };
                }

                if (levels > 1) {
                    find_children(1, base_list, n, this.li_obj[n]);
                }
                else {
                    this.li_obj[n].children = [];
                }

            }

            //After the object hierarchy is created, it is stored in a local variable for further use
            var li_obj_local = this.li_obj;

            //Base unordered list
            var u = document.createElement('ul');
            u.setAttribute("class", "parent");
            u.setAttribute("id", "root");

            //Draw Table
            for (var n = 0; n < cnt; n++) {

                if(!this.li_obj[n]) continue;
                //Create list item for the base list and append it to its parent
                li[n] = document.createElement('li');
                li[n].innerHTML = li[n].innerHTML + this.li_obj[n].name;
                li[n].setAttribute("level", n.toString());
              
                //All the levels except the last one, has to be either expanded or collpased
                //Appropriate class is added based on the value of the boolean "isExpanded"
                if (levels > 1 && this.li_obj[n].children[0] && this.li_obj[n].isExpanded) li[n].classList.add("expanded");
                else if (levels > 1 && this.li_obj[n].children[0] && !this.li_obj[n].isExpanded) li[n].classList.add("collapsed");

                u.appendChild(li[n]);
                li[n].style.display = 'block';

                if (levels > 1)
                    draw_children(1, this.li_obj[n].children, n, li[n], this.li_obj[n].isExpanded);
            }

            //If child already exists, delete it and append the new child
            if (this.target.hasChildNodes()) {
                this.target.removeChild(this.target.childNodes[0]);
            }

            div.appendChild(u);
            this.target.appendChild(div);

            //Function to draw the elements created
            function draw_children(curr_level: any, li_obj: any[], parent_cnt: any, li_parent: any, parent_isExpanded) {
  
                if(!li_obj[0]) return;

                var u_child = [];
                u_child[parent_cnt] = document.createElement('ul');
                u_child[parent_cnt].setAttribute("class", "parent");

                var li_child = [];
                var child_cnt = 0;
                li_child[0] = document.createElement('li');
                li_child[0].innerHTML = li_child[0].innerHTML + li_obj[child_cnt].name;
                li_child[0].setAttribute("level", li_parent.getAttribute("level") + child_cnt.toString());

                if (curr_level + 1 < levels && li_obj[child_cnt].children[0] && li_obj[child_cnt].isExpanded) li_child[0].classList.add("expanded");
                else if (curr_level + 1 < levels && li_obj[child_cnt].children[0] && !li_obj[child_cnt].isExpanded) li_child[0].classList.add("collapsed");

                if (!parent_isExpanded) {
                    li_child[child_cnt].style.display = 'none';
                }
                else {
                    li_child[child_cnt].style.display = 'block';
                }
                u_child[parent_cnt].appendChild(li_child[0]);

                if (curr_level + 1 < levels)
                    draw_children(curr_level + 1, li_obj[child_cnt].children, child_cnt, li_child[child_cnt], li_obj[child_cnt].isExpanded);


                child_cnt++;
                while (child_cnt < li_obj.length) {

                    if (!li_obj[child_cnt]) return;

                    //For each unique element
                    li_child[child_cnt] = document.createElement('li');
                    li_child[child_cnt].innerHTML = li_child[child_cnt].innerHTML + li_obj[child_cnt].name;
                    li_child[child_cnt].setAttribute("level", li_parent.getAttribute("level") + child_cnt.toString());

                    if (curr_level + 1 < levels && li_obj[child_cnt].isExpanded) li_child[child_cnt].classList.add("expanded");
                    else if (curr_level + 1 < levels && !li_obj[child_cnt].isExpanded) li_child[child_cnt].classList.add("collapsed");

                    if (!parent_isExpanded) {
                        console.log("hide")
                        li_child[child_cnt].style.display = 'none';
                    }
                    else {
                        li_child[child_cnt].style.display = 'block';
                    }

                    console.log(li_child[child_cnt].getAttribute("level"));
                    u_child[parent_cnt].appendChild(li_child[child_cnt]);

                    if (curr_level + 1 < levels)
                        draw_children(curr_level + 1, li_obj[child_cnt].children, child_cnt, li_child[child_cnt], li_obj[child_cnt].isExpanded);

                    child_cnt++;
                }

                li_parent.appendChild(u_child[parent_cnt]);
            }

            //Function to find the next level
            function find_children(curr_level: any, parent_list: any[], parent_cnt: any, li_parent_obj: any) {
            
                var li_child_obj = [],
                    child_list = [],
                    child_cnt = 0;

                for (var k = 0; k < datasize; k++) {
                    if (data.categories[curr_level - 1].values[k] == parent_list[parent_cnt]) {
                        child_list[child_cnt] = data.categories[curr_level].values[k];
                        child_cnt++;
                    }
                }
                let child_sorted = Object.create(child_list);
                child_sorted = child_sorted.sort();

                child_list = [];
                child_cnt = 0;


                var bFlag1 = true;

                if (bFlag1 && ((typeof li_parent_obj.children[0] === 'undefined') || (typeof li_parent_obj.children[0] !== 'undefined' && li_parent_obj.children[0].name != child_sorted[0])))
                    bFlag1 = false;

                if (!bFlag1) {

                    if(!child_sorted[0])
                        return;
                    //If new objects to be created are not same as the objects already existing, create a new object
                    li_child_obj[0] = {
                        name: child_sorted[0],
                        isExpanded: false,
                        children: []
                    };
                    li_parent_obj.children[0] = li_child_obj[0];
                }
                child_list[0] = child_sorted[0];


                if (curr_level + 1 < levels)
                    find_children(curr_level + 1, child_list, child_cnt, li_parent_obj.children[0]);

                var i1 = 1;
                child_cnt++;

                while (i1 < child_sorted.length) {
                    
                    //For each unique element
                    if (child_sorted[i1] != child_sorted[i1 - 1]) {

                        if (bFlag1 && ((typeof li_parent_obj.children[child_cnt] === 'undefined') || (typeof li_parent_obj.children[child_cnt] !== 'undefined' && li_parent_obj.children[child_cnt].name != child_sorted[i1])))
                            bFlag1 = false;

                        if (!bFlag1) {
                            if(!child_sorted[i1])
                                return;
                            li_child_obj[child_cnt] = {
                                name: child_sorted[i1],
                                isExpanded: false,
                                children: []
                            };

                            li_parent_obj.children[child_cnt] = li_child_obj[child_cnt];
                        }
                        child_list[child_cnt] = child_sorted[i1];

                        if (curr_level + 1 < levels) {
                            find_children(curr_level + 1, child_list, child_cnt, li_parent_obj.children[child_cnt]);
                        }
                        else {
                            li_parent_obj.children[child_cnt].children = [];
                        }

                        child_cnt++;
                    }
                    i1++;
                }
            }

            var fontcolor = Visual.getFill(this.dataView),
                fontsize = Visual.getFontSize(this.dataView);

            let $parent_li = $('.parent li');
            $parent_li.css('color', fontcolor.solid.color);
            $parent_li.css('font-size', fontsize + "px");

            $parent_li.click(function (event) {

                event.stopPropagation();

                let $li_element = $(this).closest('li');
                if ($li_element.hasClass('expanded') || $li_element.hasClass('collapsed')) {
                    $li_element.toggleClass('expanded');
                    $li_element.toggleClass('collapsed');

                    let path = $li_element.attr("level"),
                        len = path.length,
                        obj = li_obj_local[parseInt(path.charAt(0))],
                        iCounter = 1;
                    while (iCounter <= len - 1) {
                        obj = obj.children[parseInt(path.charAt(iCounter))];
                        iCounter++;
                    }
                    obj.isExpanded = !obj.isExpanded;
                }

                $(this).find(">.parent >li").slideToggle();
            });

        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {

            var instances: VisualObjectInstance[] = [];
            var dataView = this.dataView;
            dataView.metadata.objects

            if (options.objectName == 'font') {

                var font: VisualObjectInstance = {
                    objectName: 'font',
                    displayName: 'Font',
                    selector: null,
                    properties: {
                        fill: Visual.getFill(dataView),
                        fontSize: Visual.getFontSize(dataView)
                    }
                };

                instances.push(font);

            }

            return instances;
        }

        private static getFill(dataView: DataView): Fill {

            if (dataView) {
                var objects = dataView.metadata.objects;
                if (objects) {
                    var font = objects['font'];

                    if (font) {
                        var fill = <Fill>font['fill'];
                        if (fill)
                            return fill;
                    }
                }
                return { solid: { color: '#000' } };
            }
        }

        private static getFontSize(dataView: DataView): number {
            let default_size:number = 12;
            if (dataView) {
                let objects = dataView.metadata.objects;
                if (objects) {
                    let font = objects['font'];

                    if (font) {
                        let size: number = <number>font['fontSize'];
                        if (size !== undefined) {
                            return size.valueOf();
                        }
                    }
                }
            }
            return default_size;
        }

    }
}