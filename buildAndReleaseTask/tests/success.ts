import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

let taskPath = path.join(__dirname, '..', 'index.js');
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

// Set up the "environment" inputs
tmr.setInput('cosmosEndpoint', 'https://cosmosdb.com');
tmr.setInput('cosmosKey', 'someKey');
tmr.setInput('cosmosDatabase', 'example-database');
tmr.setInput('cosmosContainer', 'example-container');
tmr.setInput('cosmosPartition', '/example-partition')
tmr.setInput('fileLocation', 'path/to/file.json');

// Mock the libraries that are imported: fs, jsonfile, @azure/cosmos
tmr.registerMock('fs', {
    readFile: function(location : string) {
        return {};
    }
})

tmr.registerMock('jsonfile', {
    readFileSync: function(location : string) {
        return [1,2,3];
    }
})

// Register a mock of the cosmos lib - we're not here to test it's functionality
// but we need to mock some of its contents.
tmr.registerMock('@azure/cosmos', {
    CosmosClient: function(endpoint : string, key : string) {
        return {
            databases: {
                createIfNotExists: async function ({}) {
                    return {
                        database: {
                            id: "someDatabase"
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
                                    id: "someContainer",
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