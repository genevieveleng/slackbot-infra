const appRootPath = require('app-root-path');
const presto  = require('presto-client');
const util  = require(`${appRootPath}/util`);
const winston  = require(`${appRootPath}/winston`);

module.exports = class Presto {
    constructor(){
        const db_config = util.get_presto_config();
        this.client = new presto.Client({
            user: db_config['email'],
            basic_auth:{user: db_config['email'],password:db_config['password']},
            host: db_config['host'],
            port: db_config['port'],
            ssl: true, // depends on whether your host is http (ssl:true) or https (ssl:false)
            catalog: 'hive',
            schema: 'public',
            source:  'nodejs-client'
        });
        winston.debug('set presto client');
    }
    
    execute (sql){
        // run the query
        var results = {};
        results['data'] = [];
        return new Promise( (resolve, reject) => {
            this.client.execute({
                query: sql,
                columns: function(error, data){
                    // get headers of the query
                    results['columns'] = data;
                },
                data: function(error, data, columns, stats){
                    // this code takes intermittent release of data, and organise into one nice array
                    data.forEach(function(e){
                        winston.debug(`pushing this data: ${e}`);
                        results['data'].push(e);
                    })
                },
                success: function(error, stats){
                    // this code turn the data into an object
                    var results_cleaned = results['data'].map(function(values) {
                        return results['columns'].reduce(function(o, k, i) {
                            o[k.name] = values[i];
                            return o;
                        }, {});
                    });
                    resolve(results_cleaned);
                },
                error: function(error){reject(error);}
            });
        });
    }

    // default presto client execution statement
    // execute(strSql){
    //     const results = []
    //     results['state']='NEW';
    //     client.execute({
    //         query:   strSql,
    //         state:   function(error, query_id, stats){ results['queryInfo'] = {id:query_id, stats:stats}; results['state'] = stats['state'];},
    //         columns: function(error, data){ results['columns'] = data; },
    //         data:    function(error, data, columns, stats){ results['data'] = data; },
    //         success: function(error, stats){console.log(results); return results;},
    //         error:   function(error){results['error']=error; return results;}
    //     });
    // }
}