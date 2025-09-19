/**
 * Utilitário para conversão de tempo entre string e minutos
 */

export interface TimeConversionResult {
  minutes: number;
  displayString: string;
}

/**
 * Converte uma string de tempo para minutos
 * Suporta formatos:
 * - '1h' = 60 minutos
 * - '0.5h' = 30 minutos  
 * - '1.5h' = 90 minutos
 * - '10' = 10 minutos
 * - '10min' = 10 minutos
 */
export function parseTimeString(timeString: string): TimeConversionResult {
  if (!timeString || timeString.trim() === '') {
    return { minutes: 0, displayString: '' };
  }

  const cleanString = timeString.trim().toLowerCase();
  
  // Se contém 'h' (horas)
  if (cleanString.includes('h')) {
    const hoursMatch = cleanString.match(/^(\d*\.?\d+)h$/);
    if (hoursMatch) {
      const hours = parseFloat(hoursMatch[1]);
      const minutes = Math.round(hours * 60);
      return { 
        minutes, 
        displayString: formatMinutesToString(minutes) 
      };
    }
  }
  
  // Se contém 'min' (minutos)
  if (cleanString.includes('min')) {
    const minutesMatch = cleanString.match(/^(\d+)min$/);
    if (minutesMatch) {
      const minutes = parseInt(minutesMatch[1]);
      return { 
        minutes, 
        displayString: formatMinutesToString(minutes) 
      };
    }
  }
  
  // Se é apenas número (assume minutos)
  const numberMatch = cleanString.match(/^(\d+)$/);
  if (numberMatch) {
    const minutes = parseInt(numberMatch[1]);
    return { 
      minutes, 
      displayString: formatMinutesToString(minutes) 
    };
  }
  
  // Se não conseguiu parsear, retorna 0
  return { minutes: 0, displayString: '' };
}

/**
 * Converte minutos para string formatada
 * Exemplos:
 * - 60 minutos = "1h"
 * - 90 minutos = "1.5h" 
 * - 30 minutos = "0.5h"
 * - 45 minutos = "45min"
 */
export function formatMinutesToString(minutes: number): string {
  if (minutes === 0) return '';
  
  // Se é múltiplo de 60 (horas exatas)
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours}h`;
  }
  
  // Se é maior que 60 minutos, mostra em horas com decimais
  if (minutes >= 60) {
    const hours = minutes / 60;
    // Arredonda para 1 casa decimal se necessário
    const roundedHours = Math.round(hours * 10) / 10;
    return `${roundedHours}h`;
  }
  
  // Menos de 60 minutos, mostra em minutos
  return `${minutes}min`;
}

/**
 * Valida se uma string de tempo é válida
 */
export function isValidTimeString(timeString: string): boolean {
  if (!timeString || timeString.trim() === '') return true; // Vazio é válido
  
  const cleanString = timeString.trim().toLowerCase();
  
  // Padrões válidos
  const validPatterns = [
    /^\d*\.?\d+h$/, // Ex: 1h, 0.5h, 1.5h
    /^\d+min$/,     // Ex: 30min, 45min
    /^\d+$/         // Ex: 30, 45 (apenas números)
  ];
  
  return validPatterns.some(pattern => pattern.test(cleanString));
}

/**
 * Exemplos de conversões para referência
 */
export const TIME_EXAMPLES = [
  { input: '1h', output: '1h', minutes: 60 },
  { input: '0.5h', output: '0.5h', minutes: 30 },
  { input: '1.5h', output: '1.5h', minutes: 90 },
  { input: '30min', output: '30min', minutes: 30 },
  { input: '45min', output: '45min', minutes: 45 },
  { input: '10', output: '10min', minutes: 10 },
  { input: '120', output: '2h', minutes: 120 },
  { input: '90', output: '1.5h', minutes: 90 },
];
