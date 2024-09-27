import React, { useState, useEffect, useRef } from 'react';
import TinderCard from 'react-tinder-card';
import Axios from 'axios';

export default function Feed({ user }) {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState();
  const childRefs = useRef([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await Axios.get('http://localhost:3000/users/hi');
        const newUsers = response.data;
        console.log(newUsers);
        const filteredUsers = newUsers.filter(({ _id }) => _id !== user._id);
        setUsers(filteredUsers);
      } catch (error) {
        console.log('Error fetching users:', error);
      }
    }
    fetchUsers();
  }, [user._id]);

  const handleLike = async (selectedUserId) => {
    try {
      const response = await Axios.post("http://localhost:3000/users/send-like", {
        currentUserId: user._id,
        selectedUserId: selectedUserId,
      });

      setUsers(prevUsers => prevUsers.filter(user => user._id !== selectedUserId));

      if (response.data.matchCreated) {
        alert("Match created!");
      }

    } catch (error) {
      console.log("Error liking:", error);
    }
  };

  const handleDislike = async (selectedUserId) => {
    try {
      const response = await Axios.post("http://localhost:3000/users/dislike", {
        currentUserId: user._id,
        dislikedUserId: selectedUserId,
      });

      setUsers(prevUsers => prevUsers.filter(user => user._id !== selectedUserId));

    } catch (error) {
      console.log("Error disliking:", error);
    }
  };

  useEffect(() => {
    childRefs.current = Array(users.length).fill(0).map(() => React.createRef());
  }, [users]);

  const swiped = async (direction, _id, index) => {
    setLastDirection(direction);

    if (direction === 'right') {
      await handleLike(_id);
    } else if (direction === 'left') {
      await handleDislike(_id);
    }

    setCurrentIndex(index + 1);
  };

  const outOfFrame = (userId, index) => {
    console.log(`${userId} (${index}) left the screen!`);
  };

  return (
    <div>
      <h1>React Tinder Card</h1>
      <div className='cardContainer'>
        {users.map((userData, index) => (
          <TinderCard
            ref={childRefs.current[index]}
            className='swipe'
            key={userData._id}
            onSwipe={(dir) => swiped(dir, userData._id, index)}
            onCardLeftScreen={() => outOfFrame(userData._id, index)}
          >
            <div
              style={{ backgroundImage: `url(${userData.firstImage})` }}
              className='card'
            >
              <h3 style={{ color: 'black', fontSize: '20px' }}>{userData.username}</h3>
            </div>
          </TinderCard>
        ))}
      </div>

      {lastDirection && (
        <h2 className='infoText'>You swiped {lastDirection}</h2>
      )}
    </div>
  );
}


