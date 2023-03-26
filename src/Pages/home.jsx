import React, { useState } from 'react';
import "./home.css";
import Quiz from './quiz';
import CreateAccount from './CreateAccount';
import "./testlogin.js"
import "./createuser.js"

function Home() {

const [showQuiz, setShowQuiz] = useState(false);
const [createNewAccount, setCreateNewAccount] = useState(false);
const [login, setLogin] = useState(false);

const handleStartButtonClick = () => {
    login(true)
    setShowQuiz(true);
};

const handleSignInButtonClick = () => {
    createNewAccount(true);
    setShowQuiz(true);
}

  return (
    <content>
      {showQuiz ? (
                
                <Quiz />
              ) : (
                <div className='bruh'>
                <h1>Welcome to ChowNow.</h1>
                <p className='about'>Introducing ChowNow, a web application designed to make dining out easier and more enjoyable. ChowNow offers users the ability to select their favorite foods and preferences in order to receive personalized restaurant recommendations. The user can also create an account to save their preferences to get recommendations instantaneously.</p>
                <div className='actions'>
                  <button className="home" onClick={() => handleStartButtonClick()}>Get Started</button>
                  <p>or</p>
                  <button className='home' onClick={() => handleSignInButtonClick()}>Sign In</button>
                  <p>if you have an account</p>
                </div>
                
              </div>
              )
              }
    </content>
    
  );
}

export default Home;