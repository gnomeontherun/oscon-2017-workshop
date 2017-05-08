require('dotenv').config();

const bodyParser = require('body-parser');
const boxen = require('boxen');
const chalk = require('chalk');
const cors = require('cors');
const crypto = require('crypto');
const emojiRegex = require('emoji-regex')();
const express = require('express');
const firebase = require('firebase-admin');
const Twitter = require('twitter');

const requiredENV = [
    'FIREBASE_CONFIG',
    'FIREBASE_DATABASE',
    'SEARCH_TERM',
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_TOKEN_SECRET'
];
requiredENV.forEach(env => {
    if (!process.env[env]) {
        console.log(chalk.red(`You have not provided all required configuration in the .env file, please give ${env} a value and try again.`));
        process.exit(1);
    }
})

// Setup Firebase
firebase.initializeApp({
    credential: firebase.credential.cert(process.env.FIREBASE_CONFIG),
    databaseURL: process.env.FIREBASE_DATABASE
});
const tweetsRef = firebase.database().ref('tweets');
const aggregatesRef = firebase.database().ref('aggregates');
const hashtagsRef = firebase.database().ref('hashtags');
const linksRef = firebase.database().ref('links');
// Clean up between server restarts
tweetsRef.remove();
aggregatesRef.remove();
hashtagsRef.remove();
linksRef.remove();

// Setup Twitter stream
const client = new Twitter({
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});
let stream;
let aggregates;
let term = '';
let ids = [];
let hashtags = {};
let links = {};

