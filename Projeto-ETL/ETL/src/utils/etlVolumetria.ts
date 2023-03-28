import * as fs from "fs";
import * as fastcsv from "fast-csv";
import { cadWfDataSource, cadWfAvonDataSource, warehouseDataSource } from "../db/connection";
import { readSqlFile, writeResult } from "./utils";

const queries = readSqlFile("../querys/queryLatam.sql");
let etlCount = 1;

export async function etl_volumetria() {

    await exportDBCadWfAvontoCSV()
        .then(async () => await exportDBCadWftoCSV());

};

async function exportDBCadWfAvontoCSV() {
    const wsMexico = fs.createWriteStream("./src/result/volumetria_mx_export_to_sql.csv");

    console.time("Export runtime AVON");
    console.log("\nData Source AVON has been initialized!");
    console.log("Getting query from SQL FILE");
    console.log("Executing query from queryLatam.sql");
    await cadWfAvonDataSource.query(queries[1])
        .then(async (result) => await writeResult(result, wsMexico))
    console.timeEnd("Export runtime AVON")
};

async function exportDBCadWftoCSV() {
    const wsLatam = fs.createWriteStream("./src/result/volumetria_export_to_sql.csv");

    console.time("Export runtime NATURA");
    console.log("\nData Source NATURA has been initialized!");
    console.log("Getting query from SQL FILE");
    console.log("Executing query from queryLatam.sql");
    await cadWfDataSource.query(queries[1])
        .then(async (result) => await writeResult(result, wsLatam))
        .then(() => setTimeout(importVolumetriaCadwf, 30000))
    console.timeEnd("Export runtime NATURA");
};

const insertQuery = "INSERT INTO volumetria (coleta, criado, country_id, roles_id, function_id, quantidade) VALUES ?";
const createQueryVolumetria = "CREATE TABLE IF NOT EXISTS `indicadoresVolumetria`( `id` int NOT NULL AUTO_INCREMENT, `coleta` timestamp DEFAULT NULL, `criado` timestamp DEFAULT NULL, `country_id` int DEFAULT NULL, `roles_id` int DEFAULT NULL, `function_id` int DEFAULT NULL, `quantidade` int DEFAULT NULL, PRIMARY KEY(`id`)) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci";
const insertQueryIndicador = "INSERT INTO indicadoresVolumetria (coleta, criado, country_id, roles_id, function_id, quantidade) VALUES ?";

async function importVolumetriaCadwf() {
    const stream = fs.createReadStream("./src/result/volumetria_export_to_sql.csv");
    const csvData = [];

    const createQuery = "CREATE TABLE IF NOT EXISTS `volumetria`( `id` int NOT NULL AUTO_INCREMENT, `coleta` timestamp DEFAULT NULL, `criado` timestamp DEFAULT NULL, `country_id` int DEFAULT NULL, `roles_id` int DEFAULT NULL, `function_id` int DEFAULT NULL, `quantidade` int DEFAULT NULL, PRIMARY KEY(`id`)) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci";
    const deleteQuery = "TRUNCATE TABLE volumetria";

    console.time("Import runtime 2");
    console.log("\nData Source WAREHOUSE has been initialized!");
    console.log("Getting data from CSV VOLUMETRIA");

    const csvStream = fastcsv.parse();
    stream.pipe(csvStream)
        .on("data", function (data) {
            csvData.push(data);
        })
        .on("end", async function () {
            csvData.shift();
            if (csvData.length > 0) {
                await warehouseDataSource.query(createQuery)
                    .then(() => console.log("\ntable volumetria created successfully"));
                await warehouseDataSource.query(deleteQuery)
                    .then(() => console.log("volumetria content deleted successfully"));
                await warehouseDataSource.query(insertQuery, [csvData])
                    .then(() => console.log("Data entered successfully into table volumetria\n"));
                await warehouseDataSource.query(createQueryVolumetria)
                    .then(() => console.log("table indicadoresVolumetria created successfully"));
                await warehouseDataSource.query(insertQueryIndicador, [csvData])
                    .then(() => console.log("Data entered successfully into table indicadoresVolumetria"))
                    .then(() => setTimeout(importVolumetriaMXCadwf, 10000))
                    .then(() => setTimeout(() => {
                        console.log(`\nETL VOLUMETRIA number ${etlCount} executed successfully at ${new Date().toLocaleString()}!`);
                        etlCount++;
                    }, 15000));
            }
        });
};

async function importVolumetriaMXCadwf() {
    const streamMX = fs.createReadStream("./src/result/volumetria_mx_export_to_sql.csv");
    const csvDataMX = [];

    const csvStreamMX = fastcsv.parse();
    streamMX.pipe(csvStreamMX)
        .on("data", function (data) {
            csvDataMX.push(data);
        })
        .on("end", async function () {
            csvDataMX.shift();
            if (csvDataMX.length > 0) {
                await warehouseDataSource.query(insertQuery, [csvDataMX])
                    .then(() => console.log("Data from MX entered successfully into table volumetria\n"));
                await warehouseDataSource.query(insertQueryIndicador, [csvDataMX])
                    .then(() => console.log("Data from MX entered successfully into table indicadoresVolumetria"))
            }
            console.timeEnd("Import runtime 2");
        })
}