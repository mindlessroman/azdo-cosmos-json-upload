import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';

describe('Sample task tests', function () {

    before( function() {

    });

    after(() => {

    });

    // it('should succeed with simple inputs', function(done: Mocha.Done) {
    //     this.timeout(1000);

    //     let tp = path.join(__dirname, 'success.js');
    //     let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    //     tr.run();
    //     console.log(tr.succeeded);
    //     console.log(tr);
    //     assert.equal(tr.succeeded, true, 'should have succeeded');
    //     assert.equal(tr.warningIssues.length, 0, 'should have no warnings');
    //     assert.equal(tr.errorIssues.length, 0, 'should have no errors');
    //     console.log(tr.stdout);
    //     // assert.equal(tr.stdout.indexOf('Hello human') >= 0, true, 'should display Hello human');
    //     done();
    // });

    it('should fail with a bad URL input', function(done: Mocha.Done) {
        this.timeout(1000);

        let tp = path.join(__dirname, 'badurl.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();
        console.log(tr.succeeded);
        assert.equal(tr.succeeded, false, 'should have failed');
        assert.equal(tr.errorIssues.length > 0, true, 'should error out with a missing key');
        assert.equal(tr.errorIssues.includes('Invalid URL: badurl'), true, 'should report a bad URL');
        console.log(tr.stdout);
        done();
    });

    it('should fail with a missing primary key', function(done: Mocha.Done) {
        this.timeout(1000);

        let tp = path.join(__dirname, 'badkey.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();
        // console.log(tr);
        console.log(tr.succeeded);
        assert.equal(tr.succeeded, false, 'should have failed');
        assert.equal(tr.errorIssues.length > 0, true, 'should error out with a missing input');
        assert.equal(tr.errorIssues.includes('Input required: cosmosKey'), true, 'should report a missing key error');
        console.log(tr.stdout);
        done();
    });

    it('should fail with partition key poorly formatted inputs', function(done: Mocha.Done) {
        this.timeout(1000);

        let tp = path.join(__dirname, 'badpartkey.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();
        // console.log(tr);
        console.log(tr.succeeded);
        assert.equal(tr.succeeded, false, 'should have failed');
        assert.equal(tr.errorIssues.length > 0, true, 'should error out without proper formatting - missing \/');
        assert.equal(tr.errorIssues.includes('If providing a partition key, it must be preceded by a \/'), true, 'should report a missing slash error');
        console.log(tr.stdout);
        done();
    });

    it('should fail without a reference to the file', function(done: Mocha.Done) {
        this.timeout(1000);

        let tp = path.join(__dirname, 'nofile.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();
        // console.log(tr);
        console.log(tr.succeeded);
        assert.equal(tr.succeeded, false, 'should have failed');
        assert.equal(tr.errorIssues.length > 0, true, 'should error with missing file');
        assert.equal(tr.errorIssues.includes('Input required: fileLocation'), true, 'should report a missing file error');
        console.log(tr.stdout);
        done();
    });

    it('should fail if upload file is not JSON format', function(done: Mocha.Done) {
        this.timeout(1000);

        let tp = path.join(__dirname, 'notjson.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();
        // console.log(tr);
        console.log(tr.succeeded);
        assert.equal(tr.succeeded, false, 'should have failed');
        assert.equal(tr.errorIssues.length > 0, true, 'should error bad file ending');
        assert.equal(tr.errorIssues.includes('Expected JSON file'), true, 'should report wrong file types');
        console.log(tr.stdout);
        done();
    });
});