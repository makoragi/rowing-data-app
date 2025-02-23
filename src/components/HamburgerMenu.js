import React, { useState } from 'react';

const HamburgerMenu = ({ onSelectScreen }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectScreen = (screen) => {
    onSelectScreen(screen);
    setIsOpen(false);
  };

  return (
    <div className="hamburger-menu-container">
      <button className="hamburger-icon" onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav className={`side-menu ${isOpen ? 'open' : ''}`}>
        <button onClick={() => handleSelectScreen('built-in')}>WAKANA SC</button>
        <button onClick={() => handleSelectScreen('upload')}>アップロードデータ表示</button>
        <button onClick={() => handleSelectScreen('processing')}>データ加工</button>
      </nav>
      {isOpen && <div className="overlay" onClick={toggleMenu}></div>}
    </div>
  );
};

export default HamburgerMenu;