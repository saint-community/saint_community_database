'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { cn } from '@/libutils';
import { Area, AreaChart, XAxis } from 'recharts';
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

interface FollowUpChartProps {
  className?: string;
}

interface ChartDataPoint {
  week: string;
  value: number;
}

const chartConfig = {
  value: {
    label: 'Follow-Up Sessions',
    color: 'hsl(var(--chart-1))',
  },
};

export function FollowUpChart({ className }: FollowUpChartProps): React.JSX.Element {
  const data = useMemo(() => [
    { week: 'Week 1', value: 75 },
    { week: 'Week 2', value: 35 },
    { week: 'Week 3', value: 65 },
    { week: 'Week 4', value: 85 },
    { week: 'Week 5', value: 50 },
  ], []);

  return (
    <Card className={cn('bg-white', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Follow-Up Sessions Analytics</CardTitle>
            <CardDescription>
              Follow-up sessions tracked over the last 5 weeks
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-gray-50 rounded-full">
              <span className="text-sm text-gray-700">This Week</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">January 2024</span>
              <ChevronDown className="w-3 h-3 text-gray-600" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.replace('Week ', 'W')}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent className="w-[200px]" nameKey="value" />
              }
            />
            <Area
              dataKey="value"
              fill="var(--color-value)"
              type="natural"
              fillOpacity={0.4}
              stroke="var(--color-value)"
            />
          </AreaChart>
        </ChartContainer>
        <div className="flex justify-between text-sm text-gray-600 pt-4">
          <span>Analytics Overview</span>
          <span className="text-blue-600">Trending up 18%</span>
        </div>
      </CardContent>
    </Card>
  );
}