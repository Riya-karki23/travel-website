const express=require('express');
const app=express();
const mongoose=require ('mongoose');
//requiring listing table from listing.js
const Listing=require("./models/listing.js")
const path=require('path');
const methodOverride=require('method-override');
const ejsMate=require('ejs-mate');
const asyncWrap=require("./utils/asyncWrap.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema}=require("./schema.js");


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));

//////////////////////////////////////////////////////////requiring ejs-mate
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.static(path.join(__dirname, 'public')));





///////////////////////////////////////////////////////////////////////
// async function main(){
//     await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
// }
async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        // Handle the error appropriately, e.g., exit the application
        process.exit(1);
    }
}




main()
.then(()=>{
    console.log("connected to mongoDb");
}).catch((err)=>{
    console.log(err);
})
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/",(req,res)=>{
    res.render("./listings/home.ejs");
})

///////////////////////////////////////////////////////////////////////////////////////Validate Listing
const validateListing=(req,res,next)=>{
    let{error}=listingSchema.validate(req.body);

    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}
/////////////////////////////////////////////////////////////////////

// app.get("/listings",async(req,res)=>{
//     let sampleListing=new Listing({
//         title:"Rin Nohara",
//         description:"my name is Rin Nohara",
//         price:12000,
//         location:"chandigarh,Punjab",
//         country:"India"
//     })

//    let result= await sampleListing.save();
   
// })
////////////////////////////////////////////////////////////////////////////////////////////index route for all listing

app.get("/listings",asyncWrap(async(req,res)=>{
  let allListing=await Listing.find();
   res.render("./listings/index.ejs",{allListing});

}));
//////////////////////////////////////////////////////////////////////////////////////////////create new listing
app.get("/listings/new",(req,res)=>{
    res.render("./listings/createNew.ejs");
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////show list
app.get("/listings/:id",asyncWrap(async(req,res)=>{
    let{id}=req.params;
const listing= await Listing.findById(id);
res.render("./listings/show.ejs",{listing});
}));

///////////////////////////////////////////////////////////////////////////////////////////////route to create a new list

app.post(
    "/listings",validateListing,
    asyncWrap(async(req,res,next)=>{
   
    let newList=new Listing(req.body.listing);
    await newList.save();
    res.redirect("/listings");
}));

/////////////////////////////////////////////////////////////////////////////////////////////////////////EDIT EXISTING LIST
app.get("/listings/:id/edit",asyncWrap(async(req,res)=>{
    let{id}=req.params;
    let listing=await Listing.findById(id);
   res.render("./listings/edit.ejs",{listing});
}));



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////UPDATE ROUTE
app.put(
    "/listings/:id",validateListing,
        asyncWrap(async(req,res)=>{
    let{id}=req.params;
    let editedList=req.body.listing;
    await Listing.findByIdAndUpdate(id,{...editedList});
    res.redirect(`/listings/${id}`);
}));


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////delete list
app.delete("/listings/:id",asyncWrap(async(req,res)=>{
    let{id}=req.params;
    let result=await Listing.findByIdAndDelete(id);
    console.log(result);
    res.redirect("/listings");
}));


app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found!!!!!!!!!"));
})

app.use((err,req,res,next)=>{
    let{status=500,message="Internal Server Error"}=err;
    res.render("./listings/error.ejs",{err});
})


////////////////////////////////////////////////////////////////////////////////////////////listen 
app.listen(3000,()=>{
console.log("3000 port working");
})

