import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../../ThemeContext'; 
import Header from '../HeaderTemplate/Header';
import Content from '../../Content/Content';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Asistencia = () => {
  const { DarkTheme } = useContext(ThemeContext); 
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [horaEntrada, setHoraEntrada] = useState('');
  const [horaSalida, setHoraSalida] = useState('');
  const [fecha, setFecha] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [aprobacion, setAprobacion] = useState(''); // Estado para aprobación

  const fetchEmployees = async () => {
    const employeesCollection = collection(db, 'empleados');
    const employeeSnapshot = await getDocs(employeesCollection);
    const employeeList = employeeSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setEmployees(employeeList);
  };

  const handleAttendance = () => {
    if (selectedEmployee && horaEntrada && horaSalida && fecha) {
      const employee = employees.find(emp => emp.id === selectedEmployee);
      const horasTrabajadas = calculateHours(horaEntrada, horaSalida);
      const horasExtras = horasTrabajadas > 8 ? horasTrabajadas - 8 : 0;

      const newRecord = {
        empleado: employee.nombre,
        documento: employee.documento,
        horaEntrada: horaEntrada,
        horaSalida: horaSalida,
        fecha: fecha,
        horasTrabajadas: horasTrabajadas,
        horasExtras: horasExtras,
        ausencia: selectedOption === 'ausencia' ? 'Sí' : 'No',
        justificacion: selectedOption === 'ausencia' ? justificacion : '',
        aprobar: aprobacion // Agregar opción de aprobación
      };

      setAttendanceRecords([...attendanceRecords, newRecord]);
      resetForm();
    } else {
      alert('Por favor, completa todos los campos.');
    }
  };

  const calculateHours = (entrada, salida) => {
    const entradaDate = new Date(`1970-01-01T${entrada}:00`);
    const salidaDate = new Date(`1970-01-01T${salida}:00`);
    const diffMs = salidaDate - entradaDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return diffHours;
  };

  const resetForm = () => {
    setSelectedEmployee('');
    setSelectedOption('');
    setHoraEntrada('');
    setHoraSalida('');
    setFecha('');
    setJustificacion('');
    setAprobacion(''); // Reiniciar aprobación
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAprobacionChange = (index, value) => {
    const updatedRecords = [...attendanceRecords];
    updatedRecords[index].aprobar = value; // Actualiza la aprobación en el registro correspondiente
    setAttendanceRecords(updatedRecords);
  };

  const exportToPDF = async () => {
    const input = document.getElementById('attendance-table');
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('l', 'mm', 'a4');
    
    const imgBackground = new Image();
    imgBackground.src = 'https://media.istockphoto.com/id/1300464397/es/foto/los-tiempos-de-trabajo-empresarial-concepto-personas-trabajan-escribiendo-en-la-superposici%C3%B3n.webp?a=1&b=1&s=612x612&w=0&k=20&c=_2LkzEoCMsou1LESIcRgGr48bZrvAXckxvqIwfuJrxs=';

    imgBackground.onload = () => {
      pdf.addImage(imgBackground, 'JPEG', 0, 0, 297, 210);

      pdf.setFontSize(20);
      pdf.text('Registros de Asistencia', 105, 20, { align: 'center' });

      const imgWidth = 297;
      const pageHeight = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position + 30, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgBackground, 'JPEG', 0, 0, 297, 210);
        pdf.addImage(imgData, 'PNG', 0, position + 30, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('registros_asistencia.pdf');
    };
  };

  return (
    <div className={`main ${DarkTheme ? "dark" : ""}`}>
      <Header /> 
      <Content /> 

      <h2>Seleccionar Empleado</h2>
      <select
        value={selectedEmployee}
        onChange={(e) => {
          setSelectedEmployee(e.target.value);
          setSelectedOption('');
          setHoraEntrada('');
          setHoraSalida('');
          setFecha('');
          setJustificacion('');
          setAprobacion(''); // Reiniciar aprobación al cambiar empleado
        }}
      >
        <option value="" disabled>Selecciona un empleado</option>
        {employees.map((employee) => (
          <option key={employee.id} value={employee.id}>
            {employee.nombre} - {employee.documento}
          </option>
        ))}
      </select>

      {selectedEmployee && (
        <div>
          <p>Empleado seleccionado: {employees.find(emp => emp.id === selectedEmployee).nombre}</p>
          
          <h3>Seleccionar Opción</h3>
          <select
            value={selectedOption}
            onChange={(e) => {
              setSelectedOption(e.target.value);
              if (e.target.value === 'ausencia') {
                setJustificacion('');
              }
            }}
          >
            <option value="" disabled>Selecciona una opción</option>
            <option value="horaExtra">Hora Extra</option>
            <option value="ausencia">Ausencia</option>
          </select>

          {selectedOption && (
            <div>
              <h3>Ingresar Fecha y Horas</h3>
              <label>Fecha:</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
              <div>
                <label>Hora de Entrada:</label>
                <input
                  type="time"
                  value={horaEntrada}
                  onChange={(e) => setHoraEntrada(e.target.value)}
                />
              </div>
              <div>
                <label>Hora de Salida:</label>
                <input
                  type="time"
                  value={horaSalida}
                  onChange={(e) => setHoraSalida(e.target.value)}
                />
              </div>

              {selectedOption === 'ausencia' && (
                <div>
                  <label>Ausencia con Justificación:</label>
                  <select
                    value={justificacion}
                    onChange={(e) => setJustificacion(e.target.value)}
                  >
                    <option value="" disabled>Seleccionar</option>
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                  </select>
                </div>
              )}

             

              <p>Opción seleccionada: {selectedOption === 'horaExtra' ? 'Hora Extra' : 'Ausencia'}</p>
              <button onClick={handleAttendance}>Registrar Asistencia</button>
            </div>
          )}
        </div>
      )}

      <h2>Registros de Asistencia</h2>
      <table id="attendance-table">
        <thead>
          <tr>
            <th>Empleado</th>
            <th>Documento</th>
            <th>Fecha</th>
            <th>Hora Entrada</th>
            <th>Hora Salida</th>
            <th>Horas Trabajadas</th>
            <th>Horas Extras</th>
            <th>Ausencia</th>
            <th>Justificación</th>
            <th>Aprobar</th>
          </tr>
        </thead>
        <tbody>
          {attendanceRecords.map((record, index) => (
            <tr key={index}>
              <td>{record.empleado}</td>
              <td>{record.documento}</td>
              <td>{record.fecha}</td>
              <td>{record.horaEntrada}</td>
              <td>{record.horaSalida}</td>
              <td>{record.horasTrabajadas}</td>
              <td>{record.horasExtras}</td>
              <td>{record.ausencia}</td>
              <td>{record.justificacion}</td>
              <td>
                <select
                  value={record.aprobar || ''}
                  onChange={(e) => handleAprobacionChange(index, e.target.value)}
                >
                  <option value="" disabled>Seleccionar</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={exportToPDF}>Exportar a PDF</button>
    </div>
  );
};

export default Asistencia;
