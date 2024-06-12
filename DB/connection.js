import mongoose from 'mongoose'

const ConnectDB=async()=>{
    return await mongoose.connect(process.env.DBConnect).then(()=>{
        console.log('connection established successfully');
    }).catch((error)=>{
        console.log(`error with connectDB : ${error} `);
    })
}

export default ConnectDB;