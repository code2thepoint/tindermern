import React, { useEffect, useState } from 'react';
import Axios from 'axios';

export default function Matches({ user }) {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    async function loadInitialPosts() {
      try {
        const response = await Axios.get(`http://localhost:3000/users/matches/${user._id}`);
        const newPosts = response.data;
        console.log(newPosts);

        setMatches(newPosts);

      } catch (error) {
        console.log('There was a problem loading your matches.');
        console.log(error);
      }
    }
    loadInitialPosts();
  }, [user._id]);

  return (
    <div className="Feed">
      {matches.map(post => (
        <div key={post.id} className="Post-Component">
          <div className="Avatar-Username">
            <img className="Avatar" src={post.firstImage} alt="Avatar" />
            <h3>{post.username}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}