import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

const taskPath = path.join(__dirname, '..', 'index.js');
const tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

// Set up the "environment" inputs
tmr.setInput('optInTelemetry', 'true');
tmr.setInput('cosmosEndpointName', 'https://cosmosdb.com');
tmr.setInput('cosmosKeyName', 'someKey');
tmr.setInput('cosmosDatabase', 'example-database');
tmr.setInput('cosmosContainer', 'example-container');
tmr.setInput('cosmosPartition', '/example-partition');
tmr.setInput('fileLocation', 'path/to/file.json');
tmr.run();
