import multer from 'multer'

//multer attaches file to req.file
const storage = multer.memoryStorage()

function fileFilter(req,file,cb){
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Only image files (jpg/png/webp) are allowed."), ok);
}

export const uploadProfilePicture= multer({
    storage,
    fileFilter,
    limits:{fileSize:5*1024*1024, files:1}
}).single("profilePicture");   //frontEnd need to send profilePicture