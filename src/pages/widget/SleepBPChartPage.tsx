import { WidgetLayout } from '@/layouts/WidgetLayout';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNativeBridge } from '@/hooks/useNativeBridge';
import ReactECharts from 'echarts-for-react';


interface ChartData {
  name: string;
  sbp: number;
  sleep: number;
}

const PAGE_OPTION = {
  pageId: 'sleep-bp-chart',
  pageName: '睡眠血压关系图表'
}


export function SleepBPChartPage () {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const { t } = useTranslation();
  const { onData } = useNativeBridge(PAGE_OPTION)

  useEffect(() => {
    onData((data) => {
      try {
        const newData: ChartData[] = JSON.parse(data as string)
        if (!newData) {
          return;
        }
        setChartData(newData as ChartData[]);
      } catch (error) {
        console.log('JSON error', error)
      }
    })

    setTimeout(() => {
      setChartData([{
        name: '星期一',
        sbp: 120,
        sleep: 60
      },
      {
        name: '星期二',
        sbp: 125,
        sleep: 70
      },
      {
        name: '星期三',
        sbp: 130,
        sleep: 80
      },
      {
        name: '星期四',
        sbp: 135,
        sleep: 85
      },
      {
        name: '星期五',
        sbp: 140,
        sleep: 90
      },
      {
        name: '星期六',
        sbp: 145,
        sleep: 95
      },
      {
        name: '星期日',
        sbp: 150,
        sleep: 100
      },
      ]);
    }, 100)
  }, [onData])

  const getOption = () => {
    return {
      title: {
        show: false
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          label: {
            backgroundColor: '#6a7985',
            color: '#fff',
            fontSize: 12,
            padding: [5, 10]
          },
          axis: 'x',
          lineStyle: {
            color: '#6a7985',
            width: 1,
            type: 'dashed'
          }
        },
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#f0f0f0',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        textStyle: {
          fontSize: 13,
          color: '#333',
          lineHeight: 1.5
        },
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        formatter: function (params: any) {
          console.log('params', params)
          let result = `<div style="font-weight: 600; margin-bottom: 12px; color: #333; text-align: left;">${params[0].name}</div>`;
          params.forEach((item: any) => {
            console.log(item.seriesName)
            result += `<div style="display: flex; align-items: center; margin-bottom: 10px; text-align: left;">`;
            result += `<span style="display:inline-block;margin-right:10px;border-radius:10px;width:12px;height:12px;background-color:${item.color};"></span>`;
            result += `<span style="flex: 1; text-align: left;">${item.seriesName === 'SBP' || item.seriesName === '高压' ? t('vitals.sbp') : t('vitals.sleepDuration')}</span>`;
            result += `<span style="font-weight: 500; margin-left: 10px; text-align: left;">${item.value} ${item.seriesName === 'SBP' || item.seriesName === '高压' ? 'mmHg' : 'min'}</span>`;
            result += `</div>`;
          });
          return result;
        }
      },
      legend: {
        data: [
          {
            name: t('vitals.sbp'),
            textStyle: {
              color: '#FF8C00',
              fontSize: 14,
              textAlign: 'left'
            },
            emphasis: {
              textStyle: {
                color: '#FF8C00'
              }
            }
          },
          {
            name: t('vitals.sleepDuration'),
            textStyle: {
              color: '#9370DB',
              fontSize: 14,
              textAlign: 'left'
            },
            emphasis: {
              textStyle: {
                color: '#9370DB'
              }
            }
          }
        ],
        left: '20px',
        top: '10px',
        icon: 'circle',
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 30,
        align: 'left',
        emphasis: {
          textStyle: {
            color: function (params: any) {
              return params.name === t('vitals.sbp') ? '#FF8C00' : '#9370DB';
            }
          },
          itemStyle: {
            color: function (params: any) {
              return params.name === t('vitals.sbp') ? '#FF8C00' : '#9370DB';
            }
          }
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '60px',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        data: chartData.map(item => item.name),
        axisLine: {
          lineStyle: {
            color: '#e0e0e0'
          }
        },
        axisTick: {
          show: true,
          length: 6,
          lineStyle: {
            color: '#e0e0e0'
          },
          alignWithLabel: true // 刻度线居中对齐
        },
        axisLabel: {
          color: '#999',
          fontSize: 12,
          margin: 10,
          align: 'left'
        },
      },
      yAxis: [
        {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#f0f0f0',
              type: 'dashed'
            }
          }
        },
        {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false
          },
          splitLine: {
            show: false
          }
        }
      ],
      series: [
        {
          name: t('vitals.sbp'),
          type: 'line',
          data: chartData.map(item => item.sbp),
          symbol: 'circle',
          symbolSize: 10,
          lineStyle: {
            color: '#FF8C00',
            width: 2
          },
          itemStyle: {
            color: '#FF8C00'
          },
          emphasis: {
            focus: 'none',
            itemStyle: {
              color: '#FF8C00',
              borderColor: '#fff',
              borderWidth: 2
            },
            lineStyle: {
              width: 3,
              color: '#FF8C00'
            }
          }
        },
        {
          name: t('vitals.sleepDuration'),
          type: 'line',
          data: chartData.map(item => item.sleep),
          symbol: 'circle',
          symbolSize: 10,
          lineStyle: {
            color: '#9370DB',
            width: 2
          },
          itemStyle: {
            color: '#9370DB'
          },
          emphasis: {
            focus: 'none',
            itemStyle: {
              color: '#9370DB',
              borderColor: '#fff',
              borderWidth: 2
            },
            lineStyle: {
              width: 3,
              color: '#9370DB'
            }
          }
        }
      ]
    };
  };

  return (
    <WidgetLayout>
      <div className='w-full flex-auto h-full flex items-start justify-center p-5'>
        {chartData.length > 0 ? <div className='w-full h-auto bg-[#fafafa]'>
          <ReactECharts
            option={getOption()}
            className='w-full h-full'
          />
        </div> : <Loader2 className="animate-spin" />}
      </div>
    </WidgetLayout>
  );
}
