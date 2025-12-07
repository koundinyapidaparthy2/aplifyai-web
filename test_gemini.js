
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct listModels on the instance in some versions, 
        // but let's try to just hit the API if possible or use the generic request.
        // Actually the SDK might not expose listModels directly in the helper.
        // Let's try to just run a simple generateContent with "gemini-pro" to see if THAT works.

        console.log("Trying gemini-pro...");
        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await modelPro.generateContent("Hello");
        console.log("gemini-pro response:", result.response.text());

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
