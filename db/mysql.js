const appRootPath = require('app-root-path');
const mysql  = require('mysql');
const util  = require(`${appRootPath}/util`);
const winston  = require(`${appRootPath}/winston`);

module.exports = class MySQL {

    constructor(){
        const db_config = util.get_bia_config();
        // this.db_conn = mysql.createConnection({
        //     host: db_config.host,
        //     user: db_config.user,
        //     password: db_config.password
        // });

        this.db_pool = mysql.createPool({
            host: db_config.host,
            user: db_config.user,
            password: db_config.password,
            connectionLimit: 10
        });
        winston.debug('created connection and connected');
    }

    query_simple(sql) {
        this.db_pool.query(sql, function (err, result) {
            if (err) throw err;
            winston.debug("Result: " + JSON.stringify(result));
            return JSON.stringify(result);
        });
    }

    query(sql, params){
        winston.debug(this.db_pool);
        winston.debug("mysql.query()");
        winston.debug("%o", sql);
        
        return new Promise( (resolve, reject) => {
            this.db_pool.getConnection(function(err,connection){
                if (err) {
                    connection.release();
                    reject(err);
                }
                if( typeof(params) !== 'undefined' && params!==null ){
                    winston.debug("%o", params);
                    connection.query(sql,params,function(err,rows){
                        connection.release();
                        if(!err) {
                            resolve({rows: rows});
                        }           
                    });
                }
                else {
                    winston.debug('no params');
                    connection.query(sql,function(err,rows){
                        connection.release();
                        if(!err) {
                            resolve({rows: rows});
                        } else {
                            winston.debug(err);
                        }
                    });
                }
                connection.on('error', function(err) {      
                    winston.debug(err);
                    reject(err);
                });
            });
        });
    }
}