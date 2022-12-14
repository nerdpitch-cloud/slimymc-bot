export interface InfractionEntry {
	punishment_id: number;
	user_id: string;
	punishment: number;
	reason: string;
	date_issued: Date;
}

export interface InviteEntry {
	inviterId: string;
	userId: string;
}

export interface LevelsEntry {
	userId: string;
	xp: number;
}

export interface InvitesLeaderboardEntry {
	userId: string;
	invites: number;
}

export interface VariableEntry {
	key: string;
	value: string;
}

export interface CountingEntry {
	userId: string;
	count: number;
}
