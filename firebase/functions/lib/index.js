"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const serpapi_1 = require("serpapi");
exports.webSearch = functions.https.onCall(async (data, context) => {
    // Ensure the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const query = data.query;
    if (!query) {
        throw new functions.https.HttpsError("invalid-argument", 'The function must be called with one argument "query".');
    }
    try {
        const response = await (0, serpapi_1.getJson)({
            engine: "google",
            q: query,
            api_key: functions.config().serpapi.key,
        });
        return response;
    }
    catch (error) {
        console.error("Error fetching search results:", error);
        throw new functions.https.HttpsError("internal", "An error occurred while fetching search results.");
    }
});
//# sourceMappingURL=index.js.map