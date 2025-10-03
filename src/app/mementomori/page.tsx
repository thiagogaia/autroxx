'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar, Heart, Briefcase, GraduationCap, Plane, Home, Baby, TrendingUp, Download, Settings, User, BookOpen, Skull, Activity, Brain, Dumbbell, Coffee, Users, Target, Award, Printer, Monitor } from 'lucide-react';
import { Navigation } from '@/components/Navigation';

// From https://en.wikipedia.org/wiki/List_of_countries_by_life_expectancy#List_by_the_United_Nations.2C_for_2010.E2.80.932015
const LIFE_EXPECTANCY = [
  {country: "Afeganistão", male: 47.19, female: 47.47},
  {country: "Albânia", male: 73.43, female: 79.72},
  {country: "Argélia", male: 70.12, female: 77.72},
  {country: "Angola", male: 48.21, female: 51.04},
  {country: "Argentina", male: 71.53, female: 79.07},
  {country: "Armênia", male: 70.21, female: 76.74},
  {country: "Aruba (Holanda)", male: 72.28, female: 77.09},
  {country: "Austrália", male: 79.9, female: 84.3},
  {country: "Áustria", male: 78.5, female: 83.6},
  {country: "Azerbaijão", male: 67.09, female: 73.14},
  {country: "Bahamas", male: 71.60, female: 77.83},
  {country: "Bahrein", male: 74.03, female: 75.37},
  {country: "Bangladesh", male: 67.41, female: 68.29},
  {country: "Barbados", male: 73.00, female: 79.50},
  {country: "Belarus", male: 63.59, female: 75.53},
  {country: "Bélgica", male: 78.0, female: 83.0},
  {country: "Belize", male: 73.93, female: 76.80},
  {country: "Benin", male: 52.72, female: 56.50},
  {country: "Butão", male: 64.08, female: 67.77},
  {country: "Bolívia", male: 63.43, female: 67.70},
  {country: "Bósnia e Herzegovina", male: 72.43, female: 77.70},
  {country: "Botsuana", male: 53.80, female: 52.54},
  {country: "Brasil", male: 71.75, female: 79.25},
  {country: "Brunei", male: 75.29, female: 79.98},
  {country: "Bulgária", male: 69.21, female: 76.35},
  {country: "Burkina Faso", male: 52.84, female: 54.78},
  {country: "Burundi", male: 47.48, female: 50.05},
  {country: "Camboja", male: 60.21, female: 62.61},
  {country: "Camarões", male: 49.02, female: 50.89},
  {country: "Canadá", male: 79.7, female: 83.8},
  {country: "Cabo Verde", male: 69.41, female: 77.36},
  {country: "República Centro-Africana", male: 44.47, female: 47.31},
  {country: "Chade", male: 47.15, female: 49.90},
  {country: "Ilhas do Canal (Reino Unido)", male: 78.5, female: 82.4},
  {country: "Chile", male: 75.54, female: 81.68},
  {country: "China", male: 71.10, female: 74.45},
  {country: "Colômbia", male: 69.24, female: 76.66},
  {country: "Comores", male: 58.33, female: 61.00},
  {country: "Congo", male: 54.88, female: 57.16},
  {country: "República Democrática do Congo", male: 45.93, female: 48.91},
  {country: "Costa Rica", male: 76.7, female: 81.7},
  {country: "Croácia", male: 72.45, female: 79.49},
  {country: "Cuba", male: 76.55, female: 80.52},
  {country: "Chipre", male: 76.84, female: 81.07},
  {country: "República Tcheca", male: 73.78, female: 80.15},
  {country: "Costa do Marfim", male: 52.14, female: 54.05},
  {country: "Dinamarca", male: 75.99, female: 80.50},
  {country: "Djibuti", male: 55.24, female: 58.04},
  {country: "República Dominicana", male: 69.85, female: 75.44},
  {country: "Equador", male: 72.14, female: 78.06},
  {country: "Egito", male: 71.23, female: 75.82},
  {country: "El Salvador", male: 66.55, female: 76.08},
  {country: "Guiné Equatorial", male: 48.87, female: 51.48},
  {country: "Eritreia", male: 57.61, female: 62.23},
  {country: "Estônia", male: 68.35, female: 79.17},
  {country: "Etiópia", male: 55.70, female: 58.74},
  {country: "Estados Federados da Micronésia", male: 67.56, female: 69.11},
  {country: "Fiji", male: 66.09, female: 71.90},
  {country: "Finlândia", male: 77.6, female: 83.4},
  {country: "França", male: 78.8, female: 84.9},
  {country: "Guiana Francesa (França)", male: 72.55, female: 79.89},
  {country: "Polinésia Francesa (França)", male: 72.21, female: 77.08},
  {country: "Gabão", male: 60.24, female: 62.35},
  {country: "Gâmbia", male: 56.25, female: 58.49},
  {country: "Geórgia", male: 69.36, female: 76.50},
  {country: "Alemanha", male: 78.2, female: 83.1},
  {country: "Gana", male: 61.84, female: 63.61},
  {country: "Grécia", male: 77.6, female: 83.6},
  {country: "Granada", male: 73.71, female: 76.79},
  {country: "Guadalupe (França)", male: 76.8, female: 84.0},
  {country: "Guam (EUA)", male: 73.25, female: 77.94},
  {country: "Guatemala", male: 66.73, female: 73.79},
  {country: "Guiné", male: 50.93, female: 54.01},
  {country: "Guiné-Bissau", male: 45.33, female: 48.22},
  {country: "Guiana", male: 65.53, female: 71.93},
  {country: "Haiti", male: 59.94, female: 62.02},
  {country: "Honduras", male: 69.74, female: 74.51},
  {country: "Hong Kong", male: 80.0, female: 86.5},
  {country: "Hungria", male: 69.54, female: 77.64},
  {country: "Islândia", male: 80.7, female: 83.8},
  {country: "Índia", male: 62.80, female: 65.73},
  {country: "Indonésia", male: 66.29, female: 69.43},
  {country: "Irã", male: 70.33, female: 73.91},
  {country: "Iraque", male: 63.37, female: 71.69},
  {country: "Irlanda", male: 78.4, female: 82.7},
  {country: "Israel", male: 80.2, female: 83.8},
  {country: "Itália", male: 80.3, female: 85.2},
  {country: "Jamaica", male: 69.57, female: 74.97},
  {country: "Japão", male: 80.9, female: 86.6},
  {country: "Jordânia", male: 71.65, female: 74.29},
  {country: "Cazaquistão", male: 60.18, female: 71.53},
  {country: "Quênia", male: 53.96, female: 55.93},
  {country: "Kuwait", male: 73.47, female: 75.19},
  {country: "Quirguistão", male: 62.66, female: 71.04},
  {country: "Laos", male: 64.77, female: 67.31},
  {country: "Letônia", male: 66.88, female: 77.45},
  {country: "Líbano", male: 69.86, female: 74.18},
  {country: "Lesoto", male: 46.46, female: 45.18},
  {country: "Libéria", male: 53.45, female: 55.35},
  {country: "Líbia", male: 74.36, female: 77.82},
  {country: "Lituânia", male: 65.46, female: 77.24},
  {country: "Luxemburgo", male: 78.9, female: 83.7},
  {country: "Macau (China)", male: 78.1, female: 82.5},
  {country: "Macedônia", male: 72.12, female: 76.32},
  {country: "Madagascar", male: 64.27, female: 67.30},
  {country: "Malawi", male: 51.51, female: 51.48},
  {country: "Malásia", male: 71.24, female: 75.72},
  {country: "Maldivas", male: 74.64, female: 76.52},
  {country: "Mali", male: 48.89, female: 50.99},
  {country: "Malta", male: 76.34, female: 81.19},
  {country: "Martinica (França)", male: 77.8, female: 84.4},
  {country: "Mauritânia", male: 55.89, female: 59.16},
  {country: "Maurício", male: 69.49, female: 76.19},
  {country: "Mayotte", male: 73.69, female: 81.08},
  {country: "México", male: 73.73, female: 78.63},
  {country: "Moldávia", male: 64.42, female: 72.06},
  {country: "Mongólia", male: 63.40, female: 71.47},
  {country: "Montenegro", male: 71.55, female: 76.47},
  {country: "Marrocos", male: 68.96, female: 73.44},
  {country: "Moçambique", male: 47.56, female: 49.88},
  {country: "Myanmar", male: 62.08, female: 64.98},
  {country: "Namíbia", male: 60.35, female: 61.62},
  {country: "Nepal", male: 66.71, female: 68.04},
  {country: "Holanda", male: 79.4, female: 83.1},
  {country: "Antilhas Holandesas (Holanda)", male: 72.65, female: 79.36},
  {country: "Nova Caledônia (França)", male: 72.31, female: 78.71},
  {country: "Nova Zelândia", male: 79.7, female: 83.3},
  {country: "Nicarágua", male: 69.91, female: 76.12},
  {country: "Níger", male: 52.66, female: 53.55},
  {country: "Nigéria", male: 49.50, female: 51.03},
  {country: "Coreia do Norte", male: 64.80, female: 71.75},
  {country: "Noruega", male: 79.2, female: 83.4},
  {country: "Omã", male: 70.88, female: 74.83},
  {country: "Paquistão", male: 63.78, female: 65.42},
  {country: "Palestina", male: 70.60, female: 73.81},
  {country: "Panamá", male: 72.98, female: 78.21},
  {country: "Papua Nova Guiné", male: 59.49, female: 63.66},
  {country: "Paraguai", male: 69.67, female: 73.90},
  {country: "Peru", male: 70.57, female: 75.90},
  {country: "Filipinas", male: 64.54, female: 71.29},
  {country: "Polônia", male: 71.17, female: 79.85},
  {country: "Portugal", male: 75.32, female: 81.79},
  {country: "Porto Rico (EUA)", male: 74.69, female: 82.67},
  {country: "Catar", male: 78.07, female: 77.29},
  {country: "Romênia", male: 69.57, female: 76.83},
  {country: "Rússia", male: 61.56, female: 74.03},
  {country: "Ruanda", male: 52.70, female: 55.14},
  {country: "Reunião (França)", male: 73.69, female: 81.08},
  {country: "Santa Lúcia", male: 71.42, female: 76.58},
  {country: "São Vicente e Granadinas", male: 69.59, female: 73.80},
  {country: "Samoa", male: 68.62, female: 74.89},
  {country: "Arábia Saudita", male: 72.24, female: 74.41},
  {country: "Senegal", male: 57.19, female: 59.13},
  {country: "Sérvia", male: 71.70, female: 76.34},
  {country: "Serra Leoa", male: 45.65, female: 46.88},
  {country: "Singapura", male: 79.6, female: 85.6},
  {country: "Eslováquia", male: 70.73, female: 78.65},
  {country: "Eslovênia", male: 74.97, female: 81.99},
  {country: "Ilhas Salomão", male: 65.12, female: 67.76},
  {country: "Somália", male: 48.71, female: 51.79},
  {country: "África do Sul", male: 50.13, female: 52.08},
  {country: "Coreia do Sul", male: 78.0, female: 84.6},
  {country: "Espanha", male: 79.4, female: 85.0},
  {country: "Sri Lanka", male: 71.20, female: 77.40},
  {country: "Sudão", male: 58.59, female: 62.01},
  {country: "Suriname", male: 66.42, female: 73.11},
  {country: "Suazilândia", male: 47.56, female: 47.04},
  {country: "Suécia", male: 80.1, female: 83.7},
  {country: "Suíça", male: 80.4, female: 84.7},
  {country: "Síria", male: 73.91, female: 76.85},
  {country: "São Tomé e Príncipe", male: 62.46, female: 65.11},
  {country: "Taiwan", male: 75.25, female: 81.51},
  {country: "Tajiquistão", male: 63.29, female: 69.91},
  {country: "Tanzânia", male: 54.62, female: 56.19},
  {country: "Tailândia", male: 70.17, female: 77.06},
  {country: "Timor-Leste", male: 59.94, female: 61.68},
  {country: "Togo", male: 54.24, female: 57.14},
  {country: "Tonga", male: 69.05, female: 74.70},
  {country: "Trinidad e Tobago", male: 65.80, female: 72.90},
  {country: "Tunísia", male: 72.2, female: 78.6},
  {country: "Turquia", male: 73.70, female: 79.4},
  {country: "Turcomenistão", male: 60.62, female: 68.91},
  {country: "Uganda", male: 51.68, female: 52.73},
  {country: "Ucrânia", male: 61.78, female: 73.54},
  {country: "Emirados Árabes Unidos", male: 75.25, female: 77.04},
  {country: "Reino Unido", male: 77.38, female: 81.68},
  {country: "Estados Unidos", male: 76.5, female: 81.3},
  {country: "Ilhas Virgens Americanas (EUA)", male: 75.89, female: 82.01},
  {country: "Uruguai", male: 72.72, female: 79.85},
  {country: "Uzbequistão", male: 64.33, female: 70.66},
  {country: "Vanuatu", male: 68.20, female: 72.06},
  {country: "Venezuela", male: 70.83, female: 76.78},
  {country: "Vietnã", male: 72.33, female: 76.21},
  {country: "Saara Ocidental", male: 64.27, female: 68.10},
  {country: "Iêmen", male: 62.52, female: 65.36},
  {country: "Zâmbia", male: 46.49, female: 47.26},
  {country: "Zimbábue", male: 47.45, female: 45.43}
];

