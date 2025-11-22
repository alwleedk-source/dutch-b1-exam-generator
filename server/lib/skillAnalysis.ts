/**
 * NT2 Reading Skills Analysis
 * Analyzes student performance across 5 core reading skills
 */

export type SkillType = 'hoofdgedachte' | 'zoeken' | 'volgorde' | 'conclusie' | 'woordenschat';

export interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  skillType: SkillType;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
  evidence?: string;
}

export interface SkillPerformance {
  skillType: SkillType;
  skillName: string;
  total: number;
  correct: number;
  percentage: number;
  level: 'excellent' | 'good' | 'needs_improvement' | 'weak';
}

export interface SkillAnalysis {
  overall: {
    totalQuestions: number;
    correctAnswers: number;
    percentage: number;
    staatsexamenScore: number;
  };
  bySkill: SkillPerformance[];
  strengths: SkillType[];
  weaknesses: SkillType[];
  recommendations: string[];
}

/**
 * Get skill name in Dutch
 */
export function getSkillName(skillType: SkillType): string {
  const names: Record<SkillType, string> = {
    hoofdgedachte: 'Hoofdgedachte',
    zoeken: 'Zoeken',
    volgorde: 'Volgorde',
    conclusie: 'Conclusie',
    woordenschat: 'Woordenschat',
  };
  return names[skillType];
}

/**
 * Determine performance level based on percentage
 */
export function getPerformanceLevel(percentage: number): 'excellent' | 'good' | 'needs_improvement' | 'weak' {
  if (percentage >= 80) return 'excellent';
  if (percentage >= 65) return 'good';
  if (percentage >= 50) return 'needs_improvement';
  return 'weak';
}

/**
 * Analyze exam performance by skill type
 */
export function analyzeSkillPerformance(
  questions: Question[],
  userAnswers: number[]
): SkillAnalysis {
  // Group questions by skill type
  const skillGroups = new Map<SkillType, { correct: number; total: number }>();
  
  questions.forEach((q, index) => {
    const skillType = q.skillType;
    if (!skillGroups.has(skillType)) {
      skillGroups.set(skillType, { correct: 0, total: 0 });
    }
    
    const group = skillGroups.get(skillType)!;
    group.total++;
    
    if (userAnswers[index] === q.correctAnswerIndex) {
      group.correct++;
    }
  });
  
  // Calculate performance for each skill
  const bySkill: SkillPerformance[] = Array.from(skillGroups.entries()).map(([skillType, stats]) => {
    const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return {
      skillType,
      skillName: getSkillName(skillType),
      total: stats.total,
      correct: stats.correct,
      percentage,
      level: getPerformanceLevel(percentage),
    };
  });
  
  // Sort by skill type order
  const skillOrder: SkillType[] = ['hoofdgedachte', 'zoeken', 'volgorde', 'conclusie', 'woordenschat'];
  bySkill.sort((a, b) => skillOrder.indexOf(a.skillType) - skillOrder.indexOf(b.skillType));
  
  // Calculate overall performance
  const totalQuestions = questions.length;
  const correctAnswers = questions.filter((q, i) => userAnswers[i] === q.correctAnswerIndex).length;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  // Calculate Staatsexamen score (276-740 scale)
  // Formula: 276 + (percentage / 100) * (740 - 276)
  const staatsexamenScore = Math.round(276 + (percentage / 100) * 464);
  
  // Identify strengths (>= 75%) and weaknesses (< 60%)
  const strengths = bySkill.filter(s => s.percentage >= 75).map(s => s.skillType);
  const weaknesses = bySkill.filter(s => s.percentage < 60).map(s => s.skillType);
  
  // Generate recommendations
  const recommendations = generateRecommendations(bySkill, weaknesses);
  
  return {
    overall: {
      totalQuestions,
      correctAnswers,
      percentage,
      staatsexamenScore,
    },
    bySkill,
    strengths,
    weaknesses,
    recommendations,
  };
}

/**
 * Generate personalized recommendations based on performance
 */
function generateRecommendations(
  bySkill: SkillPerformance[],
  weaknesses: SkillType[]
): string[] {
  const recommendations: string[] = [];
  
  weaknesses.forEach(skillType => {
    const skill = bySkill.find(s => s.skillType === skillType);
    if (!skill) return;
    
    switch (skillType) {
      case 'hoofdgedachte':
        recommendations.push(
          'Oefen met het identificeren van de hoofdgedachte: lees de eerste en laatste alinea extra aandachtig.'
        );
        break;
      case 'zoeken':
        recommendations.push(
          'Verbeter je scanvaardigheden: oefen met het snel vinden van specifieke informatie door te zoeken op zoekwoorden.'
        );
        break;
      case 'volgorde':
        recommendations.push(
          'Let op signaalwoorden voor volgorde: eerst, dan, daarna, vervolgens, tenslotte.'
        );
        break;
      case 'conclusie':
        recommendations.push(
          'Oefen met het trekken van conclusies: lees tussen de regels en verbind informatie uit verschillende delen van de tekst.'
        );
        break;
      case 'woordenschat':
        recommendations.push(
          'Breid je woordenschat uit: lees regelmatig Nederlandse teksten en let op de context waarin woorden gebruikt worden.'
        );
        break;
    }
  });
  
  // Add general recommendations
  if (weaknesses.length === 0) {
    recommendations.push('Uitstekend werk! Blijf oefenen om je niveau te behouden.');
  } else if (weaknesses.length >= 3) {
    recommendations.push('Oefen regelmatig met verschillende teksttypen om je leesvaardigheid te verbeteren.');
  }
  
  return recommendations;
}

/**
 * Get skill description for students
 */
export function getSkillDescription(skillType: SkillType): string {
  const descriptions: Record<SkillType, string> = {
    hoofdgedachte: 'Het begrijpen van het algemene doel, thema of hoofdboodschap van de tekst.',
    zoeken: 'Het snel kunnen vinden van specifieke informatie in de tekst.',
    volgorde: 'Het begrijpen van de volgorde van stappen, gebeurtenissen of procedures.',
    conclusie: 'Het kunnen trekken van conclusies en begrijpen van impliciete informatie.',
    woordenschat: 'Het begrijpen van woordbetekenissen op basis van de context.',
  };
  return descriptions[skillType];
}

/**
 * Get skill icon emoji
 */
export function getSkillIcon(skillType: SkillType): string {
  const icons: Record<SkillType, string> = {
    hoofdgedachte: '🎯',
    zoeken: '🔍',
    volgorde: '📋',
    conclusie: '💡',
    woordenschat: '📚',
  };
  return icons[skillType];
}
