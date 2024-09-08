interface GuildGlobal {
  channels?: {
    join?: string;
    leave?: string;
  },
  role?: string,
  messages?: {
    join?: string;
    leave?: string;
  },
  colors?: {
    join?: string;
    leave?: string;
  }
  image?: {
    join?: string;
    leave?: string;
  }
}
interface Ticket {
  support_cat: string,
  fac_cat: string,
  donations_cat: string,
  report_cat: string,
  ombudsman_cat: string,
  donation_role: string,
  support_role: string,
  fac_role: string,
  report_role: string,
  ombudsman_role: string,
  transcripts: string,
}

interface Systems {
  logs?: string;
  verification?: string;
  suggestions?: string;
  backup?: string;
  very?: {
    channel: string;
    role: string;
  }
}

export interface GuildDocument {
  welcome?: GuildGlobal,
  ticket?: Ticket,
  systems?: Systems,
}