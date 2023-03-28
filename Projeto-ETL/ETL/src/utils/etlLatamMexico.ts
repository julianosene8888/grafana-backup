import * as fs from "fs";
import * as fastcsv from "fast-csv";
import { cadWfDataSource, cadWfAvonDataSource, warehouseDataSource } from "../db/connection";
import { readSqlFile, writeResult } from "./utils";

const queries = readSqlFile("../querys/queryLatam.sql");
let etlCount = 1;

export async function etl_latamBrasil() {

    await exportDBCadWfAvontoCSV()
        .then(async () => await exportDBCadWftoCSV())
        .then(async () => await importAvon())
        .then(async () => setTimeout(() => {
            console.log(`\nETL LATAM_MEXICO number ${etlCount} executed successfully at ${new Date().toLocaleString()}!`);
            etlCount++;
        }, 15000));
};

async function exportDBCadWftoCSV() {
    const wsLatam = fs.createWriteStream("./src/result/latam_export_to_sql.csv");

    console.time("Export runtime NATURA");
    console.log("\nData Source NATURA has been initialized!");
    console.log("Getting query from SQL FILE");
    console.log("Executing query from queryLatam.sql");
    await cadWfDataSource.query(queries[0])
        .then(async (result) => await writeResult(result, wsLatam));
    console.timeEnd("Export runtime NATURA");
};

async function exportDBCadWfAvontoCSV() {
    const wsMexico = fs.createWriteStream("./src/result/mexico_avon_export_to_sql.csv");

    console.time("Export runtime AVON");
    console.log("\nData Source AVON has been initialized!");
    console.log("Getting query from SQL FILE");
    console.log("Executing query from queryLatam.sql");
    await cadWfAvonDataSource.query(queries[0])
        .then(async (result) => await writeResult(result, wsMexico));
    console.timeEnd("Export runtime AVON");
};

async function importAvon() {
    const stream = fs.createReadStream("./src/result/mexico_avon_export_to_sql.csv");
    const csvData = [];

    const createQuery = "CREATE TABLE IF NOT EXISTS `latamBrasil`( `id` int NOT NULL AUTO_INCREMENT, `coleta` timestamp DEFAULT NULL, `geografia` varchar(255) DEFAULT NULL, `status` int DEFAULT NULL, `status_name` varchar(255) DEFAULT NULL, `substatus` int DEFAULT NULL, `substatus_name` varchar(255) DEFAULT NULL, `registros` int DEFAULT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci";
    const insertQuery = "INSERT INTO latamBrasil (coleta, geografia, status, status_name, substatus, substatus_name, registros) VALUES ?";

    console.time("Import runtime AVON");
    console.log("\nData Source WAREHOUSE has been initialized!");
    console.log("Getting data from CSV AVON");

    const csvStream = fastcsv.parse();
    stream.pipe(csvStream)
        .on("data", function (data) {
            csvData.push(data);
        })
        .on("end", async function () {
            csvData.shift();
            if (csvData.length > 0) {
                await warehouseDataSource.query(createQuery)
                    .then(() => console.log("table latamBrasil created successfully"));
                await warehouseDataSource.query(insertQuery, [csvData])
                    .then(() => {
                        console.log("Data entered successfully");
                        console.timeEnd("Import runtime AVON");
                        importNatura();
                    });
            }
        });
};

async function importNatura() {
    const stream = fs.createReadStream("./src/result/latam_export_to_sql.csv");
    const csvData = [];

    const insertQuery = "INSERT INTO latamBrasil (coleta, geografia, status, status_name, substatus, substatus_name, registros) VALUES ?";

    console.log("\nGetting data from CSV NATURA");
    console.time("Import runtime NATURA");

    const csvStream = fastcsv.parse();
    stream.pipe(csvStream)
        .on("data", function (data) {
            csvData.push(data);
        })
        .on("end", async function () {
            csvData.shift();
            if (csvData.length > 0) {
                await warehouseDataSource.query(insertQuery, [csvData])
                    .then(() => console.log("Data entered successfully"));
            }
        })
    console.timeEnd("Import runtime NATURA");
};