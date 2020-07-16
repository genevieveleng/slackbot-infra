const appRoot = require('app-root-path');
const winston = require(`${appRoot}/winston`);
const axios = require('axios');

module.exports = async (body)=>{
    winston.debug('/slackbot_name/post/slackbot-admin/index.js');

    // using this to check what type of analytics to run using body.text_array[0]
    try {
        const run_stats = require(`${appRoot}/interfaces/slackbot_name/post/slackbot-admin/${body.text_array[0]}`);
        run_stats(body);
    } catch (e) {
        winston.debug(e);
        return_json = {'text':'Sorry... Wrong usage of command...'};
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
    }
    
}