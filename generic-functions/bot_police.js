const appRoot = require('app-root-path');
const Mysql = require(`${appRoot}/db/mysql`);
const winston = require(`${appRoot}/winston`);
const util = require(`${appRoot}/util`);

module.exports = class Police {
    constructor(body){
        this.body = body;
        this.db_conn = new Mysql();
        this.bot_name = util.get_bot_name('<your_bot_token>')
        this.permission = false;
        this.insertId = 0;
    }

    check_permission = () => {
        var _self = this;
        var results = [];
        var sql = `select *
            from db.user_permissions p 
            left join db.users u on p.user_id = u.id
            where upper(u.slack_user_id) = '${_self.body.user_id.toUpperCase()}'
            and p.status = 1
            and lower(p.bot_name) = '${this.bot_name}'
            and (lower(p.commands) = '${_self.body.command.toLowerCase()}' 
            or p.commands = '*'
            or lower(p.commands) = '${_self.body.command.toLowerCase()} *'`
        if (typeof(_self.body.text_array) === 'undefined'){
            sql += `)`
        } else {
            sql += `or p.commands = '${_self.body.command} ${_self.body.text_array[0]}')`
        }
        // check token is correct + whether got permission (y0urb0tT0ken = slackbot_name)
        return new Promise ((resolve, reject) => {
            this.db_conn.query(sql).then(
                function(result) {
                    winston.debug('%o',result);
                    results = result;
                    if (results.rows.length > 0){
                        resolve(_self.permission = true);
                    } else {
                        resolve(_self.permission = false);
                    }
                }, function(err) {
                    reject(err);
            });
        });
    }
    
    first_call = () => {
        var _self = this;
        var status = 'new';
        var dateNow = new Date();
        // check permission first and set status
        if (this.permission == false) {
            status = 'unauthorised';
        } 
        return new Promise ((resolve, reject) => {
            this.db_conn.query(
                `insert into db.loggings
                (trigger_id,slack_user_id,bot_name,call_at,call_message,status)
                values(?,?,?,?,?,?)`,
                [_self.body.trigger_id,_self.body.user_id,_self.bot_name,dateNow.toISOString(),_self.body.command+ ' ' +_self.body.text,status]
            ).then(
                function(result) {
                    winston.debug('%o',result);
                    resolve(_self.insertId = result.rows.insertId);
                }, function(err) {
                    winston.debug(err);
                    reject(err);
            });
        });
        
    }

    mid_call = () => {
        var _self = this;
        return new Promise ((resolve, reject) => {
            this.db_conn.query(
                `update db.loggings
                set status = 'processing'
                where id = ?`,
                [_self.insertId]
            ).then(
                function(result) {
                    winston.debug('%o',result);
                    resolve(result);
                }, function(err) {
                    winston.debug(err);
                    reject(err);
            });
        });
    }

    close_call = (return_message) => {
        var _self = this;
        var dateNow = new Date();
        return new Promise ((resolve, reject) => {
            this.db_conn.query(
                `update db.loggings
                set return_at = ?, return_message = ?, status = 'completed'
                where id = ?`,
                [dateNow.toISOString(), return_message, _self.insertId]
            ).then(
                function(result) {
                    winston.debug('%o',result);
                    resolve(result);
                }, function(err) {
                    winston.debug(err);
                    reject(err);
            });
        });
    }
}