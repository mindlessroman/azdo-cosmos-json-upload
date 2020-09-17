import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

const taskPath = path.join(__dirname, '..', 'index.js');
const tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

const answers: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
    "findMatch": {
        "path/to/file.json": ['path/to/file.json']
    }
};
tmr.setAnswers(answers);

tmr.setInput('cosmosEndpointName', 'http://goodurl.com');
tmr.setInput('cosmosKeyName', '');
tmr.setInput('cosmosDatabase', 'example-database');
tmr.setInput('cosmosContainer', 'example-container');
tmr.setInput('cosmosPartition', '/example-partition');
tmr.setInput('fileLocation', 'path/to/file.json');
tmr.run();