const FAMOUS_DEATHS = [
  {who:"Anne Frank", age: 15.72},
  {who:"Joan of Arc", age: 19.41},
  {who:"Sid Vicious", age: 21.73},
  {who:"Buddy Holly", age: 22.41},
  {who:"Lee Harvey Oswald", age: 24.10},
  {who:"James Dean", age: 24.64},
  {who:"Tupac Shakur", age: 25.25},
  {who:"Otis Redding", age: 26.25},
  {who:"Kurt Cobain", age: 27.12},
  {who:"Jimi Hendrix", age: 27.81},
  {who:"Jim Morrison", age: 27.57},
  {who:"Emily Bronte", age: 30.39},
  {who:"Sylvia Plath", age: 30.29},
  {who:"Bruce Lee", age: 32.64},
  {who:"Chris Farley", age: 33.84},
  {who:"Andy Kaufman", age: 35.33},
  {who:"Mozart", age: 35.85},
  {who:"Bob Marley", age: 36.26},
  {who:"Marilyn Monroe", age: 36.18},
  {who:"Vincent van Gogh", age: 37.33},
  {who:"Che Guevara", age: 39.32},
  {who:"Martin Luther King", age: 39.22},
  {who:"Dylan Thomas", age: 39.04},
  {who:"John Lennon", age: 40.16},
  {who:"Jane Austen", age: 41.59},
  {who:"Alan Turing", age: 41.95},
  {who:"Elvis Presley", age: 42.60},
  {who:"Freddie Mercury", age: 45.22},
  {who:"Andre 'the Giant'", age: 46.69},
  {who:"Douglas Adams", age: 49.17},
  {who:"Steve McQueen", age: 50.63},
  {who:"Napoleon Bonaparte", age: 51.72},
  {who:"Moliere", age: 51.09},
  {who:"Shakespeare", age: 52.00},
  {who:"Jim Henson", age: 53.64},
  {who:"John von Neumann", age: 53.12},
  {who:"Babe Ruth", age: 53.52},
  {who:"Emily Dickinson", age: 55.43},
  {who:"Adolf Hitler", age: 56.02},
  {who:"Abraham Lincoln", age: 56.17},
  {who:"Ernest Hemingway", age: 61.95},
  {who:"Carl Sagan", age: 62.11},
  {who:"C. S. Lewis", age: 64.98},
  {who:"Bach", age: 65.35},
  {who:"Walt Disney", age: 65.03},
  {who:"Leonardo da Vinci", age: 67.04},
  {who:"Richard Feynman", age: 69.77},
  {who:"Stanley Kubrick", age: 70.61},
  {who:"Isaac Asimov", age: 72.26},
  {who:"Charles Darwin", age: 73.18},
  {who:"Mark Twain", age: 74.39},
  {who:"Fred 'Mister' Rogers", age: 74.94},
  {who:"Albert Einstein", age: 76.09},
  {who:"Sigmund Freud", age: 83.38},
  {who:"Isaac Newton", age: 84.23},
  {who:"Charlie Chaplin", age: 88.69}
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dom', short: 'D' },
  { value: 1, label: 'Seg', short: 'S' },
  { value: 2, label: 'Ter', short: 'T' },
  { value: 3, label: 'Qua', short: 'Q' },
  { value: 4, label: 'Qui', short: 'Q' },
  { value: 5, label: 'Sex', short: 'S' },
  { value: 6, label: 'Sáb', short: 'S' }
];

