//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    dataTipPanel.ts - popup panel for editing the properties of a dataTip.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class DataTipPanelClass extends BasePanelClass
    {
        _notesElem: HTMLElement;

        _dataTip: DataTipClass;

        constructor(container: HTMLElement, dataTip: DataTipClass)
        {
            super(container, "notesPanel", false, null, "DataTip Properties", null, null, true, "Edit the properties of the dataTip", false);

            this._dataTip = dataTip;
        }

        onPanelSizeChanged()
        {
            //TODO:
        }
   }
}