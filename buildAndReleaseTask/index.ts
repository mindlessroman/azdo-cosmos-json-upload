import tl = require('azure-pipelines-task-lib/task');
import azcosmos = require('@azure/cosmos');
import fs = require('fs');

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
        console.log('before the cosmosclient');
        const client = new azcosmos.CosmosClient({ endpoint, key });
        console.log('after the cosmosclient')
        if (!client) {
            throw new Error('Cannot connect CosmosClient with provided credentials');
        }

        // Get the contents of the json file
        fs.readFile(inputFileLocation, function(err, data) {
            if (err) throw err;

            records = JSON.parse(data.toString());
        });

        console.log('before the database checks');
        // set up the database and container
        const { database } = await client.databases.createIfNotExists({ id: inputDatabase});
        console.log('after the database check');
        console.log('before the container');
        const { container } = await client.database(database.id).containers.createIfNotExists({ id: inputContainer, partitionKey: inputPartition });
        console.log('after the container');

        console.log('before upsert')

        for (const record of records) {
            container.items.upsert(record);
            console.log('upsert happened')
        }
        console.log('Upload complete');
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();