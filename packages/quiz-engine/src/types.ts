export type Subject = "math" | "english" | "spelling";
export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType = "single_choice" | "true_false";
export interface Option { id:string; text:string }
export interface Question {
 id:string; subject:Subject; topic:string; difficulty:Difficulty; type:QuestionType;
 prompt:string; options:Option[]; correctOptionIds:string[]; explanation?:string; active:boolean;
}
export interface QuizConfig {
 enabledSubjects:Subject[]; minimumBaseQuestions:number; maxExtraQuestions:number; startingDifficulty:Difficulty;
}
export interface SessionQuestion { questionId:string; role:"base"|"remediation"; subject:Subject; topic:string; difficulty:Difficulty }
export interface QuizSession {
 id:string; config:QuizConfig; status:"in_progress"|"unlocked"|"needs_parent_review"|"bank_exhausted";
 targetDifficulty:Difficulty; consecutiveCorrect:number; baseAnswered:number; extraAsked:number;
 pendingRemediation:number; usedQuestionIds:string[]; current:SessionQuestion|null;
 history:Array<{questionId:string;role:"base"|"remediation";correct:boolean;selectedOptionIds:string[]}>;
}
