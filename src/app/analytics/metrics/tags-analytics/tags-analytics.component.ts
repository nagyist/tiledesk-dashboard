import { Component, OnInit, ViewChild } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';
import { TagsService } from 'app/services/tags.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexXAxis,
  ApexPlotOptions,
  ApexStroke,
  ApexTitleSubtitle,
  ApexYAxis,
  ApexTooltip,
  ApexFill,
  ApexLegend
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  fill: ApexFill;
  legend: ApexLegend;
};
import moment from "moment"
@Component({
  selector: 'appdashboard-tags-analytics',
  templateUrl: './tags-analytics.component.html',
  styleUrls: ['./tags-analytics.component.scss']
})
export class TagsAnalyticsComponent implements OnInit {
  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  lastdays = 7;
  initDay: string;
  endDay: string;
  selectedDaysId = 7  //  ?? evaluate whether to use it
  chartStackedColumns: boolean = true 
  chartBasicColumns: boolean = false 
 
  constructor(
    private tagsService: TagsService,
    private logger: LoggerService,
  ) { }

  ngOnInit(): void {
    this.getTagDataAndBuildGraph(this.lastdays, this.chartStackedColumns)
  }

  onSelectStackedColmunsGraphType(areStaked) {
    console.log('[TAG-ANALYTICS] - onSelectColmunsGraphType areStaked', areStaked)
    this.chartStackedColumns = areStaked;
    this.chartBasicColumns = false
    console.log('[TAG-ANALYTICS] - chartStackedColumns ', this.chartStackedColumns)
    this.getTagDataAndBuildGraph(this.lastdays, this.chartStackedColumns)
  }

  onSelectBasicColmunsGraphType(areBasic) {
    console.log('[TAG-ANALYTICS] - onSelectBasicColmunsGraphType ', areBasic)
    this.chartBasicColumns = areBasic
    this.chartStackedColumns = false;
    console.log('[TAG-ANALYTICS] - chartBasicColumns ', this.chartBasicColumns)
    this.getTagDataAndBuildGraph(this.lastdays, this.chartStackedColumns)
  }

  daysSelect(value) {
    this.selectedDaysId = value;//--> value to pass throw for graph method
    //check value for label in htlm
    if (value <= 30) {
      this.lastdays = value;
    } else if ((value === 90)) {
      this.lastdays = value;
      console.log('lastdays use case 90 or 180 lastdays' ,this.lastdays) 
    } else if ((value === 180)) {
      this.lastdays = value;
    } else if (value === 360) {
      this.lastdays = value;
    }
    // this.barChart.destroy();
    // this.subscription.unsubscribe();
    // this.avgTimeResponseCHART(value, this.selectedDeptId, this.selectedAgentId, this.selectedChannelId);
   console.log('[TAG-ANALYTICS] daysSelect:', value,  'selectedDaysId ', this.selectedDaysId)

   this.getTagDataAndBuildGraph(this.lastdays, this.chartStackedColumns)
  }

