import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer';
import { subirDocumentoEmpleado, subirDocumentoCliente, getFirmaAdminService } from '../services/admin.service';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11, lineHeight: 1.5, paddingBottom: 85 },
  title: { fontSize: 14, textAlign: 'center', marginBottom: 20 },
  paragraph: { marginBottom: 10, textAlign: 'justify' },
  signatureLine: { borderTopWidth: 1, borderColor: '#000', width: 200, paddingTop: 5, textAlign: 'center' }
});

const SignatureBlock = ({ firmaAdmin, tituloIzquierda = "EL EMPLEADOR", tituloDerecha = "EL TRABAJADOR" }) => (
  <View style={{ marginTop: 'auto', paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
    <View style={{ alignItems: 'center' }}>
      {firmaAdmin && (
        <Image src={firmaAdmin} style={{ width: 100, height: 50, marginBottom: 5 }} />
      )}
      <View style={styles.signatureLine}>
        <Text>{tituloIzquierda}</Text>
      </View>
    </View>
    <View style={{ alignItems: 'center' }}>
      <View style={styles.signatureLine}>
        <Text>{tituloDerecha}</Text>
      </View>
    </View>
  </View>
);

export const ContractDocument = ({ formData, employeeData, facilityData, firmaAdmin }) => {
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

        <SignatureBlock firmaAdmin={firmaAdmin} tituloIzquierda="EL EMPLEADOR" tituloDerecha="EL TRABAJADOR" />
      </Page>
    </Document>
  );
};

export const CommercialContractDocument = ({ formData, clientData, firmaAdmin }) => {
  const currentDate = new Date().toLocaleDateString('es-CL');
  const cli = clientData || {};

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>CONTRATO DE COMPRAVENTA COMERCIAL</Text>
        <Text style={styles.paragraph}>
          Con constancia en la ciudad de Concepción, a {currentDate}, se celebra el presente contrato comercial entre las partes:
        </Text>
        
        <Text style={styles.paragraph}>I. COMPARECIENTES</Text>
        <Text style={styles.paragraph}>
          EL PRESTADOR: CleanPro SpA, RUT 76.000.000-K, con domicilio en Collao 1202, representada legalmente por Heriberto Mora Vargas, Cédula de Identidad 12.345.678-9.
        </Text>
        <Text style={styles.paragraph}>
          EL CLIENTE: {cli.nombreEmpresa || 'Cliente'}, RUT {cli.usuario?.rut || cli.rut || 'No especificado'}, con domicilio en {formData.domicilio || 'No especificado'}, representada legalmente por {cli.usuario?.nombre ? `${cli.usuario.nombre} ${cli.usuario.apellido}` : 'su Representante Legal'}, Cédula de Identidad {cli.usuario?.rut || 'No especificada'}.
        </Text>
        <Text style={styles.paragraph}>
         Ambas partes declaran ser mayores de edad, tener la capacidad legal para contratar y obligarse, y acuerdan lo siguiente:
        </Text>

        <Text style={styles.paragraph}>II. CLÁUSULAS</Text>
        <Text style={styles.paragraph}>
          PRIMERA: Objeto del Contrato
          El Vendedor vende, cede y transfiere al Comprador, quien compra y adquiere para sí, las siguientes mercancías/productos:
          {formData.descripcionServicio || '[Descripción detallada del producto, marca, modelo, cantidad y estado]'}.
        </Text>

        <Text style={styles.paragraph}>
          SEGUNDA: Precio y Forma de Pago
          El precio total de venta acordado por las partes asciende a la suma de ${Number(formData.montoServicio).toLocaleString('es-CL')} CLP.
          El Comprador pagará dicho monto al Vendedor de la siguiente forma:
          {formData.condicionPago || '[Ejemplo: El 50% mediante transferencia bancaria al momento de la firma y el 50% restante contra entrega de los productos]'}.
        </Text>

        <Text style={styles.paragraph}>
          TERCERA: Plazo y Condiciones de Entrega
          El Vendedor se compromete a entregar los productos a más tardar el día {formData.fechaFin || 'cumplimiento del servicio'}.
          La entrega se realizará en el domicilio del Comprador ubicado en {formData.domicilio || 'la dirección acordada'}.
          Los gastos de transporte y seguro correrán por cuenta del Vendedor.
        </Text>

        <Text style={styles.paragraph}>
          CUARTA: Garantía y Saneamiento
          El Vendedor garantiza que los productos se encuentran libres de gravámenes, prohibiciones, embargos o vicios ocultos que impidan su uso normal.
          El Vendedor responderá por cualquier defecto de fabricación durante un plazo de 6 meses a contar de la entrega.
        </Text>

        <Text style={styles.paragraph}>
          QUINTA: Incumplimiento y Cláusula Penal
          En caso de retraso en la entrega de los productos o en el pago del precio, la parte infractora pagará a la otra parte una multa equivalente al 1% del valor total del contrato por cada día de retraso.
        </Text>

        <Text style={styles.paragraph}>
          SEXTA: Resolución de Conflictos
          Cualquier controversia derivada de la interpretación o ejecución de este contrato se resolverá ante los Tribunales Ordinarios de Justicia de la ciudad de Concepción, renunciando las partes a cualquier otro fuero que pudiera corresponderles.
        </Text>

        <Text style={styles.paragraph}>III. CIERRE Y FIRMAS</Text>
        <Text style={styles.paragraph}>
          En señal de conformidad y aceptación de todas las cláusulas anteriores, las partes firman el presente contrato en dos ejemplares del mismo tenor y fecha.
        </Text>

        <SignatureBlock firmaAdmin={firmaAdmin} tituloIzquierda="EL VENDEDOR" tituloDerecha="EL COMPRADOR" />
      </Page>
    </Document>
  );
};

