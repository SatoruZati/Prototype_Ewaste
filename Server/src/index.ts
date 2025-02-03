import express, { Request, Response } from "express";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables
dotenv.config();


// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173' // Adjust based on your frontend URL
}));
  

// Middleware to parse JSON bodies


// Validate Gemini API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not defined in the environment variables.");
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY? GEMINI_API_KEY : "");

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function assessProduct(brand: string, modelName: string, description: string) {
    const prompt = `
      Assess the product with the following details:
      - Brand: ${brand}
      - Model: ${modelName}
      - Description: ${description}
  
      Provide three responses:
      1. **Repair**: Possible repairable issues and how to fix them.
      2. **Recycle**: Responsible recycling methods.
      3. **Reuse**: Creative ways to reuse the product.
    `;
  
    try {
      const result = await model.generateContentStream({
        generationConfig,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
  
      let responseText = "";
      for await (const chunk of result.stream) {
        responseText += chunk.text();
      }
  
      return responseText;
    } catch (error) {
      console.error("Error generating content with Gemini:", error);
      throw error;
    }
}
  

// Chat route
app.post("/api/chat", async (req: Request, res: Response) => {
  const { brand, model, description } = req.body;

  // Validate request body
  if (!brand || !model || !description) {
    res.status(400).json({ error: "Brand, Model, and Description are required." });
    return;
  }

  try {
    // Get Gemini's response
    const response = await assessProduct(brand, model, description);
    res.json({ response });
  } catch (error) {
    console.error("Error in /api/chat route:", error);
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
});

// Start the server
app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000`);
});