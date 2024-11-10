import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import pg from "pg";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname } from "path";
import { count } from "console";
dotenv.config();

const app=express();
const dircname=dirname(fileURLToPath(import.meta.url));
const serverport= process.env.port||3000;
const db=new pg.Client({
     user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: 5432
})

db.connect().then(() => console.log("Connected to database")).catch(err => console.error("Database connection error:", err));

//Middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());

//query functions
async function getRandomCountry(row,table,keyname, key) {
    try {
        const res = await db.query(`SELECT ${row} FROM ${table} WHERE ${keyname} = $1`, [key]);
        if (res.rows.length > 0) {
            return res.rows;
        } else {
            console.error("No data found for the specified country.");
            return null;
        }
    } catch (err) {
        console.error("Database query error:", err);
        return null;
    }
}


//to uppercase
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

function flagEmojiToCountryCode(emoji) {
    // Get the Unicode code points for each character in the emoji
    const codePoints = Array.from(emoji, char => char.codePointAt(0));
    // Subtract 127397 from each code point to get the ASCII value of the letter
    const countryCode = codePoints
        .map(cp => String.fromCharCode(cp - 127397))
        .join('');
    
    return countryCode;
}
  

var visitedCountries=[];
//server routes handler
app.get("/",async(req,res)=>{
    
    var data= await getRandomCountry("*","flags","name","Angola");
console.log(data);
    res.render(dircname+"/views/home.ejs",{
        countries:visitedCountries,
        total:visitedCountries.length,
        message:" ",
     });
});

app.post("/add",async(req,res)=>{
    try{
    var userinput=req.body.country;
    var country=capitalizeFirstLetter(userinput);
    var data= await getRandomCountry("*","flags","name",country);
    var userEnteredFlag=flagEmojiToCountryCode(data[0].flag);
    
        if(visitedCountries.find(flag=>flag===userEnteredFlag)){

            res.render(dircname+"/views/home.ejs",{
                countries:visitedCountries,
                total:visitedCountries.length,
                message:"country visit already added"
             
            });

        }else{

    visitedCountries.push(userEnteredFlag);
    console.log(visitedCountries);

    res.render(dircname+"/views/home.ejs",{
        countries:visitedCountries,
        total:visitedCountries.length,
        message:"country visit added"
     
    });
}
    }catch(err){
        res.render(dircname+"/views/home.ejs",{
            countries:visitedCountries,
            total:visitedCountries.length,
            message:"enter valid country"
         
        });

    }

})

//server
app.listen(serverport,()=>{
    console.log("listening on 3000");
})