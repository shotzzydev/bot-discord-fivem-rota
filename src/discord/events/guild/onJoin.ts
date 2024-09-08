import { Event } from "@/discord/base";
import { globalMessage } from "@/functions/welcome";
globalMessage

new Event({
    name: "guildMemberAdd",
    run(member) {
        globalMessage({ member, action: "join" })
    }
})