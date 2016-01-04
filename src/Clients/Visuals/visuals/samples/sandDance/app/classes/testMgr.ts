//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    testMgr.ts - controls the running of an automated BeachParty test.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachPartyApp
{
    export class TestMgrClass extends beachParty.DataChangerClass
    {
        testResultsKey = "testResults";

        //---- test PARAMS ----
        _repeatCount = 1;
        _name: string;
        _maxBuildTime = undefined;
        _minFPS = undefined;
        _cmdDelay = undefined;
        _stopOnError = true;
        _cmds: any[];
        _plotResults: boolean;
        _collectPerfData = true;

        //---- test STATE ----
        _cmdIndex: number;
        _runCount = 0;
        _isRunning = false;
        _waitingForCycleNum = undefined;
        _currentViewName = "Scatter";
        _currentCmd: string;
        _cmdId: string;

        //---- OTHER ----
        _app: AppClass;
        _cmdTimer = null;
        _perfRecords: PerfRecord[];

        constructor(app: AppClass, test: any)
        {
            super();

            this._app = app;

            this._repeatCount = test.repeatCount;
            this._plotResults = test.plotResults;

            this._name = test.name;
            this._cmds = test.cmds;
        }

        public start(firstPass?: boolean)
        {
            if (firstPass)
            {
                this._runCount = 0;
                this._isRunning = true;
                this._perfRecords = [];
            }

            this._cmdIndex = 0;
            this._runCount++;

            this.statusMsg();

            this.startNextCmd();
        }

        statusMsg(msg?: string)
        {
            var fullMsg = this._name + ": run #" + this._runCount;

            if (msg)
            {
                fullMsg += "\r\n" + msg;
            }

            this._app.infoMsg(fullMsg);

        }

        private startNextCmd(delay?: number)
        {
            if (this._isRunning)
            {
                if (this._cmdIndex < this._cmds.length)
                {
                    if (delay === undefined || delay === null)
                    {
                        delay = (this._cmdDelay !== undefined) ? this._cmdDelay : 1;
                    }

                    this.cancelCmdTimer();

                    this._cmdTimer = setTimeout((e) =>
                    {
                        //this._cmdTimer = null;

                        var cmd = this._cmds[this._cmdIndex];
                        this._cmdIndex++;

                        this.runCmd(cmd);
                    }, delay);
                }
                else
                {
                    this.onEndReached();
                }
            }
        }

        cancelCmdTimer()
        {
            if (this._cmdTimer)
            {
                clearTimeout(this._cmdTimer);
                this._cmdTimer = null;
            }
        }

        public reportFrameStats(cmdTime: number, buildChartElapsed: number, frameRate: number, frameCount: number,
            cycleNum: number, cmdId: string)
        {
            if (this._isRunning)
            {
                if (this._maxBuildTime !== undefined && buildChartElapsed > this._maxBuildTime)
                {
                    this.error("maxBuildTime=" + this._maxBuildTime + " exceeded");
                }

                if (this._minFPS !== undefined && frameRate < this._minFPS)
                {
                    this.error("minFPS=" + this._minFPS + " not met");
                }

                if (this._collectPerfData)
                {
                    //---- add perf record ----
                    var pr = new PerfRecord();

                    pr.time = vp.utils.now();
                    pr.cmdTime = cmdTime;    
                    pr.fps = frameRate;
                    pr.frameCount = frameCount;
                    pr.buildTime = buildChartElapsed;
                    pr.dataName = this._app._filename;
                    pr.cycleNum = cycleNum;
                    pr.recordCount = this._app._recordCount;
                    pr.view = this._currentViewName;
                    pr.cmd = this._currentCmd;

                    this._perfRecords.push(pr);
                }

                if (this._cmdId === cmdId)        //   cycleNum == this._waitingForCycleNum)
                {
                    this._waitingForCycleNum = undefined;

                    this.startNextCmd();
                }

            }
        }

        private error(msg)
        {
            this.stop();

            msg = "Error during automated test: " + msg;
            this._app.showError(msg);
        }

        getParam(cmd: any, paramName: string)
        {
            var value = (vp.utils.isObject(cmd)) ? cmd[paramName] : cmd;
            if (value === undefined || value === null)
            {
                this.error("cmd=" + cmd + " is missing parameter=" + paramName);
            }

            return value;
        }

        runCmd(cmd: any)
        {
            var cmdNeedsRendering = true;
            var nextCmdDelay = undefined;

            var cmdName = vp.utils.keys(cmd)[0];
            this._currentCmd = cmdName;
            
            //---- store the cmdID with bpsHelper ----
            this._cmdId = (5000 + this._cmdIndex) + "";
            this._app.setHelperCmdId(this._cmdId);

            if (cmd.setTestParams)
            {
                var params = cmd.setTestParams;

                this._maxBuildTime = params.maxBuildTime;
                this._minFPS = params.minFPS;
                this._cmdDelay = params.cmdDelay;
                this._stopOnError = params.stopOnError;

                cmdNeedsRendering = false;
            }
            else if (cmd.loadData)
            {
                var dataName = this.getParam(cmd.loadData, "name");
                FileOpenMgr.instance.autoloadFile(dataName);
                this. _currentViewName = "Scatter";
            }
            else if (cmd.setView)
            {
                var viewName = this.getParam(cmd.setView, "name");
                this._app.changeToChart(viewName, null, Gesture.automatedTest);
                this._currentViewName = viewName;
            }
            else if (cmd.setX)
            {
                var colName = this.getParam(cmd.setX, "column");
                this._app.changeXMapping(colName);
            }
            else if (cmd.setY)
            {
                var colName = this.getParam(cmd.setY, "column");
                this._app.changeYMapping(colName);
            }
            else if (cmd.setZ)
            {
                var colName = this.getParam(cmd.setZ, "column");
                this._app.changeZMapping(colName);
            }
            else if (cmd.isolate)
            {
                if (this._app._selectedCount)
                {
                    this._app.onIsolateClick(null);
                }
                else
                {
                    cmdNeedsRendering = false;
                }
            }
            else if (cmd.exclude)
            {
                if (this._app._selectedCount)
                {
                    this._app.onExcludeClick(null);
                }
                else
                {
                    cmdNeedsRendering = false;
                }
            }
            else if (cmd.reset)
            {
                this._app.onResetClick(null);
            }
            else if (cmd.xBoxSelect !== undefined)
            {
                var index = this.getParam(cmd.xBoxSelect, "index");
                this._app.selectXBox(index);
            }
            else if (cmd.yBoxSelect !== undefined)
            {
                var index = this.getParam(cmd.yBoxSelect, "index");
                this._app.selectYBox(index);
            }
            else if (cmd.colorBoxSelect !== undefined)
            {
                var index = this.getParam(cmd.colorBoxSelect, "index");
                this._app.selectColorBox(index);
            }
            else if (cmd.setColor)
            {
                var colName = this.getParam(cmd.setColor, "column");
                var paletteName = this.getParam(cmd.setColor, "palette");
                var reverse = this.getParam(cmd.setColor, "reverse");

                if (colName)
                {
                    this._app.colorColumn(colName);
                }

                if (paletteName)
                {
                    var palette = beachParty.ColorPalettesClass.colorBrewerSchemes[paletteName]; 
                    palette.name = paletteName;

                    this._app.colorPalette(palette);
                }

                if (reverse)
                {
                    this._app.reverseColorPalette(reverse);
                }
            }
            else if (cmd.showDetails !== undefined)
            {
                var show = (cmd.showDetails === true);
                if (show)
                {
                    this._app.openDetailsPanel();
                }
                else
                {
                    this._app.closeDetailsPanel();
                }

                cmdNeedsRendering = false;
            }
            else if (cmd.delay)
            {
                nextCmdDelay = cmd.delay;
                cmdNeedsRendering = false;
            }
            else if (cmd.search)
            {
                var colName = this.getParam(cmd.search, "column");
                var text = this.getParam(cmd.search, "text");

                this._app.searchCol(colName);
                this._app.searchValue("automation", text, undefined, true);
            }
            else
            {
                //---- for now, just skip over unrecognized cmds ----
                //cmdNeedsRendering = false;
                this.error("Unsupported cmd: " + cmdName);
            }

            var strCmd = this._cmdIndex + ". " + this.cmdToString(cmd);

            if (!cmdNeedsRendering)
            {
                this._waitingForCycleNum = undefined;
                this.statusMsg(strCmd + " (completed)");
                this.startNextCmd();
            }
            else
            {
                this._waitingForCycleNum = 1 + this._app._chartCycleNum;
                this.statusMsg(strCmd + " (#" + this._waitingForCycleNum + ")");
            }
        }

        private onEndReached()
        {
            if ((!this._repeatCount) || (this._runCount < this._repeatCount))
            {
                this.start();
            }
            else
            {
                this.statusMsg("test completed");
                this.onStopped();
            }
        }

        private onStopped()
        {
            this._isRunning = false;
            this.cancelCmdTimer();

            //---- write perf results to local storage ----
            if (this._collectPerfData)
            {
                this.savePerfResults();

                if (this._plotResults)
                {
                    this.plotPerfResults();
                }
            }
        }

        plotPerfResults()
        {
            var perfResults = this.loadPerfResultsFromLocalStorage();
            if (perfResults)
            {
                FileOpenMgr.instance.uploadData(perfResults, "testResults", undefined, (e) =>
                {
                    this._app.changeToChart("Scatter", null, Gesture.automatedTest);
                    this._app.changeXMapping("time");
                    this._app.changeYMapping("fps");

                    this._app.colorColumn("cmd");
                });
            }
        }

        loadPerfResultsFromLocalStorage()
        {
            var perfResults = null;

            if (localStorage)
            {
                var str = localStorage[this.testResultsKey];
                perfResults = <PerfRecord[]> JSON.parse(str);

                //---- change "time" to a "date" ----
                perfResults.forEach((pr) =>
                {
                    pr.time = new Date(pr.time);
                });
            }

            return perfResults;
        }

        savePerfResults()
        {
            if (localStorage)
            {
                var str = JSON.stringify(this._perfRecords);
                localStorage[this.testResultsKey] = str;
            }
        }

        cmdToString(cmd: any)
        {
            var str = JSON.stringify(cmd);
            return str;
        }

        public stop()
        {
            this._app.infoMsg("Test stopped");
            this.onStopped();
       }
    }

    export class PerfRecord
    {
        //---- timestamp ----
        time: number;

        //---- measures ----
        cmdTime: number;
        fps: number;
        buildTime: number;
        frameCount: number;

        //---- dimensions ----
        cycleNum: number;
        dataName: string;
        recordCount: number;
        view: string;
        cmd: string;
    }
}