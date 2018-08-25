module.exports = {
     "database": "mongodb://localhost:27017/policefeedback",
//    "database": process.env.FEEDBACK_MONGO ,
    "port": process.env.PORT || 8888,
    "secretKey": "fucku" ,
    "url" : process.env.URL || "http://localhost:8888" ,
    "authkey" : process.env.FEEDBACK_AUTHKEY
}