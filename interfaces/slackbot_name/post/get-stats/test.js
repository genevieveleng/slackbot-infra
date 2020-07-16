const appRoot = require('app-root-path');
const winston = require(`${appRoot}/winston`);
const Presto = require(`${appRoot}/db/presto`);
const axios = require('axios');

module.exports = async (body)=>{
    // e.g. command /command sub-command 123
    winston.debug('/slackbot_name/post/get-stats/test.js');
    var db_conn = new Presto;
    var return_json = {};
    body['police'].mid_call();
    
    // prepare the sql to obtain details via id
    var sql = `select * from db.table
        where id = ${body.params['id']}`;
    
    // exceute the sql
    db_conn.execute(
        sql
    ).then(function(result) {
        // obtained results from query and process it
        winston.debug('%o',result);
        var results_return = '';
        if (results.length > 0){
            results.forEach(function(result,i){
                result.forEach(function (e,i){
                    for (let [key, value] of Object.entries(e)) {
                        results_return += `${key}: ${value} \n`;
                    }
                });
                results_return += '\n';
            });
        }
        return_json = {'text':results_return};
        axios({
            method: 'post',
            headers: {'Authorization':'Bearer xoxb-0000000-000000-AbCd3FG','Content-Type':'application/json'},
            url:body.response_url,
            data: return_json
        }).then(function (response) {
            winston.debug(response.status);
        }).catch(function (error) {
            winston.debug('%o',error);
        });
        body['police'].close_call(JSON.stringify(return_json));
    }).catch(function(err) {
        // unable to get results for query and return error
        winston.debug(err);
        return_json = {channel: "slack_user_id",text: `<@slack_user_id> \nUser: ${body.user_name} \nCommand:${body.command} \nText: ${body.text} \nError: ${JSON.stringify(err)}`};
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
}