// Interfaces para tipagem
interface LifeExpectancyData {
  country: string;
  male: number;
  female: number;
}

interface FamousDeathData {
  who: string;
  age: number;
}

interface FormData {
  birthday: string;
  gender: 'male' | 'female';
  country: number;
  eduStart1: number;
  eduDuration1: number;
  eduStart2: number;
  eduDuration2: number;
  eduStart3: number;
  eduDuration3: number;
  careerStart: number;
  careerDuration: number;
  retirementAge: number;
  autoUpdate: boolean;
}

interface Milestone {
  id: number;
  date: string;
  title: string;
  icon: string;
  color: string;
}

interface NewMilestone {
  date: string;
  title: string;
}

interface WeekCalculationResult {
  idade: number;
  diasTotais: string;
  semanasCompletas: number;
  diasExtras: string;
}

const MementoMoriPage = () => {
  // Função para carregar dados do localStorage
  const loadFormData = () => {
    try {
      const savedData = localStorage.getItem('lifeGridFormData');
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
    }
    // Dados padrão se não houver dados salvos
    return {
      birthday: '1990-01-01',
      gender: 'female',
      country: 0,
      eduStart1: 5,
      eduDuration1: 9,
      eduStart2: 14,
      eduDuration2: 4,
      eduStart3: 18,
      eduDuration3: 4,
      careerStart: 22,
      careerDuration: 38,
      retirementAge: 60,
      autoUpdate: true
    };
  };

  const [formData, setFormData] = useState(loadFormData);

  // Função para salvar dados no localStorage
  const saveFormData = (newFormData: FormData) => {
    try {
      localStorage.setItem('lifeGridFormData', JSON.stringify(newFormData));
    } catch (error) {
      console.error('Erro ao salvar dados no localStorage:', error);
    }
  };

  // Função wrapper para setFormData que também salva no localStorage
  const updateFormData = (newFormData: FormData) => {
    setFormData(newFormData);
    saveFormData(newFormData);
  };

  // Função para carregar marcos do localStorage
  const loadMilestones = () => {
    try {
      const savedMilestones = localStorage.getItem('lifeGridMilestones');
      if (savedMilestones) {
        return JSON.parse(savedMilestones);
      }
    } catch (error) {
      console.error('Erro ao carregar marcos do localStorage:', error);
    }
    // Marcos padrão se não houver dados salvos
    return [
      { id: 1, date: '15/06/2015', title: 'Casamento', icon: 'Heart', color: '#ec4899' },
      { id: 2, date: '22/03/2018', title: 'Primeiro filho', icon: 'Baby', color: '#f59e0b' },
      { id: 3, date: '10/12/2025', title: 'Casa própria', icon: 'Home', color: '#10b981' }
    ];
  };

  const [milestones, setMilestones] = useState(loadMilestones);

  // Função para salvar marcos no localStorage
  const saveMilestones = (newMilestones: Milestone[]) => {
    try {
      localStorage.setItem('lifeGridMilestones', JSON.stringify(newMilestones));
    } catch (error) {
      console.error('Erro ao salvar marcos no localStorage:', error);
    }
  };

  // Função wrapper para setMilestones que também salva no localStorage
  const updateMilestones = (newMilestones: Milestone[]) => {
    setMilestones(newMilestones);
    saveMilestones(newMilestones);
  };



  const [currentAge, setCurrentAge] = useState(0);
  const [hoveredAge, setHoveredAge] = useState<number | null>(null);
  const [selectedFamousDeath, setSelectedFamousDeath] = useState<FamousDeathData | null>(null);
  const [activeTab, setActiveTab] = useState('grid');
  const [printMode, setPrintMode] = useState(false);
  const [newMilestone, setNewMilestone] = useState<NewMilestone>({ date: '', title: '' });

  useEffect(() => {
    calculateAge();
  }, [formData.birthday]);

  useEffect(() => {
    if (formData.autoUpdate) {
      autoAdjustAges();
    }
  }, [formData.eduDuration1, formData.eduDuration2, formData.eduDuration3, formData.careerDuration]);

  const calculateAge = () => {
    const birth = new Date(formData.birthday);
    const today = new Date();
    const age = (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    setCurrentAge(age);
  };

  // Função para calcular a semana baseada na data de nascimento
  const calculateWeekFromDate = (milestoneDate: string) => {
    const [day, month, year] = milestoneDate.split('/').map(Number);
    const milestoneDateObj = new Date(year, month - 1, day);
    const birthDate = new Date(formData.birthday);
    
    // Calcula a diferença em milissegundos
    const diffInMs = milestoneDateObj.getTime() - birthDate.getTime();
    
    // Converte para semanas (7 dias * 24 horas * 60 minutos * 60 segundos * 1000 ms)
    const diffInWeeks = Math.floor(diffInMs / (7 * 24 * 60 * 60 * 1000));
    
    return Math.max(0, diffInWeeks); // Retorna 0 se a data for antes do nascimento
  };

  // Função para calcular a idade na data do milestone
  const calculateAgeAtDate = (milestoneDate: string) => {
    const [day, month, year] = milestoneDate.split('/').map(Number);
    const milestoneDateObj = new Date(year, month - 1, day);
    const birthDate = new Date(formData.birthday);
    
    let age = milestoneDateObj.getFullYear() - birthDate.getFullYear();
    const monthDiff = milestoneDateObj.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && milestoneDateObj.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return Math.max(0, age);
  };

  const autoAdjustAges = () => {
    const edu1End = formData.eduStart1 + formData.eduDuration1;
    const edu2End = edu1End + formData.eduDuration2;
    const edu3End = edu2End + formData.eduDuration3;
    const careerEnd = edu3End + formData.careerDuration;

    const updatedData = {
      ...formData,
      eduStart2: edu1End,
      eduStart3: edu2End,
      careerStart: edu3End,
      retirementAge: careerEnd
    };
    updateFormData(updatedData);
  };

  const getLifeExpectancy = () => {
    const countryData = LIFE_EXPECTANCY[formData.country];
    return formData.gender === 'female' ? countryData.female : countryData.male;
  };

  const addMilestone = () => {
    if (newMilestone.date && newMilestone.title) {
      // Converte a data do formato ISO (YYYY-MM-DD) para DD/MM/YYYY
      const dateObj = new Date(newMilestone.date);
      const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
      
      updateMilestones([...milestones, {
        id: Date.now(),
        date: formattedDate,
        title: newMilestone.title,
        icon: 'TrendingUp',
        color: '#6366f1'
      }]);
      setNewMilestone({ date: '', title: '' });
    }
  };

  const calcularSemanasVividas = (idadeAnos: number): WeekCalculationResult => {
    // média de dias por ano (considerando anos bissextos)
    const diasPorAno = 365.25;

    // dias totais vividos
    const diasTotais = (idadeAnos -1) * diasPorAno;

    // semanas completas e resto em dias
    const semanas = Math.floor(diasTotais / 7);
    const diasRestantes = (diasTotais % 7).toFixed(2);
    // console.log('diasTotais', diasTotais);
    return {
      idade: idadeAnos,
      diasTotais: diasTotais.toFixed(2),
      semanasCompletas: semanas,
      diasExtras: diasRestantes
    };
  };

  const getWeekClass = (weekIndex: number) => {
    const year = Math.floor(weekIndex / 52) + 1;
    const classes = ['week'];

    if (Math.abs(year - currentAge) < 0.5) {
      classes.push('current-age');
    }

    // Check if this week corresponds to a selected famous death
    if (selectedFamousDeath) {
      const semanasVividas = calcularSemanasVividas(selectedFamousDeath.age);
      if (weekIndex === semanasVividas.semanasCompletas) {
        classes.push('famous-death-week');
      }
    }

    const lifeExp = getLifeExpectancy();
    if (year >= lifeExp) {
      classes.push('beyond-expectancy');
    }

    if (year >= formData.eduStart1 && year < formData.eduStart1 + formData.eduDuration1) {
      classes.push('edu1');
    } else if (year >= formData.eduStart2 && year < formData.eduStart2 + formData.eduDuration2) {
      classes.push('edu2');
    } else if (year >= formData.eduStart3 && year < formData.eduStart3 + formData.eduDuration3) {
      classes.push('edu3');
    }

    if (year >= formData.careerStart && year < formData.retirementAge) {
      classes.push('career');
    }

    if (year >= formData.retirementAge) {
      classes.push('retirement');
    }

    if (year < formData.eduStart1) {
      classes.push('early-years');
    }

    return classes.join(' ');
  };

  const renderWeeksGrid = () => {
    const weeks = [];
    // console.log('currentAge', currentAge);
    const currentWeekData = calcularSemanasVividas(currentAge);
    const currentWeekIndex = currentWeekData.semanasCompletas; // Calcula a semana atual baseada na idade
    
    if (printMode) {
      return renderPrintGrid();
    }
    
    // Agrupa os anos em grupos de 10
    const yearGroups = [];
    for (let yearGroup = 0; yearGroup < 90; yearGroup += 10) {
      const groupYears = [];
      
      for (let year = yearGroup; year < Math.min(yearGroup + 10, 90); year++) {
        // Agrupa as semanas em grupos de 4
        const weekGroups = [];
        for (let week = 0; week < 52; week += 4) {
          const groupWeeks = [];
          
          for (let w = 0; w < 4 && (week + w) < 52; w++) {
            const weekIndex = year * 52 + (week + w);
            
            // Verifica se há um milestone nesta semana específica
            const milestoneInWeek = milestones.find((m: Milestone) => {
              const milestoneWeek = calculateWeekFromDate(m.date);
              return milestoneWeek === weekIndex;
            });
            
            // Verifica se é a semana atual
            const isCurrentWeek = weekIndex === currentWeekIndex;
            
            groupWeeks.push(
              <HoverCard key={weekIndex}>
                <HoverCardTrigger asChild>
                  <div
                    className={milestoneInWeek ? 'week milestone-week' : getWeekClass(weekIndex)}
                    style={milestoneInWeek ? { 
                      backgroundColor: milestoneInWeek.color,
                      position: 'relative'
                    } : {}}
                    onMouseEnter={() => setHoveredAge(year + 1)}
                    onMouseLeave={() => setHoveredAge(null)}
                  >
                    {milestoneInWeek && (
                      <div className="milestone-star">⭐</div>
                    )}
                    {isCurrentWeek && !milestoneInWeek && (
                      <div className="current-week-heart">
                        <Heart className="w-3 h-3 text-red-500" fill="currentColor" />
                      </div>
                    )}
                  </div>
                </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <Card className="border-0 shadow-none p-0">
                  <CardContent className="p-0">
                    {milestoneInWeek ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{backgroundColor: milestoneInWeek.color}}
                          ></div>
                          <div>
                            <h4 className="font-semibold text-lg">{milestoneInWeek.title}</h4>
                            <p className="text-sm text-slate-600">{milestoneInWeek.date}</p>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg">
                          <div className="text-sm space-y-1">
                            <div><strong>Idade:</strong> {calculateAgeAtDate(milestoneInWeek.date)} anos</div>
                            <div><strong>Semana:</strong> {weekIndex + 1} de {Math.floor(getLifeExpectancy() * 52)}</div>
                            <div><strong>Ano:</strong> {year + 1}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-lg">Ano {year + 1}</h4>
                          <p className="text-sm text-slate-600">Semana {week + 1}</p>
                        </div>
                        <div className="p-3 rounded-lg">
                          <div className="text-sm space-y-1">
                            <div><strong>Semana total:</strong> {weekIndex + 1}</div>
                            <div><strong>Idade aproximada:</strong> {year + 1} anos</div>
                            <div><strong>Fase da vida:</strong> {
                              year < formData.eduStart1 ? 'Infância' :
                              year >= formData.eduStart1 && year < formData.eduStart1 + formData.eduDuration1 ? 'Educação Básica' :
                              year >= formData.eduStart2 && year < formData.eduStart2 + formData.eduDuration2 ? 'Ensino Médio' :
                              year >= formData.eduStart3 && year < formData.eduStart3 + formData.eduDuration3 ? 'Ensino Superior' :
                              year >= formData.careerStart && year < formData.retirementAge ? 'Carreira' :
                              year >= formData.retirementAge ? 'Aposentadoria' : 'Infância'
                            }</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </HoverCardContent>
            </HoverCard>
            );
          }
          
          weekGroups.push(
            <div key={week} className="week-group">
              {groupWeeks}
            </div>
          );
        }
        
        groupYears.push(
          <div key={year} className="year-row">
            <span className="year-label">{year < 9 ? '0' + (year + 1) : year + 1}</span>
            <div className="weeks-container">{weekGroups}</div>
          </div>
        );
      }
      
      yearGroups.push(
        <div key={yearGroup} className="year-group">
          {groupYears}
        </div>
      );
    }
    
    return yearGroups;
  };

  const renderPrintGrid = () => {
    const currentWeekData = calcularSemanasVividas(currentAge);
    const currentWeekIndex = currentWeekData.semanasCompletas;
    const totalWeeks = 90 * 52; // 90 anos * 52 semanas
    
    return (
      <div className="print-grid-container">
        <div className="print-title">VIDA EM SEMANAS</div>
        
        <div className="print-grid">
          {Array.from({ length: totalWeeks }, (_, weekIndex) => {
            const year = Math.floor(weekIndex / 52);
            const week = weekIndex % 52;
            const isLived = weekIndex < currentWeekIndex;
            const isCurrentWeek = weekIndex === currentWeekIndex;
            
            // Usa a mesma lógica de cores do grid original
            const weekClass = getWeekClass(weekIndex);
            const isMilestone = milestones.find((m: Milestone) => {
              const milestoneWeek = calculateWeekFromDate(m.date);
              return milestoneWeek === weekIndex;
            });
            
            return (
              <div
                key={weekIndex}
                className={`print-week ${isLived ? 'lived' : 'left'} ${isCurrentWeek ? 'current' : ''} ${weekClass}`}
                style={{
                  gridColumn: week + 1,
                  gridRow: year + 1,
                  ...(isMilestone && { backgroundColor: isMilestone.color })
                }}
              />
            );
          })}
        </div>
        
        {/* <div className="print-labels">
          <div className="print-label-left">
            <div className="label-text">WEEKS LIVED</div>
            <div className="label-arrow">→</div>
          </div>
          <div className="print-label-left">
            <div className="label-text">WEEKS LEFT</div>
            <div className="label-arrow">→</div>
          </div>
        </div> */}
        
        {/* <div className="print-axis-labels">
          <div className="axis-label-top">52 WEEKS</div>
          <div className="axis-label-right">YOUR LIFE</div>
        </div> */}
        
        {/* <div className="print-quote">
          "IT'S NOT THAT WE HAVE A SHORT TIME TO LIVE, BUT THAT WE WASTE A LOT OF IT. - SENECA"
        </div> */}
        
        {/* <div className="print-info">
          <div className="info-item">
            <strong>Idade atual:</strong> {currentAge.toFixed(1)} anos
          </div>
          <div className="info-item">
            <strong>Semanas vividas:</strong> {currentWeekIndex + 1}
          </div>
          <div className="info-item">
            <strong>Expectativa de vida:</strong> {getLifeExpectancy().toFixed(1)} anos
          </div>
        </div> */}
      </div>
    );
  };

  const calculateStats = () => {
    const lifeExp = getLifeExpectancy();
    const weeksLived = Math.floor(currentAge * 52);
    const weeksRemaining = Math.floor((lifeExp - currentAge) * 52);
    const percentLived = ((currentAge / lifeExp) * 100).toFixed(1);
    
    const careerYears = formData.retirementAge - formData.careerStart;
    const careerWeeks = careerYears * 52;
    const retirementYears = lifeExp - formData.retirementAge;
    const retirementWeeks = Math.floor(retirementYears * 52);

    return {
      weeksLived,
      weeksRemaining,
      percentLived,
      careerWeeks,
      retirementWeeks,
      totalWeeks: Math.floor(lifeExp * 52)
    };
  };

  const stats = calculateStats();

  const exportData = () => {
    const data = {
      formData,
      milestones,
      stats
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minha-vida-em-semanas.json';
    a.click();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Navigation />

        <div className="flex justify-between ">
          <div className="mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="grid">Vida em Semanas</TabsTrigger>
                <TabsTrigger value="stats">Estatísticas</TabsTrigger>
                <TabsTrigger value="milestones">Marcos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        {/* <div className="text-center space-y-2 py-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Sua Vida em Semanas
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Cada quadrado representa uma semana. Com 90 anos, são 4.680 semanas. 
            Como você vai aproveitá-las?
          </p>
        </div> */}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          <TabsContent value="grid" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Vida em Semanas</CardTitle>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <User className="w-4 h-4 mr-2" />
                          Sobre Você
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Sobre Você
                          </h4>
                          <div>
                            <Label htmlFor="birthday">Data de Nascimento</Label>
                            <Input
                              id="birthday"
                              type="date"
                              value={formData.birthday}
                              onChange={(e) => updateFormData({...formData, birthday: e.target.value})}
                            />
                          </div>

                          <div>
                            <Label>Gênero</Label>
                            <RadioGroup 
                              value={formData.gender}
                              onValueChange={(value) => updateFormData({...formData, gender: value})}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="female" id="female" />
                                <Label htmlFor="female">Feminino</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="male" id="male" />
                                <Label htmlFor="male">Masculino</Label>
                              </div>
                            </RadioGroup>
                          </div>

                          <div>
                            <Label htmlFor="country">País</Label>
                            <Select 
                              value={formData.country.toString()}
                              onValueChange={(value) => updateFormData({...formData, country: parseInt(value)})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {LIFE_EXPECTANCY.map((country, idx) => (
                                  <SelectItem key={idx} value={idx.toString()}>
                                    {country.country}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500 mt-1">
                              Expectativa de vida: {getLifeExpectancy().toFixed(1)} anos
                            </p>
                          </div>

                          <Alert className="">
                            <AlertDescription>
                              <div className="space-y-1">
                                <div>Idade atual: <strong>{currentAge.toFixed(1)} anos</strong></div>
                                <div>Semanas vividas: <strong>{stats.weeksLived}</strong></div>
                                <div>Progresso: <strong>{stats.percentLived}%</strong></div>
                              </div>
                            </AlertDescription>
                          </Alert>

                          {/* <Button onClick={exportData} className="w-full" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Exportar Dados
                          </Button> */}
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Fases da Vida
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            Fases da Vida
                          </h4>
                          <div className="flex items-center space-x-2 mb-4">
                            <Checkbox
                              id="autoUpdate"
                              checked={formData.autoUpdate}
                              onCheckedChange={(checked) => updateFormData({...formData, autoUpdate: checked})}
                            />
                            <Label htmlFor="autoUpdate">Calcular automaticamente</Label>
                          </div>

                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Início Educação Básica</Label>
                                <Input
                                  type="number"
                                  value={formData.eduStart1}
                                  onChange={(e) => updateFormData({...formData, eduStart1: parseInt(e.target.value)})}
                                  disabled={formData.autoUpdate}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Duração (anos)</Label>
                                <Input
                                  type="number"
                                  value={formData.eduDuration1}
                                  onChange={(e) => updateFormData({...formData, eduDuration1: parseInt(e.target.value)})}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Ensino Médio</Label>
                                <Input
                                  type="number"
                                  value={formData.eduStart2}
                                  onChange={(e) => updateFormData({...formData, eduStart2: parseInt(e.target.value)})}
                                  disabled={formData.autoUpdate}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Duração (anos)</Label>
                                <Input
                                  type="number"
                                  value={formData.eduDuration2}
                                  onChange={(e) => updateFormData({...formData, eduDuration2: parseInt(e.target.value)})}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Ensino Superior</Label>
                                <Input
                                  type="number"
                                  value={formData.eduStart3}
                                  onChange={(e) => updateFormData({...formData, eduStart3: parseInt(e.target.value)})}
                                  disabled={formData.autoUpdate}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Duração (anos)</Label>
                                <Input
                                  type="number"
                                  value={formData.eduDuration3}
                                  onChange={(e) => updateFormData({...formData, eduDuration3: parseInt(e.target.value)})}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Início Carreira</Label>
                                <Input
                                  type="number"
                                  value={formData.careerStart}
                                  onChange={(e) => updateFormData({...formData, careerStart: parseInt(e.target.value)})}
                                  disabled={formData.autoUpdate}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Duração (anos)</Label>
                                <Input
                                  type="number"
                                  value={formData.careerDuration}
                                  onChange={(e) => updateFormData({...formData, careerDuration: parseInt(e.target.value)})}
                                />
                              </div>
                            </div>

                            <div>
                              <Label>Idade de Aposentadoria</Label>
                              <Input
                                type="number"
                                value={formData.retirementAge}
                                onChange={(e) => updateFormData({...formData, retirementAge: parseInt(e.target.value)})}
                                disabled={formData.autoUpdate}
                              />
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPrintMode(!printMode)}
                    >
                      {printMode ? <Monitor className='w-4 h-4 mr-2' /> : <Printer className="w-4 h-4 mr-2" />} {printMode ? 'Grid Interativo' : 'Versão Impressão'}
                    </Button>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Skull className="w-4 h-4 mr-2" />
                          Mortes Famosas
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Skull className="w-4 h-4" />
                            Mortes Famosas
                          </h4>
                          <div className="space-y-1 max-h-64 overflow-y-auto">
                            {FAMOUS_DEATHS.map((death: FamousDeathData, idx: number) => (
                              <div
                                key={idx}
                                className={`text-sm p-2 rounded cursor-pointer transition ${
                                  selectedFamousDeath?.who === death.who ? 'border' : ''
                                }`}
                                onMouseEnter={() => setHoveredAge(death.age)}
                                onMouseLeave={() => setHoveredAge(null)}
                                onClick={() => setSelectedFamousDeath(selectedFamousDeath?.who === death.who ? null : death)}
                              >
                                {death.who} ({Math.floor(death.age)} anos)
                                {selectedFamousDeath?.who === death.who && (
                                  <span className="ml-2 text-red-600">✓</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs mt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded shadow-lg" style={{backgroundColor: '#047857'}}></div>
                    <span>Idade Atual</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{backgroundColor: '#047857', opacity: 0.4}}></div>
                    <span>Expectativa</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{backgroundColor: 'rgb(212, 236, 225)'}}></div>
                    <span>Infância</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{backgroundColor: 'rgb(181, 226, 203)'}}></div>
                    <span>Ed. Básica</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{backgroundColor: '#a7f3d0'}}></div>
                    <span>Ens. Médio</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{backgroundColor: '#6ee7b7'}}></div>
                    <span>Superior</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{backgroundColor: '#10b981'}}></div>
                    <span>Carreira</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{backgroundColor: '#047857'}}></div>
                    <span>Aposentadoria</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* <div className="mb-2 text-sm font-medium text-slate-700 bg-yellow-50 p-2 rounded">
                  📍 Visualizando: Ano {Math.floor(hoveredAge) || 'N/A'}
                </div> */}
                <div className="grid-container">
                  <div className="y-axis-label">
                    <div className="y-axis-text">Idade em Anos {`-->`} </div>
                  </div>
                  <div className="grid-content">
                    <div className="x-axis-label">
                      <div className="x-axis-text">Semana do seu ano de nascimento (começa no seu aniversário, não em 1º de janeiro) {`-->`}</div>
                    </div>
                    <div className="weeks-grid">
                      {renderWeeksGrid()}
                    </div>
                    
                    {printMode && (
                      <div className="print-controls">
                        <Button 
                          onClick={() => window.print()}
                          className=""
                        >
                          <Printer className="w-4 h-4 mr-2" /> Imprimir Quadro
                        </Button>
                        <Button 
                          onClick={() => setPrintMode(false)}
                          variant="outline"
                        >
                          ← Voltar ao Grid Interativo
                        </Button>
                      </div>
                    )}
                    
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-300 to-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-700">⏱️ Tempo Vivido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-blue-900">{stats.weeksLived}</div>
                    <div className="text-sm text-blue-600">semanas vividas</div>
                    <div className="text-xs text-blue-500">Isso são {(stats.weeksLived / 52).toFixed(1)} anos de experiências!</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-300 to-green-200">
                <CardHeader>
                  <CardTitle className="text-green-700">🎯 Tempo Restante</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-green-900">{stats.weeksRemaining}</div>
                    <div className="text-sm text-green-600">semanas pela frente</div>
                    <div className="text-xs text-green-500">Aproximadamente {(stats.weeksRemaining / 52).toFixed(1)} anos de possibilidades!</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-200 to-purple-100">
                <CardHeader>
                  <CardTitle className="text-purple-700">📊 Progresso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-purple-900">{stats.percentLived}%</div>
                    <div className="text-sm text-purple-600">da vida vivida</div>
                    <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{width: `${stats.percentLived}%`}}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-300 to-orange-200">
                <CardHeader>
                  <CardTitle className="text-orange-700">💼 Carreira</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-orange-900">{stats.careerWeeks}</div>
                    <div className="text-sm text-orange-600">semanas de trabalho</div>
                    <div className="text-xs text-orange-500">
                      {(stats.careerWeeks / 52).toFixed(0)} anos de carreira planejada
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-500 to-cyan-200">
                <CardHeader>
                  <CardTitle className="text-cyan-700">🏖️ Aposentadoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-cyan-900">{stats.retirementWeeks}</div>
                    <div className="text-sm text-cyan-600">semanas de descanso</div>
                    <div className="text-xs text-cyan-500">
                      {(stats.retirementWeeks / 52).toFixed(1)} anos para aproveitar!
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-400 to-pink-200">
                <CardHeader>
                  <CardTitle className="text-pink-700">🌟 Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-pink-900">{stats.totalWeeks}</div>
                    <div className="text-sm text-pink-600">semanas totais estimadas</div>
                    <div className="text-xs text-pink-500">
                      Cada uma é única e insubstituível
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>💡 Insights Personalizados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    <strong>Finais de semana restantes:</strong> Aproximadamente {Math.floor(stats.weeksRemaining / 7 * 2)} dias 
                    para relaxar e fazer o que ama!
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertDescription>
                    <strong>Férias potenciais:</strong> Se você tirar 4 semanas por ano, terá cerca de {Math.floor(stats.weeksRemaining / 52 * 4)} semanas 
                    de férias pela frente.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertDescription>
                    <strong>Tempo com família:</strong> Se você passa 10 horas por semana com família, terá {Math.floor(stats.weeksRemaining * 10)} horas 
                    restantes para criar memórias incríveis.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Marco Importante</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Data</Label>
                      <Input
                        type="date"
                        value={newMilestone.date}
                        onChange={(e) => setNewMilestone({...newMilestone, date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Descrição do Marco</Label>
                      <Input
                        type="text"
                        value={newMilestone.title}
                        onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                        placeholder="Ex: Viagem para Europa"
                      />
                    </div>
                    <Button onClick={addMilestone} className="w-full">
                      Adicionar Marco
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Seus Marcos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {milestones.map((milestone: Milestone) => (
                      <div
                        key={milestone.id}
                        className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-800 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{backgroundColor: milestone.color}}
                          ></div>
                          <div>
                            <div className="font-medium">{milestone.title}</div>
                            <div className="text-xs text-slate-500">{milestone.date} ({calculateAgeAtDate(milestone.date)} anos)</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateMilestones(milestones.filter((m: Milestone) => m.id !== milestone.id))}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    {milestones.length === 0 && (
                      <div className="text-center text-slate-400 py-8">
                        Nenhum marco adicionado ainda
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          
        </Tabs>
      </div>

      <style>{`
        .grid-container {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        
        .y-axis-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
        
        .y-axis-text {
          font-size: 12px;
          font-weight: 500;
          margin-top: 25px;
          text-align: center;
        }
        
        .grid-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .weeks-grid {
          display: flex;
          flex-direction: column;
          gap: 2px;
          
          border-radius: 8px;
          
          overflow-y: auto;
          width: 100%;
        }
        
        .x-axis-label {
          display: flex;
          align-items: center;
        }
        
        .x-axis-text {
          font-size: 12px;
          font-weight: 500;
          text-align: center;
        }
        
        .year-row {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        
        .year-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 5px;
          position: relative;
        }
        
        
        
        .year-group:last-child::after {
          display: none;
        }
        
        .year-label {
          font-size: 10px;
          color: #64748b;
          // width: 25px;
          text-align: right;
          flex-shrink: 0;
          font-weight: 500;
        }
        
        .weeks-container {
          display: flex;
          gap: 1px;
          flex-wrap: wrap;
          flex: 1;
        }
        
        .week-group {
          display: flex;
          gap: 1px;
          margin-right: 7px;
          position: relative;
        }
        
        .week-group::after {
          content: '';
          position: absolute;
          right: -2px;
          top: 0;
          bottom: 0;
          width: 1px;
          background: rgba(0, 0, 0, 0.1);
        }
        
        .week-group:last-child::after {
          display: none;
        }
        
        .milestone-marker {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: 12px;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        
        .milestone-marker:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .milestone-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        
        .milestone-text {
          font-size: 11px;
          font-weight: 600;
          color: #374151;
        }
        
        .week {
          width: 20px;
          height: 20px;
          background: #f1f5f9;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .week:hover {
          transform: scale(1.1);
          z-index: 10;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        
        .week.current-age {
          background: #047857;
          box-shadow: 0 0 8px rgba(4, 120, 87, 0.4);
          animation: pulse 2s infinite;
        }
        
        .week.famous-death-week {
          background: #dc2626;
          box-shadow: 0 0 8px rgba(220, 38, 38, 0.4);
          animation: pulse 2s infinite;
          position: relative;
        }
        
        .week.famous-death-week::after {
          content: '💀';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 10px;
          z-index: 1;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        .week.beyond-expectancy {
          background: #ecfdf5;
          opacity: 0.4;
        }
        
        .week.milestone-week {
          border: 2px solid #fff;
          box-shadow: 0 0 8px rgba(0,0,0,0.3);
          position: relative;
        }
        
        .milestone-star {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 12px;
          pointer-events: none;
          text-shadow: 0 0 4px rgba(0,0,0,0.5);
        }
        
        .current-week-heart {
          position: relative;
          display: table;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          animation: heartbeat 1.5s ease-in-out infinite;
        }
        
        @keyframes heartbeat {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
        
        .week.early-years {
          background:rgb(212, 236, 225);
        }
        
        .week.edu1 {
          background:rgb(181, 226, 203);
        }
        
        .week.edu2 {
          background: #a7f3d0;
        }
        
        .week.edu3 {
          background: #6ee7b7;
        }
        
        .week.career {
          background: #10b981;
        }
        
        .week.retirement {
          background: #047857;
        }
        
        /* Print Mode Styles */
        .print-grid-container {
          width: 100%;
          
          margin: 0 auto;
          padding: 20px;
          background: white;
          position: relative;
        }
        
        .print-title {
          font-family: 'Arial Black', Arial, sans-serif;
          font-size: 32px;
          font-weight: 900;
          text-align: center;
          
          letter-spacing: 2px;
          color: #000;
        }
        
        .print-grid {
          display: grid;
          grid-template-columns: repeat(52, 1fr);
          grid-template-rows: repeat(90, 1fr);
          gap: 1px;
          width: 100%;
          height: 650px;
          
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .print-week {
          background: #f8f9fa;
          border: 0.5px solid #e9ecef;
          transition: none;
        }
        
        .print-week.lived {
          background: #000;
          border: 0.5px solid #000;
        }
        
        .print-week.left {
          background: #f8f9fa;
          border: 0.5px solid #e9ecef;
        }
        
        .print-week.current {
          background: #333;
          border: 1px solid #000;
        }
        
        /* Aplicar cores das fases da vida */
        .print-week.early-years {
          background: rgb(212, 236, 225) !important;
        }
        
        .print-week.edu1 {
          background: rgb(181, 226, 203) !important;
        }
        
        .print-week.edu2 {
          background: #a7f3d0 !important;
        }
        
        .print-week.edu3 {
          background: #6ee7b7 !important;
        }
        
        .print-week.career {
          background: #10b981 !important;
        }
        
        .print-week.retirement {
          background: #047857 !important;
        }
        
        .print-week.beyond-expectancy {
          background:rgb(172, 188, 181) !important;
          opacity: 0.4;
        }
        
        .print-labels {
          position: absolute;
          left: -120px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .print-label-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .label-text {
          font-family: 'Arial Black', Arial, sans-serif;
          font-size: 14px;
          font-weight: 900;
          color: #000;
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
        
        .label-arrow {
          font-size: 20px;
          color: #000;
          font-weight: bold;
        }
        
        .print-axis-labels {
          position: absolute;
          top: -60px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .axis-label-top {
          font-family: 'Arial Black', Arial, sans-serif;
          font-size: 16px;
          font-weight: 900;
          color: #000;
          margin-left: 50%;
          transform: translateX(-50%);
        }
        
        .axis-label-right {
          font-family: 'Arial Black', Arial, sans-serif;
          font-size: 16px;
          font-weight: 900;
          color: #000;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          position: absolute;
          right: -60px;
          top: 50%;
          transform: translateY(-50%);
        }
        
        .print-quote {
          font-family: 'Times New Roman', serif;
          font-size: 12px;
          font-style: italic;
          text-align: center;
          margin-top: 30px;
          color: #666;
          line-height: 1.4;
        }
        
        .print-info {
          display: flex;
          justify-content: space-around;
          margin-top: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        
        .info-item {
          font-size: 12px;
          color: #495057;
          text-align: center;
        }
        
        .info-item strong {
          color: #000;
          font-weight: 600;
        }
        
        .print-controls {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 20px;
          padding: 20px;
          
          border-radius: 8px;
        }
        
        /* Print Media Queries */
        @media print {
          body * {
            visibility: hidden;
          }
          
          .print-grid-container,
          .print-grid-container * {
            visibility: visible;
          }
          
          .print-grid-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 15px;
            box-shadow: none;
            border: none;
          }
          
          .print-controls {
            display: none;
          }
          
          .print-grid {
            height: 70vh;
            max-height: 500px;
          }
          
          .print-title {
            font-size: 24px;
            margin-bottom: 20px;
          }
          
          .print-labels {
            left: -100px;
          }
          
          .axis-label-right {
            right: -50px;
          }
        }
        
        @media print and (orientation: landscape) {
          .print-grid {
            height: 60vh;
            max-height: 400px;
          }
        }
        
        @media print and (orientation: portrait) {
          .print-grid {
            height: 50vh;
            max-height: 350px;
          }
        }
      `}</style>
    </div>
  );
};

export default MementoMoriPage;