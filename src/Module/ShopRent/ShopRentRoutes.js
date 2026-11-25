import ShopRentAdd from './ShopRentAdd';
import { ShopRentSearch, ShopRentDetails, ShopRentHistory, ShopRentReceipt } from './ShopRentScreens';

export const shopRentRoutes = [
  { name: 'ShopRentAdd', component: ShopRentAdd },
  { name: 'ShopRentSearch', component: ShopRentSearch },
  { name: 'ShopRentDetails', component: ShopRentDetails },
  { name: 'ShopRentHistory', component: ShopRentHistory },
  { name: 'ShopRentReceipt', component: ShopRentReceipt },
];
