import React, { useState, useContext } from 'react';
import './FormEmpleado.css';
import Header from '../HeaderTemplate/Header';
import Content from '../../Content/Content';
import { ThemeContext } from '../../ThemeContext'; 
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

function FormEmpleado({ setEmployees }) { 
  const { DarkTheme } = useContext(ThemeContext);
  const [name, setName] = useState('');
  const [documento, setDocumento] = useState('');

  const handleAddEmployee = async () => {
    if (name && documento) {
      try {
        const docRef = await addDoc(collection(db, 'empleados'), {
          nombre: name,
          documento: documento,
        });
        console.log('Empleado agregado con ID:', docRef.id);
        
        
        setEmployees(prevEmployees => [
          ...prevEmployees,
          { id: docRef.id, nombre: name, documento: documento }
        ]);

        setName('');
        setDocumento('');
      } catch (e) {
        console.error('Error al agregar el empleado:', e);
      }
    } else {
      alert('Por favor, completa todos los campos.');
    }
  };

  return (
    <div className={`main ${DarkTheme ? 'dark' : ''}`}>
      <Header />
      <Content />
      <div className='container1'>
        <h3>Agregar Empleado</h3>
        <input
          className='input'
          type='text'
          placeholder='Nombre del empleado'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className='input'
          type='number'
          placeholder='Documento'
          value={documento}
          onChange={(e) => setDocumento(e.target.value)}
        />
        <button className='button' onClick={handleAddEmployee}>Agregar Empleado</button>
      </div>
    </div>
  );
}

export default FormEmpleado;
