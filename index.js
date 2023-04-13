

import bsky  from '@atproto/api';
const { BskyAgent, RichText } = bsky;
import * as dotenv from 'dotenv';
import process from 'node:process';
import fs from 'node:fs';
import cron from 'node-cron';

dotenv.config();

console.log('Booting up BlueSky welcome bot...')

export const handler = async function () {
    console.log("Initialized.")
    
    var now = new Date();
    
    async function init() {
        console.log('running a task every minute');
        // Log in to Bluesky
        const agent = new BskyAgent({
            service: 'https://bsky.social',
            persistSession: (evt, sess) => {
                // store the session-data for reuse
                // [how to do this??]
                console.log('Persisting session data...')
                const session_data = JSON.stringify(sess);
                fs.writeFileSync('session.json', session_data);
            },
        });
        if (fs.existsSync('session.json')) {
            // load the session-data from a previous run
            console.log('Loading session data...')
            const session_data = fs.readFileSync('session.json');
            const session = JSON.parse(session_data);
            await agent.resumeSession(session)
        } else {
            // log in to Bluesky
            console.log('Logging in...')

            await agent.login({
                identifier: process.env.BSKY_USERNAME,
                password: process.env.BSKY_PASSWORD,
            });
        }

        try{
            // Get a list of bsky actors
            const profiles = await agent.app.bsky.actor.getSuggestions({ limit: 1 });
            const actors = profiles.data.actors;
            console.log(`Found ${actors.length} profiles.`)
            let i = 0;
            let j = 0;

            // Loop through the list of profiles
            for (const actor of actors) {
                // Get the profile
                const profile = await agent.getProfile({ actor: actor.did })
                // Fetch profile feed
                const mydid = 'vishal.bsky.social';
                const { data } = await await agent.getAuthorFeed({ actor: mydid, limit: 10 });

               // console.log(data.feed);

                if (data.feed.length > 0) {
                    for (const feed of data.feed) {
                        const post = feed.post
                        //console.log(post.replyCount > 0);
                        if (post.replyCount > 0) {
                            const { data: thread} = await agent.getPostThread({ uri: post.uri })
                            //console.log(thread.thread.replies);
                            const replies = thread.thread.replies;
                            for(const reply of replies) {
                                if (reply.post.record.text.includes("Welcome to BlueSky")) {
                                    console.log("Welcome post found");
                                    j++;
                                    break;
                                } else {
                                    console.log("Posting welcome reply");
                                    break;
                                }
                            }
                        }
                    }
                }
                // data.feed.length less than 5
                // if (data.feed.length <= 5) {
                //     const post = data.feed[0];
                //     console.log("Posting welcome reply");
                //     // const message = Create Welcome Message with link to profile
                //     const message = "Welcome to BlueSky! 🎉\n\n" + "Follow The Bluesky team: \n\n" + "@jay.bsky.team \n\n" + "@pfrazee.com \n\n" + "@why.bsky.team \n\n" + "@iamrosewang.bsky.social \n\n" + "@dholms.xyz \n\n" + "@divy.zone \n\n" + "@jakegold.us \n\n" + "@bnewbold.net \n\n" + "@ansh.bsky.team \n\n" + "@emilyliu.me \n\n" + "@jack.bsky.social \n\n";
                //     const rt = new RichText({text: message})
                //     await rt.detectFacets(agent) // automatically detects mentions and links
                //         const newpost = await agent.post({
                //             facets: rt.facets,
                //             text: rt.text,
                //             reply: {
                //                 parent: {
                //                     uri: post.uri,
                //                     cid: post.cid,
                //                 },
                //                 root: {
                //                     uri: post.uri,
                //                     cid: post.cid,
                //                 },
                //             },
                //             createdAt: new Date().toISOString()
                //         });
                //         fs.writeFileSync('post/' + now.getFullYear() + "-"+ now.getMonth() + "-" + now.getDate() + '___' + post.cid + '.txt', `${JSON.stringify(newpost)}`);
                //         console.log(newpost);
                // }
                // //Check if the profile is already followed
                // if (profile.data.viewer.following == null) {
                //     await agent.follow(profile.data.did);
                //     // increment i by 1
                //     i++;
                //     process.stdout.write(`Followed ${actors.length }/${i} profiles.\r`);
                //     await sleep(2000);
                // }
            }
            //fs.writeFileSync('data/' + now.getFullYear() + "-"+ now.getMonth() + "-" + now.getDate() + '___' + i + '.txt', `Total Followed ${i}`);
            console.log(`Total Followed ${i} profiles.`)
        } catch (e) {
            console.log(e)
        }
        console.log('Completed async responses. Goodbye.')
    }

    cron.schedule('* * * * *', () => {
        init();
    });

    //init();
}

const sleep = async (milliseconds) => {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
}

//export default handler

handler()