export const generateContractPDF = async (formData, entityData, facilityData) => {
  const isComercial = formData.tipoContratoPadre === 'Comercial';
  
  let firmaAdmin = null;
  try {
    const res = await getFirmaAdminService();
    if (res.data?.firmaBase64) {
      firmaAdmin = res.data.firmaBase64;
    }
  } catch (err) {
    console.error("Error al cargar la firma del admin", err);
  }

  const doc = isComercial 
    ? <CommercialContractDocument formData={formData} clientData={entityData} firmaAdmin={firmaAdmin} />
    : <ContractDocument formData={formData} employeeData={entityData} facilityData={facilityData} firmaAdmin={firmaAdmin} />;
  const asBlob = await pdf(doc).toBlob();
  const blob = new Blob([asBlob], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  window.open(url, '_blank');

  try {
    if (!isComercial) {
      const idEmpleado = entityData?.idEmpleado;
      if (idEmpleado) {
        await subirDocumentoEmpleado(idEmpleado, 'Contrato', blob);
      }
    } else {
      const idCliente = entityData?.idCliente;
      if (idCliente) {
        await subirDocumentoCliente(idCliente, 'Contrato', blob);
      }
    }
  } catch (error) {
    console.error('Error al subir Contrato a Carpeta Digital:', error);
  }
};

export const AnexoDocument = ({ contratoAnterior, contratoNuevo, firmaAdmin }) => {
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
  if (contratoNuevo.fechaInicio && contratoAnterior.fechaInicio !== contratoNuevo.fechaInicio) {
    modificaciones.push(`La fecha de inicio de estas nuevas condiciones se establece a contar del: ${contratoNuevo.fechaInicio}.`);
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

        <SignatureBlock firmaAdmin={firmaAdmin} tituloIzquierda="EL EMPLEADOR" tituloDerecha="EL TRABAJADOR" />
      </Page>
    </Document>
  );
};

export const generateAnexoPDF = async (contratoAnterior, contratoNuevo) => {
  let firmaAdmin = null;
  try {
    const res = await getFirmaAdminService();
    if (res.data?.firmaBase64) firmaAdmin = res.data.firmaBase64;
  } catch (err) { console.error("Error al cargar la firma del admin", err); }

  const doc = <AnexoDocument contratoAnterior={contratoAnterior} contratoNuevo={contratoNuevo} firmaAdmin={firmaAdmin} />;

  const asBlob = await pdf(doc).toBlob();
  const blob = new Blob([asBlob], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  window.open(url, '_blank');

  try {
    const idEmpleado = contratoAnterior.idEmpleado || contratoAnterior.empleado?.idEmpleado;
    if (idEmpleado) {
      await subirDocumentoEmpleado(idEmpleado, 'Anexo_Condiciones', blob);
    }
  } catch (error) {
    console.error('Error al subir Anexo a Carpeta Digital:', error);
  }
};

export const AnexoIndefinidoDocument = ({ contrato, empresa, representante, firmaAdmin }) => {
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

        <SignatureBlock firmaAdmin={firmaAdmin} tituloIzquierda="EL EMPLEADOR" tituloDerecha="EL TRABAJADOR" />
      </Page>
    </Document>
  );
};

export const generateAnexoIndefinidoPDF = async (contrato, empresa, representante) => {
  let firmaAdmin = null;
  try {
    const res = await getFirmaAdminService();
    if (res.data?.firmaBase64) firmaAdmin = res.data.firmaBase64;
  } catch (err) { console.error("Error al cargar la firma del admin", err); }

  const doc = <AnexoIndefinidoDocument contrato={contrato} empresa={empresa} representante={representante} firmaAdmin={firmaAdmin} />;

  const asPdf = pdf([]);
  asPdf.updateContainer(doc);

  const blob = await asPdf.toBlob();
  const url = URL.createObjectURL(blob);

  window.open(url, '_blank');

  try {
    const idEmpleado = contrato.idEmpleado || contrato.empleado?.idEmpleado;
    if (idEmpleado) {
      await subirDocumentoEmpleado(idEmpleado, 'Anexo_Indefinido', blob);
    }
  } catch (error) {
    console.error('Error al subir Anexo a Carpeta Digital:', error);
  }
};

export const AnexoTrasladoDocument = ({ empleado, instalacionAnterior, instalacionNueva, firmaAdmin }) => {
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

        <SignatureBlock firmaAdmin={firmaAdmin} tituloIzquierda="EL EMPLEADOR" tituloDerecha="EL TRABAJADOR" />
      </Page>
    </Document>
  );
};

