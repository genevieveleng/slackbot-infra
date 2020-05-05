const appRoot = require('app-root-path');
const winston = require(`${appRoot}/winston`);
const Presto = require(`${appRoot}/db/presto`);
const axios = require('axios');

module.exports = async (body)=>{
    winston.debug('/slackbot_name/post/test.js');
    var db_conn = new Presto;
    var return_json = {};
    body['police'].mid_call();
    db_conn.execute(
        `select *
        from schema.table
        limit 100`
    ).then(function(result) {
        // obtained results from query and process it
        winston.debug(result);
        var results_return = '';
        result.forEach(function (row){
            results_return += row.id;
        });
        return_json = {'text':results_return};
        axios({
            method: 'post',
            headers: {'Authorization':'Bearer xoxb-0000000-000000-AbCd3FG','Content-Type':'application/json'},
            url:body.response_url,
            data: return_json
        }).then(function (response) {
            winston.debug(response);
        }).catch(function (error) {
            winston.debug(error);
        });
        body['police'].close_call(JSON.stringify(return_json));
    }, function(err) {
        // unable to get results for query and return error
        // AZ00Z00009 is your profile ID in case you want to be notified of any errors
        // How to get AZ00Z00009? Go to view profile > ... > Copy Member ID
        return_json = {channel: "AZ00Z00009",text: `<@AZ00Z00009> \nError: ${err} \nBody: ${JSON.stringify(body)}`};
        axios({
            method: 'post',
            headers: {'Authorization':'Bearer xoxb-0000000-000000-AbCd3FG','Content-Type':'application/json'},
            url:'https://slack.com/api/chat.postMessage',
            data: return_json
        }).then(function (response) {
            winston.debug(response);
        }).catch(function (error) {
            winston.debug(error);
        });
        body['police'].close_call(JSON.stringify(return_json));
    });
}