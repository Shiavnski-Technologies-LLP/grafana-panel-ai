const express = require("express");
const bodyParser = require("body-parser");
const { OpenAI } = require("openai");
const { Client } = require("pg");
require("dotenv").config();
const cors = require("cors");


const app = express();
const port = 3001;

app.use(cors());


app.use(bodyParser.json());

const dbClient = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

dbClient.connect()
    .then(() => console.log("Connected to PostgreSQL"))
    .catch((err) => console.error("PostgreSQL connection error:", err));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post("/generate-dashboard", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
    }

    try {
        const schemaQuery = `
            SELECT table_schema, table_name, column_name, data_type
            FROM information_schema.columns
            WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
            AND table_schema NOT LIKE 'pg_toast%'
            AND table_schema NOT LIKE 'pg_temp%'
        `;

        const schemaResult = await dbClient.query(schemaQuery);
        const schema = schemaResult.rows;

        if (schema.length === 0) {
            return res.json({
                success: false,
                query: null,
                visualization: null,
                message: "The schema is empty or invalid. Please provide a valid schema."
            });
        }

        const visualArray = ["timeseries", "state-timeline", "status-history", "barchart", "histogram", "heatmap", "piechart", "candlestick", "gauge", "trend", "xychart", "stat", "bargauge", "table", "logs", "nodeGraph", "traces", "flamegraph", "canvas", "geomap", "alertlist", "text", "dashlist", "news", "annolist"];

        const openaiResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert SQL query generator and data visualization assistant. Return the response in a structured JSON format with the following keys:
                        1. "sql_query" (string): The SQL query for the user's prompt.
                        2. "visualization_type" (string): Suggested visualization type from this list: ${visualArray}.
                        3. "grafana_payload" (JSON object): Grafana dashboard payload in JSON format which includes layout, position, chart configuration, and other relevant details as per visualization is needed.
                        \n Ensure the payload matches this format exactly and please add some basis info according to the data that we need to represent if not avialable in json already.`,
                },
                {
                    role: "user",
                    content: `
                        Here is the database schema: ${JSON.stringify(schema)}.
                        Based on this schema, please:
                        1. Generate a SQL query that corresponds to the following user prompt: "${prompt}".
                        2. Suggest the best visualization type for the query.
                        3. Provide a complete Grafana dashboard payload in the required JSON format.
                        4. If the schema does not contain the required tables or data, return: "Unable to find relevant data for this request."
                    `
                }
            ],
        });
        
        let openaiMessageContent = openaiResponse.choices[0].message.content;
        
        // Clean up the response (remove markdown formatting like backticks)
        openaiMessageContent = openaiMessageContent.replace(/```json|```/g, '').trim();
        
        const parsedResponse = JSON.parse(openaiMessageContent);

        res.json({
            success: true,
            query: parsedResponse.sql_query,
            visualization: parsedResponse.visualization_type,
            grafanaPayload: parsedResponse.grafana_payload,
            message: parsedResponse.message || "Query and visualization generated successfully.",
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Something went wrong." });
    }
});

app.get('/dashboard/:dashboardId', async (req, res) => {
    const dashboardId = req.params.dashboardId;

    if (!dashboardId) {
        return res.status(400).json({ error: "Dashboard ID is required." });
    }

    try {
        const myHeaders = new Headers();
        myHeaders.append("accept", "application/json, text/plain, */*");
        myHeaders.append("content-type", "application/json");

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow",
        };

        const response = await fetch(`http://localhost:3000/api/dashboards/uid/${dashboardId}`, requestOptions);

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Failed to fetch dashboard: ${errorMessage}`);
        }

        // Await the parsed JSON response
        const data = await response.json();

        // Send the data as the API response
        res.status(200).json({
            dashboard: data.dashboard
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Something went wrong.", details: error.message });
    }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
