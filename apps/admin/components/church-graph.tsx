'use client';

import * as React from 'react';
import { Area, AreaChart, XAxis } from '@workspace/ui/components/recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@workspace/ui/components/chart';
const chartData = [
  { date: '2024-04-01', fellowships: 222, cells: 150 },
  { date: '2024-04-02', fellowships: 97, cells: 180 },
  { date: '2024-04-03', fellowships: 167, cells: 120 },
  { date: '2024-04-04', fellowships: 242, cells: 260 },
  { date: '2024-04-05', fellowships: 373, cells: 290 },
  { date: '2024-04-06', fellowships: 301, cells: 340 },
  { date: '2024-04-07', fellowships: 245, cells: 180 },
  { date: '2024-04-08', fellowships: 409, cells: 320 },
  { date: '2024-04-09', fellowships: 59, cells: 110 },
  { date: '2024-04-10', fellowships: 261, cells: 190 },
  { date: '2024-04-11', fellowships: 327, cells: 350 },
  { date: '2024-04-12', fellowships: 292, cells: 210 },
  { date: '2024-04-13', fellowships: 342, cells: 380 },
  { date: '2024-04-14', fellowships: 137, cells: 220 },
  { date: '2024-04-15', fellowships: 120, cells: 170 },
  { date: '2024-04-16', fellowships: 138, cells: 190 },
  { date: '2024-04-17', fellowships: 446, cells: 360 },
  { date: '2024-04-18', fellowships: 364, cells: 410 },
  { date: '2024-04-19', fellowships: 243, cells: 180 },
  { date: '2024-04-20', fellowships: 89, cells: 150 },
  { date: '2024-04-21', fellowships: 137, cells: 200 },
  { date: '2024-04-22', fellowships: 224, cells: 170 },
  { date: '2024-04-23', fellowships: 138, cells: 230 },
  { date: '2024-04-24', fellowships: 387, cells: 290 },
  { date: '2024-04-25', fellowships: 215, cells: 250 },
  { date: '2024-04-26', fellowships: 75, cells: 130 },
  { date: '2024-04-27', fellowships: 383, cells: 420 },
  { date: '2024-04-28', fellowships: 122, cells: 180 },
  { date: '2024-04-29', fellowships: 315, cells: 240 },
  { date: '2024-04-30', fellowships: 454, cells: 380 },
  { date: '2024-05-01', fellowships: 165, cells: 220 },
  { date: '2024-05-02', fellowships: 293, cells: 310 },
  { date: '2024-05-03', fellowships: 247, cells: 190 },
  { date: '2024-05-04', fellowships: 385, cells: 420 },
  { date: '2024-05-05', fellowships: 481, cells: 390 },
  { date: '2024-05-06', fellowships: 498, cells: 520 },
  { date: '2024-05-07', fellowships: 388, cells: 300 },
  { date: '2024-05-08', fellowships: 149, cells: 210 },
  { date: '2024-05-09', fellowships: 227, cells: 180 },
  { date: '2024-05-10', fellowships: 293, cells: 330 },
  { date: '2024-05-11', fellowships: 335, cells: 270 },
  { date: '2024-05-12', fellowships: 197, cells: 240 },
  { date: '2024-05-13', fellowships: 197, cells: 160 },
  { date: '2024-05-14', fellowships: 448, cells: 490 },
  { date: '2024-05-15', fellowships: 473, cells: 380 },
  { date: '2024-05-16', fellowships: 338, cells: 400 },
  { date: '2024-05-17', fellowships: 499, cells: 420 },
  { date: '2024-05-18', fellowships: 315, cells: 350 },
  { date: '2024-05-19', fellowships: 235, cells: 180 },
  { date: '2024-05-20', fellowships: 177, cells: 230 },
  { date: '2024-05-21', fellowships: 82, cells: 140 },
  { date: '2024-05-22', fellowships: 81, cells: 120 },
  { date: '2024-05-23', fellowships: 252, cells: 290 },
  { date: '2024-05-24', fellowships: 294, cells: 220 },
  { date: '2024-05-25', fellowships: 201, cells: 250 },
  { date: '2024-05-26', fellowships: 213, cells: 170 },
  { date: '2024-05-27', fellowships: 420, cells: 460 },
  { date: '2024-05-28', fellowships: 233, cells: 190 },
  { date: '2024-05-29', fellowships: 78, cells: 130 },
  { date: '2024-05-30', fellowships: 340, cells: 280 },
  { date: '2024-05-31', fellowships: 178, cells: 230 },
  { date: '2024-06-01', fellowships: 178, cells: 200 },
  { date: '2024-06-02', fellowships: 470, cells: 410 },
  { date: '2024-06-03', fellowships: 103, cells: 160 },
  { date: '2024-06-04', fellowships: 439, cells: 380 },
  { date: '2024-06-05', fellowships: 88, cells: 140 },
  { date: '2024-06-06', fellowships: 294, cells: 250 },
  { date: '2024-06-07', fellowships: 323, cells: 370 },
  { date: '2024-06-08', fellowships: 385, cells: 320 },
  { date: '2024-06-09', fellowships: 438, cells: 480 },
  { date: '2024-06-10', fellowships: 155, cells: 200 },
  { date: '2024-06-11', fellowships: 92, cells: 150 },
  { date: '2024-06-12', fellowships: 492, cells: 420 },
  { date: '2024-06-13', fellowships: 81, cells: 130 },
  { date: '2024-06-14', fellowships: 426, cells: 380 },
  { date: '2024-06-15', fellowships: 307, cells: 350 },
  { date: '2024-06-16', fellowships: 371, cells: 310 },
  { date: '2024-06-17', fellowships: 475, cells: 520 },
  { date: '2024-06-18', fellowships: 107, cells: 170 },
  { date: '2024-06-19', fellowships: 341, cells: 290 },
  { date: '2024-06-20', fellowships: 408, cells: 450 },
  { date: '2024-06-21', fellowships: 169, cells: 210 },
  { date: '2024-06-22', fellowships: 317, cells: 270 },
  { date: '2024-06-23', fellowships: 480, cells: 530 },
  { date: '2024-06-24', fellowships: 132, cells: 180 },
  { date: '2024-06-25', fellowships: 141, cells: 190 },
  { date: '2024-06-26', fellowships: 434, cells: 380 },
  { date: '2024-06-27', fellowships: 448, cells: 490 },
  { date: '2024-06-28', fellowships: 149, cells: 200 },
  { date: '2024-06-29', fellowships: 103, cells: 160 },
  { date: '2024-06-30', fellowships: 446, cells: 400 },
];

