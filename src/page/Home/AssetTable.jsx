import React from 'react';
import {Avatar, AvatarImage} from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TbleHeader,
  TableRow,
} from "@/component/ui/table";

const AssetTable = () => {
  return (
    <Table>
 
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">
        Coin
      </TableHead>
      <TableHead>SYMBOL</TableHead>
      <TableHead>VOLUME</TableHead>
      <TableHead>MARKET CAP</TableHead>
      <TableHead>24h</TableHead>
      <TableHead className="text-right">PRICE</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {[1,1,1,1,1,1,1,1,1,1].map((item,index)=> <TableRow key={index}>
      <TableCell className="font-medium flex item-center gap-2">
        <Avatar className="-z-50">
          <AvatarImage src="https://th.bing.com/th/id/R.fee3c459aa907c6e7969c06b7cee762d?rik=RIVUJkMGCiG0DA&riu=http%3a%2f%2fdianecapri.com%2fwp-content%2fuploads%2f2015%2f03%2fBitcoin.jpg&ehk=Zmirn0ANERFmgZtcI%2b8ilgkoe%2b9FKupqrur1pSndcXM%3d&risl=&pid=ImgRaw&r=0"/>
        </Avatar>
        <span>Bitcoin</span>
        </TableCell>
      <TableCell>BTC</TableCell>
      <TableCell>9124463121</TableCell>
      <TableCell>1364881428323</TableCell>
      <TableCell>-0.20009</TableCell>

      <TableCell className="text-right">$69249</TableCell>
    </TableRow> )}
    
  </TableBody>
</Table>

  );
};

export default AssetTable;