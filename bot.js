var private = require("./private/info.js");

var tmi = require("tmi.js");

var phrases = [
    "Follow me to get notified the next time I'm live!",
    "Like my stream and what I do? Then check out my youtube channel: https://www.youtube.com/channel/UCxI9wLt-MpuJkL0Ep6kIAKA",
    "There is alot of information down in the description. Go check it out!",
    "Want to contact me? Join my discord! https://discord.gg/tjtW53 Pm me if I'm not online."
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
            
        case "russian_roulette":
        case "rr":
            
            con.query("SELECT * FROM viewers WHERE username='" + user.username + "'", function(err, result, fields){
                if(err) throw err;
                
                console.log(result);
                
                if(result.length == 0){
                    con.query("INSERT INTO viewers (username, points) VALUES ('" + user.username + "', '" + 200 + "')", function(err, r, fields){
                        
                        if(command[1] <= 200){
                            RussianRoulette(user, command[1], 200);
                        }else {
                            Say("Sry you only have 200 points!");
                        }
                        
                    });
                }else {
                    if(command[1] <= parseInt(result[0]["points"])){
                        RussianRoulette(user, command[1], parseInt(result[0]["points"]));
                    }else {
                        Say("Sry you only have " + result[0]["points"] + " points!");
                    }
                }
            });
            
            break;
            
        default:
            Say("Sry, didn't recognize that command! Try reading the description to see which commands you can use.");
            break;
    }
}

function RussianRoulette(user, betAmount, amount){
    if(amount > 0){
        var bullet = 3;
        var ticket = Math.floor(Math.random() * 6) + 1;
        Say("[" + user["display-name"] + "] Spinning... and......");
        
        var newAmount = 0;
        if(bullet == ticket){
            Say("[" + user["display-name"] + "] Pang!");
            newAmount = amount-betAmount;
            
        }else {
            Say("[" + user["display-name"] + "] Click!");
            newAmount = Math.floor(betAmount/4) + amount;
        }
        
        con.query("UPDATE viewers SET points='" + newAmount + "' WHERE username='" + user.username + "'", function(err, r, fields){
            
            Say ("[" + user["display-name"] + "] You now have " + newAmount + "!");
            
        });
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