
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProgramCardProps {
  program: {
    id: number;
    name: string;
    level: string;
    type: string;
    price: number;
    imageUrl?: string;
  };
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        {program.imageUrl && (
          <div className="aspect-video w-full bg-muted rounded-t-lg mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={program.imageUrl}
              alt={program.name}
              className="w-full h-full object-cover rounded-t-lg"
            />
          </div>
        )}
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg tracking-tight">{program.name}</CardTitle>
          <Badge variant="outline">{program.level.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-muted-foreground text-sm">Tipe: {program.type}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <p className="text-xl font-bold">
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(program.price)}
        </p>
        <Button>Lihat Detail</Button>
      </CardFooter>
    </Card>
  );
};

export default ProgramCard;
