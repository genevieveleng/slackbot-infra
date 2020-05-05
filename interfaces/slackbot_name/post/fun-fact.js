const appRoot = require('app-root-path');
const winston = require(`${appRoot}/winston`);

module.exports = (body)=>{
    winston.debug('/slackbot_name/post/fun-fact.js');
    body['police'].mid_call();
    var thisFact = {
        0:'Do not call me Thomas Edison. I am Thomas Addison.',
        1:'My birthday is on the 29th April 2020.',
        2:'I love light bulbs, maybe because I am one.',
        3:'With me around, your life will never be dull.',
        4:'Sometimes I feel sad when people call me a light bulb.',
        5:'It is never easy being the brightest one around.',
        6:'I appreciate you calling me bright.',
        7:'I have a short fuse.',
        8:'My favourite song is You Light Up My Life by Debby Boone. Check out: https://www.youtube.com/watch?v=Mmyy-Gmyupc',
        9:'Thomas Edison once said "Many of life\'s failures are people who did not realise how close they were to success when they gave up." Gambette! Hwaiting! Don\'t ever give up!',
        10:'Thomas Edison once said "When you have exhausted all possibilities, remember this: you haven\'t." TRY HARDER!',
        11:'Hey! You are LED!',
        12:'I am not a filament of your imagination.',
        13:'Do not ask me "How many xx does it take to change a light bulb?". My answer is just one - Me.'
    }
    return_str = thisFact[Math.floor(Math.random() * Object.keys(thisFact).length)];
    body['police'].close_call(return_str);
    return return_str;
}
