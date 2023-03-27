const express = require("express");
const app = express();
const port = 4002;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const config = require('./config/key');

// const { Man } = require('./model/Man')
const { User } = require('./model/User');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require("mongoose");
mongoose.connect(config.mongoURI,
    {
        useNewUrlParser: true, useUnifiedTopology: true,
        useCreateIndex: true, useFindAndModify: false
    })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));
app.get('/', (req, res) => { res.send('Hello World! nodemon') })

app.post("/register", (req, res) => {

    const user = new User(req.body);

    user.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true
        });
    });
});

app.post('/login',(req, res) =>{
    // 요청된 이메일을 데이터베이스 찾기
    User.findOne({email: req.body.email})
        .then(docs=>{
            if(!docs){
                return res.json({
                    loginSuccess: false,
                    messsage: "제공된 이메일에 해당하는 유저가 없습니다."
                })
            }
            docs.comparePassword(req.body.password, (err, isMatch) => {
                if(!isMatch) return res.json({loginSuccess: false, messsage: "비밀번호가 틀렸습니다."})
                // Password가 일치하다면 토큰 생성
                docs.generateToken((err, user)=>{
                    if(err) return res.status(400).send(err);
                    // 토큰을 저장
                    res.cookie("x_auth", user.token)
                        .status(200)
                        .json({loginSuccess: true, userId: user._id})
                })
            })
        })
        .catch((err)=>{
            return res.status(400).send(err);
        })
})


app.listen(port, () => { console.log(`Example app listening on port ${port}`) })