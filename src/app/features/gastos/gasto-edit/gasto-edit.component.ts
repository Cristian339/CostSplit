import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { GastoService } from '../../../services/gasto.service';
import { GrupoService } from '../../../services/grupo.service';
import { GastoDTO } from '../../../models/gasto.model';
import { UsuarioDTO } from '../../../models/usuario.model';
import { TipoGasto, MetodoPago, MetodoReparticion, Divisa } from '../../../models/enums';

@Component({
  selector: 'app-gasto-edit',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './gasto-edit.component.html',
  styleUrls: ['./gasto-edit.component.scss']
})
export class GastoEditComponent implements OnInit {
  gastoForm: FormGroup;
  isLoading = false;
  grupoId: number = 0;
  gastoId: number = 0;
  participantes: UsuarioDTO[] = [];
  gasto?: GastoDTO;

  tiposGasto = Object.values(TipoGasto);
  metodosPago = Object.values(MetodoPago);
  metodosReparticion = Object.values(MetodoReparticion);
  divisas = Object.values(Divisa);

  constructor(
    private fb: FormBuilder,
    private gastoService: GastoService,
    private grupoService: GrupoService,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    this.gastoForm = this.fb.group({
      descripcion: ['', [Validators.required]],
      montoTotal: [null, [Validators.required, Validators.min(0.01)]],
      fecha: [new Date().toISOString(), [Validators.required]],
      idPagador: [null, [Validators.required]],
      tipoGasto: [TipoGasto.OTROS, [Validators.required]],
      metodoPago: [MetodoPago.EFECTIVO, [Validators.required]],
      metodoReparticion: [MetodoReparticion.PARTES_IGUALES, [Validators.required]],
      divisa: [Divisa.EUR, [Validators.required]]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['idGrupo'] && params['idGasto']) {
        this.grupoId = +params['idGrupo'];
        this.gastoId = +params['idGasto'];
        this.cargarParticipantes(this.grupoId);
        this.cargarGasto(this.gastoId);
      } else {
        this.router.navigate(['/grupos']);
      }
    });
  }

  async cargarGasto(gastoId: number) {
    const loading = await this.loadingController.create({
      message: 'Cargando gasto...'
    });
    await loading.present();

    this.gastoService.obtenerGasto(gastoId).subscribe({
      next: (gasto) => {
        // Conversión de enums si vienen como string
        const tipoGasto = typeof gasto.tipoGasto === 'string'
          ? this.convertirTipoGasto(gasto.tipoGasto)
          : gasto.tipoGasto;
        const metodoPago = typeof gasto.metodoPago === 'string'
          ? this.convertirMetodoPago(gasto.metodoPago)
          : gasto.metodoPago;
        const metodoReparticion = typeof gasto.metodoReparticion === 'string'
          ? this.convertirMetodoReparticion(gasto.metodoReparticion)
          : gasto.metodoReparticion;
        const divisa = typeof gasto.divisa === 'string'
          ? this.convertirDivisa(gasto.divisa)
          : gasto.divisa;

        this.gasto = {
          ...gasto,
          tipoGasto,
          metodoPago,
          metodoReparticion,
          divisa
        };

        this.gastoForm.patchValue({
          descripcion: gasto.descripcion,
          montoTotal: gasto.montoTotal,
          fecha: gasto.fecha,
          idPagador: gasto.idPagador,
          tipoGasto: tipoGasto,
          metodoPago: metodoPago,
          metodoReparticion: metodoReparticion,
          divisa: divisa
        });
        loading.dismiss();
      },
      error: async (error) => {
        console.error('Error cargando gasto:', error);
        loading.dismiss();
        const toast = await this.toastController.create({
          message: 'No se pudo cargar el gasto',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
        this.router.navigate(['/grupos', this.grupoId, 'gastos']);
      }
    });
  }

  private convertirTipoGasto(tipo: string): TipoGasto {
    switch (tipo.toUpperCase()) {
      case 'COMIDA': return TipoGasto.COMIDA;
      case 'TRANSPORTE': return TipoGasto.TRANSPORTE;
      case 'ALOJAMIENTO': return TipoGasto.ALOJAMIENTO;
      case 'OCIO': return TipoGasto.OCIO;
      case 'OTROS': return TipoGasto.OTROS;
      default: return TipoGasto.OTROS;
    }
  }

  private convertirMetodoPago(metodo: string): MetodoPago {
    switch (metodo.toUpperCase()) {
      case 'EFECTIVO': return MetodoPago.EFECTIVO;
      case 'TARJETA': return MetodoPago.TARJETA;
      case 'TRANSFERENCIA': return MetodoPago.TRANSFERENCIA;
      case 'BIZUM': return MetodoPago.BIZUM;
      default: return MetodoPago.EFECTIVO;
    }
  }

  private convertirMetodoReparticion(metodo: string): MetodoReparticion {
    switch (metodo.toUpperCase()) {
      case 'PARTES_IGUALES': return MetodoReparticion.PARTES_IGUALES;
      case 'PORCENTAJE': return MetodoReparticion.PORCENTAJE;
      case 'EXACTO': return MetodoReparticion.EXACTO;
      default: return MetodoReparticion.PARTES_IGUALES;
    }
  }

  private convertirDivisa(divisa: string): Divisa {
    switch (divisa.toUpperCase()) {
      case 'EUR': return Divisa.EUR;
      case 'USD': return Divisa.USD;
      case 'GBP': return Divisa.GBP;
      case 'JPY': return Divisa.JPY;
      case 'MXN': return Divisa.MXN;
      default: return Divisa.EUR;
    }
  }

  cargarParticipantes(idGrupo: number) {
    this.grupoService.verParticipantes(idGrupo).subscribe({
      next: (usuarios) => {
        this.participantes = usuarios;
      },
      error: (error) => {
        console.error('Error cargando participantes:', error);
        this.showToast('No se pudieron cargar los participantes', 'danger');
      }
    });
  }

  async onSubmit() {
    if (this.gastoForm.invalid) {
      const toast = await this.toastController.create({
        message: 'Por favor, complete todos los campos requeridos correctamente.',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      return;
    }

    this.isLoading = true;

    const gastoActualizado: GastoDTO = {
      id: this.gastoId,
      idGrupo: this.grupoId,
      descripcion: this.gastoForm.value.descripcion,
      montoTotal: this.gastoForm.value.montoTotal,
      fecha: this.gastoForm.value.fecha,
      idPagador: this.gastoForm.value.idPagador,
      tipoGasto: this.gastoForm.value.tipoGasto,
      metodoPago: this.gastoForm.value.metodoPago,
      metodoReparticion: this.gastoForm.value.metodoReparticion,
      divisa: this.gastoForm.value.divisa,
      categoriaId: this.gasto?.categoriaId,
      categoriaNombre: this.gasto?.categoriaNombre
    };

    setTimeout(() => {
      this.isLoading = false;
      this.showToast('Gasto actualizado con éxito', 'success');
      this.router.navigate(['/grupos', this.grupoId, 'gastos']);
    }, 1500);
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color
    });
    await toast.present();
  }
}
