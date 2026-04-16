interface WeeklyEntry {
  id: number;
  weekStart: string;
  workedWell: string;
  whatWasHard: string;
  focusNextWeek: string;
  avgVitality: number;
  mealsLogged: number;
  consistencyDays: number;
}

export const SEED_WEEKLY_CHECKINS: WeeklyEntry[] = [
  {
    id: 1744070400000,
    weekStart: '2026-04-07',
    workedWell: 'Mantuve mis comidas preparadas desde el domingo y no salté ningún desayuno. La hidratación mejoró notablemente esta semana.',
    whatWasHard: 'El miércoles tuve una reunión larga y no pude comer a mi hora habitual, lo que me llevó a un snack poco nutritivo a las 4 pm.',
    focusNextWeek: 'Preparar snacks saludables en porciones individuales para días de reuniones largas. Meta: 9 vasos de agua al día.',
    avgVitality: 78,
    mealsLogged: 25,
    consistencyDays: 6,
  },
  {
    id: 1743465600000,
    weekStart: '2026-03-31',
    workedWell: 'El entrenamiento de fuerza lo cumplí los 3 días planificados. Las cenas ligeras me ayudaron a dormir mejor y despertar con más energía.',
    whatWasHard: 'El fin de semana fue desafiante: cena familiar con muchos alimentos fuera de mi plan. Resultó en dos días con exceso calórico.',
    focusNextWeek: 'Disfrutar las reuniones sociales pero aplicar la regla del 80/20. Priorizar proteína en cada comida.',
    avgVitality: 72,
    mealsLogged: 22,
    consistencyDays: 5,
  },
  {
    id: 1742860800000,
    weekStart: '2026-03-24',
    workedWell: 'Logré registrar todas las comidas de lunes a viernes sin excepción. El plan de comidas de la semana fue variado y satisfactorio.',
    whatWasHard: 'El estrés laboral a mitad de semana me hizo comer con rapidez y sin prestar atención. Poco movimiento el jueves y viernes.',
    focusNextWeek: 'Incorporar al menos 10 minutos de caminata después de cada comida. Practicar comer más despacio.',
    avgVitality: 65,
    mealsLogged: 18,
    consistencyDays: 5,
  },
  {
    id: 1742256000000,
    weekStart: '2026-03-17',
    workedWell: 'Empecé a usar la app de forma constante y encontré mi ritmo de registro. Las recetas nuevas que probé salieron bien.',
    whatWasHard: 'Fue mi primera semana siendo muy consistente con el registro — costó un poco recordar apuntar todo, especialmente las cenas.',
    focusNextWeek: 'Establecer una alarma recordatorio a las 8 pm para revisar el registro del día. Llegar a 4 comidas registradas diariamente.',
    avgVitality: 58,
    mealsLogged: 15,
    consistencyDays: 4,
  },
];