export const generateAnexoTrasladoPDF = async (empleado, instalacionAnterior, instalacionNueva) => {
  let firmaAdmin = null;
  try {
    const res = await getFirmaAdminService();
    if (res.data?.firmaBase64) firmaAdmin = res.data.firmaBase64;
  } catch (err) { console.error("Error al cargar la firma del admin", err); }

  const doc = <AnexoTrasladoDocument empleado={empleado} instalacionAnterior={instalacionAnterior} instalacionNueva={instalacionNueva} firmaAdmin={firmaAdmin} />;

  const asPdf = pdf([]);
  asPdf.updateContainer(doc);

  const blob = await asPdf.toBlob();
  const url = URL.createObjectURL(blob);

  window.open(url, '_blank');

  try {
    const idEmpleado = empleado.idEmpleado;
    if (idEmpleado) {
      await subirDocumentoEmpleado(idEmpleado, 'Anexo_Traslado', blob);
    }
  } catch (error) {
    console.error('Error al subir Anexo a Carpeta Digital:', error);
  }
};

export const AnexoMultiInstalacionDocument = ({ contrato, payload, instalacionNueva, firmaAdmin }) => {
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

        <SignatureBlock firmaAdmin={firmaAdmin} tituloIzquierda="EL EMPLEADOR" tituloDerecha="EL TRABAJADOR" />
      </Page>
    </Document>
  );
};

export const generateAnexoMultiInstalacionPDF = async (contrato, payload, instalacionNueva) => {
  let firmaAdmin = null;
  try {
    const res = await getFirmaAdminService();
    if (res.data?.firmaBase64) firmaAdmin = res.data.firmaBase64;
  } catch (err) { console.error("Error al cargar la firma del admin", err); }

  const doc = <AnexoMultiInstalacionDocument contrato={contrato} payload={payload} instalacionNueva={instalacionNueva} firmaAdmin={firmaAdmin} />;

  const asPdf = pdf([]);
  asPdf.updateContainer(doc);

  const blob = await asPdf.toBlob();
  const url = URL.createObjectURL(blob);

  window.open(url, '_blank');

  try {
    const idEmpleado = contrato.idEmpleado || contrato.empleado?.idEmpleado;
    if (idEmpleado) {
      await subirDocumentoEmpleado(idEmpleado, 'Anexo_MultiInstalacion', blob);
    }
  } catch (error) {
    console.error('Error al subir Anexo a Carpeta Digital:', error);
  }
};
