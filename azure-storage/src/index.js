const express = require("express");
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

if (!process.env.PORT) {
    throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
}

if (!process.env.STORAGE_ACCOUNT_NAME) {
    throw new Error("Please specify the name of an Azure storage account in environment variable STORAGE_ACCOUNT_NAME.");
}

if (!process.env.STORAGE_ACCESS_KEY) {
    throw new Error("Please specify the access key to an Azure storage account in environment variable STORAGE_ACCESS_KEY.");
}

const PORT = process.env.PORT;
const STORAGE_ACCOUNT_NAME= process.env.STORAGE_ACCOUNT_NAME;
const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY;

function createBlobService() {
    const sharedKeyCredential = new StorageSharedKeyCredential (STORAGE_ACCOUNT_NAME, STORAGE_ACCESS_KEY);
    const blobService = new BlobServiceClient (
        `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`, 
        sharedKeyCredential
    );
    return blobService;
}

const app = express();

app.get("/video", async (req, res) => {
    
    const videoPath = req.query.path;

    if (!videoPath) {
        return res.status(400).send("Please provide a valid video path.");
    }


    const containerName = "videos";
    const blobService = createBlobService();
    const containerClient = blobService.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(videoPath);
    
    const properties = await blobClient.getProperties();

    res.writeHead(200, {
        "Content-Length": properties.contentLength,
        "Content-Type": "video/mp4",
    });

    const response = await blobClient.download();
    response.readableStreamBody.pipe(res);
});

app.listen(PORT, () => {
    console.log(`Microservice online`);
});