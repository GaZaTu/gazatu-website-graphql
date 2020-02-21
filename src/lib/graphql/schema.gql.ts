export interface AuthResult {
  __typename?: 'AuthResult';
  token?: string;
  user?: User;
}
export interface Change {
  __typename?: 'Change';
  id?: string;
  kind?: ChangeKind;
  targetEntityName?: string;
  targetId?: string | null;
  targetColumn?: string | null;
  newColumnValue?: string | null;
  createdAt?: DateTime;
}
export enum ChangeKind {
  INSERT = "INSERT",
  UPDATE = "UPDATE",
  REMOVE = "REMOVE"
}
export interface CountResult {
  __typename?: 'CountResult';
  count?: number;
}
export type DateTime = unknown;
export interface Language {
  __typename?: 'Language';
  id?: string;
  name?: string;
  languageCode?: string | null;
  countryCode?: string | null;
  createdAt?: DateTime;
  updatedAt?: DateTime;
}
export interface LanguageInput {
  name: string;
  languageCode: string;
  countryCode: string;
}
export interface Mutation {
  __typename?: 'Mutation';
  addLanguage?: Language;
  updateUser?: User | null;
  deleteUser?: CountResult;
  getOrAddUserRole?: UserRole;
  registerUser?: AuthResult;
  saveTriviaQuestion?: TriviaQuestion;
  verifyTriviaQuestions?: CountResult;
  removeTriviaQuestions?: CountResult;
  categorizeTriviaQuestions?: CountResult;
  importLegacyTriviaQuestions?: CountResult;
  saveTriviaCategory?: TriviaCategory;
  verifyTriviaCategories?: CountResult;
  removeTriviaCategories?: CountResult;
  reportTriviaQuestion?: TriviaReport;
}
export interface NodeRef {
  id: string;
}
export interface PageInfo {
  __typename?: 'PageInfo';
  startCursor?: string | null;
  endCursor?: string | null;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  count?: number;
}
export interface Query {
  __typename?: 'Query';
  language?: Language | null;
  languages?: Language[];
  changes?: Change[];
  user?: User | null;
  users?: User[];
  currentUser?: User | null;
  userRole?: UserRole | null;
  userRoles?: UserRole[];
  authenticate?: AuthResult;
  triviaQuestion?: TriviaQuestion | null;
  triviaQuestions?: TriviaQuestionConnection;
  triviaCategory?: TriviaCategory | null;
  triviaCategories?: TriviaCategory[];
  triviaReport?: TriviaReport | null;
  triviaReports?: TriviaReport[];
  triviaCounts?: TriviaCounts;
}
export enum SortDirection {
  ASC = "ASC",
  DESC = "DESC"
}
export interface Subscription {
  __typename?: 'Subscription';
  newChange?: Change;
}
export interface TriviaCategory {
  __typename?: 'TriviaCategory';
  id?: string;
  name?: string;
  description?: string | null;
  submitter?: string | null;
  verified?: boolean | null;
  disabled?: boolean | null;
  createdAt?: DateTime;
  updatedAt?: DateTime;
  questions?: TriviaQuestion[] | null;
}
export interface TriviaCategoryInput {
  id?: string | null;
  name: string;
  description?: string | null;
  submitter?: string | null;
}
export interface TriviaCounts {
  __typename?: 'TriviaCounts';
  questionsCount?: number;
  unverifiedQuestionsCount?: number;
  categoriesCount?: number;
  unverifiedCategoriesCount?: number;
  reportsCount?: number;
  reportedQuestionsCount?: number;
}
export interface TriviaQuestion {
  __typename?: 'TriviaQuestion';
  id?: string;
  question?: string;
  answer?: string;
  hint1?: string | null;
  hint2?: string | null;
  submitter?: string | null;
  verified?: boolean | null;
  disabled?: boolean | null;
  createdAt?: DateTime;
  updatedAt?: DateTime;
  version?: number;
  category?: TriviaCategory;
  language?: Language;
  submitterUser?: User | null;
  updatedBy?: User | null;
  reports?: TriviaReport[] | null;
}
export interface TriviaQuestionConnection {
  __typename?: 'TriviaQuestionConnection';
  edges?: TriviaQuestionEdge[];
  pageInfo?: PageInfo;
}
export interface TriviaQuestionEdge {
  __typename?: 'TriviaQuestionEdge';
  node?: TriviaQuestion;
  cursor?: string;
}
export interface TriviaQuestionInput {
  id?: string | null;
  question: string;
  answer: string;
  category: NodeRef;
  language: NodeRef;
  hint1?: string | null;
  hint2?: string | null;
  submitter?: string | null;
}
export interface TriviaQuestionLegacyInput {
  question: string;
  answer: string;
  category: string;
  language: string;
  hint1?: string | null;
  hint2?: string | null;
  submitter?: string | null;
  verified: boolean;
  disabled: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}
export interface TriviaReport {
  __typename?: 'TriviaReport';
  id?: string;
  message?: string;
  submitter?: string;
  createdAt?: DateTime;
  updatedAt?: DateTime;
  question?: TriviaQuestion;
}
export interface TriviaReportInput {
  questionId: string;
  message: string;
  submitter: string;
}
export interface TriviaStatistics {
  __typename?: 'TriviaStatistics';
  questionsCount?: number;
  verifiedQuestionsCount?: number;
  categoriesCount?: number;
  verifiedCategoriesCount?: number;
  topCategories?: TriviaCategory[];
  topSubmitters?: string[];
  submissionDates?: DateTime[];
}
export interface User {
  __typename?: 'User';
  id?: string;
  username?: string;
  createdAt?: DateTime;
  updatedAt?: DateTime;
  roles?: UserRole[];
}
export interface UserInput {
  username: string;
  password: string;
}
export interface UserRole {
  __typename?: 'UserRole';
  id?: string;
  name?: string;
  description?: string | null;
}
export interface UserRoleInput {
  name: string;
}
export type Node = Change | Language | TriviaCategory | TriviaQuestion | TriviaReport | User | UserRole;
