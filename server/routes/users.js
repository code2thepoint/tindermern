const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const config = require('../config');
const Auth = passport.authenticate('jwt', { session: false });
const User = require('../models/users');
 
const router = express.Router();
     
        

router.get('/hi', Auth,async (req, res) => {
  try {
    const users = await User.find();

    const usuariosFiltrados = users.filter(user => {
      return !req.user.crushes.includes(user._id) && !req.user.dislikesDelivered.includes(user._id);
    });
 

    res.status(200).json(usuariosFiltrados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuarios." });
  }
});

 

router.get('/whoami', Auth, (async (req, res) => {
    res.json(renderFields(req.user));
  })
);

router.post('/signup', async (req, res) => {
  try {
    let newUser = req.body;

    const userExist = await User.find()
      .or([{ username: newUser.username }, { email: newUser.email }])
      .then(users => users.length > 0);

    if (userExist) {
      console.log(
        `Email [${newUser.email}] o username [${newUser.username}] ya existen en la base de datos`
      );
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const hash = await bcrypt.hash(newUser.password, 10);

    const createdUser = await new User({
      ...newUser,
      password: hash,
    }).save();

    res.status(201).json({
      token: createToken(createdUser._id),
      user: renderFields(createdUser),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
 
 


async function obtainUser(criteria) {
  try {
    return await User.findOne(criteria);
  } catch (error) {
    throw new Error('Error al obtener el usuario: ' + error.message);
  }
}

router.post('/login', async (req, res) => {
  try {
    let userNotAuthenticated = req.body;

    let userRegistered = await obtainUser({ email: userNotAuthenticated.email });

    if (!userRegistered) {
      console.log(
        `Usuario con email [${userNotAuthenticated.email}] no existe. No pudo ser autenticado`
      );
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    let correctPass = await bcrypt.compare(
      userNotAuthenticated.password,
      userRegistered.password
    );

    if (correctPass) {
      let token = createToken(userRegistered._id);

      console.log(
        `User with email ${userNotAuthenticated.email} successfully authenticated.`
      );

      const user = renderFields(userRegistered);

      res.status(200).json({ token, user });
    } else {
      console.log(`User with email ${userNotAuthenticated.email} incorrect password`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

 


function createToken(usuarioId) {
  return jwt.sign({ id: usuarioId }, config.jwt.secreto, {
    expiresIn: config.jwt.tiempoDeExpiración
  });
}

function renderFields(user) {
  return {
    _id: user._id || user.id,  
    email: user.email,
    username: user.username,
    firstImage: user.firstImage,
  };
}






router.post("/send-like", async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;

  try {
    // Update the recipient's receivedLikes array
    await User.findByIdAndUpdate(selectedUserId, {
      $push: { receivedLikes: currentUserId },
    });

    // Update the sender's crushes array
    await User.findByIdAndUpdate(currentUserId, {
      $push: { crushes: selectedUserId },
    });

    console.log("Like successfully sent.");

    // Check if there's a match
    const sender = await User.findById(currentUserId);
    const recipient = await User.findById(selectedUserId);

    if (
      sender.crushes.includes(selectedUserId) &&
      recipient.receivedLikes.includes(currentUserId) &&
      recipient.crushes.includes(currentUserId) &&
      sender.receivedLikes.includes(selectedUserId)
    ) {
      // Update both users' matches arrays
      await User.findByIdAndUpdate(currentUserId, {
        $push: { matches: selectedUserId },
      });
      await User.findByIdAndUpdate(selectedUserId, {
        $push: { matches: currentUserId },
      }); 


      console.log("¡Match created!");

     // Envía una respuesta al cliente con información sobre el match
      return res.status(200).json({ matchCreated: true });
    }   

    res.sendStatus(200);
  } catch (error) {
    console.error("Error al enviar el like:", error);
    res.sendStatus(500);
  }
});
    



router.get("/matches/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId).select('matches').populate('matches');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.matches);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error no matches found" });
  }
});





 
router.post("/dislike", async (req, res) => {
  const { currentUserId, dislikedUserId } = req.body;

  try {
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { dislikesDelivered: dislikedUserId },
    });

    console.log("Profile marked as 'Disliked' successfully.");

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error al marcar el perfil como 'No me gusta':", error);
    res.status(500).json({ success: false, error: error.message });
  }
});





 


//ednpoint to get the details of the received Likes
router.get("/received-likes/:userId/details", async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch details of users who liked the current user
    const receivedLikesDetails = [];
    for (const likedUserId of user.recievedLikes) {
      const likedUser = await Usuario.findById(likedUserId);
      if (likedUser) {
        receivedLikesDetails.push(likedUser);
      }
    }

    res.status(200).json({ receivedLikesDetails });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching received likes details",
      error: error.message,
    });
  }
});
 

 

module.exports = router;



