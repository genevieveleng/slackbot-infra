Slack Bot infrastucture
===================
by Genevieve (with the help of Joe)

# How to start?
*  git clone git@github.com:genevieveleng/slackbot-infra.git
*  npm install
*  Refer to `DB Set Up`
*  Refer to `Slackbot Set Up`
*  Once ready, fire away - `node app.js`

## DB Set Up
*  Go to ./client_secrets/*.json and update your db credentials
*  Set up your MySQL database by creating 3 tables (users, user_permissions, loggings)

CREATE TABLE db.loggings (
  id int(11) NOT NULL AUTO_INCREMENT,
  trigger_id varchar(100) NOT NULL,
  slack_user_id varchar(45) NOT NULL COMMENT 'refer to users.id',
  bot_name varchar(45) NOT NULL,
  call_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  call_message varchar(255) NOT NULL COMMENT 'chatbot command entered by user',
  return_at datetime DEFAULT NULL,
  return_message varchar(255) DEFAULT NULL COMMENT 'bot message to user of the command status (successful, error, waiting, etc)',
  status varchar(45) NOT NULL DEFAULT 'new' COMMENT 'new > processing > completed > unauthorised',
  PRIMARY KEY (id)
)

CREATE TABLE db.user_permissions (
  id int(11) NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL COMMENT 'Linked to users.id',
  bot_name varchar(45) NOT NULL,
  commands varchar(255) NOT NULL COMMENT '* = all functions of the bot, else will be singular functions',
  status tinyint(1) NOT NULL COMMENT '1 = able to access, 0 = not able to access',
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
)

CREATE TABLE db.users (
  id int(11) NOT NULL AUTO_INCREMENT,
  slack_user_id varchar(45) NOT NULL,
  slack_user_name varchar(255) NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_slack_user_id (slack_user_id)
)

## Slackbot Set Up
*  Create your slackbot https://api.slack.com/apps?new_app=1
*  Name your slackbot and rename ./interfaces/slackbot_name with your new bot name
*  Update ./generic-functions/bot_police.js with your bot token so that bot_police will record which bot is being used `var bot_name_dict = {y0urb0tT0ken:'slackbot_name'}`;


## Sample API call (via POSTMAN)
var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

var urlencoded = new URLSearchParams();
urlencoded.append("token", "y0urb0tT0ken");
urlencoded.append("command", "/get-stats"); OR urlencoded.append("command", "/fun-fact");
urlencoded.append("response_url", "https://hooks.slack.com/commands/xxxx/yyyy/zzzz");
urlencoded.append("user_id", "AZ00Z00009");
urlencoded.append("user_name", "yourname");
urlencoded.append("text", "test"); OR urlencoded.append("text", ""); 
urlencoded.append("trigger_id", "00000.00000.aBcd3FG");

var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow'
};

fetch("http://localhost:8080/api/slackbot_name", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));