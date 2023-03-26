import React, { useState } from 'react';
import "./home.css";
import Quiz from './quiz';

function Home() {

const [showQuiz, setShowQuiz] = useState(false);
const [createNewAccount, setCreateNewAccount] = useState(false);

const handleStartButtonClick = () => {
    setShowQuiz(true);
};

const handleSignInButtonClick = () => {
  setShowQuiz(true);
}

  return (
    <content>
      {showQuiz ? (
                
                <Quiz />
              ) : (
                <div className='bruh'>
                <h1>Welcome to ChowNow.</h1>
                <p className='about'>I have an idea that this app requires about 5 options of different types of food style in terms of button and it will save it in your “profile” in the backend. Then when you open the app, it will give you the best result in terms of what you like and the busy times and open the menu automatically fort you. If you don’t like the result it will give you the second best option and all this data can be stored in a min heap (sorted in order of algo result and O(1) extraction time and O(log(n) ` creation time).If we do want to add a back button, we must store this info in a stack(for the back arrow). It’s O(n) but it doesn’t really matter as user won’t really interact with it as much and extraction is still O(1).</p>
                <div className='actions'>
                  <button className="home" onClick={() => handleStartButtonClick()}>Get Started</button>
                  <p>or</p>
                  <button className='home' onClick={() => handleStartButtonClick()}>Sign In</button>
                  <p>if you have an account</p>
                </div>
                
              </div>
              )
              }
    </content>
    
  );
}

export default Home;