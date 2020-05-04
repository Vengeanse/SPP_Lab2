const {Router} = require('express')
const router = Router()
const multer = require('multer')
const upload = multer({dest:"uploads"})
const fs = require('fs')

var todos = []

const ExpiryTime = 3600 * 1000

router.get('/', (req, res) => {
	if (statusCheck(req) == 200) {
		res.status(statusCheck(req)).render('index', {
			title: 'Todo list',
			isIndex: true,
			todos
		})
	}
	else {
		res.status(statusCheck(req)).render('error', {
	    	error: statusCheck(req)
	    })
	}
})

router.get('/create', (req, res) => {
	if (statusCheck(req) == 200) {
		res.status(statusCheck(req)).render('create', {
			title: 'Create todo',
			isCreate: true
		})
	}
	else {
		res.status(statusCheck(req)).render('error', {
	    	error: statusCheck(req)
	    })
	}
})

router.get('*', (req, res) => {
    res.status(404).render('error', {
    	error: '404'
    })
})

router.post('/create', upload.single('Ufile'), async (req, res) => {
	if (statusCheck(req) == 200) {
		todos.push({
			title: req.body.title,
			file: req.file.path,
			filename: req.file.originalname,
			completed: false,
			CreateDate: new Date(),
			Date: String(new Date().getHours() + ":" + new Date().getMinutes())
		})
		//if (req.file) {
	    //	console.log('Uploaded: ', req.file)
		//}
		update()
		res.redirect('/')
	}
	else {
		res.status(statusCheck(req)).render('error', {
	    	error: statusCheck(req)
	    })
	}
})

router.post('/refresh', async (req, res) => {
	if (statusCheck(req) == 200) {
		update()
		res.redirect('/')
	}
	else {
		res.status(statusCheck(req)).render('error', {
	    	error: statusCheck(req)
	    })
	}
})

router.post('/download', async (req, res) => {
	if (fileCheck(req) == 200) {
		res.status(fileCheck(req)).download(req.body.file)
	}
	else {
		res.status(fileCheck(req)).render('error', {
	    	error: fileCheck(req)
	    })
	}
})

async function update() {
	todos.forEach(function(item, i, arr) {
		if (item.completed){
			if (new Date() - item.CreateDate > ExpiryTime) {
				todos.splice(i,1)
				fs.unlink(item.file, (err) => {
					if (err) console.log(err)
				})
			}

		} else {
			fs.readFile(item.file, "utf8", function(err, data){
                if (err) console.log(err) 
	            fs.writeFile(item.file + '.txt', data.toUpperCase(), function(err){
				    if (err) console.log(err) 
				    else {
				    	fs.unlink(item.file, (err) => {
							if (err) console.log(err)
						})
						item.file = item.file + '.txt'
						item.completed = true
					}
				});
			})
		}
	})
}

function statusCheck(req) {
	if (!req.body) {
		return '400'
	}
	else {
		return '200'
	}
}

function fileCheck(req) {
	try {
		if (fs.existsSync(req.body.file)) {
	    	return '200'
	  	}
	  	else {
	  		return '404'
	  	}
	} catch(err) {
	  	console.log(err)
	}
}


module.exports = router