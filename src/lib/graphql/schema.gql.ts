export interface AuthResult {
  __typename?: 'AuthResult';
  token?: string;
  user?: User;
}
export interface BlogEntry {
  __typename?: 'BlogEntry';
  createdAt?: DateTime;
  id?: string;
  imageAsBase64?: string | null;
  imageAsDataURL?: string | null;
  imageFileExtension?: string | null;
  imageMimeType?: string | null;
  message?: string | null;
  story?: string;
  title?: string;
  updatedAt?: DateTime;
}
export interface BlogEntryInput {
  id?: string | null;
  imageAsBase64?: string | null;
  imageAsDataURL?: string | null;
  imageFileExtension?: string | null;
  imageMimeType?: string | null;
  message?: string | null;
  story?: string | null;
  title?: string | null;
}
export interface Change {
  __typename?: 'Change';
  createdAt?: DateTime;
  id?: string;
  kind?: ChangeKind;
  newColumnValue?: string | null;
  targetColumn?: string | null;
  targetEntityName?: string;
  targetId?: string | null;
}
export enum ChangeKind {
  INSERT = "INSERT",
  REMOVE = "REMOVE",
  UPDATE = "UPDATE"
}
export interface CountResult {
  __typename?: 'CountResult';
  count?: number;
}
export type DateTime = unknown;
export interface IDsResult {
  __typename?: 'IDsResult';
  ids?: string[];
}
export interface Language {
  __typename?: 'Language';
  countryCode?: string | null;
  createdAt?: DateTime;
  id?: string;
  languageCode?: string | null;
  name?: string;
  updatedAt?: DateTime;
}
export interface LanguageInput {
  countryCode: string;
  languageCode: string;
  name: string;
}
export interface Mutation {
  __typename?: 'Mutation';
  addLanguage?: Language;
  categorizeTriviaQuestions?: CountResult;
  deleteUser?: CountResult;
  getOrAddUserRole?: UserRole;
  importLegacyTriviaQuestions?: CountResult;
  mergeTriviaCategoriesInto?: CountResult;
  registerUser?: AuthResult;
  removeTriviaCategories?: CountResult;
  removeTriviaQuestions?: CountResult;
  removeTriviaReports?: CountResult;
  reportTriviaQuestion?: TriviaReport;
  saveBlogEntries?: IDsResult;
  saveBlogEntry?: BlogEntry;
  saveTriviaCategory?: TriviaCategory;
  saveTriviaQuestion?: TriviaQuestion;
  updateUser?: User | null;
  verifyTriviaCategories?: CountResult;
  verifyTriviaQuestions?: CountResult;
}
export interface NodeRef {
  id: string;
}
export interface PageInfo {
  __typename?: 'PageInfo';
  count?: number;
  endCursor?: string | null;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  startCursor?: string | null;
}
export interface Query {
  __typename?: 'Query';
  authenticate?: AuthResult;
  blogEntries?: BlogEntry[];
  blogEntry?: BlogEntry | null;
  changes?: Change[];
  currentUser?: User | null;
  language?: Language | null;
  languages?: Language[];
  triviaCategories?: TriviaCategory[];
  triviaCategory?: TriviaCategory | null;
  triviaCounts?: TriviaCounts;
  triviaQuestion?: TriviaQuestion | null;
  triviaQuestions?: TriviaQuestionConnection;
  triviaReport?: TriviaReport | null;
  triviaReports?: TriviaReport[];
  user?: User | null;
  userRole?: UserRole | null;
  userRoles?: UserRole[];
  users?: User[];
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
  createdAt?: DateTime;
  description?: string | null;
  disabled?: boolean | null;
  id?: string;
  name?: string;
  questions?: TriviaQuestion[] | null;
  questionsCount?: number;
  submitter?: string | null;
  updatedAt?: DateTime;
  verified?: boolean | null;
}
export interface TriviaCategoryInput {
  description?: string | null;
  id?: string | null;
  name: string;
  submitter?: string | null;
}
export interface TriviaCounts {
  __typename?: 'TriviaCounts';
  categoriesCount?: number;
  danglingQuestionsCount?: number;
  questionsCount?: number;
  reportedQuestionsCount?: number;
  reportsCount?: number;
  unverifiedCategoriesCount?: number;
  unverifiedQuestionsCount?: number;
}
export interface TriviaQuestion {
  __typename?: 'TriviaQuestion';
  answer?: string;
  category?: TriviaCategory;
  createdAt?: DateTime;
  disabled?: boolean | null;
  hint1?: string | null;
  hint2?: string | null;
  id?: string;
  language?: Language;
  question?: string;
  reports?: TriviaReport[] | null;
  submitter?: string | null;
  submitterUser?: User | null;
  updatedAt?: DateTime;
  updatedBy?: User | null;
  verified?: boolean | null;
  version?: number;
}
export interface TriviaQuestionConnection {
  __typename?: 'TriviaQuestionConnection';
  edges?: TriviaQuestionEdge[];
  pageInfo?: PageInfo;
}
export interface TriviaQuestionEdge {
  __typename?: 'TriviaQuestionEdge';
  cursor?: string;
  node?: TriviaQuestion;
}
export interface TriviaQuestionInput {
  answer: string;
  category: NodeRef;
  hint1?: string | null;
  hint2?: string | null;
  id?: string | null;
  language: NodeRef;
  question: string;
  submitter?: string | null;
}
export interface TriviaQuestionLegacyInput {
  answer: string;
  category: string;
  createdAt: DateTime;
  disabled: boolean;
  hint1?: string | null;
  hint2?: string | null;
  language: string;
  question: string;
  submitter?: string | null;
  updatedAt: DateTime;
  verified: boolean;
}
export interface TriviaReport {
  __typename?: 'TriviaReport';
  createdAt?: DateTime;
  id?: string;
  message?: string;
  question?: TriviaQuestion;
  submitter?: string;
  updatedAt?: DateTime;
}
export interface TriviaReportInput {
  message: string;
  questionId: string;
  submitter: string;
}
export interface User {
  __typename?: 'User';
  createdAt?: DateTime;
  id?: string;
  roles?: UserRole[];
  updatedAt?: DateTime;
  username?: string;
}
export interface UserInput {
  roles: NodeRef[];
}
export interface UserRole {
  __typename?: 'UserRole';
  description?: string | null;
  id?: string;
  name?: string;
}
export interface UserRoleInput {
  name: string;
}
export type Node = BlogEntry | Change | Language | TriviaCategory | TriviaQuestion | TriviaReport | User | UserRole;
