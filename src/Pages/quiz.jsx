import React, { useState } from "react";

function Quiz() {

    const prompts = [
        {
            promptText: 'Which is more important to you?',
            answerOptions: [
                { answerText: "Distance (how far the restaurant is from your current location)"},
                { answerText: "Wait Time (how long it will take to receive your order)"}
            ]
        },
        {
            promptText: 'How do you get around?',
            answerOptions: [
                { answerText: "I drive"},
                { answerText: "I take the bus"},
                { answerText: "I walk"},
            ]
        },
        {
            promptText: 'What kind of food do you like?',
            answerOptions: [
                { answerText: '1'},
				{ answerText: '2'},
				{ answerText: '3'},
				{ answerText: '4'},
                { answerText: '5'},
            ]
        }
    ];

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const handleAnswerButtonClick = (answerOption) => {
        const nextQuestion = currentQuestion + 1;
        if (nextQuestion < prompts.length) {
            setCurrentQuestion(nextQuestion);
        }
        else {
            setShowResult(true);
        }
    };

    const handlePreviousButtonClick = () => {
        const prevQuestion = currentQuestion - 1;
        setCurrentQuestion(prevQuestion);
    };

    return (
        <div className='app'>
			{/* HINT: replace "false" with logic to display the 
      score when the user has answered all the questions */}
      {/* go back to 'saving the score' section to implement */}
			{showResult ? (
                <div>
                    <h1>Your recommendations:</h1>
				    <div className='score-section'>You should go to Broward.</div>
                </div>
			) : (
				<div>
					<div className='question-section'>
						<div className='question-count'>
							<span>{currentQuestion + 1}</span>/{prompts.length}
						</div>
						<div className='question-text'>{prompts[currentQuestion].promptText}</div>
					</div>
					<div className='answer-section'>
                        {prompts[currentQuestion].answerOptions.map((answerOption, index) => (
                            <button onClick={()=> handleAnswerButtonClick()}>{answerOption.answerText}</button>
                        ))}

                        {currentQuestion > 0 ? (
                            <button className='prev' onClick={() => handlePreviousButtonClick()}>Previous</button>
                        ) : (<></>)
                        }
                        
                    </div>
				</div>
			)}
		</div>
    );
}

export default Quiz;