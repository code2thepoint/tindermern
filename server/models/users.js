const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {

    username: {
      type: String,
      minlength: 1,
      required: [true, 'User debe tener un username']
    },
    password: {
      type: String,
      minlength: 1,
      required: [true, 'User debe tener una contraseña']
    },
    email: {
      type: String,
      minlength: 1,
      required: [true, 'User debe tener un email']
    },

    firstImage: {
      type: String,
      default: null

    },
    
    crushes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    receivedLikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    dislikesDelivered: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],


    matches: [ 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model('user', userSchema);



