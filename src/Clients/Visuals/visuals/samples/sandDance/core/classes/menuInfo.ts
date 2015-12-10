//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    menuInfo.ts - describes a menu item 
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    export enum ActionType
    {
        //---- property-bound actions ----
        checkBox,               // propertyInfoClass
        radioButton,            // propertyInfoClass
        numberValue,            // gaugeInfoClass
        openControl,
        dropDownList,
        textBox,

        //---- other actions ----
        pushButton,             // pushButtonInfoClass
        openSubMenu,            // subMenuInfoClass

        separator,
    }

    export class menuInfoClass
    {
        name: string;               // text displayed for menu
        menuId: string;             // parent.child name
        tooltip: string;
        actionType: ActionType;
        isLayoutHorizontal = false;
        disabled: boolean;
        uiControls: any[] = [];     // UI controls that instanitate this menu info as a menuButton or control (may be multiple views)

        constructor(name: string, tooltip: string, actionType: ActionType, isLayoutHorizontal?: boolean, disabled?: boolean)
        {
            this.name = name;
            this.tooltip = tooltip;
            this.actionType = actionType;
            this.disabled = false;
            this.isLayoutHorizontal = isLayoutHorizontal;
        }

        addUiControl(control: any)
        {
            this.uiControls.push(control);
        }

        removeUiControl(control: any)
        {
            this.uiControls.remove(control);
        }
    }

    export class menuSeparator extends menuInfoClass
    {
        constructor()
        {
            super(null, null, ActionType.separator);
        }
    }

    export class propertyInfoClass extends menuInfoClass
    {
        propertyName: string;
        dataMgr: dataChangerClass;

        constructor(name: string, tooltip: string, actionType: ActionType, propertyName: string, dataMgr: any, isLayoutHorizontal?: boolean, disabled?: boolean)
        {
            super(name, tooltip, actionType, isLayoutHorizontal, disabled);

            this.propertyName = propertyName;

            //if (dataMgr instanceof appMgrClass)
            //{
            //    //---- TODO: make this happen when dataMgr is actually used so that currentView is up to date ----
            //    var appMgr = <appMgrClass>dataMgr;
            //    dataMgr = appMgr._currentView;
            //}

            this.dataMgr = dataMgr;
        }
    }

    export class pushButtonInfoClass extends menuInfoClass
    {
        actionCallback: any;

        constructor(name: string, tooltip: string, actionType: ActionType, actionCallback: any, isLayoutHorizontal?: boolean, disabled?: boolean)
        {
            super(name, tooltip, actionType, isLayoutHorizontal, disabled);

            this.actionCallback = actionCallback;
        }
    }

    export class subMenuInfoClass extends menuInfoClass
    {
        menuGroup: menuInfoClass[];

        constructor(name: string, tooltip: string, actionType: ActionType, menuGroup: menuInfoClass[], isLayoutHorizontal?: boolean, disabled?: boolean)
        {
            super(name, tooltip, actionType, isLayoutHorizontal, disabled);

            this.menuGroup = menuGroup;
        }
    }

    export class gaugeInfoClass extends propertyInfoClass
    {
        min: number;
        max: number;
        tickCount: number;
        minorTickCount: number;

        constructor(name: string, tooltip: string, actionType: ActionType, propertyName: string, dataMgr: any, min: number, max: number,
            tickCounts?: number, minorTickCount?: number, isLayoutHorizontal?: boolean, disabled?: boolean)
        {
            super(name, tooltip, actionType, propertyName, dataMgr, isLayoutHorizontal, disabled);

            this.propertyName = propertyName;
            this.dataMgr = dataMgr;
            this.min = min;
            this.max = max;
            this.tickCount = tickCounts;
            this.minorTickCount = minorTickCount;
        }
    }

}
