const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

// Webhook endpoint for Dialogflow
app.post('/webhook', (req, res) => {
    const intentName = req.body.queryResult.intent.displayName;
    let response = {};

    switch (intentName) {
        case 'Performance_Anxiety':
            response = {
                fulfillmentText: "Performance anxiety is common among athletes. Here are some strategies that can help:\n\n" +
                    "1. Deep breathing exercises\n" +
                    "2. Positive self-talk\n" +
                    "3. Visualization techniques\n" +
                    "4. Progressive muscle relaxation\n\n" +
                    "Would you like to learn more about any of these techniques?"
            };
            break;

        case 'Pre_Game_Preparation':
            response = {
                fulfillmentText: "A good pre-game routine can help you feel more confident and prepared. Consider:\n\n" +
                    "1. Mental rehearsal of your performance\n" +
                    "2. Light physical warm-up\n" +
                    "3. Listening to motivating music\n" +
                    "4. Following a consistent routine\n\n" +
                    "Which aspect would you like to explore further?"
            };
            break;

        default:
            response = {
                fulfillmentText: "I'm here to help you with sports psychology topics like performance anxiety, mental focus, and pre-game preparation. What specific area would you like to work on?"
            };
    }

    // Send response back to Dialogflow
    res.json(response);
});

// Health check endpoint
app.get('/', (req, res) => {
    res.send('Dialogflow Webhook is running!');
});

app.listen(port, () => {
    console.log(`Webhook server is running on port ${port}`);
}); 