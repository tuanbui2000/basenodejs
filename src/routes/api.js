import express from "express"
import apiController from "../controller/apiController"




const router = express.Router();



const initApiRoutes = (app) => {




    // router.get("/test-api", apiController.testApi)


    return app.use("/api/", router);

}
export default initApiRoutes;

