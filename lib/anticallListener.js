const fs = require("fs");
const path = require("path");
const { font, bfont, isAnticallEnabled } = require("./myFunc");
const processedCalls = new Set();

async function anticallListener(maki, call) {
  try {
    if (isAnticallEnabled() && !processedCalls.has(call.id)) {
      processedCalls.add(call.id);
      const callerId = call.from;
      console.log(`Incoming call from ${callerId}, rejecting.`);
      await maki.rejectCall(call.id, call.from);
      await maki.sendMessage(callerId, {
        text: font(
          `     ${bfont("CALL TERMINATED")}\nYour call was terminated because the user is not available right now 🌸`,
        ),
      });

      setTimeout(() => {
        processedCalls.delete(call.id);
      }, 5000); // Remove the call ID from the set after 5 seconds
    }
  } catch (err) {
    console.error("❌ Anticall listener error:", err);
  }
}

module.exports = anticallListener;