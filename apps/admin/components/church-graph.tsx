'use client';

import { Area, AreaChart, XAxis } from '@workspace/ui/components/recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@workspace/ui/components/chart';
import { useWorkerStatistics } from '@/hooks/statistics';
import { useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@workspace/ui/components/select';

const chartConfig = {
  workers: { label: 'Workers', color: 'hsl(var(--chart-1))' },
};

export function ChurchChart() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data: chartData } = useWorkerStatistics(year);

  return (
    <Card className='bg-white'>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6'>
          <CardTitle>Workers Data</CardTitle>
          <CardDescription>
            Showing workers data across the year
          </CardDescription>
        </div>
        <div className='flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-r data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6'>
          <div className='text-xs text-muted-foreground'>Year</div>
          <Select
            value={year.toString()}
            onValueChange={(value) => {
              setYear(Number(value));
            }}
          >
            <SelectTrigger className='bg-transparent text-sm font-medium border-none h-auto p-0 focus:ring-0 outline-none shadow-none'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from(
                { length: new Date().getFullYear() - 2000 + 1 },
                (_, i) => {
                  const year = 2000 + i;
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  );
                }
              ).reverse()}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className='px-2 sm:p-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <XAxis
              dataKey='month'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />

            <ChartTooltip
              content={
                <ChartTooltipContent className='w-[200px]' nameKey='total' />
              }
            />
            <Area
              dataKey='total'
              fill={`var(--color-workers)`}
              type='natural'
              fillOpacity={0.4}
              stroke={`var(--color-workers)`}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
