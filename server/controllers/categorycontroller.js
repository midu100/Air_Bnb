const categorySchema = require("../models/categorySchema")
const uploadToClaudinary = require("../sevices/claudinaryServices")

const createCategory = async(req,res)=>{
    try {
        const{name,description,slug} = req.body
        const thumbnail = req.file

        if(!name) return res.status(400).send({message : 'Category name is required'})
        if(!slug) return res.status(400).send({message : 'Category slug is required'})
        if(!thumbnail) return res.status(400).send({message : 'Category thumbnail is required'})

        const existCategory = await categorySchema.findOne({slug})
        if(existCategory) return res.status(400).send({message : 'Category name is already exist'})
   
        //========= upload image to claudinary =========
        const imgRes = await uploadToClaudinary(thumbnail,'category')

        const category = new categorySchema({
          name,
          description,
          thumbnail : imgRes.secure_url,
          slug,

        })
        category.save()

        // ========= successfull =========
        res.status(201).send({message : 'Category created.'})


    } 
    catch (error) {
      console.log(error)    
    }
}

const getAllCategory = async(req,res)=>{
  try {
    const category = await categorySchema.find({})

    // =========== success ==========
    res.status(200).send({message : 'success',category})
  } 
  catch (error) {
     console.log(error)  
  }
}

module.exports ={createCategory,getAllCategory}