import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GastoDTO } from '../../../models/gasto.model';
import { Chart, registerables } from 'chart.js';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-graficos-gastos',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './graficos-gastos.component.html',
  styleUrls: ['./graficos-gastos.component.scss']
})
export class GraficosGastosComponent implements OnInit, OnChanges {
  @Input() gastos: GastoDTO[] = [];

  // Referencias para los gráficos
  tipoGastoChart: Chart | undefined;
  distribMensualChart: Chart | undefined;
  pagadorChart: Chart | undefined;

  constructor() {}

  ngOnInit(): void {
    if (this.gastos.length > 0) {
      this.crearGraficos();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gastos'] && !changes['gastos'].firstChange) {
      // Destruir gráficos existentes antes de recrearlos
      this.destruirGraficos();

      if (this.gastos.length > 0) {
        this.crearGraficos();
      }
    }
  }

  crearGraficos(): void {
    setTimeout(() => {
      this.crearGraficoTipoGasto();
      this.crearGraficoDistribucionMensual();
      this.crearGraficoPorPagador();
    }, 100);
  }

  destruirGraficos(): void {
    if (this.tipoGastoChart) {
      this.tipoGastoChart.destroy();
    }

    if (this.distribMensualChart) {
      this.distribMensualChart.destroy();
    }

    if (this.pagadorChart) {
      this.pagadorChart.destroy();
    }
  }

  crearGraficoTipoGasto(): void {
    // Agrupar gastos por tipo y calcular la suma
    const datosPorTipo = this.agruparGastosPorTipo();

    const ctx = document.getElementById('tipoGastoChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.tipoGastoChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(datosPorTipo),
        datasets: [{
          data: Object.values(datosPorTipo),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Distribución por Tipo de Gasto'
          }
        }
      }
    });
  }

  crearGraficoDistribucionMensual(): void {
    const datosPorMes = this.agruparGastosPorMes();

    const ctx = document.getElementById('distribMensualChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.distribMensualChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(datosPorMes),
        datasets: [{
          label: 'Gastos por Mes',
          data: Object.values(datosPorMes),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Gastos por Mes'
          }
        }
      }
    });
  }

  crearGraficoPorPagador(): void {
    const datosPorPagador = this.agruparGastosPorPagador();

    const ctx = document.getElementById('pagadorChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.pagadorChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(datosPorPagador),
        datasets: [{
          data: Object.values(datosPorPagador),
          backgroundColor: [
            'rgba(255, 159, 64, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 205, 86, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(201, 203, 207, 0.7)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Gastos por Pagador'
          }
        }
      }
    });
  }

  private agruparGastosPorTipo(): Record<string, number> {
    return this.gastos.reduce((acc, gasto) => {
      const tipo = gasto.tipoGasto;
      if (!acc[tipo]) {
        acc[tipo] = 0;
      }
      acc[tipo] += +gasto.montoTotal;
      return acc;
    }, {} as Record<string, number>);
  }

  private agruparGastosPorMes(): Record<string, number> {
    const datosPorMes: Record<string, number> = {};

    this.gastos.forEach(gasto => {
      const fecha = new Date(gasto.fecha);
      const mes = fecha.toLocaleString('default', { month: 'short' });
      const anio = fecha.getFullYear();
      const clave = `${mes} ${anio}`;

      if (!datosPorMes[clave]) {
        datosPorMes[clave] = 0;
      }
      datosPorMes[clave] += +gasto.montoTotal;
    });

    return datosPorMes;
  }

  private agruparGastosPorPagador(): Record<string, number> {
    return this.gastos.reduce((acc, gasto) => {
      const pagadorId = gasto.idPagador;
      // Aquí deberías idealmente obtener el nombre del pagador
      // Por simplicidad, usamos el ID como clave
      const clave = `Pagador ${pagadorId}`;

      if (!acc[clave]) {
        acc[clave] = 0;
      }
      acc[clave] += +gasto.montoTotal;
      return acc;
    }, {} as Record<string, number>);
  }
}
