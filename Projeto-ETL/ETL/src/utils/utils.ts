import path from "node:path";
import * as fs from "fs";
import * as fastcsv from "fast-csv";
import { DataSource } from "typeorm";

import { cadWfDataSource, cadWfAvonDataSource, vipo84DataSource, warehouseDataSource } from "../db/connection";

export function readSqlFile(filepath: string): string[] {
    return fs
        .readFileSync(path.join(__dirname, filepath))
        .toString()
        .replace(/\r?\n|\r/g, "")
        .split(";")
        .filter((query) => query?.length);
};

export async function writeResult(result: any, fs: fs.WriteStream) {
    fastcsv
        .write(result, { headers: true })
        .pipe(fs);

    console.log("Write to CSV successfully!");
};

export async function test(text: String) {
    console.log(text);
};

const isDataBaseConnected = (dataSource: DataSource) => {

    if (dataSource.isInitialized) {
        return;
    }

    return dataSource.initialize();
};

export const databaseConnection = async () => {
    await Promise.all([
        isDataBaseConnected(cadWfDataSource),
        isDataBaseConnected(cadWfAvonDataSource),
        isDataBaseConnected(warehouseDataSource),
        isDataBaseConnected(vipo84DataSource)
    ])
        .catch((err) => console.error("Error during Data Sources initialization:", err));
};
