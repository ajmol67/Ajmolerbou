/**
 * GoatBot v2 compatible "owner" command (text only)
 * Aliases: .owner, .admin, .info
 */

module.exports = {
  config: {
    name: "owner",
    version: "1.0",
    author: "AceGun",
    countDown: 5,
    role: 0,
    shortDescription: "owner info",
    longDescription: "Shows owner info (text only, no attachment)",
    category: "info",
    prefix: ".", // Optional
  },

  onStart: async function () {},

  onChat: async function ({ event, message, usersData, threadsData }) {
    try {
      const body = (event.body || "").trim().toLowerCase();
      const triggers = [".owner", ".admin", ".info"];

      if (!triggers.includes(body)) return;

      // User এবং thread info (optional)
      let user = {};
      try {
        user = (await usersData.get(event.senderID)) || {};
      } catch (e) {
        user = {};
      }

      let threadName = "";
      try {
        const threadData = (await threadsData.get(event.threadID)) || {};
        threadName = threadData.threadName || "";
      } catch (e) {
        threadName = "";
      }

      // Date & Time
      const now = new Date();
      const date = now.toLocaleDateString("en-GB");
      const time = now.toLocaleTimeString("en-US", { timeZone: "Asia/Dhaka", hour12: true });

      // Message content
      const infoMessage =
        "╔╝❮\n━━━━━━━━━━━━━━━━━━━━━━\n" +
        "NAME: 🆁🅾🅱🅸🆄🅻\n" +
        "RELIGION: ISLAM\n" +
        "ADDRESS: Ⓡⓐⓙⓢⓗⓐⓗⓘ\n" +
        "GENDER: MALE\n" +
        "AGE: 16\n" +
        "RELATIONSHIP: SINGLE\n" +
        "WORK: STUDENT\n" +
        "GMAIL: roniulisoam1023x@gmail.com\n" +
        "FACEBOOK: https://www.facebook.com/profile.php?id=100093774930731&mibextid=kFxxJD\n" +
        "MESSENGER: (hidden)\n" +
        "WHATSAPP: wa.me/+8801887267477\n" +
        "TELEGRAM: (hidden)\n" +
        "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
        `Bot Prefix: ( . )\nBot Name: 🆁🅾🅱🅸🆄🅻\n` +
        (threadName ? `Thread: ${threadName}\n` : "") +
        `Date: ${date} || Time: ${time}\n` +
        "━━━━━━━━━━━━━━━━━━━━━━";

      return message.reply({ body: infoMessage });
    } catch (err) {
      console.error("Owner command error:", err);
      return message.reply({ body: `কোথাও ভুল হয়েছে। Error: ${err.message}` });
    }
  },
};