const chartConfig = {
  views: {
    label: 'Churches started',
  },
  fellowships: {
    label: 'Fellowships',
    color: 'hsl(var(--chart-1))',
  },
  cells: {
    label: 'Cells',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function ChurchChart() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>('fellowships');

  const total = React.useMemo(
    () => ({
      fellowships: chartData.reduce((acc, curr) => acc + curr.fellowships, 0),
      cells: chartData.reduce((acc, curr) => acc + curr.cells, 0),
    }),
    []
  );

  return (
    <Card className='bg-white'>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6'>
          <CardTitle>Church Data</CardTitle>
          <CardDescription>Showing church data across the year</CardDescription>
        </div>
        <div className='flex'>
          {['fellowships', 'cells'].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className='relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6'
                onClick={() => setActiveChart(chart)}
              >
                <span className='text-xs text-muted-foreground'>
                  {chartConfig[chart].label}
                </span>
                <span className='text-lg font-bold leading-none sm:text-3xl'>
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className='px-2 sm:p-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          {/* <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className='w-[150px]'
                  nameKey='views'
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart> */}
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            {/* <CartesianGrid vertical={false} /> */}
            {/* <XAxis
              dataKey='month'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            /> */}
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            {/* <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='line' />}
            /> */}
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className='w-[200px]'
                  nameKey='views'
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  }}
                />
              }
            />
            <Area
              dataKey={activeChart}
              fill={`var(--color-${activeChart})`}
              type='natural'
              fillOpacity={0.4}
              stroke={`var(--color-${activeChart})`}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
