import { DataSource, DataSourceOptions } from "typeorm";

const cadWfPRD: DataSourceOptions = {
  type: "postgres",
  host: "cadastro-workflow-db.prd.naturacloud.com",
  port: 5432,
  username: "caduni",
  password: "CdUn_PrD#986",
  database: "cadwf",
  name: "cadwf",
  maxQueryExecutionTime: 180000,
  connectTimeoutMS: 185000,
};

const cadWfAvonMxPRD: DataSourceOptions = {
  type: "postgres",
  host: "cadastro-workflow-avon-mx-prd-cluster.cluster-cdtghkfehe06.us-east-1.rds.amazonaws.com",
  port: 5432,
  username: "caduni",
  password: "Cad_uNi#047avMX_PRD",
  database: "cadwf",
  name: "cadwf",
  maxQueryExecutionTime: 6000,
  connectTimeoutMS: 6500,
};

const vipo84PRD: DataSourceOptions = {
  type: "oracle",
  host: "172.26.16.32",
  port: 1521,
  username: "278071597",
  password: "RXgwXQ03zS",
  connectString: "172.26.16.32:1521/o84prdg",
  database: "o84prdg",
  name: "o84prdg",
};

export const warehouseGPP: DataSourceOptions = {
  type: "mysql",
  host: "172.25.0.3",
  port: 3306,
  username: "root",
  password: "naturaGPP",
  database: "warehouseGPP",
  name: "warehouseGPP",  
};


export const cadWfDataSource = new DataSource(cadWfPRD);

export const cadWfAvonDataSource = new DataSource(cadWfAvonMxPRD);

export const vipo84DataSource = new DataSource(vipo84PRD);

export const warehouseDataSource = new DataSource(warehouseGPP);
