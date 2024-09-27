import React, { useState } from 'react';
import { Link } from 'react-router-dom';


export default function Signup({ signup }) {
  const [user, setUser] = useState({
    email: '',
    username: '',
    password: '',
    firstImage: '',
  });


  function handleInputChange(e) {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  }


  
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await signup(user);
    } catch (error) {
       console.log(error);
    }
  }
  return (

      <div className="Signup">
        <div className="FormContainer">
          <h1 className="Form__title">Tinder Card</h1>
          <p className="FormContainer__info">
           </p>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="Form__field"
              required
              onChange={handleInputChange}
              value={user.email}
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="Form__field"
              required
              minLength="3"
              maxLength="30"
              onChange={handleInputChange}
              value={user.username}
            />
            <input
              type="text"
              name="firstImage"
              placeholder="Picture"
              className="Form__field"
              required
              maxLength="150"
              onChange={handleInputChange}
              value={user.bio}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="Form__field"
              required
              onChange={handleInputChange}
              value={user.password}
            />
            <button className="Form__submit" type="submit">
              Sign up
            </button>
            <p className="FormContainer__info">
              Already an account? <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </div>
    
  );
}