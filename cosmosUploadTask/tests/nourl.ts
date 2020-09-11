import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

let taskPath = path.join(__dirname, '..', 'index.js');
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

let answers: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
    "find": {
        "path/to/file.json": ['path/to/file.json']
    }
};
tmr.setAnswers(answers);

tmr.setInput('cosmosKeyName', 'some-key');
tmr.setInput('cosmosDatabase', 'example-database');
tmr.setInput('cosmosContainer', 'example-container');
tmr.setInput('cosmosPartition', '/example-partition');
tmr.setInput('fileLocation', 'path/to/file.json');
tmr.run();