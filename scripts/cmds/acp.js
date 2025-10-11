const moment = require("moment-timezone");
module.exports = {
  config: {
    name: "acp",
    version: "1.0.2",
    author: "ROBIUL",
    role: 2,
    shortDescription: {
      en: "Accept or delete pending friend requests"
    },
    longDescription: {
      en: "List all Facebook friend requests and let you accept or delete them easily."
    },
    category: "admin",
    guide: {
      en: "{pn} → show friend request list\nReply with: add or del + number(s) or all\nExample:\nadd 1 2\ndel all"
    }
  },

  onStart: async function({ api, event }) {
    try {
      const form = {
        av: api.getCurrentUserID(),
        fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
        fb_api_caller_class: "RelayModern",
        doc_id: "4499164963466303",
        variables: JSON.stringify({ input: { scale: 3 } })
      };

      const data = await api.httpPost("https://www.facebook.com/api/graphql/", form);
      const listRequest = JSON.parse(data).data.viewer.friending_possibilities.edges;

      if (listRequest.length === 0)
        return api.sendMessage("😅 কোনও পেন্ডিং ফ্রেন্ড রিকোয়েস্ট নেই।", event.threadID, event.messageID);

      let msg = "";
      let i = 0;
      for (const user of listRequest) {
        i++;
        msg += `\n${i}.\nনাম: ${user.node.name}\nআইডি: ${user.node.id}\nলিংক: ${user.node.url.replace("www.facebook", "fb")}\nসময়: ${moment(user.time * 1000).tz("Asia/Dhaka").format("DD/MM/YYYY HH:mm:ss")}\n`;
      }

      api.sendMessage(
        `${msg}\n\n👉 রিপ্লাই দাও: add বা del এবং তারপর নাম্বার (বা all)\nউদাহরণ:\nadd 1 3\ndel all`,
        event.threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "accept",
            author: event.senderID,
            listRequest
          });
        },
        event.messageID
      );
    } catch (e) {
      console.log(e);
      return api.sendMessage("❌ কোনো সমস্যা হয়েছে, পরে আবার চেষ্টা করো।", event.threadID, event.messageID);
    }
  },

  onReply: async function({ api, event, Reply }) {
    const { author, listRequest } = Reply;
    if (event.senderID != author) return;

    const args = event.body.trim().toLowerCase().split(/\s+/);
    const form = {
      av: api.getCurrentUserID(),
      fb_api_caller_class: "RelayModern",
      variables: {
        input: {
          source: "friends_tab",
          actor_id: api.getCurrentUserID(),
          client_mutation_id: Math.round(Math.random() * 19).toString()
        },
        scale: 3,
        refresh_num: 0
      }
    };

    const success = [];
    const failed = [];

    if (args[0] == "add") {
      form.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
      form.doc_id = "3147613905362928";
    } else if (args[0] == "del") {
      form.fb_api_req_friendly_name = "FriendingCometFriendRequestDeleteMutation";
      form.doc_id = "4108254489275063";
    } else {
      return api.sendMessage("অনুগ্রহ করে add বা del লেখো, তারপর নাম্বার বা all দাও।", event.threadID, event.messageID);
    }

    let targetIDs = args.slice(1);
    if (args[1] == "all") {
      targetIDs = [];
      const lengthList = listRequest.length;
      for (let i = 1; i <= lengthList; i++) targetIDs.push(i);
    }

    const newTargetIDs = [];
    const promiseFriends = [];

    for (const stt of targetIDs) {
      const u = listRequest[parseInt(stt) - 1];
      if (!u) {
        failed.push(`নম্বর ${stt} পাওয়া যায়নি`);
        continue;
      }
      form.variables.input.friend_requester_id = u.node.id;
      form.variables = JSON.stringify(form.variables);
      newTargetIDs.push(u);
      promiseFriends.push(api.httpPost("https://www.facebook.com/api/graphql/", form));
      form.variables = JSON.parse(form.variables);
    }

    for (let i = 0; i < newTargetIDs.length; i++) {
      try {
        const friendRequest = await promiseFriends[i];
        if (JSON.parse(friendRequest).errors) failed.push(newTargetIDs[i].node.name);
        else success.push(newTargetIDs[i].node.name);
      } catch (e) {
        failed.push(newTargetIDs[i].node.name);
      }
    }

    api.sendMessage(
      `✅ ${args[0] == "add" ? "অ্যাকসেপ্ট" : "ডিলিট"} হয়েছে ${success.length} জন:\n${success.join("\n")}${failed.length > 0 ? `\n❌ ব্যর্থ ${failed.length} জন:\n${failed.join("\n")}` : ""}`,
      event.threadID,
      event.messageID
    );
  }
};
