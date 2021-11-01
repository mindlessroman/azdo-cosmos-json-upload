# Upload to a Cosmos DB Instance in an Azure DevOps Pipeline

This pipeline task for the [Azure DevOps (AzDO) Marketplace](https://marketplace.visualstudio.com/items?itemName=mindlessroman.json-upload-cosmosdb) allows a user to upload a JSON file from
their code's repository to an instance of a Cosmos DB database and container in the specified Azure subscription.

Check out the [Overview](./overview.md) for more details on how to run the task.

## Why

If a user needs to have a CosmosDB instance populated as part of a CI/CD testing pipeline, then having
this task makes that easy. Instead of having to create a separate script to manage the upload, add
this task to the pipeline. The data then can be accessed and manipulated in whatever testing is
required.
