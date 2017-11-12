var private = require("./private/info.js");

var tmi = require("tmi.js");

var phrases = [
    "Follow me to get notified the next time I'm live!",
    "Like my stream and what I do? Then check out my youtube channel: https://www.youtube.com/channel/UCxI9wLt-MpuJkL0Ep6kIAKA",
    "There is alot of information down in the description. Go check it out!"
]

var options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: private.username,
        password: private.password
    },
    channels: ["Z4F1_"]
}

var mysql = require("mysql");
var private = require("./private/info.js");

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: private.mysqlPass,
    database: "twitch"
});

con.connect(function(err){
    if(err) throw err;
    console.log("connected");
});

var bot = new tmi.client(options);

bot.connect();

bot.on("chat", function(channel, userstate, msg, self){
    
    if(self) return;
    
    if(msg.charAt(0) == "!") Command(userstate, msg.substring(1));
});

function Command(user, txt){
    var command = txt.split(" ");
    
    switch(command[0]){
        case "mods":
            
            bot.mods("Z4F1_").then(function(data){
                var mods = "Current mods are: ";
                for(var i = 0; i < data.length; i++){
                    mods += data[i] + ", ";
                }
                
                Say(mods);
            });
            
            break;
        case "points":
            
            con.query("SELECT * FROM viewers WHERE username='" + user.username + "'", function(err, result, fields){
                if(err) throw err;
                
                if(result.length == 0){
                    con.query("INSERT INTO viewers (username, points) VALUES ('" + user.username + "', '" + 200 + "')", function(err, result, fields){
                        Say("@" + user["display-name"] + " you have 200 f*cking points man!");
                    });
                }else {
                    Say("@" + user["display-name"] + " you have " + result[0]["points"] + " f*cking points man!");
                }
            });
            
            break;
        default:
            Say("Sry, didn't recognize that command! Try reading the description to see which commands you can use.");
            break;
    }
}

function Say(msg){
    console.log("Just said: " + msg);
    bot.say("Z4F1_", msg);
}

var index = 0; 
setInterval(function(){
    
    Say(phrases[index]);
    
    index++;
    if(index == phrases.length) index = 0;
    
}, 90000);