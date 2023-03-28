import * as fs from "fs";
import * as fastcsv from "fast-csv";
import { vipo84DataSource, warehouseDataSource } from "../db/connection";
import { readSqlFile, test, writeResult } from "./utils";

const queries = readSqlFile("../querys/queryTableau.sql");
let etlCount = 1;

export async function etl_KPI() {

    await exportDBTableautoCSV()
        .then(() => setTimeout(importTableauNatura, 30000))
};

async function exportDBTableautoCSV() {
    const wsTableau = fs.createWriteStream("./src/result/tableau_export_to_sql.csv");

    console.log("\nData Source TABLEAU has been initialized!");
    console.log("Getting query from SQL FILE");
    console.log("Executing query[0] from queryTableau.sql");
    console.time("Export runtime 1");
    await vipo84DataSource.query(queries[0])
        .then(async (result) => await writeResult(result, wsTableau));
    console.timeEnd("Export runtime 1");
};

async function importTableauNatura() {
    const stream = fs.createReadStream("./src/result/tableau_export_to_sql.csv");
    const csvData = [];

    const createQuery = "CREATE TABLE IF NOT EXISTS `tableauNatura`( `id` int NOT NULL AUTO_INCREMENT, `COLETA` timestamp DEFAULT NULL, `CLASSE` varchar(60) DEFAULT NULL, `CHAMADO` varchar(30) DEFAULT NULL, `STATUS` varchar(60) DEFAULT NULL, `DT_COMPLETA_ABERTURA` varchar(60) DEFAULT NULL, `DT_COMPLETA_RESOLUCAO` varchar(60) DEFAULT NULL,  `DT_COMPLETA_FECHAMENTO` varchar(60) DEFAULT NULL, `AGING_IN_DAYS` varchar(60) DEFAULT NULL, `ANO_MES_ABERTURA` varchar(60) DEFAULT NULL, `DT_ABERTURA` varchar(60) DEFAULT NULL, `ANO_MES_SOLUÇÃO` varchar(60) DEFAULT NULL, `DT_SOLUÇÃO` varchar(60) DEFAULT NULL, `DT_FECHAMENTO` varchar(60) DEFAULT NULL, `TEMPO_CONCLUSAO` varchar(60) DEFAULT NULL, `GRUPO` varchar(100) DEFAULT NULL, `CATEGORIA` varchar(1000) DEFAULT NULL, `PRODUTO` varchar(27) DEFAULT NULL, `TIPO` varchar(17) DEFAULT NULL, `RESUMO` varchar(255) DEFAULT NULL, `DESCRICAO` varchar(4000) DEFAULT NULL, `ABERTO_POR` varchar(100) DEFAULT NULL, `USUARIO_FINAL` varchar(100) DEFAULT NULL, `FECHADO_POR` varchar(100) DEFAULT NULL, `LOCALIDADE` varchar(100) DEFAULT NULL, `ORIGEM` varchar(200) DEFAULT NULL, `IMPACTO` varchar(60) DEFAULT NULL, `PRIORIDADE` varchar(60) DEFAULT NULL, `URGENCIA` varchar(60) DEFAULT NULL, `SLA_VIOLADO` varchar(60) DEFAULT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci";
    const deleteQuery = "TRUNCATE TABLE tableauNatura";
    const insertQuery = "INSERT INTO tableauNatura (COLETA ,CLASSE, CHAMADO, STATUS, DT_COMPLETA_ABERTURA, DT_COMPLETA_RESOLUCAO, DT_COMPLETA_FECHAMENTO, AGING_IN_DAYS, ANO_MES_ABERTURA, DT_ABERTURA, ANO_MES_SOLUÇÃO, DT_SOLUÇÃO,	DT_FECHAMENTO, TEMPO_CONCLUSAO, GRUPO, CATEGORIA, PRODUTO, TIPO, RESUMO, DESCRICAO, ABERTO_POR,	USUARIO_FINAL, FECHADO_POR,	LOCALIDADE,	ORIGEM,	IMPACTO, PRIORIDADE, URGENCIA, SLA_VIOLADO) VALUES ?";

    console.time("Import runtime 2");
    console.log("\nData Source WAREHOUSE has been initialized!");
    console.log("Getting data from CSV TABLEAU");

    const csvStream = fastcsv.parse();
    stream.pipe(csvStream)
        .on("data", function (data) {
            csvData.push(data);
        })
        .on("end", async function () {
            csvData.shift();
            if (csvData.length > 0) {
                await warehouseDataSource.query(createQuery)
                    .then(() => console.log("table tableauNatura created successfully"));
                await warehouseDataSource.query(deleteQuery)
                    .then(() => console.log("tableauNatura content deleted successfully"));
                await warehouseDataSource.query(insertQuery, [csvData])
                    .then(() => {
                        console.timeEnd("Import runtime 2");
                        exportKPItoCSV();
                    });
            }
        });
};

