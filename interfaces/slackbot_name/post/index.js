const appRoot = require('app-root-path');
const winston = require(`${appRoot}/winston`);
const Police = require(`${appRoot}/generic-functions/bot_police`);
const axios = require('axios');
const util = require(`${appRoot}/util`);
const Presto = require(`${appRoot}/db/presto`);

// get the payload then run the correct file
// e.g. Slack command = 'current_fleet_ads' will run current_fleet_ads.js

module.exports = (req,res)=>{
    winston.debug('/slackbot_name/post/index.js');
    winston.debug('%o', req.body);

    // split the text into array, if any
    if (req.body.text != ''){
        winston.debug('splitting of text');
        req.body['text_array'] = req.body.text.split(' ');
        winston.debug(req.body['text_array']);
        // loop through all arrays to get variables
        if (req.body['text_array'].length > 0) {
            req.body['params'] = {};
            req.body['text_array'].forEach(function (e,i) {
                if (e.includes('=')){
                    var temp_var = e.split('=');
                    req.body['params'][temp_var[0]] = temp_var[1];
                }
            });
        }
    }

    const currentPolice = new Police(req.body);
    // check permission
    currentPolice.check_permission().then(function(result) {
        winston.debug('%o',result);
        // conduct logging, including whether got permission anot
        currentPolice.first_call().then(function(result) {
            winston.debug('%o',result);
            winston.debug(currentPolice.permission);
            if (currentPolice.permission == true){
                try {
                    req.body['police'] = currentPolice;
                    if (req.body.command == '/fun-fact'){
                        const command = require(`${appRoot}/interfaces/slackbot_name/post${req.body.command}`);
                        // fun-fact mainly for testing and for fun
                        res.send(command(req.body));
                    }
                    else {
                        // the real deal is here, usually will reply first to ensure response within 3 seconds and process request in another script
                        const command = require(`${appRoot}/interfaces/slackbot_name/post${req.body.command}/index`);
                        currentPolice.mid_call(); // to update db that it is running now
                        command(req.body);
                        res.send('Ok, I got you mate! Please wait awhile...');
                    }
                }
                catch (e) {
                    winston.debug(e);
                    res.send("I'm not programmed for this!");
                }
            }
            // if token is incorrect, return not authorised
            else {
                res.send('not authorised');
            }
        },function(err) {
            // close exception for logging
            winston.debug(err);
            res.send('server failure');
        });
    }
    ,function(err) {
        // close exception for permission check
        winston.debug(err);
        res.send('server failure');
    });   
}