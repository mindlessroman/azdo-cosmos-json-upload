import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

let taskPath = path.join(__dirname, '..', 'index.js');
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

// Set up the "environment" inputs
tmr.setInput('cosmosEndpointName', 'https://cosmosdb.com');
tmr.setInput('cosmosKeyName', 'someKey');
tmr.setInput('cosmosDatabase', 'example-database');
tmr.setInput('cosmosContainer', 'example-container');
tmr.setInput('fileLocation', 'path/to/file.json');

// // Mock the libraries that are imported: jsonfile, @azure/cosmos
tmr.registerMock('jsonfile', {
    readFileSync: function(location : string) {
        return [1,2,3];
    }
})

let answers: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
    "find": {
        "path/to/file.json": ['path/to/file.json']
    }
};
tmr.setAnswers(answers);

// Register a mock of the cosmos lib - we're not here to test its functionality
// but we need to mock some of its contents.
tmr.registerMock('@azure/cosmos', {
    CosmosClient: function(endpoint : string, key : string) {
        return {
            databases: {
                createIfNotExists: async function ({}) {
                    return {
                        database: {
                            id: "example-database"
                        }
                    }
                }
            },
            database: function(id : string) {
                return {
                    containers: {
                        createIfNotExists: async function({}) {
                            return {
                                container: {
                                    id: "example-container",
                                    items : {
                                        upsert: function({}) {
                                            return;
                                        }
                                    }
                                }
                            };
                        }
                    }
                };
            }
        };
    }
});

tmr.run();