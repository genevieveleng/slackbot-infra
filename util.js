const appRoot = require('app-root-path');
const fs = require('fs');
const path = require('path');

//======================|
//DB CREDS              |
//======================|

this.get_presto_config = () => {
    var config = [];
    try {
        var strConfigPath = path.join(appRoot.toString(), '.', 'client_secrets', 'dbconn-presto.json');
        var jsonString = fs.readFileSync(strConfigPath);
        config = JSON.parse(jsonString);
      } catch(err) {
        console.log(err);
        return err;
      }
    return config;
}
this.get_mysql_config = () => {
    var config = [];
    try {
        var strConfigPath = path.join(appRoot.toString(), '.', 'client_secrets', 'dbconn-mysql.json');
        var jsonString = fs.readFileSync(strConfigPath);
        config = JSON.parse(jsonString);
        console.log(config);
      } catch(err) {
        return err;
      }
    return config;
}

//======================|
//List of Bot Names     |
//======================|

this.get_bot_name = str_token => {
    var bot_name_dict = {bot_token:'bot_name'};
    return bot_name_dict[str_token];
}

//======================|
//Simple function       |
//======================|


this.string_is_empty = inputString => {
    if( typeof(inputString) !== 'string' ){
        //WARNING: will return true if null, numbers, object, etc
        return true;
    }
    if( inputString === '' ){
        return true;
    }

    return false;
}

//to validate if a string is actually numbers
this.can_parse_int = strInput => {
    try{
        if( isNaN(parseInt(strInput)) ){
            return false
        }else{
            return true;
        }

        //no exception means strInput is parsed successfully
        
    }catch(ex){
        //has exception means strInput isn't number
        return false;
    }
}


this.is_array_empty = (inputAry) => {
    if( !Array.isArray(inputAry) ){
        //WARNING: will return true for null, object, string and anything that's not Array
        return true;
    }
    if( inputAry.length <= 0 ){
        return true;
    }

    
    return false;
}

this.is_valid_object = (inputObj, aryRequiredFields) => {
    
    if( Array.isArray(inputObj) ){
        return "expecting Dict/Object, not Array";
    }
    const aryKeyNames = Object.keys(inputObj);
    if( aryKeyNames.length <= 0){
        return "Dict/Object has no keys";
    }else if( this.can_parse_int(aryKeyNames[0]) ){
        return "Dict/Object ["+aryKeyNames[0]+"] is bad key naming: do not name key with numbers. obj['a'] is ok but NOT obj['0']. obj['0'] should just be a normal array like ary[0]";
    }

    if( typeof(aryRequiredFields) === 'undefined' ){
        //if required fields/keys not specified
        //then output as No Error (empty string means no error)
        return "";
    }else{
        //else, validate further
        //make sure all required fields exists

        let strErrMsg = "";
        let strTmpFieldName = "";
        console.log('aryKeyNames:');
        console.log(aryKeyNames);
        for(let i=0; i<aryRequiredFields.length; i++){
            strTmpFieldName = aryRequiredFields[i];
            if( aryKeyNames.indexOf(strTmpFieldName) < 0 ){
                strErrMsg += "object key [" + strTmpFieldName + "] not found\n";
            }

        }

        return strErrMsg;
    }

}

this.escape_string = (objInput) => {
    if( typeof(objInput) !== 'string' ){
        //if not string, then no need escape
        return objInput;
    }

    //console.log("before replace()");
    objInput = objInput.replace(/&/g, "&amp;");

    //console.log("before replace() 2");
    objInput = objInput.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    //console.log("before replace() 3");
    objInput = objInput.replace(/"/g, "&quot;").replace(/'/g, "&#039;");

    //console.log(objInput);

    return objInput;
}

this.escape_all_array_elements = (aryInput) => {
    let tmpVal = null;
    for(let i=0; i<aryInput.length; i++){
        tmpVal = aryInput[i];
        aryInput[i] = this.escape_string(tmpVal);
    }

    return aryInput;
}


//NOTE: only applicable to resultSet that select ONLY ONE Column
this.convert_resultset_to_single_array = (resultSet, strColumnName) => {

    let aryOutput = [];
    for(let i=0; i<resultSet.length; i++){
        aryOutput.push( resultSet[i][strColumnName] );
    }

    return aryOutput;
}


this.generate_random_char = intTotalChar => {
    let strRandomCharacters = "";

    for(let i=0; i<intTotalChar; i++){
        strRandomCharacters += String.fromCharCode( Math.floor(Math.random()*26)+65 );
    }

    return strRandomCharacters;
};


this.extract_params_from_msg = (aryMsgKeys) => {

    let aryascParams = {};
    let tmpKeyValues = [];
    for(let i=1; i<aryMsgKeys.length; i++){
        tmpKeyValues = aryMsgKeys[i].split('=');
        aryascParams[ tmpKeyValues[0] ] = tmpKeyValues[1];
    }

    return aryascParams;
}

module.exports = this;