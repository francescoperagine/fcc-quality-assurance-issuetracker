'use strict';

require('dotenv').config();
const mongoose = require('mongoose');

const username = process.env.MONGO_USER;
const password = encodeURIComponent(process.env.MONGO_PASS);
const cluster = process.env.MONGO_CLUSTER;
const uri = `mongodb+srv://${username}:${password}@${cluster}/`;

mongoose.connect(uri,{ retryWrites: true, writeConcern: "majority", appName: cluster, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });

const issueSchema = new mongoose.Schema({
  project: String,
  issue_title: String,
  issue_text: String,
  created_by: String,
  assigned_to: String,
  status_text: String,
  created_on: Date,
  updated_on: Date,
  open: Boolean
});

const Issue = mongoose.model('Issue', issueSchema);

const missingFieldsError = { error: 'required field(s) missing' };
const missingIdError = { error: 'missing _id' };
const noUpdateFieldsError = (_id) => { return { error: 'no update field(s) sent', '_id': _id } };

const couldNotUpdateError = (_id) => { return { error: 'could not update', '_id': _id } };
const successfullyUpdated = (_id) => { return { result: 'successfully updated', '_id': _id } };

const couldNotDelete = (_id) => { return { error: 'could not delete', '_id': _id } };
const successfullyDeleted = (_id) => { return { result: 'successfully deleted', '_id': _id } };

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;

      let issues;
      if(req.query != {}){
        issues = Issue.find({ project, ...req.query }, (err, issues) => {
          if (err) res.json(err);
          res.json(issues);
        });
      } 
    })
    
    .post(function (req, res){
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text, created_on, updated_on, open } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json(missingFieldsError)
      }

      const isAssignedTo = assigned_to || '';
      const statusText = status_text || '';
      const createdOn = created_on || new Date();
      const updatedOn = updated_on || new Date();
      const isOpen = open || true;
      const newIssue = new Issue({ project, issue_title, issue_text, created_by, assigned_to: isAssignedTo, status_text: statusText, created_on: createdOn, updated_on: updatedOn, open: isOpen });

      Issue.create(newIssue, (err, savedIssue) => {
        if (err) console.log(err);
          return res.json(savedIssue);
      });      
    })
    
    .put(function (req, res){
      let project = req.params.project;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, created_on, open } = req.body;

      if(!_id) return res.json(missingIdError);
      if(!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !created_on && !open) return res.json(noUpdateFieldsError(_id));
      
      Issue.updateOne({ project, _id }, {updated_on: new Date(), ...req.body}, (err, updateResult) => {
        if (err || updateResult.nModified === 0) {
          return res.json(couldNotUpdateError(_id));
        }
        return res.json(successfullyUpdated(_id));
      });
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      const { _id } = req.body;

      if(!_id) return res.json(missingIdError);

      Issue.deleteOne({ project, _id }, (err, deleteResult) => {
        if (err || deleteResult.deletedCount === 0) return res.json(couldNotDelete(_id));
        return res.json(successfullyDeleted(_id));
      });
    });
    
};
