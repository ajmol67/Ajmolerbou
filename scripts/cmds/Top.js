function formatMoney(num) {
  if (num >= 1e15) return (num / 1e15).toFixed(1).replace(/\.0$/, "") + "Q";
  if (num >= 1e12) return (num / 1e12).toFixed(1).replace(/\.0$/, "") + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}
module.exports = {
  config: {
    name: "top",
    version: "2.1",
    author: "ᴀɴɪᴋ_🐢",
    role: 0,
    shortDescription: {
      en: "Show Top Rich Users"
    },
    longDescription: {
      en: "Shows the richest users with K/M/B/T/Q money format."
    },
    category: "group",
    guide: {
      en: "{pn} [number]\nExample: {pn} → Top 20\n{pn} 3 → Top 3 users"
    }
  },

  onStart: async function ({ message, args, usersData }) {
    const allUsers = await usersData.getAll();

    let limit = 20;
    if (args[0] && !isNaN(args[0])) {
      limit = parseInt(args[0]);
      if (limit < 1) limit = 1;
    }

    const topUsers = allUsers
      .filter(user => typeof user.money === "number")
      .sort((a, b) => b.money - a.money)
      .slice(0, limit);

    if (topUsers.length === 0) {
      return message.reply("ᴅᴀᴛᴀ ɴᴏᴛ ꜰᴏᴜɴᴅ.");
    }

    const rankEmojis = ["👑", "🥈", "🥉"];
    const topUsersList = topUsers.map((user, index) => {
      const name = user.name || "ᴜɴᴋɴᴏᴡɴ ᴜꜱᴇʀ";
      const money = formatMoney(user.money);
      const rankIcon = rankEmojis[index] || `#${index + 1}`;
      return ` ${rankIcon}  ${name} → 💰 ${money}`;
    });

    const msg = `━━━━━━━━━━━━━━━━━━
      🏆 ᴛᴏᴘ ${limit} ʀɪᴄʜᴇꜱᴛ ᴜꜱᴇʀꜱ 🏆
━━━━━━━━━━━━━━━━━━
${topUsersList.join("\n")}
━━━━━━━━━━━━━━━━━━`;

    message.reply(msg);
  }
};
