import cron from "node-cron";
import { etl_cadastros } from "./src/utils/etlCadastro";
import { etl_KPI } from "./src/utils/etlKPI";
import { etl_latamBrasil } from "./src/utils/etlLatamMexico";
import { etl_volumetria } from "./src/utils/etlVolumetria";
import { databaseConnection } from './src/utils/utils';

databaseConnection();
cron.schedule("12 */1 * * *", etl_latamBrasil);
cron.schedule("5 */6 * * *", etl_volumetria);
cron.schedule("18 */2 * * *", etl_cadastros);
cron.schedule("15 */1 * * *", etl_KPI);
