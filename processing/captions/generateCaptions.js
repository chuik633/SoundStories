const fs = require("fs");
const path = require("path");
const { SpeechClient } = require("@google-cloud/speech");

async function getCaptions(audioFilePath) {
  const client = new SpeechClient();

  //api call request (GOT THIS ONLINE)
  const audio = {
    content: fs.readFileSync(audioFilePath).toString("base64"),
  };

  const config = {
    encoding: "LINEAR16", // Audio encoding (adjust based on your file)
    sampleRateHertz: 16000, // Sample rate of the audio
    languageCode: "en-US", // Language code (adjust if necessary)
  };

  const request = {
    audio: audio,
    config: config,
  };

  //SEND REQUEST (and get response)
  const [response] = await client.recognize(request);
  const transcription = response.results
    .map((result) => result.alternatives[0].transcript)
    .join("\n");

  console.log(`Transcription: ${transcription}`);
  return transcription;
}

getCaptions("./tmp/PrincessMononoke/audios/5.mp3")
  .then((result) => {
    console.log("Media processed successfully:", result);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
