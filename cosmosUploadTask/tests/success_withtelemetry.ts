import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

const taskPath = path.join(__dirname, '..', 'index.js');
const tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

// set up the environment
tmr.setInput('optInTelemetry', 'true');
tmr.setInput('aiKey', 'someAIKey');
tmr.setInput('cosmosEndpointName', 'https://cosmosdb.com');
tmr.setInput('cosmosKeyName', 'someKey');
tmr.setInput('cosmosDatabase', 'example-database');
tmr.setInput('cosmosContainer', 'example-container');
tmr.setInput('fileLocation', 'path/to/file.json');

tmr.registerMock('applicationinsights', {
    defaultClient: {
        trackEvent: function() {
            return;
        },
        flush: function() {
            return;
        }
    },
    DistributedTracingModes: function() {
        return;
    },
    setup: function() {
        return {
            setAutoDependencyCorrelation: function() {
                return {
                    setAutoCollectDependencies: function() {
                        return {
                            setAutoCollectConsole: function() {
                                return {
                                    setAutoCollectPerformance: function() {
                                        return {
                                            setAutoCollectExceptions: function() {
                                                return {
                                                    setSendLiveMetrics: function() {
                                                        return {
                                                            setDistributedTracingMode: function () {
                                                                return {
                                                                    start: function() {
                                                                        return {};
                                                                    }
                                                                };
                                                            }
                                                        };
                                                    }
                                                };
                                            }
                                        };
                                    }
                                };
                            }
                        };
                    }
                };
            }
        };
    },
});

tmr.registerMock('jsonfile', {
    readFileSync: function() {
        return [1,2,3];
    }
});

tmr.registerMock('@azure/cosmos', {
    CosmosClient: function() {
        return {
            databases: {
                createIfNotExists: async function () {
                    return {
                        database: {
                            id: 'example-database'
                        }
                    };
                }
            },
            database: function() {
                return {
                    containers: {
                        createIfNotExists: async function() {
                            return {
                                container: {
                                    id: 'example-container',
                                    items : {
                                        upsert: function() {
                                            return {
                                                headers: function() {
                                                    return;
                                                }
                                            };
                                        }
                                    },
                                    readOffer: function() {
                                        return {
                                            resource: function() {
                                                return;
                                            }
                                        };
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

const answers: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
    'findMatch': {
        'path/to/file.json': ['path/to/file.json']
    }
};
tmr.setAnswers(answers);

tmr.run();
