import PropertyCollection from './Reports/Collection';
import PaymentWiseReportPorpty from './Reports/PaymentWiseReport';
import Property from './Property';
import Assessment from './Saf/Assessment';
import Inbox from './Saf/Inbox';
import FieldVarification from './Saf/FieldVarification';
import SurveyPage from './Saf/SurveyPage';
import VerifiedStatus from './Saf/VerifiedStatus';
import SearchAssesment from './Saf/SearchAssesment';
import SafDueDetails from './Saf/SafDueDetails';
import ApplyAssessment from './Saf/ApplyAssessment';
import AssessmentSummary from './Saf/AssessmentSummary';
import ApplyAssessmentComponentized from './Saf/ApplyAssessmentComponentized';
import SubmitVarification from './Saf/SubmitVarification';
import SearchHolding from './Holdings/Search';
import HoldingDetails from './Holdings/HoldingDetails';
import RessesmentSummry from './Saf/SubmitData/RessesmentSummry';
import MutationScreen from './Saf/SubmitData/Verification/MutationScreen';
import SubmitSummaryPage from './Saf/SubmitData/Verification/SubmitSummaryPage';

export const propertyRoutes = [
  { name: 'SurveyPage', component: SurveyPage },
  { name: 'Property', component: Property },
  { name: 'Assessment', component: Assessment },
  { name: 'Inbox', component: Inbox },
  { name: 'FieldVarification', component: FieldVarification },
  { name: 'VerifiedStatus', component: VerifiedStatus },
  { name: 'SearchAssesment', component: SearchAssesment },
  { name: 'SafDueDetails', component: SafDueDetails },
  { name: 'ApplyAssessment', component: ApplyAssessment },
  { name: 'AssessmentSummary', component: AssessmentSummary },
  { name: 'ApplyAssessmentComponentized', component: ApplyAssessmentComponentized },
  { name: 'SubmitVarification', component: SubmitVarification },
  { name: 'SearchHolding', component: SearchHolding },
  { name: 'HoldingDetails', component: HoldingDetails },
  { name: 'RessesmentSummry', component: RessesmentSummry },
  { name: 'SubmitSummaryPage', component: SubmitSummaryPage },
  { name: 'PropertyCollection', component: PropertyCollection },
  { name: 'PaymentWiseReportPorpty', component: PaymentWiseReportPorpty },
  { name: 'MutationScreen', component: MutationScreen },
];
