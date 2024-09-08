import { db } from "@/database";
import { Event } from "@/discord/base";
import { globalMessage } from "@/functions/welcome";
import mysql from 'mysql';

new Event({
    name: "guildMemberRemove",
    async run(member) {
        globalMessage({ member, action: "leave" });
        }
    },
);
