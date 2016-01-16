//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    notesPanel.ts - popup panel for displaying INSIGHT title and notes.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class NotesPanelClass extends BasePanelClass
    {
        _notesElem: HTMLElement;

        constructor(application: AppClass, settings: AppSettingsMgr, container: HTMLElement, title: string, notes: string, bounds: any, rcPlot)
        {
            super(application, settings, container, "notesPanel", false, null, title, null, null, true, "Notes for this insight", false);

            var rootW = vp.select(this._root)
                .css("opacity", ".7");

            if (notes && notes.length)
            {
                //---- create the notes holder DIV ----
                var notesHolderW = vp.select(this._root).append("div")
                    .addClass("insightNotesHolder");

                //---- create a "apsn" for each section of text/URL ----

                //---- for now, just replace NEWLNE with <br> ----
                notes = notes.replace(/\n/g, "<br />");

                notesHolderW.append("span")
                    .addClass("insightNotesSpan")
                    .html(notes);

                this._notesElem = notesHolderW[0];
            }

            //---- figure out bounds of panel ----
            if (bounds)
            {
                rootW
                    .width(bounds.width)
                    .height(bounds.height);

                var left = bounds.left;
                var top = bounds.top;
            }
            else
            {
                //---- center at top of plot ----
                var xMiddle = (rcPlot.left + rcPlot.right) / 2;
                var myWidth = vp.select(this._root).width();

                left = xMiddle - myWidth / 2;
                top = rcPlot.top;
            }

            //---- track sizing for relayout ----
            this.registerForChange("size", (e) => this.onPanelSizeChanged());

            this.open(left, top);
        }

        onPanelSizeChanged()
        {
            var rcPanel = vp.select(this._root).getBounds(false);
            var rcTitle = vp.select(this._root, ".panelTitle").getBounds(false);
            var paddingEtc = 12 + 20 + 4;       // 4 for spacing
            var notesHeight = rcPanel.height - (rcTitle.height + paddingEtc);

            vp.select(this._notesElem).height(notesHeight);
        }
   }
}