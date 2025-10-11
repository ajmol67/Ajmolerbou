.cmd install group.js const fs = require("fs-extra");
const request = require("request");

module.exports = {
  config: {
    name: "group",
    version: "1.0.2",
    author: "ROBIUL",
    role: 0,
    shortDescription: {
      en: "Manage group settings easily"
    },
    longDescription: {
      en: "Change group name, emoji, photo, view group info, and manage admin privileges."
    },
    category: "box",
    guide: {
      en: `Usage:
→ group name [new name]
→ group emoji [emoji]
→ group image (reply with an image)
→ group admin [@tag or reply]
→ group info`
    }
  },

  onStart: async function({ api, event, args }) {
    if (args.length === 0) {
      return api.sendMessage(
        `🛠️ You can use:\n\n` +
        `• group name [new name]\n` +
        `• group emoji [emoji]\n` +
        `• group image (reply to an image)\n` +
        `• group admin [@tag or reply] → promote/demote admin\n` +
        `• group info → show group details`,
        event.threadID,
        event.messageID
      );
    }

    const command = args[0].toLowerCase();

    // 🏷️ Change group name
    if (command === "name") {
      const newName = args.slice(1).join(" ") || (event.messageReply?.body || "");
      if (!newName) return api.sendMessage("❌ Please provide a new group name.", event.threadID, event.messageID);
      api.setTitle(newName, event.threadID);
      return api.sendMessage(`✅ Group name has been changed to:\n→ ${newName}`, event.threadID, event.messageID);
    }

    // 😀 Change group emoji
    if (command === "emoji") {
      const emoji = args[1] || (event.messageReply?.body || "");
      if (!emoji) return api.sendMessage("❌ Please provide an emoji.", event.threadID, event.messageID);
      api.changeThreadEmoji(emoji, event.threadID);
      return api.sendMessage(`✅ Group emoji changed to: ${emoji}`, event.threadID, event.messageID);
    }

    // 👑 Add or remove group admin
    if (command === "admin") {
      let targetID;
      if (Object.keys(event.mentions).length > 0) targetID = Object.keys(event.mentions)[0];
      else if (event.messageReply) targetID = event.messageReply.senderID;
      else if (args[1]) targetID = args[1];
      else return api.sendMessage("❌ Please tag or reply to the person you want to promote/demote.", event.threadID, event.messageID);

      const threadInfo = await api.getThreadInfo(event.threadID);
      const botIsAdmin = threadInfo.adminIDs.some(e => e.id == api.getCurrentUserID());
      const userIsAdmin = threadInfo.adminIDs.some(e => e.id == event.senderID);
      const targetIsAdmin = threadInfo.adminIDs.some(e => e.id == targetID);

      if (!userIsAdmin) return api.sendMessage("❌ You are not a group admin.", event.threadID, event.messageID);
      if (!botIsAdmin) return api.sendMessage("❌ The bot needs to be an admin to perform this action.", event.threadID, event.messageID);

      if (!targetIsAdmin) {
        await api.changeAdminStatus(event.threadID, targetID, true);
        return api.sendMessage("✅ The user has been promoted to group admin.", event.threadID, event.messageID);
      } else {
        await api.changeAdminStatus(event.threadID, targetID, false);
        return api.sendMessage("✅ The user has been demoted from admin.", event.threadID, event.messageID);
      }
    }

    // 🖼️ Change group photo
    if (command === "image") {
      if (event.type !== "message_reply")
        return api.sendMessage("❌ You must reply to an image.", event.threadID, event.messageID);

      const attachment = event.messageReply.attachments[0];
      if (!attachment || !attachment.url)
        return api.sendMessage("❌ Please reply to a valid image.", event.threadID, event.messageID);

      const path = __dirname + "/cache/group.png";
      const callback = () => {
        api.changeGroupImage(fs.createReadStream(path), event.threadID, () => fs.unlinkSync(path));
        api.sendMessage("✅ Group photo has been updated successfully.", event.threadID, event.messageID);
      };
      request(attachment.url).pipe(fs.createWriteStream(path)).on("close", callback);
    }

    // ℹ️ Show group info
    if (command === "info") {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const totalMembers = threadInfo.participantIDs.length;
      const totalAdmins = threadInfo.adminIDs.length;
      const groupName = threadInfo.threadName;
      const emoji = threadInfo.emoji;
      const approval = threadInfo.approvalMode ? "✅ On" : "❎ Off";
      const imageSrc = threadInfo.imageSrc;

      let adminList = "";
      for (const admin of threadInfo.adminIDs) {
        const info = await api.getUserInfo(admin.id);
        adminList += `• ${info[admin.id].name}\n`;
      }

      const path = __dirname + "/cache/groupinfo.png";
      const callback = () => {
        api.sendMessage(
          {
            body:
              `📄 Group Name: ${groupName}\n🆔 ID: ${threadInfo.threadID}\n` +
              `Emoji: ${emoji}\nApproval Mode: ${approval}\n` +
              `👥 Total Members: ${totalMembers}\n` +
              `👑 Total Admins: ${totalAdmins}\n\n` +
              `🧾 Admin List:\n${adminList}`,
            attachment: fs.createReadStream(path)
          },
          event.threadID,
          () => fs.unlinkSync(path),
          event.messageID
        );
      };

      if (imageSrc) {
        request(imageSrc).pipe(fs.createWriteStream(path)).on("close", callback);
      } else {
        api.sendMessage(
          `📄 Group Name: ${groupName}\n🆔 ID: ${threadInfo.threadID}\n` +
            `Emoji: ${emoji}\nApproval Mode: ${approval}\n` +
            `👥 Total Members: ${totalMembers}\n👑 Total Admins: ${totalAdmins}\n\n🧾 Admin List:\n${adminList}`,
          event.threadID,
          event.messageID
        );
      }
    }
  }
};
