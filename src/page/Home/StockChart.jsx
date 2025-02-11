import React from 'react';

const timeSeries = [
    {
        keyword :"DIGITAL CURRENCY WEEKLY",
        key:"Time Series (Daily)" ,
        lable:"1 Day",
        value:1,
    },
    {
        keyword :"DIGITAL CURRENCY WEEKLY",
        key:"Weekly Time Series" ,
        lable:"1 Week",
        value:7,
    },
    {
        keyword :"DIGITAL CURRENCY WEEKLY",
        key:"Monthly Time Series" ,
        lable:"1 Month",
        value:30,
    },
];


const StockChart = () => {
    const [activeLabel,setActiveLabel]=useState(" 1Day")
    const searies=[
        {
            data: [
            [1736694517730, 94762.2267511439],
            [1736697820915, 95011.9033536808],
            [1736701413133, 94940.616169318],
            [1736705025341, 95116.6673651701],
            [1736708819760, 94918.7173194447],
            [1736712225476, 94576.4597051775],
            [1736715833852, 94657.5387105761],
            [1736719442372, 94290.5196736908],
            [1736723023099, 93873.3704055025],
            [1736726436404, 94454.7708963881],
            [1736730244515, 95230.5013635734],
            [1736733798201, 94129.1856393411],
            [1736741019288, 94124.6851331951],
            [1736744650854, 94466.3549182907],
            [1736748223466, 94137.938359676],
            [1736751763832, 93330.9010942089],
            [1736755278929, 93493.6901474369],
            [1736759025504, 92923.1643244505],
            [1736762617047, 92965.673056223],
            [1736766498214, 91618.1627755342],
            [1736769818313, 91066.5096907206],
            [1736773705727, 90897.722821227],
            [1736777014838, 91046.8826430159],
            [1736780625868, 91673.9888547046],
            [1736784208725, 92196.8440602546],
            [1736787825245, 91203.8650436534],
            [1736791376846, 91929.4735169686],
            [1736795015992, 92048.1895936744],
            [1736798610727, 92270.7567426066],
            [1736802216362, 93565.1618405116],
            [1736805819183, 94163.8907477522],
            [1736809347487, 94358.1054114969],
            [1736813019758, 94504.2684951496],
            [1736816629692, 94451.9127217777],
            [1736820214882, 94804.2256180504],
            [1736823825339, 94883.6817763858],
            [1736827408110, 94835.8701289085],
            [1736831226814, 95164.6160620197],
        ],
        },
    ];

    const options ={
        chart: {
            id : " area-datetime" ,
            type : "area " ,
            height: 350,
            zoom :{
                autoSca1eYaxis : true
            }       
    },

    dataLabe1s:{
        enabled : false
    },
    xaxis : {
        type: "datetime" ,
        tickAmount : 6
        },
    colors:[" #758AA2"],
    markers :{
        colors : [ "#fff" ],
        strokeColor : "#fff" ,
        size:e,
        strokeWidth:1,
        style : " hollow"
    },
    tooltip: {
        theme: "dark"
    },
    fill:{
        type: " gradient" ,
        gradient :{
            shadelntensity:l,
            opacityFrom:0.7,
            opacityTo: 0.9,
            stops: [0,100]
        }   
    },
    grid:{
        borderColor: "#47535E"  ,
        strokeDashArray: 4,
        show: true,
    },
 };

 const handleActiveLabel=(value)=>{
    setActiveLab1e(va1ue);
 }
 

  return (
    <div>
        <div>
        {timeSeries.map((item)=><Button
        variant = {activeLabel==item.label?"": "outline"}
        onClick={()=>handleActiveLabel(item.label)} key={item. lable}>
        {item. lable}
        </Button>)}
        </div>
        
        <div id="chart-timelines">
            <ReactApexChart
                options={options}
                series={searies}
                height={450}
                type=" area "
        />
        </div>
    </div>);   
};

export default StockChart