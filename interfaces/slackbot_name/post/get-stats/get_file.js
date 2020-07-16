const appRoot = require('app-root-path');
const winston = require(`${appRoot}/winston`);
const Presto = require(`${appRoot}/db/presto`);
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

module.exports = async (body)=> {
    // e.g. /get-stats get_file start_date=2020-06-01 end_date=2020-06-30
    body['police'].mid_call();

    // defining variables
    winston.debug('/slackbot_name/post/get-stats/get_file.js');
    var db_conn = new Presto;
    var sql = '';
    var filename = '';
    var results_headers = [];
    var regex_dateformat = /(202[0-9])-(0[1-9]|1[1-2])-(0[1-9]|[1-2][0-9]|3[0-1])/g;
    
    // sense check of params
    if (typeof(body.params['start_date']) !== 'undefined' 
        && typeof(body.params['end_date']) !== 'undefined'
        && body.params['start_date'].match(regex_dateformat) !== null
        && body.params['end_date'].match(regex_dateformat) !== null) {
        filename = `get_file_${body.params['start_date']}_to_${body.params['end_date']}.csv`
        sql = `select * from db.table
        where partition_date >= date_format(date('${body.params['start_date']}') - interval '1' day, '%Y-%m-%d')
        and created_at_local >= date('${body.params['start_date']}')
        and created_at_local < date('${body.params['end_date']}') + interval '1' day`;
        
        // execute the sql
        db_conn.execute(sql).then(function(results) {

            // obtained results from query and convert it into csv before sending back to user
            winston.debug('%o',results);
            return_json = {channel:body.user_id};

            if (results.length > 0){

                // get the results header
                for (let [key,value] of Object.entries(results[0])) {
                    results_headers.push({id:key,title:key});
                }
                // define csv
                const csvWriter = createCsvWriter({
                    path: `${appRoot}/${filename}`,
                    header:results_headers
                });
                
                // generate csv
                csvWriter.writeRecords(results)
                    .then(() => {
                        // prepare to load csv
                        var form = new FormData();
                        form.append('channels', body.user_id);
                        form.append('file', fs.createReadStream(`${appRoot}/${filename}`));
                        return_json['file'] = filename;
                        // send to user the csv
                        axios({
                            method: 'post',
                            headers: {'Authorization':'Bearer xoxb-0000000-000000-AbCd3FG','Content-Type':form.getHeaders()['content-type']},
                            url:'https://slack.com/api/files.upload',
                            data: form
                        }).then(function (response) {
                            winston.debug('%o',response);
                            // remove file once uploaded
                            fs.unlinkSync(`${appRoot}/${filename}`);
                        }).catch(function (error) {
                            winston.debug('%o',error);
                        });
                    }).catch(function(err){winston.debug(err);});
            } else {
                return_json['text'] = "No results";
                axios({
                    method: 'post',
                    headers: {'Authorization':'Bearer xoxb-0000000-000000-AbCd3FG','Content-Type':'application/json'},
                    url:'https://slack.com/api/files.upload',
                    data: return_json
                }).then(function (response) {
                    winston.debug('%o',response);
                }).catch(function (error) {
                    winston.debug('%o',error);
                });
            }
            body['police'].close_call(JSON.stringify(return_json));
        }).catch(function(err) {
            // unable to get results for query and return error
            winston.debug(err);
            return_json = {channel: "<@slack_channel_id>",text: `<@slack_channel_id> \nUser: ${body.user_name} \nCommand:${body.command} \nText: ${body.text} \nError: ${JSON.stringify(err)}`};
            axios({
                method: 'post',
                headers: {'Authorization':'Bearer xoxb-0000000-000000-AbCd3FG','Content-Type':'application/json'},
                url:'https://slack.com/api/chat.postMessage',
                data: return_json
            }).then(function (response) {
                winston.debug(response.status);
            }).catch(function (error) {
                winston.debug('%o',error);
            });
            body['police'].close_call(JSON.stringify(return_json));
        });
    } else {
        // ask user to input correct parameters
        return_json = {channel:body.user_id};
        return_json['blocks'] = {"type":"section","text":{"type":"mrkdwn","text":`Please follow this format:\n/get-stats get_file body.params['start_date']=2020-06-01 body.params['end_date']=2020-06-30`}};
        axios({
            method: 'post',
            headers: {'Authorization':'Bearer xoxb-0000000-000000-AbCd3FG','Content-Type':'application/json'},
            url:'https://slack.com/api/chat.postMessage',
            data: return_json
        }).then(function (response) {
            winston.debug(response.status);
        }).catch(function (error) {
            winston.debug('%o',error);
        });
    }
}