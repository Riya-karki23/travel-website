const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const listingSchema=new Schema({
    title:{
        type:String,
    
    },
    description:{
        type:String
    },
    image: {
        type: String,
        set: (v) => (v === "" ? "https://iwfstaff.com.au/wp-content/uploads/2017/12/placeholder-image.png" : v),
        default: "https://iwfstaff.com.au/wp-content/uploads/2017/12/placeholder-image.png"
    },
    
    price:{
        type:Number
    },
    location:{
        type:String
    },
    country:{
        type:String
    }
})

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;