async function exportKPItoCSV() {
    const wsKPI = fs.createWriteStream("./src/result/KPI_indicadores_to_sql.csv");

    console.log("\nGetting data of indicadores from table tableauNatura");
    console.log("Executing query[1] from queryTableau.sql");
    console.time("Export runtime 3");
    await warehouseDataSource.query(queries[1])
        .then(async (result) => {
            await writeResult(result, wsKPI)
            console.timeEnd("Export runtime 3");
        })
        .then(() => setTimeout(importKPItoIndicadores, 30000));
};

function importKPItoIndicadores() {
    const stream = fs.createReadStream("./src/result/KPI_indicadores_to_sql.csv");
    const csvData = [];

    const createQueryKPI = "CREATE TABLE IF NOT EXISTS `indicadoresKPI`( `id` int NOT NULL AUTO_INCREMENT, `COLETA` timestamp DEFAULT NULL, `PAIS` varchar(4) DEFAULT NULL, `CLASSE` varchar(60) DEFAULT NULL, `STATUS` varchar(60) DEFAULT NULL, `CHAMADO` varchar(30) DEFAULT NULL,`AGING_IN_DAYS` int DEFAULT NULL,`DT_ABERTURA` varchar(60) DEFAULT NULL, `SLA_VIOLADO` int DEFAULT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci";
    const insertQuery = "INSERT INTO indicadoresKPI (COLETA, PAIS, CLASSE, STATUS, CHAMADO, AGING_IN_DAYS, DT_ABERTURA, SLA_VIOLADO) VALUES ?";

    const csvStream = fastcsv.parse();

    stream.pipe(csvStream)
        .on("data", function (data) {
            csvData.push(data);
        })
        .on("end", async function () {
            csvData.shift();
            console.time("Import runtime 4");
            console.log("\nGetting data from CSV KPI_indicadores_to_sql");
            if (csvData.length > 0) {
                await warehouseDataSource.query(createQueryKPI)
                    .then(() => console.log("table indicadoresKPI created successfully"));
                await warehouseDataSource.query(insertQuery, [csvData])
                    .then(() => {
                        console.timeEnd("Import runtime 4");
                        console.log("Data entered successfully");
                    })
                    .then(() => exportEntranteToCSV())
            }
        });
};

async function exportEntranteToCSV() {
    const wsEntranteHora = fs.createWriteStream("./src/result/KPI_entrante_hora_to_sql.csv");

    console.log("\nGetting data of Entrante de tickets from table tableauNatura");
    console.log("Executing query[2] from queryTableau.sql");
    console.time("Export runtime 5");
    await warehouseDataSource.query(queries[2])
        .then(async (result) => {
            await writeResult(result, wsEntranteHora)
            console.timeEnd("Export runtime 5");
        })
        .then(() => setTimeout(importKPItoIndicadoresEntrante, 15000))
        .then(() => setTimeout(() => {
            console.log(`\nETL TABLEAU number ${etlCount} executed successfully at ${new Date().toLocaleString()}!`);
            etlCount++;
        }, 20000));
};

function importKPItoIndicadoresEntrante() {
    const stream = fs.createReadStream("./src/result/KPI_entrante_hora_to_sql.csv");
    const csvData = [];

    const createQueryKPI = "CREATE TABLE IF NOT EXISTS warehouseGPP.indicadoresEntranteHora( `id` int NOT NULL AUTO_INCREMENT, `COLETA` timestamp DEFAULT NULL, `PAIS` varchar(4) DEFAULT NULL, `TICKETS_ENTRADA` int DEFAULT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci";
    const insertQuery = "INSERT INTO indicadoresEntranteHora (COLETA, PAIS, TICKETS_ENTRADA) VALUES ?";

    const csvStream = fastcsv.parse();

    stream.pipe(csvStream)
        .on("data", function (data) {
            csvData.push(data);
        })
        .on("end", async function () {
            csvData.shift();
            console.time("Import runtime 6");
            console.log("\nGetting data from CSV KPI_entrante_hora_to_sql.csv");

            if (csvData.length > 0) {
                await warehouseDataSource.query(createQueryKPI)
                    .then(() => console.log("table indicadoresEntranteHora created successfully"));
                await warehouseDataSource.query(insertQuery, [csvData])
                    .then(() => console.log("Data entered successfully"));
                console.timeEnd("Import runtime 6");
            }
        });
};