function startStream() {
    // Clear existing data if the stream existed previously
    if (stream) {
        stream.destroy();
        stream = null;
        hashtags = {};
        links = {};
        tweetsRef.remove();
        aggregatesRef.remove();
        hashtagsRef.remove();
        linksRef.remove();
    }

    // Reset aggregation data
    aggregates = {
        time: [{
            name: 'Tweets by Time',
            series: []
        }],
        languages: [],
        start: Date.now(),
        stats: [
            { name: 'Total', value: 0 },
            { name: 'Minutes running', value: 0 },
            { name: 'Per Minute', value: 0 },
            { name: 'of Retweets', value: 0 },
            { name: 'of Replies', value: 0 },
            { name: 'of Mentions', value: 0 },
            { name: 'Links shared', value: 0 },
            { name: 'Hashtags used', value: 0 },
            { name: 'Media used', value: 0 },
            { name: 'Emoji used', value: 0 },
            { name: 'with Location', value: 0 },
            { name: 'with a Place', value: 0 },
        ]
    };
    aggregatesRef.update(aggregates);

    console.log(chalk.yellow('Attempting to start Twitter stream'));

    // Set a timeout because Twitter doesn't like you making too many connections to fast
    setTimeout(function() {
        if (!term) return;

        client.stream('statuses/filter', { track: term }, function(ref) {
            console.log(chalk.green('Twitter stream started for term ' + term));
            stream = ref;
        });
        stream.on('data', function (tweet) {
            // Track duplicates, though only the last 1000 will be kept in memory
            if (ids.indexOf(tweet.id) >= 0) return;
            ids.push(tweet.id);
            if (ids.length > 1000) ids.shift();

            // Display tweet in terminal
            console.log(
                boxen(
                    chalk.green(`@${tweet.user.screen_name}: (${tweet.user.name}: ${tweet.text}`),
                    { padding: 1, margin: 1 }
                )
            );

            // Update the tweets/per/minute aggregation
            let time = new Date(parseInt(tweet.timestamp_ms));
            let minute = new Date(time.getUTCFullYear(), time.getUTCMonth(), time.getUTCDate(), time.getUTCHours(), time.getUTCMinutes(), 0, 0).toISOString();
            let minuteIndex = aggregates.time[0].series.find(item => item.name == minute);
            if (minuteIndex) {
                minuteIndex.value += 1;
            } else {
                aggregates.time[0].series.push({name: minute, value: 1});
            }
            // Update the number of minutes running
            aggregates.stats[1].value = Math.round((Date.now() - aggregates.start) / 60000);
            // Update the tweets/per/language aggregation
            let languageIndex = aggregates.languages.find(item => item.name == tweet.lang);
            if (languageIndex) {
                languageIndex.value += 1;
            } else {
                aggregates.languages.push({name: tweet.lang, value: 1});
            }
            // Add to total count
            aggregates.stats[0].value++;
            // Calculate average per minute
            aggregates.stats[2].value = aggregates.stats[0].value / ((Date.now() - aggregates.start) / 60000);
            // Check existance of a retweet property to indicate a retweet
            if (tweet.retweeted_status) {
                aggregates.stats[3].value++;
            }
            // Check existance of reply properties to indicate a reply
            if (tweet.in_reply_to_status_id || tweet.in_reply_to_user_id) {
                aggregates.stats[4].value++;
            }
            // Check if there are any entities
            if (tweet.entities) {
                // Check for mentions
                if (tweet.entities.user_mentions) {
                    aggregates.stats[5].value += tweet.entities.user_mentions.length;
                }
                // Check for mentions
                if (tweet.entities.urls) {
                    aggregates.stats[6].value += tweet.entities.urls.length;
                }
                // Check for mentions
                if (tweet.entities.hashtags) {
                    aggregates.stats[7].value += tweet.entities.hashtags.length;
                }
                // Check for media
                if (tweet.entities.media) {
                    aggregates.stats[8].value += tweet.entities.media.length;
                }
            }
            // Check how many emojis
            let emojis = emojiRegex.exec(tweet.text);
            if (emojis && emojis.length) {
                aggregates.stats[9].value += emojis.length;
            }
            // Check if there are coordinates
            if (tweet.coordinates) {
                aggregates.stats[10].value++;
            }
            // Check if there is a place
            if (tweet.place) {
                aggregates.stats[11].value++;
            }

            // Add and track counts on hashtags
            if (tweet.entities && tweet.entities.hashtags) {
                let update = {};
                tweet.entities.hashtags.forEach(hashtag => {
                    let key = crypto.createHash('md5').update(hashtag.text).digest('hex');
                    if (!hashtags[key]) hashtags[key] = 0;
                    hashtags[key]++;
                    update['/' + key] = {
                        hashtag: hashtag.text,
                        count: hashtags[key]
                    };
                });
                hashtagsRef.update(update);
            }

            // Add and track counts on links
            if (tweet.entities && tweet.entities.urls) {
                let update = {};
                tweet.entities.urls.forEach(link => {
                    let key = crypto.createHash('md5').update(link.expanded_url).digest('hex');
                    if (!links[key]) links[key] = 0;
                    links[key]++;
                    update['/' + key] = {
                        link: link.expanded_url,
                        count: links[key]
                    };
                });
                linksRef.update(update);
            }

            // Push updates to Firebase
            tweetsRef.push(tweet);
            aggregatesRef.update(aggregates);
        });
        stream.on('error', function (error) {
            console.log(chalk.red('Twitter stream error: ' + error));
        });
        stream.on('end', function() {
            console.log(chalk.red('Twitter stream ended for term ' + term));
        });
    }, 5000);
}

// Setup HTTP server
const app = express();
app.use(cors())
app.post('/term', bodyParser.json(), function (req, res) {
    if (!req.body || !req.body.term) {
        res.sendStatus(400);
        return;
    }
    if (req.header('authorization') !== 'token ' + process.env.API_KEY) {
        res.sendStatus(401);
        return;
    }
    term = req.body.term.toString();
    console.log(chalk.yellow('Received new term ' + term));
    startStream();
    console.log('POST /term ' + term);
    res.status(200).send({ term: term });
});

app.get('/term', function(req, res) {
    console.log('GET /term ' + term);
    res.status(200).send({ term: term });
});

app.listen(5000, function() {
    console.log('Server running on port 5000');
});