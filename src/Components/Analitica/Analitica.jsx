import React, { useContext } from 'react'; // Asegúrate de importar useContext
import Header from '../HeaderTemplate/Header';
import Content from '../../Content/Content';
import { ThemeContext } from '../../ThemeContext'; 
import './Analitica.css'

const Analitica = () => {
  const { DarkTheme } = useContext(ThemeContext); 
  return (
    <div className={`main ${DarkTheme ? 'dark' : ''}`}> 
      <div>
        <Header />
        <Content />
      </div>
    </div>
  );
}

export default Analitica;
