import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GrupoService } from '../../services/grupo.service';
import { GastoService } from '../../services/gasto.service';
import { AuthService } from '../../services/auth.service';
import { GrupoDTO } from '../../models/grupo.model';
import { GastoDTO } from '../../models/gasto.model';
import { TipoGasto, MetodoPago, MetodoReparticion, Divisa } from '../../models/enums';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './informes.component.html',
  styleUrls: ['./informes.component.scss']
})
export class InformesComponent implements OnInit {
  grupos: GrupoDTO[] = [];
  gastos: GastoDTO[] = [];
  filtroForm: FormGroup;
  isLoading = false;
  tiposGasto = Object.values(TipoGasto);

  constructor(
    private fb: FormBuilder,
    private grupoService: GrupoService,
    private gastoService: GastoService,
    private authService: AuthService,
    private toastController: ToastController
  ) {
    this.filtroForm = this.fb.group({
      grupoId: [''],
      fechaDesde: [''],
      fechaHasta: [''],
      tipoGasto: ['']
    });
  }

  ngOnInit() {
    this.cargarGruposDelUsuario();

    // Escuchar cambios en el grupo seleccionado
    this.filtroForm.get('grupoId')?.valueChanges.subscribe(grupoId => {
      if (grupoId) {
        this.cargarGastos(grupoId);
      } else {
        this.gastos = [];
      }
    });
  }

  cargarGruposDelUsuario() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) return;

    this.isLoading = true;
    this.grupoService.listarGrupos(currentUser.id).subscribe({
      next: (grupos) => {
        // Convertir explícitamente al tipo GrupoDTO requerido
        this.grupos = grupos.map(grupo => ({
          ...grupo,
          descripcion: grupo.descripcion || '' // Asegurar que descripcion es siempre string
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando grupos:', error);
        this.isLoading = false;
      }
    });
  }

  cargarGastos(grupoId: number) {
    this.isLoading = true;
    this.gastoService.listarGastosPorGrupo(grupoId).subscribe({
      next: (gastos) => {
        // Convertir los gastos al formato correcto antes de filtrar
        const gastosConvertidos: GastoDTO[] = gastos.map(gasto => ({
          ...gasto,
          tipoGasto: this.convertirTipoGasto(gasto.tipoGasto),
          metodoPago: this.convertirMetodoPago(gasto.metodoPago),
          metodoReparticion: this.convertirMetodoReparticion(gasto.metodoReparticion),
          divisa: this.convertirDivisa(gasto.divisa)
        }));
        this.gastos = this.filtrarGastos(gastosConvertidos);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando gastos:', error);
        this.isLoading = false;
      }
    });
  }

  private convertirTipoGasto(tipo: any): TipoGasto {
    if (typeof tipo === 'string') {
      switch (tipo.toUpperCase()) {
        case 'COMIDA': return TipoGasto.COMIDA;
        case 'TRANSPORTE': return TipoGasto.TRANSPORTE;
        case 'ALOJAMIENTO': return TipoGasto.ALOJAMIENTO;
        case 'OCIO': return TipoGasto.OCIO;
        default: return TipoGasto.OTROS;
      }
    }
    return tipo;
  }

  private convertirMetodoPago(metodo: any): MetodoPago {
    if (typeof metodo === 'string') {
      switch (metodo.toUpperCase()) {
        case 'EFECTIVO': return MetodoPago.EFECTIVO;
        case 'TARJETA': return MetodoPago.TARJETA;
        case 'TRANSFERENCIA': return MetodoPago.TRANSFERENCIA;
        case 'BIZUM': return MetodoPago.BIZUM;
        default: return MetodoPago.EFECTIVO;
      }
    }
    return metodo;
  }

  private convertirMetodoReparticion(metodo: any): MetodoReparticion {
    if (typeof metodo === 'string') {
      switch (metodo.toUpperCase()) {
        case 'PARTES_IGUALES': return MetodoReparticion.PARTES_IGUALES;
        case 'PORCENTAJE': return MetodoReparticion.PORCENTAJE;
        case 'EXACTO': return MetodoReparticion.EXACTO;
        default: return MetodoReparticion.PARTES_IGUALES;
      }
    }
    return metodo;
  }

  private convertirDivisa(divisa: any): Divisa {
    if (typeof divisa === 'string') {
      switch (divisa.toUpperCase()) {
        case 'EUR': return Divisa.EUR;
        case 'USD': return Divisa.USD;
        case 'GBP': return Divisa.GBP;
        case 'JPY': return Divisa.JPY;
        case 'MXN': return Divisa.MXN;
        default: return Divisa.EUR;
      }
    }
    return divisa;
  }

  aplicarFiltros() {
    if (!this.filtroForm.value.grupoId) {
      this.mostrarToast('Selecciona un grupo primero');
      return;
    }

    this.cargarGastos(this.filtroForm.value.grupoId);
  }

  filtrarGastos(gastos: GastoDTO[]): GastoDTO[] {
    const { fechaDesde, fechaHasta, tipoGasto } = this.filtroForm.value;
    let gastosFiltrados = [...gastos];

    if (fechaDesde) {
      const desde = new Date(fechaDesde);
      gastosFiltrados = gastosFiltrados.filter(g => new Date(g.fecha) >= desde);
    }

    if (fechaHasta) {
      const hasta = new Date(fechaHasta);
      gastosFiltrados = gastosFiltrados.filter(g => new Date(g.fecha) <= hasta);
    }

    if (tipoGasto) {
      gastosFiltrados = gastosFiltrados.filter(g => g.tipoGasto === tipoGasto);
    }

    return gastosFiltrados;
  }

  calcularTotalGastos(): number {
    return this.gastos.reduce((sum, gasto) => sum + Number(gasto.montoTotal), 0);
  }

  exportarCSV() {
    if (this.gastos.length === 0) {
      this.mostrarToast('No hay datos para exportar');
      return;
    }

    // Preparar encabezados
    const headers = ['Descripción', 'Monto', 'Divisa', 'Fecha', 'Pagador', 'Tipo', 'Método Pago'];

    // Preparar filas de datos
    const rows = this.gastos.map(gasto => [
      gasto.descripcion,
      gasto.montoTotal,
      gasto.divisa,
      new Date(gasto.fecha).toLocaleDateString(),
      gasto.idPagador.toString(), // En una implementación real se buscaría el nombre
      gasto.tipoGasto,
      gasto.metodoPago
    ]);

    // Combinar encabezados y datos
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Crear blob y link para descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    // Crear URL para el blob
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `gastos-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    // Añadir al DOM, hacer clic y limpiar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.mostrarToast('Datos exportados correctamente');
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000
    });
    await toast.present();
  }

  resetFiltros() {
    this.filtroForm.patchValue({
      fechaDesde: '',
      fechaHasta: '',
      tipoGasto: ''
    });

    if (this.filtroForm.value.grupoId) {
      this.cargarGastos(this.filtroForm.value.grupoId);
    }
  }
}
