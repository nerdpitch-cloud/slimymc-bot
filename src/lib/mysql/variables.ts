import { refreshDbVariables } from "../variables";
import { VariableEntry } from "./types";
import { sendSQLQuery } from "./_base";

export class VariablesDB {
	private static async _formatVariable(variable: any): Promise<VariableEntry> {
		let res: VariableEntry = {
			key: String(variable[0]["name"]),
			value: String(variable[0]["value"]),
		};

		return res;
	}

	private static async _formatVariables(variables: Array<any>): Promise<Array<VariableEntry>> {
		let res: Array<VariableEntry> = [];

		for (let i = 0; i < variables.length; i++) {
			res.push({
				key: String(variables[i]["name"]),
				value: String(variables[i]["value"]),
			});
		}

		return res;
	}
	static async set(name: string, value: string | number) {
		let res = await sendSQLQuery("INSERT INTO variables (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?;", [name, value, value]);

		await refreshDbVariables();

		return res;
	}

	static async get(varName: string | number) {
		let res = await sendSQLQuery("SELECT * FROM variables WHERE name = ?;", [varName]);
		if (!Array.isArray(res)) throw new Error("res[0] was not an array");

		return await VariablesDB._formatVariable(res[0]);
	}

	static async getAll() {
		let res = await sendSQLQuery("SELECT * FROM variables;");
		if (!Array.isArray(res[0])) throw new Error("res[0] was not an array");

		return await VariablesDB._formatVariables(res[0]);
	}
}
