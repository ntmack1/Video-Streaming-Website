const express = require("express");
const fs = require("fs");
const http = require("http");
// const http = require("http");
// const mongodb = require("mongodb");

if (!process.env.PORT) {
    throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
}

// if (!process.env.VIDEO_STORAGE_HOST) {
//     throw new Error("Please specify the host name for the video storage microservice in variable VIDEO_STORAGE_HOST.");
// }

// if (!process.env.VIDEO_STORAGE_PORT) {
//     throw new Error("Please specify the port number for the video storage microservice in variable VIDEO_STORAGE_PORT.");
// }

// if (!process.env.DBHOST) {
//     throw new Error("Please specify the host databse for the video storage microservice in variable DBHOST.");
// }

// if (!process.env.DBNAME) {
//     throw new Error("Please specify the database name for the video storage microservice in variable DBNAME.");
// }

const PORT = process.env.PORT;
// const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
// const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT);
// const DBHOST = process.env.DBHOST;
// const DBNAME = process.env.DBNAME;

// console.log(`Forwarding video requests to ${VIDEO_STORAGE_HOST}:${VIDEO_STORAGE_PORT}.`);
function sendViewedMessage(videoPath) {
    const postOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    };

    const requestBody = {
        videoPath: videoPath
    };

    const req = http.request(
        "http://history/viewed",
        postOptions
    );

    req.on("close", () => {
        console.log("Sent 'viewed' message to history microservice.");
    });

    req.on("error", (err) => {
        console.error("Failed to send 'viewed' message!");
        console.error(err && err.stack || err);
    });

    req.write(JSON.stringify(requestBody));
    req.end();
}

async function main() {

    const app = express();

    app.get("/video", async (req, res) => { // Route for streaming video.
        
        const videoPath = "./videos/SampleVideo_1280x720_1mb.mp4";
        const stats = await fs.promises.stat(videoPath);
    
        res.writeHead(200, {
            "Content-Length": stats.size,
            "Content-Type": "video/mp4",
        });

        fs.createReadStream(videoPath).pipe(res);

        sendViewedMessage(videoPath); // Sends the "viewed" message to indicate this video has been watched.
    });

    app.listen(PORT, () => {
        console.log("Microservice online.");
    });
}

main()
    .catch(err => {
        console.error("Microservice failed to start.");
        console.error(err && err.stack || err);
    });