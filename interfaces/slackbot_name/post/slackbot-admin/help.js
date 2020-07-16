const appRoot = require('app-root-path');
const winston = require(`${appRoot}/winston`);
const axios = require('axios');

module.exports = async (body)=>{
    // e.g. command /slackbot-admin help
    winston.debug('/slackbot_name/post/help/id.js');
    var return_json = {};
    body['police'].mid_call();
    
    return_json = {'channel':body.user_id
    ,"type": "mrkdwn"
    ,"text": "*List of example commands:*\n\
    `/slackbot-admin add_user <slack_user_id> <slack_user_name> <department>`\n\
    `/slackbot-admin add_permission <user_id> </permission-*>`"};
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
}