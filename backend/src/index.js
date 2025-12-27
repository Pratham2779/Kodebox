import {config} from 'dotenv';
config({path:'.env'});

import {app} from './app.js';
import { connectDB } from './configs/db/index.js';
const PORT=process.env.PORT;


;(async ()=>{
    try {
        await connectDB();
        console.log('Databse connection successful !');

        app.listen(PORT,()=>{
            console.log(`Server is running on PORT : ${PORT}`);
            console.log(`\nServer URL : [http://localhost:${PORT}]`);
        });
        
    } catch (error) {
        console.log('Failed connecting to database',error);
    }

})();

