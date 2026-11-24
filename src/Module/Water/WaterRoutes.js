import WaterInbox from './Inbox/Inbox';
import WaterSurvey from './Inbox/WaterSurvey';
import SubmitSurey from './Inbox/SubmitSurey';
import SubmitApply from './ApplyWater/SubmitApply';
import ApplyWaterConnectionForm from './ApplyWater/ApplyWaterConnectionForm';
import SearchWater from './Details/Search';
import WaterDetails from './Details/Details';
import MyInput from './ApplyWater/MyInput';
import SearchCustomer from './Consumer/Search';
import CustomerDetails from './Consumer/Details';

export const waterRoutes = [
  { name: 'ApplyWaterConnection', component: ApplyWaterConnectionForm },
  { name: 'SearchWater', component: SearchWater },
  { name: 'SubmitApply', component: SubmitApply },
  { name: 'MyInput', component: MyInput },
  { name: 'WaterDetails', component: WaterDetails },
  { name: 'SearchCustomer', component: SearchCustomer },
  { name: 'CustomerDetails', component: CustomerDetails },
  { name: 'WaterInbox', component: WaterInbox },
  { name: 'WaterSurvey', component: WaterSurvey },
  { name: 'SubmitSurey', component: SubmitSurey },
];
