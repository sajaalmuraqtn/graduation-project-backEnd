import express from 'express'
import dotenv from 'dotenv'
import initApp from './Src/Modules/app.router.js';
dotenv.config()
const app=express()

const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT} `);
})
initApp(app,express);

