const express = require("express");
const app = express();
const port = 4002;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const config = require('./config/key');

const { auth } = require('./middleware/auth');
const { User } = require('./models/User');

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

app.get('/api/hello', (req, res) => {
    
    res.send("안녕하세요")
})

app.post("/api/users/register", (req, res) => {

    const user = new User(req.body);

    user.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true
        });
    });
});

app.post('/api/users/login',(req, res) =>{
    // 요청된 이메일을 데이터베이스에서 있는지 찾기
    User.findOne({ email: req.body.email }, (err, userInfo) => {
        if (!userInfo)
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            });
        // 비밀번호가 맞는 비밀번호인지 확인
        userInfo.comparePassword(req.body.password, (err, isMatch) => {
            console.log("isMatch:",isMatch)
            if(!isMatch)
                return res.json({loginSuccess: false, messsage: "비밀번호가 틀렸습니다."})
            // Password가 일치하다면 토큰 생성
            userInfo.generateToken((err, user)=>{
                if(err) return res.status(400).send(err);
                // 토큰을 저장
                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({loginSuccess: true, userId: user._id})
            })
        })
    })
})

app.get('/api/users/auth', auth ,(req, res) => {

    //여기까지 미들웨어를 통과했다는 이야기는 Authentication이 true라는 말
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

app.get("/api/users/logout", auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({
            success: true
        });
    });
});

app.listen(port, () => { console.log(`Example app listening on port ${port}`) })