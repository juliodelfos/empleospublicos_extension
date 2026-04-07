// Base de datos de rubros para filtrado por categoría
// Cada rubro contiene palabras clave que los identifican

const RUBROS = {
  salud: {
    label: 'Carreras de Salud',
    icon: '🏥',
    keywords: [
      'médico',
      'medico',
      'enfermera',
      'enfermero',
      'kinésiologo',
      'kinesiologo',
      'dentista',
      'psicólogo',
      'psicologo',
      'terapeuta',
      'farmacéutico',
      'farmaceutico',
      'nutricionista',
      'veterinario',
      'flebólogo',
      'flebolog',
      'radiólogo',
      'radiolog',
      'cardiólogo',
      'cardiolog',
      'neurólogo',
      'neurologo',
      'anestesiólogo',
      'anestesiolog',
      'oftalmólogo',
      'oftalmolog',
      'ginecólogo',
      'ginecolog',
      'urólogo',
      'urologo',
      'pediatra',
      'oncólogo',
      'oncolog',
      'cirujano',
      'patólogo',
      'patologo',
      'bacteriólogo',
      'bacteriologo',
      'tecnólogo médico',
      'tecnologo medico',
      'asistente social',
      'matrona',
      'matron',
      'fisiatra',
      'logopaeda',
      'logopeda',
    ]
  },
  
  educacion: {
    label: 'Educación',
    icon: '📚',
    keywords: [
      'profesor',
      'docente',
      'educador',
      'maestro',
      'instructor',
      'capacitador',
      'entrenador',
      'tutor',
      'pedagogía',
      'pedagogia',
      'educacional',
      'académico',
      'academico',
      'especialista en educación',
      'especialista en educacion',
    ]
  },
  
  administracion: {
    label: 'Administración',
    icon: '📋',
    keywords: [
      'administrativo',
      'administrador',
      'secretaria',
      'secretario',
      'asistente administrativo',
      'coordinador administrativo',
      'auxiliar administrativo',
      'oficinista',
      'recepcionista',
      'ejecutivo de cuentas',
      'gestor administrativo',
      'auditor',
      'contador',
      'contable',
      'asesor fiscal',
      'analista de sistemas',
      'analista de datos',
    ]
  },
  
  finanzas: {
    label: 'Finanzas y Contabilidad',
    icon: '💰',
    keywords: [
      'contador',
      'contable',
      'contador público',
      'contador general',
      'tesorero',
      'jefe de finanzas',
      'analista de finanzas',
      'asesor fiscal',
      'auditor',
      'auditor interno',
      'especialista en finanzas',
      'especialista en contabilidad',
      'ejecutivo de finanzas',
    ]
  },
  
  construccion: {
    label: 'Construcción y Obras',
    icon: '🏗️',
    keywords: [
      'constructor',
      'maestro constructor',
      'arquitecto',
      'ingeniero en construcción',
      'ingeniero civil',
      'inspector de obras',
      'supervisor de obras',
      'capataz',
      'albañil',
      'carpintero',
      'electricista',
      'plomero',
      'pintor',
      'soldador',
      'excavador',
      'operador de maquinaria',
    ]
  },
  
  logistica: {
    label: 'Logística y Transporte',
    icon: '🚚',
    keywords: [
      'logística',
      'logistica',
      'operario logístico',
      'operario logistico',
      'coordinador de almacén',
      'coordinador de almacen',
      'supervisor de almacén',
      'supervisor de almacen',
      'jefe de bodega',
      'bodeguero',
      'operador de bodega',
      'transportista',
      'chofer',
      'conductor',
      'repartidor',
      'despachante',
      'aduanero',
      'especialista en aduanas',
    ]
  },
  
  tecnologia: {
    label: 'Tecnología e Informática',
    icon: '💻',
    keywords: [
      'analista de sistemas',
      'analista de datos',
      'analista programador',
      'programador',
      'desarrollador',
      'desarrollador web',
      'desarrollador full stack',
      'ingeniero de software',
      'ingeniero informático',
      'soporte técnico',
      'soporte it',
      'técnico en sistemas',
      'técnico en informática',
      'administrador de sistemas',
      'administrador de bases de datos',
      'especialista en seguridad informática',
      'especialista en redes',
      'especialista en telecomunicaciones',
      'ciberseguridad',
      'informatico',
      'informático',
    ]
  },
  
  rrhh: {
    label: 'Recursos Humanos',
    icon: '👥',
    keywords: [
      'recursos humanos',
      'rrhh',
      'jefe de rrhh',
      'jefe de recursos humanos',
      'gerente de recursos humanos',
      'especialista en rrhh',
      'especialista en recursos humanos',
      'coordinador de rrhh',
      'coordinador de personal',
      'ejecutivo de relaciones públicas',
      'ejecutivo de capacitación',
      'reclutador',
      'seleccionador de personal',
      'especialista en selección',
      'especialista en capacitación',
      'especialista en compensaciones',
      'especialista en relaciones laborales',
    ]
  },
  
  ventas: {
    label: 'Ventas y Marketing',
    icon: '📊',
    keywords: [
      'vendedor',
      'ejecutivo de ventas',
      'ejecutivo comercial',
      'gerente de ventas',
      'gerente comercial',
      'jefe de ventas',
      'coordinador de ventas',
      'representante de ventas',
      'asesor de ventas',
      'promotor de ventas',
      'especialista en marketing',
      'especialista en publicidad',
      'community manager',
      'especialista en redes sociales',
      'especialista en comunicación',
      'especialista en relaciones públicas',
      'publicista',
      'diseñador gráfico',
      'diseñador web',
      'redactor publicitario',
    ]
  },
  
  derecho: {
    label: 'Derecho y Legal',
    icon: '⚖️',
    keywords: [
      'abogado',
      'abogada',
      'jefe de asesoría legal',
      'asesor legal',
      'asesor jurídico',
      'asesor juridico',
      'especialista legal',
      'especialista jurídico',
      'especialista juridico',
      'fiscalizador',
      'inspector legal',
      'notario',
      'escribano',
      'procurador',
    ]
  },
  
  seguridad: {
    label: 'Seguridad y Vigilancia',
    icon: '🔒',
    keywords: [
      'seguridad',
      'vigilante',
      'guardia de seguridad',
      'jefe de seguridad',
      'coordinador de seguridad',
      'superintendente de seguridad',
      'especialista en seguridad',
      'investigador',
      'detective',
      'oficial de seguridad',
      'oficial de policía',
      'carabinero',
      'policía',
      'policía civil',
      'investigador policial',
    ]
  },
};

// Función para obtener todos los rubros
function getRubros() {
  return Object.entries(RUBROS).map(([key, rubro]) => ({
    id: key,
    ...rubro
  }));
}

// Función para obtener palabras clave de un rubro específico
function getRubroKeywords(rubroId) {
  return RUBROS[rubroId]?.keywords || [];
}

// Función para obtener el label de un rubro
function getRubroLabel(rubroId) {
  return RUBROS[rubroId]?.label || '';
}
