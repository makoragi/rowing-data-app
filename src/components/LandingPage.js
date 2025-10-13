import React from 'react';

const LandingPage = ({ onSelectWakana, onSelectSuzuka }) => {
  return (
    <section className="landing-page">
      <h2 className="landing-title">データセットを選択してください</h2>
      <p className="landing-description">
        表示したいチームのデータを選ぶと可視化画面に移動します。
      </p>
      <div className="landing-links">
        <button className="landing-link" onClick={onSelectWakana}>
          WAKANA SC
        </button>
        <button className="landing-link" onClick={onSelectSuzuka}>
          SUZUKA SC
        </button>
      </div>
    </section>
  );
};

export default LandingPage;
