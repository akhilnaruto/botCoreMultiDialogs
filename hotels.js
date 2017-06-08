var builder = require('botbuilder');
var Store = require('./store');

module.exports =[
    function(session){
        session.send('Welcome to hotels finder');   
        builder.Prompts.text(session,'Please enter your destination');
    },
    function(session,result,next){
        session.dialogData.destination = result.response;
        session.send('looking for hotels in %s', result.response);
        next();
    },

    function(session){
        builder.Prompts.time(session, 'When do you want to check in ?');
    },
    function(session,result,next){
        session.dialogData.checkIn = result.response;
        next();
    },

    function(session){
        builder.Prompts.number(session,'How many nights do you want to stay ?');
    },
    function(session, result, next){
        session.dialogData.nights = result.response;
        next();
    },

    function(session){
        var destination = session.dialogData.destination;
        var checkIn = new Date(session.dialogData.checkIn);
        var checkOut = checkIn.addDays(session.dialogData.nights);

       session.send(
            'Ok. Searching for Hotels in %s from %d/%d to %d/%d...',
            destination,
            checkIn.getMonth() + 1, checkIn.getDate(),
            checkOut.getMonth() + 1, checkOut.getDate());

      Store.searchHotels(destination,checkIn,checkOut)
           .then(function(hotels){
               session.send('I found total  %d hotels for yor dates :', hotels.length);

               var message = new builder.Message()
                                        .attachmentLayout(builder.AttachmentLayout.carousel)
                                        .attachments(hotels.map(hotelAsAttachment));
               session.send(message);   
               
               session.endDialog();
           });
    }
];

function hotelAsAttachment(hotel){
     return new builder.HeroCard()
        .title(hotel.name)
        .subtitle('%d stars. %d reviews. From $%d per night.', hotel.rating, hotel.numberOfReviews, hotel.priceStarting)
        .images([new builder.CardImage().url(hotel.image)])
        .buttons([
            new builder.CardAction()
                .title('More details')
                .type('openUrl')
                .value('https://www.bing.com/search?q=hotels+in+' + encodeURIComponent(hotel.location))
        ]);
}

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};