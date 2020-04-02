const 	express			=	require('express'),
		mongoose		=	require('mongoose'),
		ejs				=	require('ejs'),
		bodyParser		=	require('body-parser'),
		methodOverride	=	require('method-override'),
		MongoClient		=	require('mongodb').MongoClient,
		app				=	express(),
		fs 				=	require('fs'),
		path			=	require('path'),
		dotenv			=	require('dotenv'),
		formidable 		= 	require('formidable');

dotenv.config();
app.set('view engine' , 'ejs');
app.use( express.static( "public" ) );
app.use(express.urlencoded({extended: false}));

app.use(bodyParser.urlencoded({extended:true}));

app.use(methodOverride('_method'));

let url = process.env.DB_URL;
let dbo;
MongoClient.connect(url,{useUnifiedTopology: true}, function(err, db) {
	  	if (err) throw err;
	  	console.log("Database created!");
	  	dbo = db.db("sample");
		dbo.createCollection("uploadphotos", function(err, res) {
			if (err) throw err;
	    	console.log("Collection created!");
		});
		// dbo.collection('uploadphotos').insertOne({totalfiles: 0});
	});



// mongoose.connect("mongodb://singhanuj620:1Ab23cd45e@ds161700.mlab.com:61700/sample", {useNewUrlParser: true , 
// useUnifiedTopology: true},()=>{
// 	console.log("Db connected");
// });


app.get("/", (req,res)=>{
	res.render('index');
});

app.post("/uploadphoto", (req,res) => {
	const form = new formidable.IncomingForm();
	form.parse(req, (err,fields ,files) => {
    if (err) {
      console.error('Error', err)
      throw err
    }
    // console.log('Fields', fields)
    // console.log('Files', files)
    for (const file of Object.entries(files)) {
     	// console.log(file[1]);
     	const img=file[1]
     	const i = fs.readFileSync(img.path);
	  	var encode_image=i.toString('base64');
		let data={
			name:img.name+"-"+Date.now(),
		  	contentType:img.type,
		  	image:encode_image
		}

		dbo.collection("uploadphotos").insertOne(data);
	}
		res.redirect('/files');
  });
});



app.get("/files",(req,res)=>{
	dbo.collection("uploadphotos").find().toArray((err,items) => {
		if(err) return res.send(err);
		let coll_length = Object.keys(items).length
		res.render('allfiles',{coll_length:coll_length , items:items});
	});
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log("server is running at : "+port);
});