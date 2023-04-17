

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
            const profiles = await agent.app.bsky.actor.getSuggestions({ limit: 10 });
            const actors = profiles.data.actors;
            console.log(`Found ${actors.length} profiles.`)
            let j = 0;
            let i = 0;

            let isReplied = false;
            let readyToReply = false;
            // Loop through the list of profiles
            for (const actor of actors) {
                let totalPosts = 0;
                let replyobj;
                // Get the profile
                const {data : profile} = await agent.getProfile({ actor: actor.did })

                let postsCount = profile.postsCount;

                if (postsCount > 0 && postsCount === 1) {
                    
                }

                // Fetch profile feed
            //     const { data } = await await agent.getAuthorFeed({ actor: actor.did, limit: 10 });

            //     if (data.feed.length > 0) {
            //         for (const feed of data.feed) {
            //             const post = feed.post
            //             //console.log('Replies: ' + post.replyCount )
            //             if (post.replyCount > 0) {
            //                 const { data: thread } = await agent.getPostThread({ uri: post.uri })
            //                 //console.log(thread.thread.replies);
            //                 const replies = thread.thread.replies;
            //                 for (const reply of replies) {
            //                     totalPosts++;
            //                     if (reply.post.record.text.includes("Welcome to BlueSky")) {
            //                         isReplied = true;
            //                         console.log("Welcome post found");
            //                         j++;
            //                         break;
            //                     } else {
            //                         readyToReply = true;
            //                         replyobj = thread.thread.replies[0].post;
            //                         //console.log("Ready to Post welcome reply");
            //                         break;
            //                     }
            //                 }
            //             }
            //         }
            //     }

            //     if (readyToReply) {
            //         if (replyobj !== undefined) {
            //             console.log("Posting welcome reply");
            //             // const message = Create Welcome Message with link to profile
            //             const message = "Welcome to BlueSky! 🎉\n\n" + "Follow The Bluesky team: \n\n" + "@jay.bsky.team \n\n" + "@pfrazee.com \n\n" + "@why.bsky.team \n\n" + "@iamrosewang.bsky.social \n\n" + "@dholms.xyz \n\n" + "@divy.zone \n\n" + "@jakegold.us \n\n" + "@bnewbold.net \n\n" + "@ansh.bsky.team \n\n" + "@emilyliu.me \n\n" + "@jack.bsky.social \n\n";
            //             const rt = new RichText({text: message})
            //             await rt.detectFacets(agent) // automatically detects mentions and links
            //             const newpost = await agent.post({
            //                 facets: rt.facets,
            //                 text: rt.text,
            //                 reply: {
            //                     parent: {
            //                         uri: replyobj.uri,
            //                         cid: replyobj.cid,
            //                     },
            //                     root: {
            //                         uri: replyobj.uri,
            //                         cid: replyobj.cid,
            //                     },
            //                 },
            //                 createdAt: new Date().toISOString()
            //             });
            //             fs.writeFileSync('post/' + now.getFullYear() + "-"+ now.getMonth() + "-" + now.getDate() + '___' + replyobj.cid + '.txt', `${JSON.stringify(newpost)}`);
            //             console.log(newpost);
            //         }
            //         console.log("Posting welcome reply");
            //     }
            //     //Check if the profile is already followed
            //     if (profile.data.viewer.following == null) {
            //         await agent.follow(profile.data.did);
            //         // increment i by 1
            //         i++;
            //         process.stdout.write(`Followed ${actors.length }/${i} profiles.\r`);
            //         await sleep(2000);
            //     }
            }
            console.log(`Total Followed ${j} profiles.`)
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