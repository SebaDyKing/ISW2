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
  const fac = facilityData || emp.instalacion || {};

  const instalacionText = fac.nombre
    ? `la instalación denominada ${fac.nombre}`
    : `las instalaciones designadas por la empresa`;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>CONTRATO DE TRABAJO</Text>

        <Text style={styles.paragraph}>
          En Concepción, a {currentDate}, entre la empresa CleanPro SpA, RUT 76.000.000-K, representada legalmente por don/doña Heriberto Mora Vargas , RUT 12.345.678-9, ambos domiciliados para estos efectos en Collao 1202, en adelante "el Empleador", y don/doña {emp.nombre} {emp.apellido}, de nacionalidad {formData.nacionalidad}, estado civil {formData.estadoCivil}, nacido/a el {formData.fechaNacimiento}, RUT {emp.rut || emp.idEmpleado}, domiciliado en {formData.domicilio}, en adelante "el Trabajador", se ha convenido el siguiente contrato de trabajo:
        </Text>

        <Text style={styles.paragraph}>
          PRIMERO: Del Cargo y Funciones. El Trabajador se compromete a desempeñar las funciones de {formData.cargo}, ejecutando las tareas inherentes a dicho puesto y las instrucciones que imparta su jefatura directa.
        </Text>

        <Text style={styles.paragraph}>
          SEGUNDO: Lugar de Prestación de Servicios. Los servicios se prestarán única y exclusivamente en {instalacionText}, propiedad del empleador o de sus clientes, sin perjuicio de la facultad del empleador de alterar dicho sitio por causas justificadas, según el artículo 12 del Código del Trabajo.
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

