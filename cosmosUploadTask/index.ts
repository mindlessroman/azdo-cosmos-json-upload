import azcosmos = require('@azure/cosmos');
import appinsights = require('applicationinsights');
import tl = require('azure-pipelines-task-lib/task');
import js = require('jsonfile');
import { v4 as uuid } from 'uuid';

let records: Array<JSON> = [];

async function run() {
    try {
        const optInTelemetry: boolean = (tl.getBoolInput('optInTelemetry', true));
        const aiKey: string | undefined = (tl.getInput('aiKey', true));

        if (optInTelemetry) {
            console.log('Opted into telemetry');
            appinsights.setup(aiKey)
                .setAutoDependencyCorrelation(false)
                .setAutoCollectDependencies(false)
                .setAutoCollectConsole(true)
                .setAutoCollectPerformance(true, true)
                .setAutoCollectExceptions(true)
                .setSendLiveMetrics(false)
                .setDistributedTracingMode(appinsights.DistributedTracingModes.AI)
                .start();
        }

        // Since appinsights.getCorrelationContext() returns null when autoCollectDependencies is false
        // generate our own correlation id
        const correlationId = uuid();

        let aiClient: appinsights.TelemetryClient = appinsights.defaultClient;

        const endpoint: string | undefined = (tl.getInput('cosmosEndpointName', true)) || '';
        const key: string | undefined = (tl.getInput('cosmosKeyName', true)) || '';

        const inputDatabase: string | undefined = (tl.getInput('cosmosDatabase', true)) || '';
        const inputContainer: string | undefined = (tl.getInput('cosmosContainer', true)) || '';
        const inputPartition: string | undefined = (tl.getInput('cosmosPartition', false));
        const inputFileLocation: string | undefined = (tl.getInput('fileLocation', true)) || '';

        if (typeof inputPartition != 'undefined' && !inputPartition.startsWith('/')) {
            tl.setResult(tl.TaskResult.Failed, 'If providing a partition key, it must be preceded by a /');
        }

        // Situate in the temp directory
        // Thank you HelmDeployV0 Task for inspo
        const rootDir = tl.getVariable('System.DefaultWorkingDirectory') || '';
        console.log(`Setting root directory to ${rootDir}`);

        const matching = tl.findMatch(rootDir, inputFileLocation);

        if (!matching || matching.length == 0) {
            tl.setResult(tl.TaskResult.Failed, `Cannot resolve path to ${inputFileLocation}`);
        }
        const fileLocation = matching[0];

        if (!fileLocation.toLowerCase().endsWith('.json')) {
            tl.setResult(tl.TaskResult.Failed, 'Expected JSON file');
        }

        // Get the CosmosClient to connect to the CosmosDB instance
        const client = new azcosmos.CosmosClient({ endpoint, key });

        // Read the JSON file
        records = js.readFileSync(fileLocation);

        console.log('Connecting to database. Will create if it does not already exist...');
        // Set up the database and container
        const { database } = await client.databases.createIfNotExists({ id: inputDatabase});
        console.log(`Connected to database ${inputDatabase}`);
        console.log('Connecting to container. Will create if it does not already exist...');
        const { container } = await client.database(database.id)
            .containers.createIfNotExists({ id: inputContainer, partitionKey: inputPartition });
        console.log(`Connected to container ${inputContainer}`);

        const throughput = Number(await (await container.readOffer()).resource?.content?.offerThroughput);
        let requestChargeSum = 0;
        let requestDurationSum = 0;
        // For every record in the file, upsert to the container
        console.log('Beginning upsert process...');
        if (optInTelemetry && aiClient) {
            aiClient.trackEvent({
                'name': 'Upload Started Event',
                'properties': {
                    'recordCount': records.length,
                    'correlationId': correlationId
                }
            });
        }
        for (let i = 0; i < records.length; i++) {
            const upsertItem = await container.items.upsert(records[i]);
            const upsertRequestCharge = Number(upsertItem.headers['x-ms-request-charge']);
            const upsertDuration = Number(upsertItem.headers['x-ms-request-duration-ms']);
            requestChargeSum += upsertRequestCharge!;
            requestDurationSum += upsertDuration!;

            // If the elapsed amount of time is approaching a second (1000 milliseconds),
            // OR the throughput consumed so far seems close to the throughput max, slow down
            if ((requestDurationSum % 1000 >= 700) || requestChargeSum % throughput >= (throughput * 0.85)) {
                await new Promise(r => setTimeout(r, 100));
            }

            if (i % 10 == 0 && i > 0) {
                console.log(`Upserted ${i} of ${records.length}`);
            }
        }

        if (optInTelemetry && aiClient) {
            aiClient.trackEvent({
                'name': 'Upload Completed Event',
                'properties': {
                    'recordCount': records.length,
                    'correlationId': correlationId
                }
            });
        }
        console.log('Upload complete');
        tl.setResult(tl.TaskResult.Succeeded, '');
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();
