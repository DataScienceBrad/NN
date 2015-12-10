//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    insightMgr.ts - manages the insight instances & UI for the BeachParty app.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    import InsightData = bps.InsightData;
    var nextInsightId = 1;
    declare var tinymce: any;

    export class insightMgrClass extends beachParty.dataChangerClass
    {
        static insightWidth = 200;
        static insightHeight = 130;

        _session: InsightSession;
        _isShowingInsightsPanel = false;
        _currentInsight: InsightData = null;
        _currentInsightReason = null;
        _currentPanel: jsonPanelClass = null;
        _editInsight: InsightData = null;                   // the insight being edited
        _contextMenu: popupMenuClass = null;
        _rebuildTimer = null;
        _forceShow = false;
        //_currentInsightElem = null;
        _insightEntryElems = [];
        _editSessionName = null;
        _sessionName = "untitled";
        _pendingDropText = null;

        //---- auto playback ----
        _playbackIndex = -1;
        _playbackTimer = null;
        _isPlayingBack = false;
        _isPaused = false;
        _playbackDuration = 3;      // 3 seconds
        _isLooping = true;             // should playback restart once end is reached

        constructor()
        {
            super();

            this._session = new InsightSession();
        }

        closeMenus()
        {
            if (this._contextMenu)
            {
                this._contextMenu.close();
                this._contextMenu = null;
            }
        }

        createEnumPicker(enumType, callback)
        {
            var picker = null;

            if (enumType == bps.LoadAction)
            {
                picker = this.createLoadActionMenu(callback);
            }
            else
            {
                picker = appClass.instance.createEnumPicker(enumType, callback);
            }

            return picker;
        }

        playbackDuration(value?: number)
        {
            if (arguments.length === 0)
            {
                return this._playbackDuration;
            }

            this._playbackDuration = value;
            this.onDataChanged("playbackDuration");
        }

        isPlaybackLooping(value?: boolean)
        {
            if (arguments.length === 0)
            {
                return this._isLooping;
            }

            this._isLooping = value;
            this.onDataChanged("isPlaybackLooping");
        }

        getCurrentInsightReason()
        {
            return this._currentInsightReason;
        }

        currentInsight(value?: InsightData, reason?: string)
        {
            if (arguments.length == 0)
            {
                return this._currentInsight;
            }

            //---- this is quicker than rebuilding insight bar, and preserves insight elements for consistent event handling ("click"). ----
            if (this._currentInsight)
            {
                this.setInsightAsCurrent(this._currentInsight, false);
            }

            this._currentInsight = value;
            this._currentInsightReason = reason;

            if (this._currentInsight)
            {
                this.setInsightAsCurrent(this._currentInsight, true);
            }

            this.onDataChanged("currentInsight");
        }

        setInsightAsCurrent(insight: InsightData, value: boolean)
        {
            for (var i = 0; i < this._insightEntryElems.length; i++)
            {
                var elem = this._insightEntryElems[i];
                if (elem && elem.insightObj == insight)
                {
                    if (value)
                    {
                        vp.dom.addClass(elem, "currentEntry");
                    }
                    else
                    {
                        vp.dom.removeClass(elem, "currentEntry");
                    }
                }
            }
        }


        editSessionName(value?: string)
        {
            if (arguments.length == 0)
            {
                return this._editSessionName;
            }

            this._editSessionName = value;
            this.onDataChanged("editSessionName");
        }

        editInsightName(value?: string)
        {
            if (arguments.length == 0)
            {
                return (this._editInsight) ? this._editInsight.name : "";
            }

            if (this._editInsight)
            {
                this._editInsight.name = value;
                this.onDataChanged("editInsightName");
            }
        }

        editInsightNotes(value?: string)
        {
            if (arguments.length == 0)
            {
                return (this._editInsight) ? this._editInsight.notes : "";
            }

            if (this._editInsight)
            {
                this._editInsight.notes = value;
                this.onDataChanged("editInsightNotes");
            }
        }

        loadAction(value?: string)
        {
            if (arguments.length == 0)
            {
                return (this._editInsight) ? bps.LoadAction[this._editInsight.loadAction] : "";
            }

            if (this._editInsight)
            {
                this._editInsight.loadAction = bps.LoadAction[value];
                this.onDataChanged("loadAction");
            }
        }

        notesSource(value?: string)
        {
            if (arguments.length == 0)
            {
                return (this._editInsight) ? bps.NotesSource[this._editInsight.notesSource] : "";
            }

            if (this._editInsight)
            {
                this._editInsight.notesSource = bps.NotesSource[value];
                this.onDataChanged("notesSource");
            }
        }

        //isNotesMarkDown(value?: boolean)
        //{
        //    if (arguments.length == 0)
        //    {
        //        return (this._editInsight) ? this._editInsight.isNotesMarkDown : null;
        //    }

        //    if (this._editInsight)
        //    {
        //        this._editInsight.isNotesMarkDown = value;
        //        this.onDataChanged("isNotesMarkDown");
        //    }
        //}

        addNewInsight(insight: InsightData)
        {
            //---- defaults ----
            var text = "Insight-" + nextInsightId++;
            insight.name = text;
            insight.notes = "";

            if (this._pendingDropText)
            {
                insight.notes = this._pendingDropText;
                this._pendingDropText = null;
            }

            //---- invoke "Insight Panel" here to supply text/notes ----
            //this.openAddInsightPanel(insight, (insight) => 
            //{
            //    this.addInsight(insight);
            //});

            //---- let user create these without interruption ----
            this.addInsight(insight);
        }

        showInsightButtonContextMenu(e)
        {
            //---- invoke the INSIGHTS CONTEXT MENU ----
            var menuItems = this.getInsightsMenuItems();

            var pm = new popupMenuClass(null, "pmInsights", menuItems, (e, menu, textIndex, menuIndex) =>
            {
                var name = (<MenuItemData>menuItems[menuIndex]).text;

                if (name.startsWith("Add insight"))
                {
                    this.onDataChanged("onAddInsightRequest", undefined, e);
                }
                else if (name.startsWith("Toggle"))
                {
                    this.toggleInsightsPanel();
                }
                else if (name.startsWith("Play"))
                {
                    this.startPlayback();
                }
                else if (name.startsWith("Stop"))
                {
                    this.stopPlayback();
                }
                else if (name == "New session")
                {
                    this.startNewSession();
                }
                else if (name.startsWith("Save session"))
                {
                    this.saveSession();
                }
                else if (name.startsWith("Email session"))
                {
                    this.emailSession();
                }
                else if (name.startsWith("Load session"))
                {
                    this.loadSessionLocalFile();
                }
                else if (name.startsWith("Load QuickTest"))
                {
                    this.loadQuickTest();
                }

            }, true);

            var rc = vp.select("#insightMenuButton").getBounds(false);

            vp.select(pm.getRootElem())
                .css("background", "rgb(69, 69, 69)")  // match color on button bg
                .css("border", "1px solid transparent") 

            pm.show(rc.left + 8, rc.bottom);
            this._contextMenu = pm;

            return pm;
        }

        onInsightEntryClick(e)
        {
            var insight = <InsightData> e.target.insightObj;
            if (!insight)
            {
                insight = <InsightData> e.target.parentElement.insightObj;
            }

            this.loadInsight(insight, "load");
        }

        markRebuildNeeded(forceShow?: boolean)
        {
            if (!this._rebuildTimer)
            {
                if (forceShow)
                {
                    this._forceShow = true;
                }
                this._rebuildTimer = setTimeout((e) =>
                {
                    this._rebuildTimer = null;
                    this.rebuildInsightBar();
                }, 100);
            }
        }

        onInsightEntryRightClick(e)
        {
            var insight = <InsightData> e.target.insightObj;
            if (!insight)
            {
                insight = <InsightData> e.target.parentElement.insightObj;
            }

            //---- invoke the INSIGHTS CONTEXT MENU ----
            var menuItems = this.getInsightEntryMenuItems();

            var pm = new popupMenuClass(null, "pmEntryInsights", menuItems, (e, menu, textIndex, menuIndex) =>
            {
                var name = (<MenuItemData>menuItems[menuIndex]).text;

                if (name == "Load")
                {
                    this.loadInsight(insight, "load");
                }
                else if (name == "Delete")
                {
                    this.deleteInsight(insight);
                }
                else if (name == "Recapture")
                {
                    this.captureInsightEx(insight);
                }
                else if (name == "Edit")
                {
                    this.openEditInsightPanel(e, insight);
                }

            }, true);

            var pt = vp.events.mousePosition(e);

            vp.select(pm.getRootElem())
                .css("background", "rgb(69, 69, 69)")  // match color on button bg
                .css("border", "1px solid transparent") 

            //this.setContextMenu(pm);
            pm.show(pt.x, pt.y + 10);
            this._contextMenu = pm;

            //---- cancel event to prevent insight from being loaded ----
            vp.events.cancelEventBubble(e);
            vp.events.cancelEventDefault(e);

            return pm;
        }


        openEditInsightPanel(e, insight: InsightData)
        {
            var pt = vp.events.mousePosition(e);

            //---- make a copy of the specified insight for editing (in case we cancel, this makes it easy to reverse the changes) ----
            this._editInsight = vp.utils.copyMap(insight);

            this._currentPanel = buildJsonPanel(null, this, "editInsight", true, pt.x, pt.y, undefined, undefined, undefined, false);

            ////---- initialize TinyMCE rich text area to convert all textAreas into RICH text areas ----
            //tinymce.init({ selector: 'textarea', setupcontent_callback: "myCustomSetupContent" });

            ////---- tinyMCE changes our text color, so reset it now ----
            //vp.select(".panelTextArea")
            //    .css("visibility", "visible")

            //vp.select(".mceEditorArea")
            //    .css("font-family", "Calibri")
            //    .css("font-size", "16px")
            //    .css("background", "black")
            //    .css("color", "white")


            ////---- hide mce's toolbar and menubar ----
            //vp.select(".mce-menubar").css("display", "none");
            //vp.select(".mce-toolbar").css("display", "none");
            //vp.select(".mce-flow-layout").css("display", "none");

            //---- support CLOSE of dialog as a cancel, so none of the properties changed are retained ----
            this._currentPanel.registerForChange("onAccept", (e) =>
            {
                this.updateInsightFromEditProps(insight);
                this.markRebuildNeeded();
            });
        }

        captureInsightEx(insight: bps.InsightData)
        {
            var sessionIndex = this._session.insights.indexOf(insight);

            appClass.instance.createInsight(true, true, (captInsight: bps.InsightData) =>
            {
                //---- transfer user properties from "insight" ----
                captInsight.name = insight.name;
                captInsight.notes = insight.notes;
                captInsight.loadAction = insight.loadAction;
                captInsight.notesSource = insight.notesSource;
                //captInsight.isNotesMarkDown = insight.isNotesMarkDown;

                //---- replace "insight" with "captInsight" ----
                this._session.insights[sessionIndex] = captInsight;

                this.rebuildInsightBar();
            });
        }

        updateInsightFromEditProps(insight: bps.InsightData)
        {
            insight.name = this._editInsight.name;
            insight.notes = this._editInsight.notes;
            insight.loadAction = this._editInsight.loadAction;
            insight.notesSource = this._editInsight.notesSource;
            //insight.isNotesMarkDown = this._editInsight.isNotesMarkDown;
        }

        openAddInsightPanel(insight: InsightData, callback)
        {
            //var pt = vp.events.mousePosition(e);

            //---- center panel horizontally ----
            var left = undefined; //window.innerWidth / 2 - xxx / 2;
            var top = 200;

            this._editInsight = insight;

            this._currentPanel = buildJsonPanel(null, this, "addInsight", true, left, top, undefined, undefined, undefined, false);

            this._currentPanel.registerForChange("onAccept", (e) =>
            {
                callback(this._editInsight);
            });

            this._currentPanel.getRootElem().focus();
        }

        closeEditInsight()
        {
            if (this._currentPanel)
            {
                this._currentPanel.close();
                this._currentPanel = null;
            }
        }

        deleteInsight(insight: InsightData)
        {
            this._session.insights.remove(insight);

            if (this._currentInsight == insight)
            {
                this.currentInsight(null, "deleted");
            }

            this.markRebuildNeeded();
        }


        loadInsight(insight, reason: string)
        {
            this.currentInsight(insight, reason);

            //---- change the outline ----
            this.markRebuildNeeded();

            this.onDataChanged("insightLoaded");
        }

        removeExt(fn: string)
        {
            var index = fn.indexOf(".");
            if (index > -1)
            {
                fn = fn.substr(0, index);
            }

            return fn;
        }

        loadSessionLocalFile()
        {
            localFileHelper.loadFile(".bpSession", (text, fn) => 
            {
                this.loadSessionFromText(text, fn);
            });
        }

        loadSessionFromServer(sessionUrl: string)
        {
            //var fn = this.getSharedServerRoot() + sessionId;

            beachParty.readSessionFile(sessionUrl, (text) =>
            {
                var fn = appUtils.getLastNodeOfUrl(sessionUrl);

                this.loadSessionFromText(text, fn);
            });
        }

        loadSessionFromText(text: string, fn: string)
        {
            try
            {
                var anyObj = JSON.parse(text);
                if (vp.utils.isArray(anyObj))
                {
                    var session = new InsightSession();
                    session.version = .9;

                    session.insights = anyObj;
                }
                else
                {
                    var session = <InsightSession > anyObj;
                    if (session.version < .9)
                    {
                        throw "Error: invalid session file";
                    }

                }

                this._session = session;
                this._sessionName = this.removeExt(fn);

                this.markRebuildNeeded(true);
            }
            catch (ex)
            {
                alert("Error parsing session file: " + ex);
            }
        }

        loadQuickTest()
        {
            //---- read the file from server ---
            var url = beachParty.getMyPath() + "/tests/QuickTest.bpSession";
            var text = <string>beachParty.fileAccess.readFile(url, beachParty.fileFormat.text);

            this.loadSessionFromText(text, "QuickTest");
        }

        saveSession()
        {
            var str = JSON.stringify(this._session);

            this.openSessionNamePanel(this._sessionName, (sessionName) =>
            {
                this._sessionName = sessionName;
                localFileHelper.saveToLocalFile(sessionName + ".bpSession", str);
            });
        }

        //getSharedServerRoot()
        //{
        //    return "c:\\BeachParty\\Sessions\\Shared\\Root\\";
        //}

        emailSession()
        {
            var contents = JSON.stringify(this._session);

            //---- save "str" to server and get back its URL ----
            //var fnBase = "@sr@" + Date.now();
            //var fn = this.getSharedServerRoot() + fnBase;
            var userName = "";
            var fn = "";

            beachParty.writeSessionFile(userName, fn, contents, (sessionUrl: string) =>
            {
                var sessionId = sessionUrl;
                var appPath = beachParty.appPath();

                var url = "mailto:?" +
                    "subject=my session" +
                    "&body=Here's a link to my BeachParty session: %0D%0A" + "%0D%0A" + "%09" +  
                    appPath + "/BeachPartyApp.html?session=" + sessionId + "%0D%0A" + "%0D%0A";

                vp.select("#helperAnchor").attr("href", url);
                vp.select("#helperAnchor")[0].click();
            });
        }

        openSessionNamePanel(name: string, callback)
        {
            this.editSessionName(name);

            this._currentPanel = buildJsonPanel(null, this, "editSessionName", true);

            this._currentPanel.registerForChange("onAccept", (e) =>
            {
                callback(this._editSessionName);
            });
        }

        processDroppedText(text: string)
        {
            if (!this._currentInsight)
            {
                this._pendingDropText = text;
                this.onDataChanged("onAddInsightRequest", undefined, null);
            }
            else
            {
                this._currentInsight.notes = this._currentInsight.notes + "\r\n" + text;
            }
        }

        startNewSession()
        {
            this._session.insights = [];
            this._sessionName = "untitled";

            vp.select("#insightList")
                .clear();

            //this.showInsightBar(false);
            this.currentInsight(null, "new session");
        }

        startPlayback()
        {
            //---- do we have any insights to play? ----
            if (this._session.insights.length == 0)
            {
                //---- special case - just treat current view as the insight we are looping on ----
                this._isPlayingBack = true;
                this._playbackIndex = -1;
            }
            else
            {
                this.loadTimedInsight(0);
            }

            this.onDataChanged("playing");
        }

        isPlaying()
        {
            return this._isPlayingBack;
        }

        isPaused()
        {
            return (this._isPlayingBack && this._isPaused);
        }

        pausePlayback()
        {
            this._isPaused = true;

            if (this._playbackTimer)
            {
                clearTimeout(this._playbackTimer);
                this._playbackTimer = null;
            }

            this.onDataChanged("playing");
        }

        resumePlayback()
        {
            this._isPaused = false;

            if (this._playbackIndex > -1)
            {
                this.loadTimedInsight(this._playbackIndex);
            }

            this.onDataChanged("playing");
        }

        stopPlayback()
        {
            this._isPlayingBack = false;
            this._isPaused = false;

            if (this._playbackTimer)
            {
                clearTimeout(this._playbackTimer);
                this._playbackTimer = null;
            }

            this.onDataChanged("playing");
        }

        loadTimedInsight(index: number)
        {
            var atEnd = (index >= this._session.insights.length);
            if (atEnd && this._isLooping)
            {
                index = 0;
            }

            if (index < this._session.insights.length)
            {
                this._isPlayingBack = true;
                this._playbackIndex = index;

                var insight = this._session.insights[index];
                if (insight)
                {
                    this.loadInsight(insight, "play load");
                }
            }
            else
            {
                this._isPlayingBack = false;
                this.onDataChanged("playing");
            }
        }

        onInsightLoadCompleted()
        {
            if (this._isPlayingBack)
            {
                this._playbackTimer = setTimeout((e) =>
                {
                    this.loadTimedInsight(this._playbackIndex + 1);
                }, this._playbackDuration*1000);
            }
        }

        toggleInsightsPanel()
        {
            this._isShowingInsightsPanel = (!this._isShowingInsightsPanel);

            this.showInsightBar(this._isShowingInsightsPanel);

            appUtils.setButtonSelectedState("insight", this._isShowingInsightsPanel, "fnIconBarToggleInsightNorm", "fnIconBarToggleInsightSelect");
        }

        isPanelOpen()
        {
            return this._isShowingInsightsPanel;
        }

        showInsightBar(value?: boolean)
        {
            if (arguments.length == 0)
            {
                return this._isShowingInsightsPanel;
            }

            vp.select("#insightPanel").css("display", (value) ? "" : "none");

            //this.layoutScreen();
            this.onDataChanged("layout");

            if (!value)
            {
                this.currentInsight(null, "hide bar");
            }

            this._isShowingInsightsPanel = value;
            this.onDataChanged("showInsightBar");
        }

        getInsightsMenuItems()
        {
            var items =
                [
                    new MenuItemData("Email session...", "Sends a URL for the current session to an email recepient"),
                    new MenuItemData("Save session...", "Saves the current session as a file on your local machine"),
                    new MenuItemData("-"),
                    new MenuItemData("Load session...", "Loads a previous session from a file on your local machine"),
                    new MenuItemData("Load QuickTest", "Loads the session used in the BeachParty team QuickTest"),
                    new MenuItemData("-"),
                    new MenuItemData("New session", "Starts a new BeachParty session"),

                    //new MenuItemData("Export insights...", "Download insights as a JSON file"),
                    //new MenuItemData("Add insight...", "Add a new insight to this session"),
                    //new MenuItemData("-"),
                    //new MenuItemData("Playback insights", "Automaticlly load each insight, with a delay between each"),
                    //new MenuItemData("Stop playback", "Stop playback of insights"),
                    //new MenuItemData("-"),
                    //new MenuItemData("Toggle insights bar", "Toggle the insights bar open/closed"),
                ];

            return items;
        }

        getInsightEntryMenuItems()
        {
            var items =
                [
                    new MenuItemData("Load", "Make this insight the current view"),
                    new MenuItemData("-"),
                    new MenuItemData("Edit", "Edit the name and notes for this insight"),
                    new MenuItemData("Recapture", "Recapture this insight from current view"),
                    new MenuItemData("-"),
                    new MenuItemData("Delete", "Delete this insight"),
                ];

            return items;
        }

        addInsight(insight: InsightData)
        {
            this._session.insights.push(insight);
            this.currentInsight(insight, "new insight");

            var forceShow = (this._session.insights.length == 1);        // first entry
            this.markRebuildNeeded(forceShow);
        }

        getInsightTooltip(insight: bps.InsightData)
        {
            var insightType = bps.LoadAction[insight.loadAction];
            if (insightType == "all" || insightType === undefined)
            {
                insightType = "full insight";
            }

            var tip = insight.name + " (" + insightType + ")\n" + insight.notes;
            return tip;
        }

        addInsightToBar(insight: InsightData)
        {
            var insightBarW = vp.select("#insightList")
            var tip = this.getInsightTooltip(insight);

            var insightW = insightBarW.append("div")
                .addClass("insightEntry")
                .css("display", "block")
                .css("position", "relative")
                .title(tip)
                .width(insightMgrClass.insightWidth)
                .height(insightMgrClass.insightHeight + 30)

            var rowW = insightW.append("div")
                .css("position", "relative")
                .css("top", "-6px")
                .css("height", "30px")

            var iconUrl = this.getIconUrl(insight.loadAction);

            //---- type of insight ICON ----
            var iconW = rowW.append("div")
                .id("insightTypeMenuButton")
                .addClass("clickIcon")
                .addClass(iconUrl)
                .css("width", "28px")
                .css("position", "relative")
                .css("top", "8px")
                .css("left", "-2px")
                .attach("click", (e) =>
                {
                    this.onIconClick(e);
                });

            var textW = rowW.append("span")
                .addClass("insightText")
                .text(insight.name)
                .css("position", "relative")
                .css("left", "-8px")
                .css("top", "-1px")

            //---- hook events on this insight entry ----
            insightW
                .attach("click", (e) => this.onInsightEntryClick(e))
                .attach("contextmenu", (e) => this.onInsightEntryRightClick(e))
                //.attach("mousedown", (e) => this.onSelectEntry(e))

            if (insight == this._currentInsight)
            {
                insightW.addClass("currentEntry");
            }

            var imageAsUrl = insight.imageAsUrl;
            if (!imageAsUrl)
            {
                //---- check for older version ----
                var anyPreload = <any>insight.preload;
                imageAsUrl = anyPreload.imageAsUrl;
            }

            if (imageAsUrl)
            {
                //---- add IMAGE ----
                var imgW = insightW.append("div")
                    .addClass("insightImage")
                    //.css("position", "absolute")
                    //.css("left", "0px")
                    //.css("top", "0px")
                    .addClass(imageAsUrl)
                    .css("background", settings._canvasColor)
                    .width(insightMgrClass.insightWidth)
                    .height(insightMgrClass.insightHeight)
                    .attach("dragstart", function (e)
                    {
                        //---- prevent drag of icon ----
                        e.preventDefault();
                    });

            }


            insightW[0].insightObj = insight;
            iconW[0].insightObj = insight;
            iconW[0].entryElem = insightW[0];

            this._insightEntryElems.push(insightW[0]);
        }

        onIconClick(e)
        {
            var iconElem = e.target;
            var rc = vp.select(iconElem).getBounds(false);
            var insight = <bps.InsightData>iconElem.insightObj;

            //---- show insight type menu ----
            var picker = this.createLoadActionMenu((mid: MenuItemData) =>
            {
                //---- set loadAction for insight, based on selected item ----
                var action = mid.text.toLowerCase();
                insight.loadAction = bps.LoadAction[action];

                //---- update icon of insight in insight panel ----
                var iconUrl = this.getIconUrl(insight.loadAction);
                vp.select(iconElem).addClass(iconUrl);

                //---- update tooltip on entryElem ----
                var entryElem = iconElem.entryElem;
                var tip = this.getInsightTooltip(insight);
                vp.select(entryElem).title(tip);
            });

            picker.openWithoutOverlap(rc.left + 15, rc.top + 15);

            //---- cancel event to prevent LOAD of this icon ----
            vp.events.cancelEventBubble(e);
            vp.events.cancelEventDefault(e);
        }

        createLoadActionMenu(callback)
        {
            var menuItems = <MenuItemData[]>[];

            menuItems.push(new MenuItemData("All", "Change this into a full (data + view) loading insight", "fnInsightFull"));
            menuItems.push(new MenuItemData("Data", "Change this into a data loading insight", "fnInsightData"));    
            menuItems.push(new MenuItemData("View", "Change this into a view loading insight", "fnInsightView"));   
            menuItems.push(new MenuItemData("Selection", "Change this into a selection loading insight", "fnInsightSelection"));  
            menuItems.push(new MenuItemData("Filter", "Change this into a filter loading insight", "fnInsightFilter"));       

            var picker = appClass.instance.createGeneralPicker(null, "loadActionPicker", menuItems, callback, undefined, 28);
            return picker;
        }

        getIconUrl(loadAction: bps.LoadAction)
        {
            var url;

            if (loadAction == bps.LoadAction.all || loadAction === undefined)
            {
                url = "fnInsightFull";
            }
            else if (loadAction == bps.LoadAction.data)
            {
                url = "fnInsightData";
            }
            else if (loadAction == bps.LoadAction.view)
            {
                url = "fnInsightView";
            }
            else if (loadAction == bps.LoadAction.selection)
            {
                url = "fnInsightSelection";
            }
            else if (loadAction == bps.LoadAction.filter)
            {
                url = "fnInsightFilter";
            }

            return url;
        }

        rebuildInsightBar()
        {
            var forceShow = this._forceShow;
            this._forceShow = false;
            this._insightEntryElems = [];

            var insightBarW = vp.select("#insightList")
                .clear()

            for (var i = 0; i < this._session.insights.length; i++)
            {
                var insight = this._session.insights[i];
                this.addInsightToBar(insight);
            }

            //---- open the bar, if requested ----
            if (forceShow)
            {
                vp.select("#insightPanel")
                    .css("display", "")             // show it

                this._isShowingInsightsPanel = true;
            }

            //---- always layout screen, in case the horizontal scrollbar just appeared/disappeared ----
            //this.layoutScreen();
            this.onDataChanged("layout");
        }

    }

    export class InsightSession
    {
        version: number;
        insights: InsightData[];

        constructor()
        {
            this.version = 1.0;
            this.insights = [];
        }
    }
}

//function myCustomSetupContent(editor_id, body, doc)
//{
//    vp.select(body).css('background', 'green');
//}
