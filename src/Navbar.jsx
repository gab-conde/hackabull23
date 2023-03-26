import { findByText } from '@testing-library/react';
import React from 'react';
import { BrowswerRouter, Route, Link } from "react-router-dom";
import './Navbar.css';

function Navbar() {
    return (
        <nav className='navbar'>
            <ul>
                <li>
                    <Link to="/">ChowNow</Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;