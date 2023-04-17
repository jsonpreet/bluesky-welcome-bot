

import bsky  from '@atproto/api';
const { BskyAgent, RichText } = bsky;
import * as dotenv from 'dotenv';
import process from 'node:process';
import fs from 'node:fs';
import cron from 'node-cron';

dotenv.config();

console.log('Booting up BlueSky unfollow bot...')

export const handler = async function () {
    console.log("Initialized.")
    
    var now = new Date();
    
    async function init() {
        console.log('running a task every 5 minutes');
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

        try {
            const session_data = fs.readFileSync('session.json');
            const session = JSON.parse(session_data);
            // Get a list of bsky actors
            const { data } = await agent.getFollows({ limit: 100, actor: session.did });
            const profiles = data.follows;
           // console.log('Follows: ', profiles)
            let i = 0;
            for (const actor of profiles) {
                //Check if the profile is already followed
                await agent.deleteFollow(actor.viewer.following);
                // increment i by 1
                i++;
                process.stdout.write(`UnFollowed ${profiles.length }/${i} profiles.\r`);
                await sleep(2000);
            }
        } catch (e) {
            console.log(e)
        }
        console.log('Completed async responses. Goodbye.')
    }

    cron.schedule('*/5 * * * *', () => {
        init();
    });

    //init();
}

const sleep = async (milliseconds) => {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
}

//export default handler

handler()