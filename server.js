import { https } from "firebase-functions";
import { initializeApp, firestore } from "firebase-admin";

initializeApp();

export const saveReading = https.onCall(async (data, context) => {
    const { meterId, value } = data;

    await firestore().collection("readings").add({
        meterId: meterId,
        value: value,
        time: new Date()
    });

    return { success: true };
});
const functions = require("firebase-functions");
const vision = require("@google-cloud/vision");

const client = new vision.ImageAnnotatorClient();

exports.scanMeter = functions.https.onRequest(async (req, res) => {
    try {
        const image = req.body.image;

        const [result] = await client.textDetection({
            image: { content: image }
        });

        const text = result.fullTextAnnotation?.text || "";

        res.json({ text });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Vision failed" });
    }
});