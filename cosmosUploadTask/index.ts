import tl = require('azure-pipelines-task-lib/task');
import azcosmos = require('@azure/cosmos');
import js = require('jsonfile');

// global-ish
var records: Array<JSON> = [];

async function run() {
    try {
        const inputEndpoint: string | undefined = (tl.getInput('cosmosEndpoint', true))!;
        const inputKey: string | undefined = (tl.getInput('cosmosKey', true))!;
        const inputDatabase: string | undefined = (tl.getInput('cosmosDatabase', true))!;
        const inputContainer: string | undefined = (tl.getInput('cosmosContainer', true))!;
        const inputPartition: string | undefined = (tl.getInput('cosmosPartition', false));
        const inputFileLocation: string | undefined = (tl.getInput('fileLocation', true))!;

        var endpoint = inputEndpoint!;
        var key = inputKey!;

        if (inputPartition && !inputPartition.startsWith('/')) {
            throw new Error('If providing a partition key, it must be preceded by a \/');
        }

        if (!inputFileLocation.toLowerCase().endsWith('.json')) {
            throw new Error('Expected JSON file');
        }

        // Get the CosmosClient to connect to the CosmosDB instance
        const client = new azcosmos.CosmosClient({ endpoint, key });

        if (!client) {
            throw new Error('Cannot connect CosmosClient with provided credentials');
        }

        // Read the JSON file
        records = js.readFileSync(inputFileLocation);

        console.log('Connecting to database...');
        // Set up the database and container
        const { database } = await client.databases.createIfNotExists({ id: inputDatabase});
        console.log('Connected to database', inputDatabase);
        console.log('Connecting to container...');
        const { container } = await client.database(database.id).containers.createIfNotExists({ id: inputContainer, partitionKey: inputPartition });
        console.log('Connected to container', inputContainer);

        // For every record in the file, upsert to the container
        console.log('Beginning upsert process...');
        for (const record of records) {
            container.items.upsert(record);
            console.log('Upserted', record);
        }

        console.log('Upload complete');
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();