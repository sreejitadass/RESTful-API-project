const mongoose=require('mongoose');
const dotenv=require('dotenv');
dotenv.config();

const app = require('./app');

//connecting our database to node
const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB
    // useNewUrlParser:true,
    // useCreateIndex:true,
    // useFindAndModify:false
)
.then(con=>{
    console.log('Database connection successful!');
});

//server
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});