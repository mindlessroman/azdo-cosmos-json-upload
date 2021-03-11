import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

const taskPath = path.join(__dirname, '..', 'index.js');
const tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

const answers: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
    'findMatch': {
        'path/to/file.txt': ['path/to/file.txt']
    }
};
tmr.setAnswers(answers);

tmr.setInput('optInTelemetry', 'false'); // not needed for this test
tmr.setInput('aiKey', 'someAIKey');
tmr.setInput('cosmosEndpointName', 'http://goodurl.com');
tmr.setInput('cosmosKeyName', 'somekey');
tmr.setInput('cosmosDatabase', 'example-database');
tmr.setInput('cosmosContainer', 'example-container');
tmr.setInput('cosmosPartition', '/example-partition');
tmr.setInput('fileLocation', 'path/to/file.txt');

tmr.run();
