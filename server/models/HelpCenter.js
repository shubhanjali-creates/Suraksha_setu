const mongoose=require('mongoose');
const schema=new mongoose.Schema({CenterID:{type:Number,required:true,unique:true},Name:{type:String,required:true},Role:{type:String,enum:['Hospital','ShelterCenter'],required:true},LocationID:{type:Number,required:true},Phone:{type:String,required:true},Capacity:{type:Number,required:true,min:0},BookedSeats:{type:Number,required:true,min:0}});
module.exports=mongoose.model('HelpCenter',schema);