export const AnexoDocument = ({ contratoAnterior, contratoNuevo }) => {
  const currentDate = new Date().toLocaleDateString('es-CL');

  // Extraemos las modificaciones comparando el anterior con el nuevo
  const modificaciones = [];
  if (contratoAnterior.cargo !== contratoNuevo.cargo) {
    modificaciones.push(`El cargo del trabajador se modifica a: ${contratoNuevo.cargo}.`);
  }
  if (parseFloat(contratoAnterior.sueldo) !== parseFloat(contratoNuevo.sueldo)) {
    modificaciones.push(`La remuneración mensual se modifica a: $${Number(contratoNuevo.sueldo).toLocaleString('es-CL')} CLP.`);
  }
  if (parseInt(contratoAnterior.jornadaHoras, 10) !== parseInt(contratoNuevo.jornadaHoras, 10)) {
    modificaciones.push(`La jornada laboral se ajusta a: ${contratoNuevo.jornadaHoras} horas semanales.`);
  }
  if (contratoAnterior.tipo !== contratoNuevo.tipo) {
    modificaciones.push(`El tipo de contrato pasa a ser: ${contratoNuevo.tipo.replace('_', ' ')}.`);
  }
  if (contratoNuevo.tipo === 'Plazo Fijo' && contratoAnterior.fechaFin !== contratoNuevo.fechaFin) {
    modificaciones.push(`La fecha de término del contrato se establece para el: ${contratoNuevo.fechaFin}.`);
  }

  const nombreEmpleado = contratoAnterior.nombre || 'Trabajador';
  const rutEmpleado = contratoAnterior.rut || 'RUT Desconocido';

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>ANEXO DE CONTRATO DE TRABAJO</Text>

        <Text style={styles.paragraph}>
          En Concepción, a {currentDate}, entre la empresa CleanPro SpA, y don/doña {nombreEmpleado}, RUT {rutEmpleado}, en adelante "el Trabajador", se ha convenido el siguiente anexo al contrato de trabajo vigente:
        </Text>

        <Text style={styles.paragraph}>
          PRIMERO: Las partes acuerdan modificar las condiciones del contrato de trabajo en los siguientes términos:
        </Text>

        {modificaciones.length > 0 ? modificaciones.map((mod, i) => (
          <Text key={i} style={styles.paragraph}>- {mod}</Text>
        )) : (
          <Text style={styles.paragraph}>- No se registraron modificaciones sustanciales.</Text>
        )}

        <Text style={styles.paragraph}>
          SEGUNDO: En todo lo no modificado expresamente por el presente anexo, el contrato original mantiene su plena vigencia y vigor legal entre las partes.
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

export const generateAnexoPDF = async (contratoAnterior, contratoNuevo) => {
  const doc = <AnexoDocument contratoAnterior={contratoAnterior} contratoNuevo={contratoNuevo} />;

  const asPdf = pdf([]);
  asPdf.updateContainer(doc);

  const blob = await asPdf.toBlob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  const codigo = contratoAnterior.codigo || 'XXXX';
  link.download = `Anexo_${codigo}_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const AnexoIndefinidoDocument = ({ contrato, empresa, representante }) => {
  const currentDate = new Date().toLocaleDateString('es-CL');
  const nombreEmpleado = contrato.nombre || 'Trabajador';
  const rutEmpleado = contrato.rut || 'RUT Desconocido';
  const empresaNombre = empresa?.razonSocial || 'CleanPro SpA';
  const fechaInicioStr = new Date(contrato.periodoInicio).toLocaleDateString('es-CL');

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>ANEXO DE CONTRATO DE TRABAJO</Text>
        <Text style={{ ...styles.title, fontSize: 12, marginTop: -15 }}>PASO A CONTRATO INDEFINIDO</Text>

        <Text style={styles.paragraph}>
          En Concepción, a {currentDate}, entre la empresa {empresaNombre}, y don/doña {nombreEmpleado}, RUT {rutEmpleado}, en adelante "el Trabajador", se ha convenido el siguiente anexo al contrato de trabajo vigente:
        </Text>

        <Text style={styles.paragraph}>
          PRIMERO: Antecedentes. Las partes dejaron constancia que con fecha {fechaInicioStr} celebraron un contrato de trabajo a plazo fijo, mediante el cual el Trabajador presta servicios como {contrato.rol}.
        </Text>

        <Text style={styles.paragraph}>
          SEGUNDO: Modificación de la Duración. Por mutuo acuerdo de las partes contratantes, o en cumplimiento de lo establecido en el Código del Trabajo respecto a las renovaciones de contratos a plazo fijo, se acuerda modificar la cláusula relativa a la duración del contrato de trabajo.
        </Text>

        <Text style={styles.paragraph}>
          TERCERO: Carácter Indefinido. A contar de esta fecha, el contrato de trabajo original pasa a tener el carácter de INDEFINIDO, rigiéndose en todo lo demás por las cláusulas originalmente pactadas y que no son materia de modificación en este documento.
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

export const generateAnexoIndefinidoPDF = async (contrato, empresa, representante) => {
  const doc = <AnexoIndefinidoDocument contrato={contrato} empresa={empresa} representante={representante} />;

  const asPdf = pdf([]);
  asPdf.updateContainer(doc);

  const blob = await asPdf.toBlob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  const codigo = contrato.codigo || 'XXXX';
  link.download = `Anexo_Indefinido_${codigo}_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const AnexoTrasladoDocument = ({ empleado, instalacionAnterior, instalacionNueva }) => {
  const currentDate = new Date().toLocaleDateString('es-CL');
  const nombreEmpleado = `${empleado.nombre} ${empleado.apellido}`;
  const rutEmpleado = empleado.rut || 'RUT Desconocido';
  const empresaNombre = 'CleanPro SpA'; // Asumimos CleanPro por ahora

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>ANEXO DE CONTRATO DE TRABAJO</Text>
        <Text style={{ ...styles.title, fontSize: 12, marginTop: -15 }}>TRASLADO DE INSTALACIÓN</Text>

        <Text style={styles.paragraph}>
          En Concepción, a {currentDate}, entre la empresa {empresaNombre}, y don/doña {nombreEmpleado}, RUT {rutEmpleado}, en adelante "el Trabajador", se ha convenido el siguiente anexo al contrato de trabajo vigente:
        </Text>

        <Text style={styles.paragraph}>
          PRIMERO: Modificación del Lugar de Trabajo. Por mutuo acuerdo de las partes contratantes, se acuerda modificar la cláusula relativa al lugar de prestación de los servicios del Trabajador.
        </Text>

        <Text style={styles.paragraph}>
          SEGUNDO: Nuevo Lugar de Trabajo. A contar de esta fecha, el Trabajador dejará de prestar servicios en la instalación denominada "{instalacionAnterior?.nombre || 'Instalación anterior'}" y pasará a desempeñar sus funciones única y exclusivamente en la instalación denominada "{instalacionNueva?.nombre || 'Instalación nueva'}", ubicada en {instalacionNueva?.direccion || '---'}.
        </Text>

        <Text style={styles.paragraph}>
          TERCERO: Vigencia y Condiciones. El presente anexo forma parte integrante del contrato de trabajo original, el cual se mantiene plenamente vigente en todas y cada una de sus partes que no hayan sido modificadas expresamente por el presente documento.
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

export const generateAnexoTrasladoPDF = async (empleado, instalacionAnterior, instalacionNueva) => {
  const doc = <AnexoTrasladoDocument empleado={empleado} instalacionAnterior={instalacionAnterior} instalacionNueva={instalacionNueva} />;

  const asPdf = pdf([]);
  asPdf.updateContainer(doc);

  const blob = await asPdf.toBlob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  const rutClean = (empleado.rut || '').replace(/\./g, '').replace('-', '');
  link.download = `Anexo_Traslado_${rutClean}_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const AnexoMultiInstalacionDocument = ({ contrato, payload, instalacionNueva }) => {
  const currentDate = new Date().toLocaleDateString('es-CL');
  const nombreEmpleado = contrato.nombre || 'Trabajador';
  const rutEmpleado = contrato.rut || 'RUT Desconocido';
  const empresaNombre = 'CleanPro SpA'; 
  const instalacionOriginal = contrato.instalacion || 'Instalación principal';

  const pagoAdicionalFormat = payload.pagoAdicional 
    ? `$${Number(payload.pagoAdicional).toLocaleString('es-CL')}` 
    : '$0';

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>ANEXO DE CONTRATO DE TRABAJO</Text>
        <Text style={{ ...styles.title, fontSize: 12, marginTop: -15 }}>ASIGNACIÓN A MÚLTIPLES INSTALACIONES</Text>

        <Text style={styles.paragraph}>
          En Concepción, a {currentDate}, entre la empresa {empresaNombre}, y don/doña {nombreEmpleado}, RUT {rutEmpleado}, en adelante "el Trabajador", se ha convenido el siguiente anexo al contrato de trabajo vigente:
        </Text>

        <Text style={styles.paragraph}>
          PRIMERO: Modificación de la Prestación de Servicios. Por mutuo acuerdo, se acuerda modificar la cláusula relativa al lugar de prestación de los servicios para permitir la distribución de la jornada laboral en múltiples instalaciones de la empresa.
        </Text>

        <Text style={styles.paragraph}>
          SEGUNDO: Distribución de Horarios. A partir de esta fecha, el trabajador prestará servicios adicionales en la instalación denominada "{instalacionNueva.nombre}", ubicada en {instalacionNueva.direccion || '---'}.
        </Text>

        <Text style={styles.paragraph}>
          TERCERO: Jornada y Remuneración Adicional. Para cumplir con las funciones en la nueva instalación, se acuerda una asignación de {payload.horasSemanales} horas semanales. En compensación por esta asignación, se establece un Pago adicional de {pagoAdicionalFormat} por la nueva instalación.
        </Text>

        <Text style={styles.paragraph}>
          CUARTO: Límite Legal. La suma de las horas trabajadas en {instalacionOriginal} y en {instalacionNueva.nombre} no podrá exceder en ningún caso el límite máximo de la jornada ordinaria de trabajo establecido por la ley vigente.
        </Text>

        <Text style={styles.paragraph}>
          QUINTO: En todo lo no modificado expresamente por el presente anexo, el contrato original mantiene su plena vigencia y vigor legal entre las partes.
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

export const generateAnexoMultiInstalacionPDF = async (contrato, payload, instalacionNueva) => {
  const doc = <AnexoMultiInstalacionDocument contrato={contrato} payload={payload} instalacionNueva={instalacionNueva} />;

  const asPdf = pdf([]);
  asPdf.updateContainer(doc);

  const blob = await asPdf.toBlob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  const rutClean = (contrato.rut || '').replace(/\./g, '').replace('-', '');
  link.download = `Anexo_MultiInstalacion_${rutClean}_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
