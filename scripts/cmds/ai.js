module.exports = {
  config: {
    name: "ai",
    version: "1.0.3",
    permission: 0,
    credits: "Nayan",
    description: "Chat with AI using GPT API",
    prefix: true,
    category: "user",
    usages: "[question]",
    cooldowns: 5
  },

  onStart: async function({ api, event, args }) {
    const axios = require("axios");

    const uid = event.senderID;
    const userName = event.senderName || "User"; // senderName fallback
    const prompt = args.join(" ");

    if (!prompt) {
      return api.sendMessage(
        "🧠 | দয়া করে কিছু লিখো, যেমন:\n`ai Who is the creator of GoatBot?`",
        event.threadID,
        event.messageID
      );
    }

    try {
      const getApi = await axios.get("https://raw.githubusercontent.com/MOHAMMAD-NAYAN-07/Nayan/main/api.json");
      const apiLink = getApi.data.api;

      const response = await axios.get(`${apiLink}/nayan/gpt3?prompt=${encodeURIComponent(prompt)}`);
      const aiResponse = response.data.response || "⚠️ | AI এখন কিছু বলতে পারছে না।";

      api.sendMessage(`🤖 ${userName},\n\n${aiResponse}`, event.threadID, event.messageID);

    } catch (error) {
      console.error("AI command error:", error);
      api.sendMessage("❌ | কিছু ভুল হয়েছে, পরে আবার চেষ্টা করো।", event.threadID, event.messageID);
    }
  }
};
