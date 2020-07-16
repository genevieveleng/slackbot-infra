const appRoot = require('app-root-path');
const winston = require(`${appRoot}/winston`);
const Mysql = require(`${appRoot}/db/mysql`);
const axios = require('axios');

module.exports = async (body)=>{
    // e.g. command /slackbot-admin add_user slack_user_id user.name
    winston.debug('/slackbot_name/post/slackbot-admin/add_user.js');
    var db_conn = new Mysql();
    var return_json = {};
    body['police'].mid_call();
    
    // prepare the sql to insert user
    var sql = `insert into db.users (slack_user_id,slack_user_name,department) values (?,?,?)`;
    var params = [body.text_array[1].toUpperCase(),body.text_array[2],body.text_array[3]];

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