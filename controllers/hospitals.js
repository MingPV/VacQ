const Hospital = require("../models/Hospital");
const Appointment = require('../models/Appointment')

exports.getHospitals = async (req, res, next) => {

    let query;

    const reqQuery = {...req,query};

    const removeFields = ['select','sort','page','limit'];

    removeFields.forEach(param=>delete reqQuery[param]);

    let queryStr = JSON.stringify(req.query);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`);
        
    query = Hospital.find(JSON.parse(queryStr)).populate('appointments');

    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else{
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.limit,10)||1;
    const limit = parseInt(req.query.limit,10)||25;
    const startIndex = (page-1)*limit;
    const endIndex = page*limit;

    try{
        const total = await Hospital.countDocuments();
        query = query.skip(startIndex).limit(limit);

        const hospitals = await query;

        const pagination = {};

        if(endIndex<total){
            pagination.next = {
                page:page+1,
                limit
            }
        }

        if(startIndex>0){
            pagination.prev = {
                page:page-1,
                limit
            }
        }

        res.status(200).json({success:true,count:hospitals.length,data:hospitals});
    }catch(err){
        res.status(400).json({success:false, msg:"Error when try to get all hospitals.", error:err})
    }
}

exports.getHospital =  async (req, res, next) => {

    try{
        console.log(req.params)
        const hospital = await Hospital.findById(req.params.id);

        if(!hospital){
            return res.status(400).json({success:false ,msg:"This hospital's id doesn't exist."});
        }

        res.status(200).json({success:true,data:hospital});
        
    }catch(err){
        res.status(400).json({success:false, msg:"Error when try to get a hospital.", error:err})
    }
}

exports.createHospital = async(req, res, next) => {

    try{
        const hospital = await Hospital.create(req.body);
        res.status(201).json({success: true, data: hospital});    
    }catch(err){
        res.status(400).json({success:false,msg:"Error when try to insert a hospital.", error:err})
    }
       
}

exports.updateHospital = async(req, res, next) => {

    try {
        console.log(req.params)
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!hospital) {
            return res.status(400).json({ success: false, msg: "This hospital's id doesn't exist." });
        }

        res.status(200).json({ success: true, data: hospital });
    } catch(err) {
        res.status(400).json({ success: false, msg: "Error when trying to update the hospital.", error:err});
    }
    
}
exports.deleteHospital = async (req, res, next) => {
    try {
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(400).json({ success: false, msg: "This hospital's id doesn't exist." });
        }

        await Appointment.deleteMany({hospital:req.params.id});
        await Hospital.deleteOne({_id: req.params.id});

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, msg: "Error when trying to delete the hospital.", error: err });
    }
}

