const appRoot = require('app-root-path');
const winston = require(`${appRoot}/winston`);
const Mysql = require(`${appRoot}/db/mysql`);
const axios = require('axios');

module.exports = async (body)=>{
    // e.g. command /slackbot-admin add_permission user_id /get-stats-*
    winston.debug('/slackbot_name/post/slackbot-admin/add_permission.js');
    var db_conn = new Mysql();
    var return_json = {};
    body['police'].mid_call();
    
    // prepare the sql to insert user
    var sql = `insert into db.user_permissions (user_id,bot_name,commands,status) values (?,'slackbot_name',?,1)`;
    var params = [body.text_array[1],body.text_array[2].replace("-", " ").toLowerCase()];
    
    // exceute the sql
    db_conn.query(
        sql, params
    ).then(function(result) {
        // obtained results from query and return results to user
        winston.debug('%o',result);
        var results_return = JSON.stringify(result);
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
        return_json = {channel: "slack_channel_id",text: `<@slack_channel_id> \nUser: ${body.user_name} \nCommand:${body.command} \nText: ${body.text} \nError: ${JSON.stringify(err)}`};
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