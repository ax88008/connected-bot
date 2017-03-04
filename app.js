var builder = require('botbuilder');
var restify = require('restify');
var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/6f176d9b-27c7-46b6-80c9-785c3c8fcf19?subscription-key=2a963c49deb9478d9fc8ce8ee76e8349&verbose=true&q=');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

var intents = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', intents);

intents.matches('Twitter', [
    function (session, args, next) {
		var content = builder.EntityRecognizer.findEntity(args.entities, 'content');
        if (!content) {
            builder.Prompts.text(session, "What would you like to tweet?");
        } else {
			next({ response: content.entity });
        }
    },
    function (session, results) {
        if (results.response) {
            // ... send Tweet
			session.send("Ok... ready to tweet, '%s'" + session.userData.content.entity, results.response);
        } else {
            session.send("Ok");
        }
    }
]);

intents.matches('Facebook', [
    function (session, args, next) {
		session.dialogData.content = builder.EntityRecognizer.findEntity(args.entities, 'content');
		var content = builder.EntityRecognizer.findEntity(args.entities, 'content');
        if (!content) {
            builder.Prompts.text(session, "What would you like to update to Facebook?");
        } else {
            next({ response: content.entity });
        }
    },
    function (session, results) {
		if (results.response) {
            session.send("Ok... ready to update Facebook, '%s'" + session.userData.content.entity, results.response);
        } else {
            session.send("Ok");
        }
    }
]);

intents.onDefault(builder.DialogAction.send("I'm sorry. I didn't understand."));