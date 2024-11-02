import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function generateStory(prompt) {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-002",
      prompt: prompt,
      max_tokens: 1000,
    });
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error("Error generating story:", error);
    throw error;
  }
}

export async function generateImage(prompt) {
  try {
    const response = await openai.createImage({
      prompt: prompt,
      n: 1,
      size: "512x512",
    });
    return response.data.data[0].url;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}
