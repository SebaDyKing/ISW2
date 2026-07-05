import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11, lineHeight: 1.5 },
  title: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  paragraph: { marginBottom: 10, textAlign: 'justify' },
  signatures: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 80 },
  signatureLine: { borderTopWidth: 1, borderColor: '#000', width: 200, paddingTop: 5, textAlign: 'center' }
});

export const ContractDocument = ({ formData, employeeData, facilityData }) => {
  const currentDate = new Date().toLocaleDateString('es-CL');
  const tipoTexto = formData.tipo.replace('_', ' ');
  
  const fechaFinTexto = formData.tipo === 'Plazo Fijo' 
    ? `hasta el ${formData.fechaFin}` 
    : `de carácter indefinido`;

  // Asegurar que employeeData y facilityData existan por precaución
  const emp = employeeData || {};
  const fac = facilityData || {};

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>CONTRATO DE TRABAJO</Text>
        
        <Text style={styles.paragraph}>
          En Santiago, a {currentDate}, entre la empresa MiEmpresa SpA, RUT 76.000.000-K, representada legalmente por don/doña Pedro Jefe, RUT 12.345.678-9, ambos domiciliados para estos efectos en Av. Apoquindo 456, en adelante "el Empleador", y don/doña {emp.nombre} {emp.apellido}, de nacionalidad chilena, estado civil soltero, nacido/a el 01/01/1990, RUT {emp.idEmpleado || '11.111.111-1'}, domiciliado en Santiago, en adelante "el Trabajador", se ha convenido el siguiente contrato de trabajo:
        </Text>

        <Text style={styles.paragraph}>
          PRIMERO: Del Cargo y Funciones. El Trabajador se compromete a desempeñar las funciones de {formData.cargo}, ejecutando las tareas inherentes a dicho puesto y las instrucciones que imparta su jefatura directa.
        </Text>

        <Text style={styles.paragraph}>
          SEGUNDO: Lugar de Prestación de Servicios. Los servicios se prestarán única y exclusivamente en la instalación denominada {fac.nombre || `Instalación #${formData.idInstalacion}`}, propiedad del empleador o de sus clientes, sin perjuicio de la facultad del empleador de alterar dicho sitio por causas justificadas, según el artículo 12 del Código del Trabajo.
        </Text>

        <Text style={styles.paragraph}>
          TERCERO: Jornada de Trabajo. La jornada laboral del trabajador será de un total de {formData.jornadaHoras} horas semanales, distribuidas de lunes a viernes en los horarios determinados por el reglamento interno de la empresa.
        </Text>

        <Text style={styles.paragraph}>
          CUARTO: Remuneración. El Empleador se obliga a pagar al trabajador una remuneración mensual de ${Number(formData.sueldo).toLocaleString('es-CL')} pesos chilenos (CLP), la cual será liquidada y pagada el último día hábil de cada mes calendario. Sobre este monto se realizarán los descuentos legales pertinentes de previsión (AFP) y salud (Fonasa/Isapre).
        </Text>

        <Text style={styles.paragraph}>
          QUINTO: Duración del Contrato. El presente acuerdo laboral corresponde a un contrato de tipo {tipoTexto}. Iniciará sus efectos a contar del {formData.fechaInicio} y tendrá vigencia {fechaFinTexto}.
        </Text>

        <Text style={styles.paragraph}>
          Para constancia de lo acordado, y en señal de aceptación, las partes firman en dos ejemplares del mismo tenor, quedando uno en poder de cada parte.
        </Text>

        <View style={styles.signatures}>
          <View>
            <View style={styles.signatureLine}>
              <Text>EL EMPLEADOR</Text>
            </View>
          </View>
          <View>
            <View style={styles.signatureLine}>
              <Text>EL TRABAJADOR</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export const generateContractPDF = async (formData, employeeData, facilityData) => {
  const doc = <ContractDocument formData={formData} employeeData={employeeData} facilityData={facilityData} />;
  
  const asPdf = pdf([]);
  asPdf.updateContainer(doc);
  
  const blob = await asPdf.toBlob();
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const rutOId = employeeData?.idEmpleado || 'Desconocido';
  link.download = `Contrato_${rutOId}_${formData.fechaInicio}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
