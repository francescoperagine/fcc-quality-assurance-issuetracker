const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    let newIssue = null;

    before(function(done) {
        chai.request(server)
            .post('/api/issues/test')
            .send({
                issue_title: 'Title for Tests',
                issue_text: 'Text for Tests',
                created_by: 'Tester',
                assigned_to: 'Someone',
                status_text: 'In QA'
            })
            .end(function(err, res) {
                if (err) {
                    done(err);
                    return;
                }
                newIssue = res.body;
                done();
            });
    });

    suite('POST request to /api/issues/{project}', function() {
        test('Create an issue with every field', function(done) {
        chai.request(server)
            .post('/api/issues/test')
            .send({
                issue_title: 'Title',
                issue_text: 'text',
                created_by: 'Functional Test - Every Field',
                assigned_to: 'Chai and Mocha',
                status_text: 'In QA'
            })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.issue_title, 'Title');
                assert.equal(res.body.issue_text, 'text');
                assert.equal(res.body.created_by, 'Functional Test - Every Field');
                assert.equal(res.body.assigned_to, 'Chai and Mocha');
                assert.equal(res.body.status_text, 'In QA');
                done();
            });
        });
        test('Create an issue with only required fields', function(done) {
        chai.request(server)
            .post('/api/issues/test')
            .send({
                issue_title: 'Title',
                issue_text: 'text',
                created_by: 'Functional Test - Only Required Fields'
            })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.issue_title, 'Title');
                assert.equal(res.body.issue_text, 'text');
                assert.equal(res.body.created_by, 'Functional Test - Only Required Fields');
                assert.equal(res.body.assigned_to, '');
                assert.equal(res.body.status_text, '');
                done();
            });
        });
        test('Create an issue with missing required fields', function(done) {
        chai.request(server)
            .post('/api/issues/test')
            .end(function(err, res) {
                assert.deepEqual(res.body, { error: 'required field(s) missing' });
                done();
            });
        });
    });
    
    suite('GET request to /api/issues/{project}', function() {
        test('View issues on a project', function(done) {
        chai.request(server)
            .get('/api/issues/test')
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                done();
            });
        });
        test('View issues on a project with one filter', function(done) {
        chai.request(server)
            .get('/api/issues/test')
            .query({ open: false, assigned_to: 'Chai and Mocha' })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                done();
            });
        });
        test('View issues on a project with multiple filters', function(done) {
        chai.request(server)
            .get('/api/issues/test')
            .query({ open: false, assigned_to: 'Chai and Mocha', issue_title: 'Title' })
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                done();
            });
        });
    });

    suite('PUT request to /api/issues/{project}', function() {

        test('Update one field on an issue', function(done) {
            const _id = newIssue._id;
            chai.request(server)
                .put('/api/issues/test')
                .send({ _id, issue_title: 'Updated Title 1' })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.deepEqual(res.body, { result: 'successfully updated', _id});
                    done();
            });
        });
        test('Update multiple fields on an issue', function(done) {
            const _id = newIssue._id;
            chai.request(server)
                .put('/api/issues/test')
                .send({ _id, issue_title: 'Updated Title 2', issue_text: 'Updated Text' })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.deepEqual(res.body, { result: 'successfully updated', _id });
                    done();
            });
        });
        test('Update an issue with missing _id', function(done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({})
                .end(function(err, res) {
                    assert.deepEqual(res.body, { error: 'missing _id' });
                    done();
            });
        });
        test('Update an issue with no fields to update', function(done) {
            const _id = newIssue._id;
            chai.request(server)
                .put('/api/issues/test')
                .send({ _id })
                .end(function(err, res) {
                    assert.deepEqual(res.body, { error: 'no update field(s) sent', _id });
                    done();
            });
        });
        test('Update an issue with an invalid _id', function(done) {
            const _id = 'invalid_id';
            chai.request(server)
                .put('/api/issues/test')
                .send({ _id: 'invalid_id', issue_title: 'Updated Title'})
                .end(function(err, res) {
                    assert.deepEqual(res.body, { error: 'could not update', _id });
                    done();
            });
        });
    });

    suite('DELETE request to /api/issues/{project}', function() {
        test('Delete an issue', function(done) {
            const _id = newIssue._id;
            chai.request(server)
                .delete('/api/issues/test')
                .send({ _id })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.deepEqual(res.body, { result: 'successfully deleted', _id});
                    done();
            });
        });

        test('Delete an issue with an invalid _id', function(done) {
            const _id = 'invalid_id';
            chai.request(server)
                .delete('/api/issues/test')
                .send({ _id })
                .end(function(err, res) {
                    assert.deepEqual(res.body, { error: 'could not delete', _id });
                    done();
            });
        });

        test('Delete an issue with missing _id', function(done) {
            chai.request(server)
                .delete('/api/issues/test')
                .send({})
                .end(function(err, res) {
                    assert.deepEqual(res.body, { error: 'missing _id' });
                    done();
            });
        });
    });
});
