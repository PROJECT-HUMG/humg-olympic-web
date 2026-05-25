// ─── LaTeX quick-insert snippets (shared between QuestionEditor & ExamTaking) ───
import i18n from '@/i18n';

export const LATEX_SNIPPETS: { label: string; insert: string; title: string }[][] = [
    [
        { label: 'x²', insert: '^{2}', title: i18n.t('exams:latex.power2') },
        { label: 'xⁿ', insert: '^{n}', title: i18n.t('exams:latex.powerN') },
        { label: '√x', insert: '\\\\sqrt{x}', title: i18n.t('exams:latex.sqrt2') },
        { label: '∛x', insert: '\\\\sqrt[3]{x}', title: i18n.t('exams:latex.sqrt3') },
        { label: 'a/b', insert: '\\\\frac{a}{b}', title: i18n.t('exams:latex.fraction') },
    ],
    [
        { label: '∑', insert: '\\\\sum_{i=1}^{n}', title: i18n.t('exams:latex.sigma') },
        { label: '∫', insert: '\\\\int_{a}^{b}', title: i18n.t('exams:latex.integral') },
        { label: '∞', insert: '\\\\infty', title: i18n.t('exams:latex.infinity') },
        { label: '±', insert: '\\\\pm', title: i18n.t('exams:latex.plusMinus') },
        { label: '≤', insert: '\\\\leq', title: i18n.t('exams:latex.leq') },
        { label: '≥', insert: '\\\\geq', title: i18n.t('exams:latex.geq') },
        { label: '≠', insert: '\\\\neq', title: i18n.t('exams:latex.neq') },
    ],
    [
        { label: 'α', insert: '\\\\alpha', title: 'Alpha' },
        { label: 'β', insert: '\\\\beta', title: 'Beta' },
        { label: 'π', insert: '\\\\pi', title: 'Pi' },
        { label: 'θ', insert: '\\\\theta', title: 'Theta' },
        { label: 'Δ', insert: '\\\\Delta', title: 'Delta' },
        { label: 'λ', insert: '\\\\lambda', title: 'Lambda' },
        { label: 'μ', insert: '\\\\mu', title: 'Mu' },
    ],
    [
        { label: '→', insert: '\\\\to', title: i18n.t('exams:latex.rightArrow') },
        { label: '⇒', insert: '\\\\Rightarrow', title: i18n.t('exams:latex.implies') },
        { label: '⇔', insert: '\\\\Leftrightarrow', title: i18n.t('exams:latex.equivalent') },
        { label: '∈', insert: '\\\\in', title: i18n.t('exams:latex.in') },
        { label: '∉', insert: '\\\\notin', title: i18n.t('exams:latex.notIn') },
        { label: '⊂', insert: '\\\\subset', title: i18n.t('exams:latex.subset') },
        { label: '∩', insert: '\\\\cap', title: i18n.t('exams:latex.intersection') },
        { label: '∪', insert: '\\\\cup', title: i18n.t('exams:latex.union') },
    ],
    [
        { label: 'ℝ', insert: '\\\\mathbb{R}', title: i18n.t('exams:latex.reals') },
        { label: 'ℚ', insert: '\\\\mathbb{Q}', title: i18n.t('exams:latex.rationals') },
        { label: 'ℤ', insert: '\\\\mathbb{Z}', title: i18n.t('exams:latex.integers') },
        { label: 'ℕ', insert: '\\\\mathbb{N}', title: i18n.t('exams:latex.naturals') },
        { label: 'ℂ', insert: '\\\\mathbb{C}', title: i18n.t('exams:latex.complex') },
        { label: '∅', insert: '\\\\emptyset', title: i18n.t('exams:latex.emptySet') },
        { label: '∀', insert: '\\\\forall', title: i18n.t('exams:latex.forAll') },
        { label: '∃', insert: '\\\\exists', title: i18n.t('exams:latex.exists') },
    ],
];

// Compact version for use in ExamTaking (fewer snippets to save space)
export const LATEX_SNIPPETS_COMPACT = LATEX_SNIPPETS.flat().slice(0, 22);
