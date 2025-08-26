const { getEmoji } = require("./myFunc");

const mess = {
  wait: `${getEmoji()} PROCESSING A SEC...`,
  nsfw: `${getEmoji()} NSFW IS PROHIBITED IN THIS GROUP`,
  success: `${getEmoji()} SUCCESSFUL`,
  only: {
    prem: `${getEmoji()} THIS FEATURE IS ONLY FOR PREMIUM USERS`,
    group: `${getEmoji()} THIS FEATURE CAN ONLY BE ACCESSED IN GROUPS`,
    private: `${getEmoji()} THIS FEATURE CAN ONLY BE ACCESSED IN PRIVATE CHAT`,
    owner: `${getEmoji()} COMMAND FOR SUDO USERS ONLY`,
    admin: `${getEmoji()} THIS FEATURE CAN ONLY BE ACCESSED BY ADMINS !!!`,
    Badmin: `${getEmoji()} MAKE BOT ADMIN TO BE ABLE TO USE THIS FEATURE`,
  },
}

module.exports = mess