import * as fs from "fs";
import * as fastcsv from "fast-csv";
import { cadWfDataSource, cadWfAvonDataSource, warehouseDataSource } from "../db/connection";
import { readSqlFile, writeResult } from "./utils";

const queries = readSqlFile("../querys/queryCadastros.sql");
let etlCount = 1;

export async function etl_cadastros() {

    await exportMexicoCadastros()
        .then(async () => await exportLatamCadastros())
        .then(async () => await importMexicoCadastros())
        .then(async () => setTimeout(() => {
            console.log(`\nETL CADASTROS APROVADOS number ${etlCount} executed successfully at ${new Date().toLocaleString()}!`);
            etlCount++;
        }, 15000));
};

async function exportLatamCadastros() {
    const wsLatam = fs.createWriteStream("./src/result/cadastros_latam_export_to_sql.csv");

    console.time("Export runtime NATURA");
    console.log("\nData Source NATURA has been initialized!");
    console.log("Getting query from SQL FILE");
    console.log("Executing query from queryCadastros.sql");
    await cadWfDataSource.query(queries[0])
        .then(async (result) => await writeResult(result, wsLatam))
    console.timeEnd("Export runtime NATURA");
};

async function exportMexicoCadastros() {
    const wsMexico = fs.createWriteStream("./src/result/cadastros_mexico_export_to_sql.csv");

    console.time("Export runtime AVON");
    console.log("\nData Source AVON has been initialized!");
    console.log("Getting query from SQL FILE");
    console.log("Executing query from queryCadastros.sql");
    await cadWfAvonDataSource.query(queries[0])
        .then(async (result) => await writeResult(result, wsMexico))
    console.timeEnd("Export runtime AVON")
};

async function importMexicoCadastros() {
    const stream = fs.createReadStream("./src/result/cadastros_mexico_export_to_sql.csv");
    const csvData = [];

    const createQuery = "CREATE TABLE IF NOT EXISTS `cadastrosAprovados`( `id` int NOT NULL AUTO_INCREMENT, `coleta` timestamp DEFAULT NULL, `pais` int DEFAULT NULL, `Total` int DEFAULT NULL, `Aprovado` int DEFAULT NULL, PRIMARY KEY(`id`)) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci";
    const insertQuery = "INSERT INTO cadastrosAprovados (coleta, pais, Total, Aprovado ) VALUES ?";

    console.time("Import runtime AVON");
    console.log("\nData Source WAREHOUSE has been initialized!");
    console.log("Getting data from CSV MEXICO CADASTROS");

    const csvStream = fastcsv.parse();
    stream.pipe(csvStream)
        .on("data", function (data) {
            csvData.push(data);
        })
        .on("end", async function () {
            csvData.shift();
            if (csvData.length > 0) {
                await warehouseDataSource.query(createQuery)
                    .then(() => console.log("table cadastrosAprovados created successfully"));
                await warehouseDataSource.query(insertQuery, [csvData])
                    .then(() => {
                        console.log("Data entered successfully");
                        console.timeEnd("Import runtime AVON");
                        importLatamCadastros();
                    });
            }
        });
};

async function importLatamCadastros() {
    const stream = fs.createReadStream("./src/result/cadastros_latam_export_to_sql.csv");
    const csvData = [];

    const insertQuery = "INSERT INTO cadastrosAprovados (coleta, pais, Total, Aprovado ) VALUES ?";

    console.log("\nGetting data from CSV LATAM CADASTROS");
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
