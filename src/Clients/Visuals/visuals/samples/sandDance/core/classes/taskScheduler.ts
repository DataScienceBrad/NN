///-----------------------------------------------------------------------------------------------------------------
/// taskScheduler.ts.  Copyright (c) 2015 Microsoft Corporation.
///     helper routines for managing async dependent tasks.
///-----------------------------------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module beachParty
{
    var tasks = [];

    export function onTaskCompleted(taskId: number)
    {
        var task = tasks[taskId];
        task.completed = true;

        for (var i in task.preTasks)
        {
            var id = task.preTasks[i];
            runTask(id);
        }
    }

    export function runTask(taskId: number)
    {
        var task = tasks[taskId];
        task.callback(taskId);
    }

    export function sched(callback, preTask?: number)
    {
        var taskId = tasks.length;

        var newTask = { callback: callback, completed: false, preTasks: [] };
        tasks.push(newTask);

        if (preTask !== undefined)
        {
            tasks[preTask].preTasks.push(taskId);
        }

        if (preTask === undefined || tasks[preTask].completed)
        {
            runTask(taskId);
        }

        return taskId;
    }
}
 