  getTagDataAndBuildGraph(lastdays, chartStackedColumns) {

    const fullDateRange = []
    for (let i = 0; i < lastdays; i++) {
      // this.logger.log('»» !!! ANALYTICS - LOOP INDEX', i);
      // fullDateRange.push( moment().subtract(i, 'd').format('D/M/YYYY'));
      fullDateRange.push( moment().subtract(i, 'd').format('YYYY-MM-DD'));
    }
    fullDateRange.reverse()

    // ---------------------------------------------------------
    // Generate all dates in the specified range @Gio
    // ---------------------------------------------------------
    //  const generateDateRange = (startDate, endDate) => {
    //   const dates = [];
    //   let currentDate = new Date(startDate);
    //   // console.log('currentDate', currentDate)
    //   const stopDate = new Date(endDate);
    //   // console.log('stopDate', stopDate)
    //   while (currentDate <= stopDate) {
    //     dates.push(currentDate.toISOString().split('T')[0]); // Format YYYY-MM-DD
    //     currentDate.setDate(currentDate.getDate() + 1); // Increment day
    //   }
    //   console.log('dates', dates)
    //   return dates;
    // };

    // const endDate =  moment().format('YYYY-MM-DD');
    // const startDate = moment().subtract(6, 'd').format('YYYY-MM-DD');
    // console.log('endDate XX ', endDate)
    // console.log('startDate XX ', startDate)
    // const fullDateRange = generateDateRange('2024-11-28', '2024-12-04');
    // console.log('[TAG-ANALYTICS] fullDateRange ', fullDateRange)


    this.initDay = fullDateRange[0];
    this.endDay = fullDateRange[this.lastdays - 1];
    console.log("[TAG-ANALYTICS] filter start day", this.initDay, "filter end day ", this.endDay);

    this.tagsService.geTagsForGraph('conversation-tag', this.initDay, this.endDay).subscribe((res: any) => {

      console.log('[TAG-ANALYTICS] - GET GRAPH TAGS RES ', res)
     
      // ---------------------------------------------
      // Map series with filled values
      // ---------------------------------------------
      const filledSeries = res.series.map(serie => {
        console.log('filledSeries serie ', serie) 
        const valuesMap = Object.fromEntries(
          res.dates.map((date, index) => [date, serie.values[index]])
        );
        console.log('valuesMap' ,valuesMap) 
        console.log('fullDateRange' ,fullDateRange) 

        const filledValues = fullDateRange.map(date => valuesMap[date] || 0); // Riempie i valori mancanti con 0
      
        return { name: serie.name, data: filledValues };
      });

      // Final output with updated dates and filled series
       const finalData = {
        dates: fullDateRange,
        series: filledSeries
      };
      this.buildGraph(finalData, chartStackedColumns)

      console.log('finalData', finalData);
      // console.log('finalData',  JSON.stringify(finalData));
      // console.log('finalData series',  finalData.series);
      // console.log('finalData series',  JSON.stringify(finalData.series));

    }, error => {
      console.error('[TAG-ANALYTICS] - GET GRAPH TAGS - ERROR: ', error);
    }, () => {
      console.log('[TAG-ANALYTICS] - GET GRAPH TAGS * COMPLETE *');

    });
   
  }

  buildGraph(finalData, chartStackedColumns) {
  this.chartOptions = {
    series: finalData.series,
    // series: [
      // {
      //   name: "tag-ex-12",
      //   data: [0, 0, 0, 2, 0, 0, 0]
      // },
      // {
      //   name: "sales",
      //   data: [0, 0, 0, 0, 1, 0, 0]
      // },
      // {
      //   name: "support",
      //   data: [0, 0, 0, 0, 2, 0, 0]
      // },
      // {
      //   name: "info",
      //   data: [0, 0, 0, 0, 1, 0, 0]
      // }
      // {
      //   name: "Marine Sprite",
      //   data: [44, 55, 41, 37, 22, 43, 21]
      // },
      // {
      //   name: "Striking Calf",
      //   data: [53, 32, 33, 52, 13, 43, 32]
      // },
      // {
      //   name: "Tank Picture",
      //   data: [12, 17, 11, 9, 15, 11, 20]
      // },
      // {
      //   name: "Bucket Slope",
      //   data: [9, 7, 5, 8, 6, 9, 4]
      // },
      // {
      //   name: "Reborn Kid",
      //   data: [25, 12, 19, 32, 25, 24, 10]
      // }
    // ],
    chart: {
      type: "bar",
      height: 350,
      stacked: chartStackedColumns
    },
    plotOptions: {
      bar: {
        horizontal: false,
        // columnWidth: "55%",
        // borderRadius: 8
      }
    },
    stroke: {
      width: 1,
      colors: ["#fff"]
    },
    // title: {
    //   text: "Fiction Books Sales"
    // },
    xaxis: {
      categories: finalData.dates, // [2008, 2009, 2010, 2011, 2012, 2013, 2014], //  finalData.dates,
      labels: {
        formatter: function (val) {
          return val; // + "K";
        }
      }
    },
    yaxis: {
      // max: 5,
      title: {
        text: undefined
      }
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + "";
        }
      }
    },
    fill: {
      opacity: 1
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      offsetX: 40
    }
  };
 
}

  

}
