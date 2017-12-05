

'use strict';
const Alexa = require('alexa-sdk');
var http = require("http");

var options = {  // options passed to xml2js parser
  explicitCharkey: false, // undocumented
  trim: false,            // trim the leading/trailing whitespace from text nodes
  normalize: false,       // trim interior whitespace inside text nodes
  explicitRoot: false,    // return the root node in the resulting object?
  emptyTag: null,         // the default value for empty nodes
  explicitArray: true,    // always put child nodes in an array
  ignoreAttrs: false,     // ignore attributes, only create text nodes
  mergeAttrs: false,      // merge attributes and child elements
  validator: null         // a callable validator
};

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const APP_ID = 'amzn1.ask.skill.03074fb2-6786-4271-887c-8adfed5c71f3';

const SKILL_NAME = 'Band Name Generator';
const GET_FACT_MESSAGE = "Here's your band name: ";
const HELP_MESSAGE = 'You can say give me a band name relating to an artist, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

//=========================================================================================================================================
//TODO: Replace this data with your own.  You can find translations of this data at http://github.com/alexa/skill-sample-node-js-fact/data
//=========================================================================================================================================
function generateNames(track) {
    var str = track.split(" ");
    console.log(str);
    
    for(var i = 0; i < str.length; i++) {
        console.log(str[i]);
    }
    return str[0];
}


//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

// Session Handler
const handlers = {
    'LaunchRequest': function () {

        this.attributes.speechOutput = "WELCOME TO BAND NAME GENERATOR";
        var welcome = "WELCOME!";
        this.response.speak(this.attributes.speechOutput);
        this.emit(':ask', welcome);
        // this.emit(':responseReady');
    },
    'GetTracksIntent': function () {
        var userArtist = this.event.request.intent.slots.artist.value.trim().split(' ').join("%20");
        var context = this;
        
        console.log(userArtist);
        
        var option = {
            host: 'ws.audioscrobbler.com',
            //port: 80,
            path: '/2.0/?method=artist.gettoptracks&artist='+userArtist+'&api_key=ddf6b561bbd923aa28f762eef49300ca&format=json&limit=2',
            method: 'GET',
        };
    
        var reqGet = http.request(option, function(res) {
        console.log("statusCode: ", res.statusCode);
         
         var responseString = '';
         
            res.on('data', function(d) {
                console.info('GET result:\n');

                var obj = JSON.parse(d);
                
                const speechOutput = obj.toptracks.track[0].name;
                const tracks = obj.toptracks.track;
                const numTracks = tracks.length;
                console.log("NUMMMM:   " + numTracks);
                
                // DEBUG
                for(var j = 0; j < numTracks; j++) {
                    console.log("SONG" + j + ":     " + tracks[j].name);
                }
                
                // var numWords = 0;
                // for(var i = 0; i < numTracks; i++) {
                //     numWords += getNumWords(tracks[i]);
                // }
                
                // This variable holds the words in an array
                var words = [];
                // Put the words in the array
                for(var k = 0; k < numTracks; k++) {
                    var focalWordArray = tracks[k].name.split(" ");
                    for(var l = 0; l < focalWordArray.length; l++) {
                        words.push(focalWordArray[l]);
                    }
                }
                
                // DEBUG
                // loops though the words
                for(var i = 0; i < words.length; i++) {
                    console.log(words[i]);
                }
                
                
                //console.log("LOWER : " + name);
                /*--------------------------------------------------------*/
                
                var option2 = {
                    host: 'api.wordnik.com',
                    //port: 80,
                    path: '/v4/words.json/randomWords?&includePartOfSpeech=adjective&minLength=0&maxLength=7&api_key=48dd829661f515d5abc0d03197a00582e888cc7da2484d5c7',
                    method: 'GET',
                };
            
                var reqGet2 = http.request(option2, function(res) {
                console.log("statusCode: ", res.statusCode);
                 
                 var responseString = '';
                 
                    res.on('data', function(d) {
                        console.info('second get:\n');
                        
                        var obj2 = JSON.parse(d);
                
                        var parsed = obj2[0].word;
                        
                        var bandNames = "Your band names are ";
                        
                        for(var i = 0; i < words.length; i++) {
                            words[i] = obj2[i].word + " " + words[i];
                            if(bandNames === "Your band names are ") {
                                bandNames += words[i];
                            } else {
                                bandNames += ", ... " + words[i];
                            }
                        }
                        
                        console.log(bandNames);
                        
                        context.response.cardRenderer(SKILL_NAME, bandNames);
                        context.response.speak(bandNames);
                        context.emit(':responseReady');
                        
                    });
                 
                });
                 
                reqGet2.end();
                reqGet2.on('error', function(e) {
                    console.error(e);
                });
                
                
                /*--------------------------------------------------------*/
                
                // context.response.cardRenderer(SKILL_NAME, speechOutput);
                // context.response.speak(speechOutput);
                // context.emit(':responseReady');
            });
         
        });
         
        reqGet.end();
        reqGet.on('error', function(e) {
            console.error(e);
        });
    },
    'Unhandled': function () {
        this.emit(':ask', HELP_MESSAGE, HELP_MESSAGE);
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};