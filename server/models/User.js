const mongoose=require('mongoose');
const schema=new mongoose.Schema({
 UserID:{type:Number,required:true,unique:true}, Name:{type:String,required:true,trim:true},
 Email:{type:String,required:true,unique:true,lowercase:true,trim:true}, Phone:{type:String,required:true,match:/^\d{10}$/},
 Password:{type:String,required:true}, Address:{type:String,required:true},
 UserType:{type:[String],required:true,default:['affected'],enum:['admin','responder','volunteer','donor','affected']},
 Available:{type:Boolean,default:true}, Active:{type:Boolean,default:true}, Community:{type:[Number],default:[]}, CreationTime:{type:Date,default:Date.now}
});
module.exports=mongoose.model('User',schema);
