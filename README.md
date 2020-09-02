# Upload to a Cosmos DB Instance in an Azure DevOps Pipeline

This pipeline task for the Azure DevOps (AzDO) Marketplace allows a user to upload a JSON file from
their code's repository to an instance of a Cosmos DB database and container in their Azure subscription.

## Why

If a user needs to have a CosmosDB instance populated as part of a CI/CD testing pipeline, then having
this task makes that easy. Instead of having to create a separate script to manage the upload, add
this task to the pipeline. The data then can be accessed and manipulated in whatever testing is
required.

## Necessary Information

The process needs a few pieces of information to function:

* The Cosmos DB instance's URI (found in the `Keys` subsection) - `cosmosEndpoint`
* The primary key for that instance (also found in the `Keys` subsection - `cosmosKey`
* The name of the database that information will land in; if it does not exist, the pipeline task
will create it - `cosmosDatabase`
* The name of the container (similar to the table structure of a relational database) that the information
will land in; if it does not exist, the pipeline task will create it - `cosmosContainer`
* The partition key for the container; if this is not provided then a default one will be created -
`cosmosPartition` _(optional)_
* The path to the JSON file that will upload data; this must be a fully qualified path or relative to the default working directory - `fileLocation`
