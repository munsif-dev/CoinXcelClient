import { Button } from '@/components/ui/button'
import React from 'react'
import AssetTable from './AssetTable'

const Home = () => {
    const[category, setCategory] = React.useState("all")

    const handleCategory = (value) =>{
        setCategory(value)
    }
  return (
        <div className='relative'>
            <div className='lg:flex'>
                <div className='lg:w[50%] lg:border-r'>
                    <div className='p-3 flex tems-center gap-4'>
                       <Button 
                       onClick={()=> handleCategory("all")}
                       variant={category=="all"?"default":"outline"} 
                       className="rounded-full"
                       >All
                       </Button>

                       <Button 
                       onClick={()=> handleCategory("top50")}
                       variant={category=="top50"?"default":"outline"} 
                       className="rounded-full"
                       >top 50
                       </Button>

                       <Button 
                       onClick={()=> handleCategory("topGaiers")}
                       variant={category=="topGainers"?"default":"outline"} 
                       className="rounded-full"
                       >top Gainers
                       </Button>

                       <Button 
                       onClick={()=> handleCategory("topLosers")}
                       variant={category=="topLosers"?"default":"outline"} 
                       className="rounded-full"
                       >top Losers
                       </Button>

                    </div>
                    <AssetTable/>

                </div>
                <div className="hidden lg:block lg:w-[50%] p-5">
                    <StockChart/>

                    <div className="flex gap-5 item-center">
                        <div>
                            <Avatar>
                                <AvatarImage src={"https://th.bing.com/th/id/R.fee3c459aa907c6e7969c06b7cee762d?rik=RIVUJkMGCiG0DA&riu=http%3a%2f%2fdianecapri.com%2fwp-content%2fuploads%2f2015%2f03%2fBitcoin.jpg&ehk=Zmirn0ANERFmgZtcI%2b8ilgkoe%2b9FKupqrur1pSndcXM%3d&risl=&pid=ImgRaw&r=0"}/>
                            </Avatar>
                        </div>

                        <div>
                        <div className="f1ex items-center gap-2">
                            <p>ETH</p>
                            <DotIcon className=" text-gray-400" />
                               <p className='teext-gray-400'>Ethereum </p> 
                               </div>
                                <div className="f1ex items-end gap-2">
                                <p className="text-x1 font-bold">5464</p>
                                <p className='text-red-600'>
                                   <span>-1319049822.578</span> 
                                   <span>(-0.29803%)</span>
                                </p>
                                </div>
                        </div>

                    </div>

                </div>

            </div>

        </div>
  );
}

export default Home