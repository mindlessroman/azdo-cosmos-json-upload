# Upload to a Cosmos DB Instance in an Azure DevOps Pipeline

This pipeline task for the Azure DevOps (AzDO) Marketplace allows a user to upload a JSON file from
their code's repository to an instance of a Cosmos DB database and container in the specified Azure subscription.

**Contents**:

* [Changelog](#changelog)
* [Telemetry](#telemetry)
* [Why](#why)
* [First Steps](#first-steps)
* [An Example Scenario](#an-example-scenario)
* [Necessary Information](#necessary-information)

## Changelog

* 0.2.0 - Includes usage logging (optional), throttling for throughput thresholds
* 0.1.14 - Initial Release

## Telemetry

Opting into sending telemetry logs the following:

* a timestamped event that X number of records started uploading with a random GUID
* a timestamped event that those records completed uploading, with that same GUID
* if any error comes up

... from an AzDO instance to an Azure subscription. Only the fact that distinct users triggered these
events is visible in logging, and **no information about who you are and where you are uploading to is saved.**
The purpose is to get a sense of usage of the task, and **not** who is using it.

## Why

If a user needs to have a CosmosDB instance populated as part of a CI/CD testing pipeline, then having
this task makes that easy. Instead of having to create a separate script to manage the upload, add
this task to the pipeline. The data then can be accessed and manipulated in whatever testing is
required.

## First Steps

To follow security best practices, you should store the primary key and the URI endpoint in a [variable
group](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/variable-groups?view=azure-devops&tabs=yaml).
Please do not store these as plaintext in your pipeline. The variables you provide are then accessed
by referencing them in the YAML pipeline you write.

## An Example Scenario

1. You have or create a security group called `example-group-name` that has the following contents:

    | Name | Value |
    | --- | --- |
    | cosmosEndpoint | http://example-cosmos-instance.documents.azure.com:443 |
    | cosmosPrimaryKey | abcdef123456== |
    | ... | ... |

    ![An image showing the Variable Group setup page in Azure DevOps, with two key-value pairs filled
    in: cosmosEndpoint and cosmosPrimaryKey, along with their respective values.](https://raw.githubusercontent.com/mindlessroman/azdo-cosmos-json-upload/master/docs-images/variable-group-setup.png)

    Ideally, mark your primary key as a [secret](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/variables?view=azure-devops&tabs=yaml%2Cbatch#secret-variables)

2. Add the reference to the variable group in the relevant syntax. This example will use the macro
syntax.

```yaml
...
variables:
- group: example-group-name
...
```

  ![An image showing the starter pipeline YAML editor view. The contents are made up of starter content
  with trigger and pool definitions, with the added variables definition included.](https://raw.githubusercontent.com/mindlessroman/azdo-cosmos-json-upload/master/docs-images/add-vg-pipeline.png)

3. Add the Cosmos JSON Upload task. When adding the task to your YAML pipeline, the prompts will ask for a few pieces of information. Fill out the prompts:

    * The variable name for the endpoint's URI (from your variable group)
    * The variable name for primary key to that Cosmos instance (again from the variable group). This
    is ideally marked as a secret, indicated with a padlock.
    * The name of the database to write to
    * The name of the container to write to
    * The partition key _(optional)_
    * The path to the JSON file
    * Whether you opt in for sending telemetry **REQUIRED** - you must indicate true or false if you
        are including this directly in the YAML and not going through the assistant window.

  ![An image that shows the fields for the upload task filled in with the dummy contents listed in
  the YAML snippet below](https://raw.githubusercontent.com/mindlessroman/azdo-cosmos-json-upload/master/docs-images/add-cosmos-upload-task.png)

4. Once you click "Add" the following YAML will be generated.

```yaml
...
variables:
- group: example-group-name
...
- task: AzDOCosmosDBUpload@0
  inputs:
    cosmosEndpointName: 'cosmosEndpoint'
    cosmosKeyName: 'cosmosPrimaryKey'
    cosmosDatabase: 'example-database'
    cosmosContainer: 'example-container'
    fileLocation: 'path/to/example/file.json'
    optInTelemetry: true
...
```

  ![An image that has the individual fields filled in for the example task. The two values of
  `cosmosEndpoint` and `cosmosPrimaryKey` are both currently surrounded by single quotation marks,
  which will cause the pipeline task to fail if left as-is](https://raw.githubusercontent.com/mindlessroman/azdo-cosmos-json-upload/master/docs-images/pipeline-task-before.png)

5. Finally, switch the single-quotation marks around the endpoint and key variable names and switch to
the [variable syntax](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/variables?view=azure-devops&tabs=yaml%2Cbatch)
that makes sense for your project. This example uses the macro syntax, but make sure your syntax use is consistent!

```yaml
...
variables:
- group: example-group-name
...
- task: AzDOCosmosDBUpload@0
  inputs:
    cosmosEndpointName: $(cosmosEndpoint)
    cosmosKeyName: $(cosmosPrimaryKey)
    cosmosDatabase: 'example-database'
    cosmosContainer: 'example-container'
    fileLocation: 'path/to/example/file.json'
    optInTelemetry: true
...
```

  ![An image showing the upload task with the inputs for `cosmosEndpointName` and `cosmosKeyName` are
  wrapped in the variable macro syntax. The two lines are highlighted in yellow alongside the rest of the YAML file.](https://raw.githubusercontent.com/mindlessroman/azdo-cosmos-json-upload/master/docs-images/pipeline-task-after.png)

6. Then once you run the pipeline, everything should proceed with your pipeline as expected.

## Necessary Information

The task needs a few pieces of information as inputs to function:

* A true or false of whether to pass on telemetry; in this task's case this includes timestamps and
record upload counts - `optInTelemetry`
* The name of the variable in the to-be-specified variable group that contains the Cosmos DB instance's
URI (found in the `Keys` subsection) - `cosmosEndpointName`
* The name of the variable in the to-be-specified variable group that contains the primary key for
that instance (also found in the `Keys` subsection) - `cosmosKeyName`
* The name of the database that information will land in; if it does not exist, the pipeline task
will create it - `cosmosDatabase`
* The name of the container (similar to the table structure of a relational database) that the information
will land in; if it does not exist, the pipeline task will create it - `cosmosContainer`
* The partition key for the container; if this is not provided then a default one will be created -
`cosmosPartition` _(optional)_
* The path to the JSON file that will upload data; this must be a relative to the default working directory - `fileLocation`
