import { db } from "@/database";
import { Event } from "@/discord/base";

new Event({
    name: "guildMemberAdd",
    run(member) {
        const { guild } = member;

     db.get(db.guilds, guild.id)
     .then((data) =>{
        const roleId = data?.welcome?.role || "";
        if (
            !guild.roles.cache.has(roleId)
            || member.roles.cache.has(roleId)
        ) return;
        member.roles.add(roleId);
     })
    },
})