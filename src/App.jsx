import { Button } from './components/ui/button';
import Navbar from './page/Navbar/Navbar';
import Portfolio from './page/Portfolio/Portfolio';
import { Route, Routes } from 'react-router-dom';
import Home from './page/Home/Home';
import Activity from './page/Activity/Activity';
import Wallet from './page/Wallet/Wallet';
import Withdrawal from './page/Withdrawal/Withdrawal';
import PaymentDetails from './page/Payment Details/PaymentDetails';
import StockDetails from './page/Stock Details/Stockdetails';
import Watchlist from './page/Watchlist/Watchlist';
import Profile from './page/Profile/Profile';
import SearchCoin from './page/Search/SearchCoin';
import Notfound from './page/Notfound/Notfound';

function App() {
 

  return (
    <>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/portfolio" element={<Portfolio/>}/>
        <Route path="/activity" element={<Activity/>}/>
        <Route path="/wallet" element={<Wallet/>}/>
        <Route path="/withdrawal" element={<Withdrawal/>}/>
        <Route path="/payment-details" element={<PaymentDetails/>}/>
        <Route path="/market/:id" element={<StockDetails/>}/>
        <Route path="/watchlist" element={<Watchlist/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/search" element={<SearchCoin/>}/>
        <Route path="*" element={<Notfound/>}/>
      </Routes>
      <Home/>
    </>
  )
}

export default App
