const cloudinary = require("cloudinary").v2;

const uploadToClaudinary = async(file,folder)=>{
    const base64String = file.buffer.toString('base64');
    // console.log('base64String=>',base64String)

    const imgDataUrl = `data:${file.mimetype};base64,${base64String}`;
    // console.log('imgUrl from uplodClaud=',imgDataUrl)

    const result = await cloudinary.uploader.upload(imgDataUrl,{folder})
    // console.log('result from uplodClaud=',result)
    return result
}

module.exports = uploadToClaudinary