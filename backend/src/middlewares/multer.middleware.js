import multer from 'multer';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/temp');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage }).single('coverImageFile');
const uploadFile = multer({ storage: storage }).single('file');
const uploadMultiple = multer({ storage: storage }).array('files',100);

export { upload, uploadMultiple, uploadFile };
