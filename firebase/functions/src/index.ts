import * as functions from "firebase-functions";
import { getJson } from "serpapi";

exports.webSearch = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const query = data.query;
  if (!query) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      'The function must be called with one argument "query".'
    );
  }

  try {
    const response = await getJson({
      engine: "google",
      q: query,
      api_key: functions.config().serpapi.key,
    });
    return response;
  } catch (error) {
    console.error("Error fetching search results:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while fetching search results."
    );
  }
});
