var builder = require('botbuilder');
var restify = require('restify');

var server = restify.createServer();
server.listen(3978,function(){
    console.log('%s listening on %s',server.name , server.url);
});

var connector = new builder.ChatConnector();
server.post('/api/messages',connector.listen());

var dialogLabels = {
    Hotels : 'Hotels',
    Flights:'Flights',
    Support : 'Support'
};

var bot = new builder.UniversalBot(connector,[
    function(session){
        builder.Prompts.choice(session,
                               'Are you looking for a flight or a hotel ?',
                               [dialogLabels.Flights,dialogLabels.Hotels],
                               {
                                   maxRetries:3,
                                   retryPrompt:'Not a valid option'
                               });
    },
    function(session,result){
        if(!result.response){
            session.send('Oops! Too many attempts : {But dont worry , I am handling that exception and '
                               + 'you can try again');
            session.endDialog();
        }

        session.on('error',function(error){
            session.send('failed with message %s', error.message);
            session.endDialog();
        });

        var selection = result.response.entity;
        switch(selection){
            case dialogLabels.Flights:
                 return session.beginDialog('flights');
            case dialogLabels.Hotels:
                 return session.beginDialog('hotels');
        }
    }
]);

bot.dialog('flights', require('./flights'));
bot.dialog('hotels', require('./hotels'));
bot.dialog('support', require('./support')).triggerAction({ matches: [/help/i, /support/i, /problem/i]})


bot.on('error',function(session){
    builder.Prompts.send(session.message);
});
