const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')

const config = require('./config/key')

const { Man } = require('./model/Man')

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


const mongoose = require('mongoose')
mongoose.connect(config.mongoURI,
    {
        useNewUrlParser: true, useUnifiedTopology: true
    })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));
app.get('/', (req, res) => { res.send('Hello World! nodemon') })

app.post('/register', (req, res) => {

  // 회원가입할 때 필요한 정보들을 Client에서 가져오면

  // 그것들을 데이터베이스에 넣어준다

  const man = new Man(req.body)

  man.save().then(()=>{
    res.status(200).json({
      success: true
    })
  }).catch((err)=>{
    res.json({ success: false, err })
  })

})


app.listen(port, () => { console.log(`Example app listening on port ${port}`) })